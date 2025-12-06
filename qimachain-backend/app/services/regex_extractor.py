"""
Fallback regex-based extractor for when LLM is blocked.
"""

import re
from app.models.models import WatchCertificateData

def extract_with_regex(ocr_text: str) -> WatchCertificateData:
    """
    Extract watch data using regex patterns as fallback.
    """
    brand = None
    model = None
    ref_number = None
    serial_number = None
    date = None
    dealer = None
    
    # Brand detection
    brand_patterns = [
        r'\b(ROLEX|Rolex)\b',
        r'\b(PATEK PHILIPPE|Patek Philippe)\b',
        r'\b(OMEGA|Omega)\b',
        r'\b(AUDEMARS PIGUET|Audemars Piguet)\b',
    ]
    for pattern in brand_patterns:
        match = re.search(pattern, ocr_text, re.IGNORECASE)
        if match:
            brand = match.group(1).title()
            break
    
    # Model detection
    if brand and brand.lower() == 'rolex':
        model_patterns = [
            r'(Oyster Perpetual|OYSTER PERPETUAL)',
            r'(Submariner|SUBMARINER)',
            r'(Daytona|DAYTONA)',
            r'(GMT-Master|GMT MASTER)',
            r'(Datejust|DATEJUST)',
        ]
        for pattern in model_patterns:
            match = re.search(pattern, ocr_text, re.IGNORECASE)
            if match:
                model = match.group(1).title()
                break
    
    # Serial number (various formats)
    serial_patterns = [
        r'Serial\s*(?:No\.?|Number)?\s*:?\s*([A-Z0-9]{6,})',
        r'Serial\s*:?\s*([A-Z0-9]{6,})',
        r'\b([0-9]{10,16})\b',  # Long numeric sequences
    ]
    for pattern in serial_patterns:
        match = re.search(pattern, ocr_text, re.IGNORECASE)
        if match:
            serial_number = match.group(1)
            break
    
    # Reference number
    ref_patterns = [
        r'Ref(?:erence)?\.?\s*:?\s*([A-Z0-9]{4,})',
        r'Model\s*:?\s*([0-9]{4,}[A-Z]*)',
    ]
    for pattern in ref_patterns:
        match = re.search(pattern, ocr_text, re.IGNORECASE)
        if match:
            ref_number = match.group(1)
            break
    
    # Document type
    doc_type = "Unknown"
    if re.search(r'WARRANTY|GUARANTEE', ocr_text, re.IGNORECASE):
        doc_type = "Warranty Certificate"
    elif re.search(r'SERVICE|REPAIR', ocr_text, re.IGNORECASE):
        doc_type = "Service Receipt"
    
    # Calculate confidence based on how many fields were found
    fields_found = sum([
        brand is not None,
        model is not None,
        ref_number is not None,
        serial_number is not None
    ])
    confidence = 0.4 + (fields_found * 0.15)  # Base 0.4, +0.15 per field
    
    return WatchCertificateData(
        brand=brand,
        model=model,
        reference_number=ref_number,
        serial_number=serial_number,
        document_type=doc_type,
        date_iso=date,
        dealer_name=dealer,
        confidence_score=confidence
    )
