"""
Configuration settings for QīmaChain Backend
"""
import os
from pathlib import Path

# Base directory (project root, not app/)
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# API Settings
API_VERSION = "1.0.0"
API_TITLE = "QīmaChain Watch Valuation API"
API_DESCRIPTION = "Upload a watch image → recognize model → estimate valuation."

# CORS Settings
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
]

# Model Paths
TRAINED_MODELS_DIR = BASE_DIR / "trained_models"
MODEL_PROTOTYPES_PATH = TRAINED_MODELS_DIR / "model_prototypes.json"
CONDITION_CLASSIFIER_PATH = TRAINED_MODELS_DIR / "condition_classifier.joblib"
PRICE_MODEL_PATH = TRAINED_MODELS_DIR / "price_model.joblib"
IMAGE_EMBEDDINGS_PATH = TRAINED_MODELS_DIR / "image_embeddings.npy"
IMAGE_METADATA_PATH = TRAINED_MODELS_DIR / "image_metadata.json"

# Data Paths
DATA_DIR = BASE_DIR / "data"
SALES_CSV_PATH = DATA_DIR / "watch_sales_template.csv"
WATCH_MODELS_JSON_PATH = DATA_DIR / "watch_models.json"
IMAGES_DIR = DATA_DIR / "images"

# ML Settings
DEVICE = "cuda"  # or "cpu"
IMAGE_SIZE = (224, 224)
EMBEDDING_DIM = 768

# Google API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
