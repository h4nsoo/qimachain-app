"""
Data models for luxury watch certificate information extraction.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


class WatchCertificateData(BaseModel):
    """
    Structured data model for luxury watch certificate information.
    
    This model represents the extracted and validated information from
    watch warranty certificates, service receipts, or auction invoices.
    """
    
    brand: Optional[str] = Field(
        None,
        description="The manufacturer (e.g., Rolex, Patek Philippe, Omega)"
    )
    
    model: Optional[str] = Field(
        None,
        description="The specific model name (e.g., Daytona, Nautilus, Speedmaster)"
    )
    
    reference_number: Optional[str] = Field(
        None,
        description="The alphanumeric model identifier (e.g., 116500LN, 5711/1A)"
    )
    
    serial_number: Optional[str] = Field(
        None,
        description="The unique ID of the specific watch"
    )
    
    document_type: str = Field(
        default="Unknown",
        description="Document classification: Warranty Certificate, Service Receipt, Auction Invoice, or Unknown"
    )
    
    date_iso: Optional[str] = Field(
        None,
        description="The primary date on the document in YYYY-MM-DD format"
    )
    
    dealer_name: Optional[str] = Field(
        None,
        description="The name of the retailer or jeweler"
    )
    
    confidence_score: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Confidence score (0.0 to 1.0) based on text clarity"
    )
    
    @field_validator('date_iso')
    @classmethod
    def validate_date_format(cls, v: Optional[str]) -> Optional[str]:
        """Validate that date is in YYYY-MM-DD format if provided."""
        if v is None:
            return v
        try:
            datetime.strptime(v, '%Y-%m-%d')
            return v
        except ValueError:
            raise ValueError(f"Date must be in YYYY-MM-DD format, got: {v}")
    
    @field_validator('document_type')
    @classmethod
    def validate_document_type(cls, v: str) -> str:
        """Ensure document_type is one of the allowed values."""
        allowed_types = [
            "Warranty Certificate",
            "Service Receipt",
            "Auction Invoice",
            "Unknown"
        ]
        if v not in allowed_types:
            return "Unknown"
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "brand": "Rolex",
                "model": "Submariner Date",
                "reference_number": "116610LN",
                "serial_number": "Z1234567",
                "document_type": "Warranty Certificate",
                "date_iso": "2020-03-15",
                "dealer_name": "Tourneau",
                "confidence_score": 0.92
            }
        }


class OCRResult(BaseModel):
    """Raw OCR output container."""
    
    raw_text: str = Field(
        description="Unprocessed text extracted from OCR engine"
    )
    
    confidence: Optional[float] = Field(
        None,
        ge=0.0,
        le=1.0,
        description="Overall OCR confidence if available"
    )
    
    processing_time: Optional[float] = Field(
        None,
        description="Time taken for OCR processing in seconds"
    )
