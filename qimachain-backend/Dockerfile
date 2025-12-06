# Use PyTorch base image with pre-built wheels (saves 15-20 mins)
FROM pytorch/pytorch:2.1.0-cuda11.8-cudnn8-runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies for OCR/image processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps (torch/torchvision already in base image)
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/requirements.txt

# Copy application code
COPY . /app

# Create directories for models and data
RUN mkdir -p /app/trained_models /app/data

# Create non-root user and switch to it
RUN useradd -m appuser && chown -R appuser /app
USER appuser

# Expose a common port; adjust if your app uses a different one
EXPOSE 8000

# Run the FastAPI app with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
