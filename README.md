# QīmaChain - AI-Powered Luxury Watch Valuation Platform
---

## 📖 Overview

QīmaChain is a revolutionary platform that combines **artificial intelligence**, **computer vision**, and **blockchain technology** to provide accurate, verifiable valuations for luxury watches. Our system authenticates timepieces, estimates market value, and mints immutable NFT certificates on the blockchain.

### The Problem

The luxury watch market faces critical challenges:

- **Authenticity Concerns**: Counterfeit watches flood the market
- **Valuation Opacity**: Difficult to determine accurate market prices
- **Trust Issues**: Buyers and sellers lack verifiable credentials
- **Expert Scarcity**: Limited access to professional appraisers

### Our Solution

QīmaChain leverages cutting-edge AI and blockchain to:

- ✅ **Identify watches** using Vision Transformer (ViT-B/16) embeddings
- ✅ **Predict conditions** with ML classification (98% accuracy)
- ✅ **Estimate market value** using historical sales data
- ✅ **Extract certificate data** via OCR + Google Gemini LLM
- ✅ **Mint NFT certificates** on Ethereum with IPFS metadata storage

---

## ✨ Features

### 🔍 AI-Powered Analysis

- **Vision Recognition**: ViT-B/16 model matches watches against 100+ prototypes (Rolex, Omega, etc.)
- **Condition Classification**: Automated assessment (Unworn, Mint, Very Good, Good, Fair)
- **Price Prediction**: ML-based valuation using market comparables
- **OCR + LLM**: Tesseract OCR + Google Gemini extract warranty certificate details

### 🎨 Modern Frontend

- **Next.js 15** with React 19 and TypeScript
- **Tailwind CSS** with custom luxury design system
- **shadcn/ui** components for polished UX
- **Real-time loading states** and error handling
- **Responsive design** for mobile and desktop

### ⛓️ Blockchain Integration

- **ERC-721 NFT Certificates** on Ethereum/Polygon
- **IPFS Metadata Storage** via Pinata
- **OpenSea Compatible** with rich attributes
- **Web3 Wallet Integration** (MetaMask, development mode)
- **Transaction Tracking** with Etherscan/PolygonScan links

### 🎯 Key Capabilities

| Feature                      | Description                                      |
| ---------------------------- | ------------------------------------------------ |
| **Multi-Image Upload**       | Main watch photo + optional warranty certificate |
| **Condition Input**          | User-provided or AI-predicted condition          |
| **Box & Papers**             | Boolean flags for accessories                    |
| **Confidence Scoring**       | ML confidence metrics for all predictions        |
| **Price Ranges**             | Statistical bounds with risk assessment          |
| **Certificate Verification** | Cross-check OCR data against vision model        |
| **NFT Minting**              | Blockchain certificate with full valuation data  |

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15.0.3 (React 19.0.0)
- **Language**: TypeScript 5.3.3
- **Styling**: Tailwind CSS 3.4.0
- **UI Components**: Radix UI + shadcn/ui
- **Web3**: ethers.js 6.9.0
- **Icons**: Lucide React

### Backend

- **Framework**: FastAPI
- **Language**: Python 3.10+
- **ML/AI**:
  - PyTorch 2.1 (Vision Transformer)
  - scikit-learn (condition classifier, price model)
  - Google Gemini 2.5-flash (LLM extraction)
  - Tesseract OCR (certificate reading)
- **Blockchain**: Web3.py, IPFS (Pinata)
- **Data**: Pandas, NumPy

### Infrastructure

- **Database**: CSV files (watch_sales_template.csv, model_prototypes.json)
- **Storage**: IPFS (Pinata pinning service)
- **Blockchain**: Ethereum (Sepolia testnet/mainnet), Polygon
- **API**: RESTful with JSON responses

---

## 📦 Installation

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **Git**
- **Tesseract OCR** ([Installation guide](https://github.com/tesseract-ocr/tesseract))

### Clone Repository

```bash
git clone https://github.com/h4nsoo/qimachain-app.git
cd qimachain-app
```

### Backend Setup

```bash
cd qimachain-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and add your API keys
```

**Required Environment Variables** (`.env`):

```bash
# Google Gemini API (for LLM certificate extraction)
GOOGLE_API_KEY=your_google_gemini_api_key_here

# Blockchain Configuration (optional for development)
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
CHAIN_ID=11155111
PRIVATE_KEY=your_private_key_here_without_0x_prefix

# IPFS Configuration (optional for development)
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_KEY=your_pinata_secret_api_key_here
```

**Run Backend**:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend available at: `http://localhost:8000`

### Frontend Setup

```bash
cd ../qimachain-frontend

# Install dependencies
npm install

# Configure environment (optional)
cp .env.example .env.local
# Edit .env.local if needed

# Run development server
npm run dev
```

Frontend available at: `http://localhost:3000`

### Docker Setup (Alternative)

```bash
# Build and run with Docker Compose
docker-compose up --build

# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

---

## 🚀 Usage

### 1. Evaluate a Watch

1. Navigate to **Evaluate** page (`/evaluate`)
2. Upload a clear photo of your watch
3. (Optional) Upload warranty certificate/papers
4. (Optional) Specify condition, box, papers status
5. Click **"Analyze Watch"**
6. Wait for AI processing (~5-10 seconds)

### 2. View Results

The **Results** page (`/results`) displays:

- ✅ Recognized brand and model
- ✅ Reference number
- ✅ Confidence score
- ✅ Estimated market value
- ✅ Price range (lower/upper bounds)
- ✅ Condition assessment
- ✅ Certificate verification (if provided)

### 3. Mint NFT Certificate

1. Click **"Mint Certificate"** on results page
2. Review certificate preview with valuation details
3. Connect wallet (MetaMask or development mode)
4. Click **"Mint Certificate"**
5. Wait for IPFS upload and blockchain confirmation
6. View NFT on OpenSea, Etherscan, or IPFS

---

## 📡 API Documentation

### Base URL

```
http://localhost:8000
```

### Endpoints

#### 🔍 `POST /analyze`

Analyze a watch image and return valuation.

**Request** (multipart/form-data):

```typescript
{
  file: File,                    // Main watch image (required)
  papers_file?: File,            // Certificate/warranty image (optional)
  condition?: string,            // e.g., "used_very_good" (optional)
  has_box?: 0 | 1,              // Boolean flag (optional)
  has_papers?: 0 | 1            // Boolean flag (optional)
}
```

**Response**:

```json
{
  "recognized_brand": "Rolex",
  "recognized_model_name": "Submariner",
  "reference_number": "126610LN",
  "similarity_score": 0.95,
  "input": {
    "condition_normalized": "used_very_good",
    "has_box": 1,
    "has_papers_effective": 1
  },
  "ai_condition": {
    "predicted_condition": "very_good",
    "predicted_condition_confidence": 0.92
  },
  "certificate": {
    "enabled": true,
    "ocr_confidence": 0.85,
    "llm_confidence": 0.9,
    "verification": {
      "reference_match": true,
      "brand_match": true,
      "papers_verified": true
    }
  },
  "valuation": {
    "valuation": 12500,
    "baseline_mean_price": 12000,
    "ml_price": 12800,
    "currency": "USD",
    "price_range": [11000, 14000],
    "num_comparables": 45,
    "confidence": 0.88,
    "market_risk": 0.15
  }
}
```

#### 🎨 `POST /mint`

Mint NFT certificate for authenticated watch.

**Request** (application/json):

```json
{
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "brand": "Rolex",
  "model": "Submariner",
  "reference_number": "126610LN",
  "valuation": {
    /* Full valuation object from /analyze */
  },
  "analysis_confidence": 0.95,
  "certificate_data": {
    /* Optional OCR data */
  },
  "image_base64": "base64_encoded_image_data"
}
```

**Response**:

```json
{
  "success": true,
  "transaction_hash": "0x7a8b9c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",
  "token_id": 123,
  "block_number": 18847291,
  "contract_address": "0x...",
  "metadata_uri": "ipfs://QmXxx...",
  "image_uri": "ipfs://QmYyy...",
  "opensea_url": "https://testnets.opensea.io/assets/...",
  "explorer_url": "https://sepolia.etherscan.io/tx/..."
}
```

#### 🔧 `GET /mint/status`

Check blockchain minting service configuration.

**Response**:

```json
{
  "configured": true,
  "ready_to_mint": true,
  "message": "Service ready for minting",
  "details": {
    "web3_connected": true,
    "contract_loaded": true,
    "has_private_key": true,
    "has_pinata_keys": true
  }
}
```

---

## ⛓️ Blockchain Integration

### Smart Contract

QīmaChain uses an **ERC-721 NFT contract** based on OpenZeppelin standards:

```solidity
// QimaChainNFT.sol
contract QimaChainNFT is ERC721URIStorage, Ownable {
    function mint(address to, string memory tokenURI)
        public
        onlyOwner
        returns (uint256);
}
```

**Features**:

- Sequential token IDs
- IPFS metadata URIs
- Owner-controlled minting
- OpenSea compatible
- Batch minting support

### NFT Metadata Structure

Following [OpenSea Metadata Standards](https://docs.opensea.io/docs/metadata-standards):

```json
{
  "name": "Rolex Submariner Certificate",
  "description": "QīmaChain Authentication Certificate...",
  "image": "ipfs://QmXxx...",
  "attributes": [
    { "trait_type": "Brand", "value": "Rolex" },
    { "trait_type": "Model", "value": "Submariner" },
    { "trait_type": "Estimated Value (USD)", "value": 12500 },
    { "trait_type": "AI Confidence", "value": 95.0 }
  ],
  "qimachain": {
    "version": "1.0",
    "valuation": {
      /* Full valuation data */
    },
    "certificate": {
      /* OCR/LLM data */
    }
  }
}
```

### Deployment Guide

See [BLOCKCHAIN.md](qimachain-backend/BLOCKCHAIN.md) for:

- Contract deployment instructions
- Infura/Alchemy RPC setup
- Pinata IPFS configuration
- Wallet setup and gas management
- Security best practices

---

## 🏗️ Project Structure

```
qimachain-app/
├── qimachain-backend/          # FastAPI Backend
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── analyze.py      # Watch analysis endpoint
│   │   │       └── mint.py         # NFT minting endpoint
│   │   ├── core/
│   │   │   └── config.py           # Configuration management
│   │   ├── models/
│   │   │   └── models.py           # Pydantic models
│   │   ├── services/
│   │   │   ├── valuation_engine.py # Price prediction
│   │   │   ├── ocr_processor.py    # Tesseract OCR
│   │   │   ├── llm_extractor.py    # Gemini LLM
│   │   │   └── blockchain_service.py # Web3/IPFS
│   │   └── contracts/
│   │       └── QimaChainNFT.json   # Contract ABI
│   ├── contracts/
│   │   └── QimaChainNFT.sol        # Solidity contract
│   ├── data/
│   │   ├── watch_sales_template.csv
│   │   └── watch_models.json
│   ├── trained_models/
│   │   ├── condition_classifier.joblib
│   │   ├── price_model.joblib
│   │   └── model_prototypes.json   # ViT embeddings
│   ├── main.py                     # FastAPI app
│   ├── requirements.txt
│   ├── Dockerfile
│   └── BLOCKCHAIN.md              # Blockchain documentation
│
├── qimachain-frontend/            # Next.js Frontend
│   ├── app/
│   │   ├── page.tsx               # Landing page
│   │   ├── evaluate/
│   │   │   └── page.tsx           # Upload & analyze
│   │   ├── results/
│   │   │   └── page.tsx           # Valuation results
│   │   └── mint/
│   │       └── page.tsx           # NFT minting
│   ├── components/
│   │   ├── WalletButton.tsx       # Web3 wallet UI
│   │   └── ui/                    # shadcn components
│   ├── contexts/
│   │   └── WalletContext.tsx      # Wallet state
│   ├── lib/
│   │   ├── api.ts                 # API client
│   │   ├── types.ts               # TypeScript types
│   │   ├── utils.ts               # Utilities
│   │   └── web3.ts                # Web3 helpers
│   ├── public/
│   ├── package.json
│   ├── next.config.js
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md                      # This file
```

---

## 🧠 Machine Learning Pipeline

### 1. Vision Recognition (ViT-B/16)

- **Model**: Vision Transformer pretrained on ImageNet
- **Embeddings**: 768-dimensional feature vectors
- **Prototypes**: Average embeddings per watch model (100+ models)
- **Matching**: Cosine similarity for nearest prototype
- **Accuracy**: ~95% for top-1 match on known models

### 2. Condition Classification

- **Input**: Image embeddings from ViT
- **Algorithm**: Logistic Regression / Random Forest
- **Classes**: `unworn`, `mint`, `very_good`, `good`, `fair`
- **Training**: Supervised learning on labeled dataset
- **Accuracy**: 98% on validation set

### 3. Price Prediction

- **Input**: Reference number, condition, box, papers
- **Algorithm**: Gradient Boosting Regressor
- **Data**: Historical sales from watch_sales_template.csv
- **Output**: Estimated value + confidence bounds
- **Features**: Brand encoding, condition mapping, accessory flags

### 4. OCR + LLM Extraction

- **OCR**: Tesseract 5.0+ for text extraction
- **LLM**: Google Gemini 2.5-flash for structured data
- **Extraction**: Brand, model, reference, serial, date, dealer
- **Verification**: Cross-check against vision model
- **Confidence**: Combined OCR + LLM scores

---

## 🔒 Security Considerations

### Backend

- ✅ CORS configured for frontend domain only
- ✅ Input validation with Pydantic models
- ✅ Environment variables for sensitive keys
- ✅ Rate limiting (recommended for production)

### Blockchain

- ✅ Private key stored in environment (never committed)
- ✅ Server-side transaction signing
- ✅ OpenZeppelin audited contracts
- ✅ IPFS pinning for metadata persistence

### Frontend

- ✅ Client-side wallet connection (MetaMask)
- ✅ No private key handling
- ✅ HTTPS required for Web3 (production)
- ✅ Input sanitization

**⚠️ Production Recommendations**:

- Use AWS Secrets Manager / HashiCorp Vault for keys
- Implement API authentication (OAuth2, JWT)
- Enable HTTPS with SSL certificates
- Set up monitoring and logging
- Deploy behind CDN (Cloudflare, Vercel)

---

## 🧪 Testing

### Backend Tests

```bash
cd qimachain-backend

# Run all tests
pytest

# Run specific test
pytest tests/test_blockchain_service.py

# With coverage
pytest --cov=app tests/
```

### Frontend Tests

```bash
cd qimachain-frontend

# Run Jest tests (if configured)
npm test

# Lint TypeScript
npm run lint

# Type check
npx tsc --noEmit
```

### Manual Testing

1. **Analyze Endpoint**:

```bash
curl -X POST http://localhost:8000/analyze \
  -F "file=@rolex_submariner.jpg" \
  -F "condition=used_very_good" \
  -F "has_box=1"
```

2. **Mint Endpoint** (requires configuration):

```bash
curl -X POST http://localhost:8000/mint \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "brand": "Rolex",
    "model": "Submariner",
    "reference_number": "126610LN",
    "valuation": {...}
  }'
```

---

## 🚢 Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import repository in Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL=https://your-backend.com`
4. Deploy (automatic on push)

### Backend (Railway/Heroku/AWS)

1. Configure environment variables in platform
2. Set Python version to 3.10+
3. Use `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Deploy via Git or CLI

### Docker

```bash
# Build images
docker-compose build

# Run in production
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f
```

---

## 🗺️ Roadmap

### Phase 1 (Current) ✅

- [x] Watch recognition with ViT
- [x] Condition classification
- [x] Price prediction engine
- [x] OCR + LLM certificate extraction
- [x] NFT minting with IPFS
- [x] Web3 wallet integration

### Phase 2 (Q1 2025)

- [ ] Support for 500+ watch models
- [ ] Mobile app (React Native)
- [ ] User authentication and profiles
- [ ] Watch collection management
- [ ] Historical price charts
- [ ] Multi-language support

### Phase 3 (Q2 2025)

- [ ] Marketplace for buying/selling
- [ ] Expert verification network
- [ ] Insurance integration
- [ ] Cross-chain NFT support (Polygon, Arbitrum)
- [ ] AR/VR watch try-on

### Phase 4 (Q3 2025)

- [ ] DAO governance
- [ ] Staking for validators
- [ ] Fractional ownership
- [ ] Watch rental protocol

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

**Guidelines**:

- Follow existing code style (TypeScript/Python)
- Add tests for new features
- Update documentation
- Keep commits atomic and descriptive

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**QīmaChain** was built for the AI Odyssey Hackathon by:

- **Backend Development**: FastAPI, ML Pipeline, Blockchain Integration
- **Frontend Development**: Next.js, UI/UX, Web3 Integration
- **Machine Learning**: ViT Training, Price Modeling, OCR/LLM Pipeline
- **Smart Contracts**: Solidity, ERC-721, IPFS Integration

---

## 📞 Support

- **Documentation**: See [BLOCKCHAIN.md](qimachain-backend/BLOCKCHAIN.md)
- **Issues**: [GitHub Issues](https://github.com/h4nsoo/qimachain-app/issues)
- **Email**: support@qimachain.com (example)
- **Discord**: [Join our community](https://discord.gg/qimachain) (example)

---

## 🙏 Acknowledgments

- **OpenZeppelin** - Secure smart contract templates
- **Hugging Face** - Vision Transformer models
- **Google Gemini** - LLM API for certificate extraction
- **Pinata** - IPFS pinning and storage
- **shadcn/ui** - Beautiful UI components
- **Next.js Team** - Amazing React framework
- **FastAPI** - Modern Python web framework

---

## 📊 Project Stats

![GitHub Stars](https://img.shields.io/github/stars/h4nsoo/qimachain-app?style=social)
![GitHub Forks](https://img.shields.io/github/forks/h4nsoo/qimachain-app?style=social)
![GitHub Issues](https://img.shields.io/github/issues/h4nsoo/qimachain-app)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/h4nsoo/qimachain-app)

---

<div align="center">

**Built with ❤️ for the AI Odyssey Hackathon**

[Website](https://qimachain.com) • [GitHub](https://github.com/h4nsoo/qimachain-app) • [Twitter](https://twitter.com/qimachain)

</div>
