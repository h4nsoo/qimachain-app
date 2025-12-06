from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import (
    API_TITLE,
    API_DESCRIPTION,
    API_VERSION,
    CORS_ORIGINS,
)
from app.api.routes.analyze import router as analyze_router

app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION,
)

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# All analyze endpoints live under /analyze
app.include_router(analyze_router, prefix="/analyze")

@app.get("/")
async def root():
    return {
        "message": "QimaChain Watch Valuation API",
        "endpoints": {
            "POST /analyze": "Upload watch image and optional condition/box/papers to get model + valuation."
        },
    }