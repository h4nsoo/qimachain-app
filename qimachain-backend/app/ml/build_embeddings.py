import os
from pathlib import Path
import pandas as pd
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import numpy as np
import json

IMAGES_CSV = "images_per_listing_template.csv"  # filled version
EMBEDDINGS_NPY = "image_embeddings.npy"
METADATA_JSON = "image_metadata.json"
PROTOTYPES_JSON = "model_prototypes.json"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Preprocess for ViT
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])

def load_model():
    # ViT backbone, remove classifier head
    vit = models.vit_b_16(weights=models.ViT_B_16_Weights.DEFAULT)
    vit.heads = nn.Identity()
    vit.eval().to(device)
    return vit

def embed_image(model, img_path: str) -> np.ndarray:
    img = Image.open(img_path).convert("RGB")
    x = transform(img).unsqueeze(0).to(device)
    with torch.no_grad():
        emb = model(x).cpu().numpy()[0]
    return emb

def main():
    df = pd.read_csv(IMAGES_CSV)
    model = load_model()

    embeddings = []
    metadata = []

    for idx, row in df.iterrows():
        img_path = row["image_path"]
        if not isinstance(img_path, str) or not img_path or img_path == "____":
            print(f"Skipping row {idx}: empty image_path")
            continue

        if not os.path.exists(img_path):
            print(f"Image not found, skipping: {img_path}")
            continue

        print(f"[{idx}] Embedding {img_path}")
        emb = embed_image(model, img_path)

        embeddings.append(emb)
        metadata.append({
            "image_path": img_path,
            "brand": row["brand"],
            "model_name": row["model_name"],
            "reference_number": row["reference_number"],
            "listing_id": row.get("listing_id", None),
            "image_number": row.get("image_number", None),
        })

    embeddings = np.stack(embeddings, axis=0)
    np.save(EMBEDDINGS_NPY, embeddings)

    with open(METADATA_JSON, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    # Build per-model prototypes
    # key = (brand, model_name, reference_number)
    prototypes = {}
    for emb, meta in zip(embeddings, metadata):
        brand = str(meta["brand"])
        model_name = str(meta["model_name"])
        reference_number = str(meta["reference_number"])

        key_str = "|".join([brand, model_name, reference_number])

        if key_str not in prototypes:
            prototypes[key_str] = []

        prototypes[key_str].append(emb.tolist())

    proto_out = {}
    for key_str, emb_list in prototypes.items():
        arr = np.array(emb_list)
        mean_emb = arr.mean(axis=0)
        brand, model_name, reference_number = key_str.split("|")
        proto_out[key_str] = {
            "brand": brand,
            "model_name": model_name,
            "reference_number": reference_number,
            "embedding": mean_emb.tolist(),
        }

    with open(PROTOTYPES_JSON, "w", encoding="utf-8") as f:
        json.dump(proto_out, f, indent=2, ensure_ascii=False)

    print(f"\nSaved {len(metadata)} image embeddings to {EMBEDDINGS_NPY}")
    print(f"Saved metadata to {METADATA_JSON}")
    print(f"Saved {len(proto_out)} model prototypes to {PROTOTYPES_JSON}")

if __name__ == "__main__":
    main()
