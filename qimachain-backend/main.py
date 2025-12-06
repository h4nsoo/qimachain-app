from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.analyze import router as analyze_router

app = FastAPI(
    title="QimaChain Watch Valuation API",
    description="Upload a watch image → recognize model → estimate valuation.",
    version="1.0.0",
)

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://127.0.0.1:3000",
        "http://localhost:3001",  # Alternative port
    ],
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