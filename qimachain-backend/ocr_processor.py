"""
OCR processing module for extracting text from watch certificate images.
"""

import logging
import time
from pathlib import Path
from typing import Union, Optional
from PIL import Image
import numpy as np

from models import OCRResult

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class WatchCertificateOCR:
    """
    OCR processor specialized for luxury watch certificates.
    Uses Tesseract OCR for text extraction (simple and compatible).
    """
    
    def __init__(self, lang: str = 'eng', use_gpu: bool = False):
        """
        Initialize Tesseract OCR engine.
        
        Args:
            lang: Language code (default: 'eng' for English)
            use_gpu: Whether to use GPU acceleration (not used by pytesseract)
        """
        try:
            import pytesseract
            from pathlib import Path
            
            # Set Tesseract executable path for Windows
            tesseract_paths = [
                r"C:\Program Files\Tesseract-OCR\tesseract.exe",
                r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"
            ]
            
            for tess_path in tesseract_paths:
                if Path(tess_path).exists():
                    pytesseract.pytesseract.tesseract_cmd = tess_path
                    logger.info(f"Using Tesseract at: {tess_path}")
                    break
            
            self.pytesseract = pytesseract
            self.lang = lang
            logger.info(f"Tesseract OCR initialized (lang={lang})")
            
        except ImportError:
            logger.error("pytesseract not installed. Install with: pip install pytesseract")
            logger.error("Also install Tesseract: https://github.com/UB-Mannheim/tesseract/wiki")
            raise
    
    def process_image(
        self,
        image_path: Union[str, Path],
        min_confidence: float = 0.5
    ) -> OCRResult:
        """
        Extract text from a watch certificate image.
        
        Args:
            image_path: Path to the image file
            min_confidence: Minimum confidence threshold for text detection (0.0-1.0)
        
        Returns:
            OCRResult containing raw text and metadata
        
        Raises:
            FileNotFoundError: If image file doesn't exist
            ValueError: If image cannot be processed
        """
        image_path = Path(image_path)
        
        if not image_path.exists():
            raise FileNotFoundError(f"Image not found: {image_path}")
        
        logger.info(f"Processing image: {image_path.name}")
        
        start_time = time.time()
        
        try:
            # Load image
            img = Image.open(image_path)
            
            # Run Tesseract OCR
            raw_text = self.pytesseract.image_to_string(img, lang=self.lang)
            
            # Get confidence data
            data = self.pytesseract.image_to_data(img, lang=self.lang, output_type=self.pytesseract.Output.DICT)
            
            # Calculate average confidence (filter out -1 which means no text detected)
            confidences = [float(conf) / 100.0 for conf in data['conf'] if int(conf) > 0]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
            
            processing_time = time.time() - start_time
            
            logger.info(
                f"OCR completed: {len(raw_text)} chars, "
                f"avg confidence: {avg_confidence:.2f}, "
                f"time: {processing_time:.2f}s"
            )
            
            if not raw_text.strip():
                logger.warning("No text extracted from image. Check image quality or language setting.")
            
            return OCRResult(
                raw_text=raw_text,
                confidence=avg_confidence,
                processing_time=processing_time
            )
            
        except Exception as e:
            logger.error(f"OCR processing failed: {str(e)}")
            raise ValueError(f"Failed to process image: {str(e)}") from e
    
    def process_image_array(
        self,
        image_array: np.ndarray,
        min_confidence: float = 0.5
    ) -> OCRResult:
        """
        Process an image already loaded as a numpy array.
        
        Args:
            image_array: Image as numpy array (RGB format)
            min_confidence: Minimum confidence threshold
        
        Returns:
            OCRResult containing raw text and metadata
        """
        start_time = time.time()
        
        try:
            # Convert numpy array to PIL Image
            img = Image.fromarray(image_array)
            
            # Run Tesseract OCR
            raw_text = self.pytesseract.image_to_string(img, lang=self.lang)
            
            # Get confidence data
            data = self.pytesseract.image_to_data(img, lang=self.lang, output_type=self.pytesseract.Output.DICT)
            confidences = [float(conf) / 100.0 for conf in data['conf'] if int(conf) > 0]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
            
            processing_time = time.time() - start_time
            
            return OCRResult(
                raw_text=raw_text,
                confidence=avg_confidence,
                processing_time=processing_time
            )
            
        except Exception as e:
            logger.error(f"OCR processing failed: {str(e)}")
            raise ValueError(f"Failed to process image array: {str(e)}") from e


def main():
    """Example usage of WatchCertificateOCR."""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python ocr_processor.py <image_path>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    ocr_processor = WatchCertificateOCR(use_gpu=False)
    result = ocr_processor.process_image(image_path)
    
    print("\n" + "="*60)
    print("OCR RESULT")
    print("="*60)
    print(f"\nConfidence: {result.confidence:.2%}")
    print(f"Processing Time: {result.processing_time:.2f}s")
    print(f"\nExtracted Text:\n{result.raw_text}")
    print("="*60)


if __name__ == "__main__":
    main()
