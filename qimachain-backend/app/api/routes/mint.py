"""
Mint API Route for QīmaChain NFT Certificates

Endpoint: POST /mint
Handles blockchain NFT minting for authenticated watch certificates
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import base64

from app.services.blockchain_service import BlockchainService

router = APIRouter()

# Global blockchain service instance
blockchain_service: Optional[BlockchainService] = None


class MintRequest(BaseModel):
    """Request body for NFT minting."""
    
    wallet_address: str = Field(
        ...,
        description="Recipient wallet address (0x...)",
        min_length=42,
        max_length=42
    )
    
    # Watch identification
    brand: str = Field(..., description="Watch brand (e.g., Rolex)")
    model: str = Field(..., description="Watch model name")
    reference_number: str = Field(..., description="Watch reference number")
    
    # Valuation data
    valuation: Dict[str, Any] = Field(..., description="Complete valuation object from analysis")
    
    # Optional data
    analysis_confidence: float = Field(
        default=0.0,
        description="AI analysis confidence score (0-1)",
        ge=0.0,
        le=1.0
    )
    
    certificate_data: Optional[Dict[str, Any]] = Field(
        default=None,
        description="OCR/LLM extracted certificate data"
    )
    
    # Image data (base64 encoded)
    image_base64: Optional[str] = Field(
        default=None,
        description="Watch image as base64 string for IPFS upload"
    )
    
    # Custom metadata
    custom_attributes: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Additional custom attributes for NFT metadata"
    )


def get_blockchain_service() -> BlockchainService:
    """Lazy-load blockchain service singleton."""
    global blockchain_service
    if blockchain_service is None:
        blockchain_service = BlockchainService()
    return blockchain_service


@router.post("/")
async def mint_certificate(request: MintRequest):
    """
    POST /mint
    
    Mint an NFT certificate for an authenticated luxury watch.
    
    Request Body (JSON):
    - wallet_address: Recipient Ethereum address (required)
    - brand: Watch brand (required)
    - model: Watch model (required)
    - reference_number: Watch reference (required)
    - valuation: Full valuation object from /analyze endpoint (required)
    - analysis_confidence: AI confidence score 0-1 (optional)
    - certificate_data: OCR/LLM extracted data (optional)
    - image_base64: Base64-encoded watch image (optional, for IPFS)
    - custom_attributes: Additional NFT attributes (optional)
    
    Response:
    {
        "success": true,
        "transaction_hash": "0x...",
        "token_id": 123,
        "contract_address": "0x...",
        "metadata_uri": "ipfs://Qm...",
        "image_uri": "ipfs://Qm...",
        "opensea_url": "https://testnets.opensea.io/assets/...",
        "explorer_url": "https://sepolia.etherscan.io/tx/..."
    }
    
    Pipeline:
    1. Validate blockchain service configuration
    2. Upload watch image to IPFS (if provided)
    3. Generate NFT metadata with valuation details
    4. Upload metadata JSON to IPFS
    5. Call smart contract mint() function
    6. Return transaction details and token info
    """
    
    # Load blockchain service
    try:
        service = get_blockchain_service()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initialize blockchain service: {e}"
        )
    
    # Check service configuration
    if not service.is_configured():
        status = service.get_status()
        return JSONResponse(
            status_code=503,
            content={
                "error": "Blockchain service not configured",
                "message": (
                    "NFT minting requires environment variables: "
                    "BLOCKCHAIN_RPC_URL, CONTRACT_ADDRESS, PRIVATE_KEY, "
                    "PINATA_API_KEY, PINATA_SECRET_KEY"
                ),
                "service_status": status,
                "note": "This is expected in development. Configure .env for production."
            }
        )
    
    try:
        # Step 1: Upload watch image to IPFS (if provided)
        image_uri = None
        if request.image_base64:
            try:
                # Decode base64 image
                image_data = base64.b64decode(request.image_base64)
                
                # Upload to IPFS
                filename = f"{request.brand}_{request.model}_{request.reference_number}.jpg"
                image_uri = await service.upload_image_to_ipfs(image_data, filename)
                
                print(f"✓ Uploaded watch image to IPFS: {image_uri}")
                
            except Exception as e:
                # Non-fatal: continue without image
                print(f"Warning: Failed to upload image to IPFS: {e}")
                image_uri = None
        
        # Step 2: Generate NFT metadata
        metadata = service.create_certificate_metadata(
            brand=request.brand,
            model=request.model,
            reference_number=request.reference_number,
            valuation=request.valuation,
            image_uri=image_uri,
            certificate_data=request.certificate_data,
            analysis_confidence=request.analysis_confidence,
        )
        
        # Add custom attributes if provided
        if request.custom_attributes:
            metadata["attributes"].extend([
                {"trait_type": k, "value": v}
                for k, v in request.custom_attributes.items()
            ])
        
        # Step 3: Upload metadata to IPFS
        metadata_filename = f"{request.brand}_{request.model}_certificate.json"
        metadata_uri = await service.upload_to_ipfs(metadata, metadata_filename)
        
        print(f"✓ Uploaded metadata to IPFS: {metadata_uri}")
        
        # Step 4: Mint NFT on blockchain
        mint_result = await service.mint_nft(
            recipient_address=request.wallet_address,
            metadata_uri=metadata_uri,
        )
        
        if not mint_result["success"]:
            raise RuntimeError("Minting transaction failed (status=0)")
        
        # Step 5: Build response with helpful URLs
        tx_hash = mint_result["transaction_hash"]
        token_id = mint_result["token_id"]
        contract_address = mint_result["contract_address"]
        chain_id = mint_result["chain_id"]
        
        # OpenSea URL (testnets vs mainnet)
        if chain_id == 1:
            opensea_base = "https://opensea.io"
            explorer_base = "https://etherscan.io"
        elif chain_id == 11155111:  # Sepolia
            opensea_base = "https://testnets.opensea.io"
            explorer_base = "https://sepolia.etherscan.io"
        else:
            opensea_base = "https://testnets.opensea.io"
            explorer_base = f"https://explorer.chain-{chain_id}.com"
        
        opensea_url = f"{opensea_base}/assets/{contract_address}/{token_id}" if token_id else None
        explorer_url = f"{explorer_base}/tx/{tx_hash}"
        
        response = {
            "success": True,
            "message": "NFT certificate minted successfully",
            
            # Transaction details
            "transaction_hash": tx_hash,
            "block_number": mint_result["block_number"],
            
            # Token details
            "token_id": token_id,
            "contract_address": contract_address,
            "chain_id": chain_id,
            "recipient": mint_result["recipient"],
            
            # IPFS URIs
            "metadata_uri": metadata_uri,
            "image_uri": image_uri,
            
            # Helpful links
            "opensea_url": opensea_url,
            "explorer_url": explorer_url,
            
            # Full metadata for reference
            "metadata": metadata,
        }
        
        return response
        
    except Exception as e:
        # Return detailed error for debugging
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Minting failed",
                "message": str(e),
                "type": type(e).__name__,
            }
        )


@router.get("/status")
async def get_minting_status():
    """
    GET /mint/status
    
    Check blockchain service configuration and readiness.
    Useful for debugging and health checks.
    """
    try:
        service = get_blockchain_service()
        status = service.get_status()
        
        configured = service.is_configured()
        
        return {
            "configured": configured,
            "ready_to_mint": configured,
            "details": status,
            "message": (
                "Service ready for minting" if configured
                else "Service not configured - check environment variables"
            )
        }
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "configured": False,
                "ready_to_mint": False,
                "error": str(e),
                "message": "Failed to initialize blockchain service"
            }
        )
