# QīmaChain Backend - Professional Architecture

## 📁 Project Structure

```
qimachain-backend/
├── main.py                     # FastAPI application entry point
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Container image
├── .dockerignore              # Docker ignore patterns
│
├── app/                        # Main application package
│   ├── __init__.py
│   ├── api/                    # API layer
│   │   ├── __init__.py
│   │   └── routes/             # API endpoints
│   │       ├── __init__.py
│   │       └── analyze.py      # POST /analyze endpoint
│   │
│   ├── core/                   # Core configuration
│   │   ├── __init__.py
│   │   └── config.py           # Application settings
│   │
│   ├── models/                 # Data models
│   │   ├── __init__.py
│   │   └── models.py           # Pydantic schemas
│   │
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── valuation_engine.py  # Market analysis
│   │   ├── ocr_processor.py     # Tesseract OCR
│   │   ├── llm_extractor.py     # Gemini LLM
│   │   └── regex_extractor.py   # Pattern matching
│   │
│   └── ml/                     # Machine learning
│       ├── __init__.py
│       ├── build_embeddings.py      # ViT embedding generation
│       ├── train_condition_classifier.py
│       └── train_price_model.py
│
├── data/                       # Application data
│   ├── images/                 # Training watch images
│   │   ├── Rolex Datejust_126234/
│   │   ├── Rolex Daytona_116509/
│   │   ├── Rolex GMT-Master II/
│   │   ├── Rolex Sea-Dweller_126600/
│   │   └── Rolex Submariner_116613/
│   ├── watch_sales_template.csv      # Historical sales data
│   ├── watch_models.json             # Watch reference database
│   └── images_per_listing_template.csv
│
├── trained_models/             # ML model artifacts
│   ├── model_prototypes.json          # ViT prototype embeddings
│   ├── condition_classifier.joblib    # Condition prediction
│   ├── price_model.joblib            # Price prediction
│   ├── image_embeddings.npy          # Pre-computed embeddings
│   └── image_metadata.json           # Embedding metadata
│
├── config/                     # Configuration files
│
├── tests/                      # Unit and integration tests
│
└── html_cache/                 # Scraped market data
```

## 🏗️ Architecture Overview

### **Layered Architecture**

1. **API Layer** (`app/api/routes/`)
   - RESTful endpoints
   - Request/response handling
   - Input validation

2. **Service Layer** (`app/services/`)
   - Business logic
   - Valuation engine
   - OCR and LLM processing

3. **Model Layer** (`app/models/`)
   - Pydantic data models
   - Request/response schemas

4. **Core Layer** (`app/core/`)
   - Configuration management
   - Shared utilities
   - Constants

5. **ML Layer** (`app/ml/`)
   - Model training scripts
   - Embedding generation
   - ML pipelines

## 🔧 Configuration

All settings are centralized in `app/core/config.py`:

- API metadata
- CORS origins
- File paths
- ML parameters
- Environment variables

## 🚀 Running the Application

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export GOOGLE_API_KEY=your_key_here

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 🐳 Docker

```bash
# Build
docker build -t qimachain-backend .

# Run
docker run -p 8000:8000 \
  -e GOOGLE_API_KEY=your_key \
  qimachain-backend
```

## 📝 Key Improvements

### **Before** (Old Structure)
```
qimachain-backend/
├── main.py
├── routers/analyze.py
├── valuation_engine.py
├── ocr_processor.py
├── llm_extractor.py
├── models.py
├── *.joblib (scattered)
├── *.csv (scattered)
└── ...
```

### **After** (Professional Structure)
```
qimachain-backend/
├── main.py
├── app/
│   ├── api/routes/
│   ├── core/
│   ├── models/
│   ├── services/
│   └── ml/
├── data/
├── trained_models/
├── config/
└── tests/
```

### **Benefits**

✅ **Clear Separation of Concerns** - Each layer has a specific responsibility
✅ **Scalability** - Easy to add new endpoints, services, or models
✅ **Maintainability** - Code is organized and easy to navigate
✅ **Testability** - Each component can be tested independently
✅ **Configuration Management** - Centralized settings
✅ **Professional Standards** - Follows Python project best practices

## 📚 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔒 Environment Variables

Create a `.env` file:

```env
GOOGLE_API_KEY=your_google_api_key_here
LOG_LEVEL=INFO
DEVICE=cpu  # or cuda
```

## 🧪 Testing

```bash
# Run tests (when implemented)
pytest tests/

# With coverage
pytest --cov=app tests/
```

## 📈 Future Enhancements

- [ ] Add comprehensive unit tests
- [ ] Implement logging middleware
- [ ] Add database integration (PostgreSQL)
- [ ] Add caching layer (Redis)
- [ ] Implement authentication
- [ ] Add API versioning
- [ ] Add monitoring and metrics
- [ ] Add CI/CD pipeline
