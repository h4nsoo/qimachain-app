from pathlib import Path
import io
import json

import numpy as np
import torch
import torch.nn as nn
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
from PIL import Image
from torchvision import models, transforms

from valuation_engine import ValuationEngine  # valuation_engine.py in project root

# OCR + LLM certificate pipeline
from ocr_processor import WatchCertificateOCR
from llm_extractor import WatchDataExtractor
from models import WatchCertificateData, OCRResult

import joblib  # for optional condition classifier

router = APIRouter()

# -------- CONFIG --------

PROTOTYPES_JSON = "model_prototypes.json"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Must match build_embeddings.py
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])

# -------- GLOBAL STATE --------

vit_model: torch.nn.Module | None = None
prototypes: list[dict] | None = None
valuation_engine: ValuationEngine | None = None

certificate_ocr: WatchCertificateOCR | None = None
certificate_extractor: WatchDataExtractor | None = None

condition_clf = None  # sklearn classifier on embeddings


# -------- LOADERS --------

def load_model():
    """Load ViT-B/16 once and reuse."""
    global vit_model
    if vit_model is None:
        vit = models.vit_b_16(weights=models.ViT_B_16_Weights.DEFAULT)
        vit.heads = nn.Identity()  # use embedding output, not classifier
        vit.eval().to(device)
        vit_model = vit
    return vit_model


def load_prototypes():
    """Load model prototypes (avg embeddings per model) from JSON."""
    global prototypes
    if prototypes is not None:
        return prototypes

    path_obj = Path(PROTOTYPES_JSON)
    if not path_obj.exists():
        raise FileNotFoundError(f"Prototype file not found: {path_obj}")

    with path_obj.open("r", encoding="utf-8") as f:
        data = json.load(f)

    protos: list[dict] = []
    for _, entry in data.items():
        emb = np.array(entry["embedding"], dtype=np.float32)
        norm = np.linalg.norm(emb)
        if norm > 0:
            emb = emb / norm

        protos.append({
            "brand": entry["brand"],
            "model_name": entry["model_name"],
            "reference_number": str(entry["reference_number"]),
            "embedding": emb,
        })

    if not protos:
        raise RuntimeError("No prototypes found in model_prototypes.json")

    prototypes = protos
    return prototypes


def load_valuation_engine():
    """Load valuation engine once and reuse."""
    global valuation_engine
    if valuation_engine is None:
        valuation_engine = ValuationEngine()
    return valuation_engine


def load_certificate_pipeline():
    """
    Lazy-load OCR + LLM extractor used for watch certificates.
    """
    global certificate_ocr, certificate_extractor
    if certificate_ocr is None:
        # Tesseract path is already handled inside WatchCertificateOCR
        certificate_ocr = WatchCertificateOCR(lang="eng", use_gpu=False)
    if certificate_extractor is None:
        # Uses Gemini via GOOGLE_API_KEY env var
        certificate_extractor = WatchDataExtractor(
            model="gemini-2.5-flash",
            temperature=0.1,
        )
    return certificate_ocr, certificate_extractor


def load_condition_classifier():
    """
    Load sklearn classifier trained on image embeddings → condition label.
    If not present, we just skip AI condition prediction.
    """
    global condition_clf
    if condition_clf is None:
        try:
            condition_clf = joblib.load("condition_classifier.joblib")
        except Exception:
            condition_clf = None
    return condition_clf


# -------- CORE HELPERS --------

def embed_image_from_bytes(model: torch.nn.Module, file_bytes: bytes) -> np.ndarray:
    """Turn uploaded image bytes into a normalized embedding."""
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    x = transform(img).unsqueeze(0).to(device)
    with torch.no_grad():
        emb = model(x).cpu().numpy()[0]
    norm = np.linalg.norm(emb)
    if norm > 0:
        emb = emb / norm
    return emb


def find_best_match(query_emb: np.ndarray, prototypes_list: list[dict]):
    """Return prototype with highest cosine similarity to query_emb."""
    best = None
    best_sim = -1.0
    for proto in prototypes_list:
        emb = proto["embedding"]
        sim = float(np.dot(query_emb, emb))  # cosine (both normalized)
        if sim > best_sim:
            best_sim = sim
            best = proto
    return best, best_sim


def normalize_condition_str(condition: str | None) -> str | None:
    if condition is None:
        return None
    c = condition.strip().lower()
    c = c.replace(" ", "_").replace("(", "_").replace(")", "_")
    return c


# -------- ROUTE --------

@router.post("/")
async def analyze(
    # Main watch image
    file: UploadFile = File(...),
    # Optional user-provided fields
    condition: str | None = Form(None),
    has_box: int | None = Form(None),
    has_papers: int | None = Form(None),
    # Optional certificate / papers image
    papers_file: UploadFile | None = File(None),
):
    """
    POST /analyze

    multipart/form-data:
      - file:           main watch image (required)
      - condition:      optional (e.g. 'used_very_good')
      - has_box:        optional 0/1
      - has_papers:     optional 0/1 (user-declared)
      - papers_file:    optional second image (warranty / certificate)

    Pipeline:
      1) ViT embedding → nearest prototype → (brand, model, ref)
      2) Optional AI condition classifier from image
      3) Optional OCR+Gemini if certificate image provided:
         - OCR → structured WatchCertificateData
         - cross-check with recognized brand/ref
         - auto-set has_papers if verified
      4) Valuation engine using comps + filters
    """

    # ---- Read main image bytes ----
    file_bytes = await file.read()

    # ---- Load heavy components lazily ----
    try:
        model = load_model()
        protos = load_prototypes()
        engine = load_valuation_engine()
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Initialization error: {e}"}
        )

    # ---- Compute embedding for main watch image ----
    try:
        query_emb = embed_image_from_bytes(model, file_bytes)
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"error": f"Failed to process image: {e}"}
        )

    # ---- Nearest prototype: which watch is it? ----
    best_proto, sim = find_best_match(query_emb, protos)
    if best_proto is None:
        return JSONResponse(
            status_code=404,
            content={"error": "No matching prototypes found"}
        )

    ref = best_proto["reference_number"]

    # ---- AI condition classifier (optional, soft) ----
    clf = load_condition_classifier()
    predicted_condition = None
    predicted_condition_conf = None
    cond_norm = None

    if clf is not None:
        try:
            probs = clf.predict_proba(query_emb.reshape(1, -1))[0]
            classes = clf.classes_
            idx = int(np.argmax(probs))
            predicted_condition = str(classes[idx])
            predicted_condition_conf = float(probs[idx])
        except Exception:
            predicted_condition = None
            predicted_condition_conf = None

    # Priority: user provided condition > AI predicted condition
    if condition is not None and condition.strip():
        cond_norm = normalize_condition_str(condition)
    elif predicted_condition is not None:
        cond_norm = predicted_condition  # already normalized label from training
    else:
        cond_norm = None

    # ---- OCR + LLM-based certificate verification (if papers image provided) ----
    certificate_section = None
    has_papers_effective = has_papers  # what we'll actually pass to valuation

    if papers_file is not None:
        try:
            ocr_proc, llm_ext = load_certificate_pipeline()
        except Exception as e:
            certificate_section = {
                "enabled": True,
                "error": f"Failed to init certificate pipeline: {e}",
            }
        else:
            try:
                papers_bytes = await papers_file.read()
                cert_img = Image.open(io.BytesIO(papers_bytes)).convert("RGB")
                cert_np = np.array(cert_img)

                # 1) OCR
                ocr_result: OCRResult = ocr_proc.process_image_array(cert_np)

                # 2) LLM extraction → WatchCertificateData
                watch_data: WatchCertificateData = llm_ext.extract_from_ocr(ocr_result)

                # 3) Cross-check with vision recognition
                ref_match = False
                brand_match = False

                if watch_data.reference_number:
                    ref_match = (
                        watch_data.reference_number.strip().replace(" ", "")
                        == str(ref).strip().replace(" ", "")
                    )

                if watch_data.brand and best_proto["brand"]:
                    brand_match = (
                        watch_data.brand.strip().lower()
                        == best_proto["brand"].strip().lower()
                    )

                ocr_conf = ocr_result.confidence or 0.0
                llm_conf = watch_data.confidence_score or 0.0

                papers_verified = (
                    ocr_conf >= 0.5
                    and llm_conf >= 0.6
                    and (ref_match or brand_match)
                )

                # If user didn't specify has_papers but our pipeline is confident, set it to 1
                if has_papers is None and papers_verified:
                    has_papers_effective = 1

                certificate_section = {
                    "enabled": True,
                    "ocr_confidence": ocr_conf,
                    "llm_confidence": llm_conf,
                    "extracted": watch_data.model_dump(mode="json"),
                    "verification": {
                        "reference_match": ref_match,
                        "brand_match": brand_match,
                        "papers_verified": papers_verified,
                    },
                }

            except Exception as e:
                certificate_section = {
                    "enabled": True,
                    "error": f"Failed to process certificate image: {e}",
                }

    # ---- Run valuation engine ----
    valuation = engine.value_model(
        reference_number=ref,
        condition=cond_norm,
        has_box=has_box,
        has_papers=has_papers_effective,
    )

    response = {
        "recognized_brand": best_proto["brand"],
        "recognized_model_name": best_proto["model_name"],
        "reference_number": ref,
        "similarity_score": sim,
        "input": {
            "condition_raw": condition,
            "condition_normalized": cond_norm,
            "has_box": has_box,
            "has_papers_user": has_papers,
            "has_papers_effective": has_papers_effective,
        },
        "ai_condition": {
            "predicted_condition": predicted_condition,
            "predicted_condition_confidence": predicted_condition_conf,
        },
        "certificate": certificate_section,
        "valuation": valuation,
    }

    return response
