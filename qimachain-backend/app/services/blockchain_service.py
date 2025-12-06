"""
Blockchain Service for QīmaChain NFT Minting

Handles:
- IPFS metadata upload via Pinata
- Smart contract interaction for ERC-721 NFT minting
- Transaction signing and submission
- Certificate metadata generation
"""

import json
import os
import base64
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime

import requests
from web3 import Web3
from web3.contract import Contract
from web3.exceptions import ContractLogicError


class BlockchainService:
    """
    Service for minting watch certificate NFTs on blockchain.
    
    Environment Variables Required:
    - BLOCKCHAIN_RPC_URL: Ethereum RPC endpoint (e.g., Infura, Alchemy)
    - CONTRACT_ADDRESS: Deployed QimaChainNFT smart contract address
    - CHAIN_ID: Network chain ID (1 = mainnet, 11155111 = Sepolia, etc.)
    - PRIVATE_KEY: Deployer/minter wallet private key (for server-side signing)
    - PINATA_API_KEY: Pinata API key for IPFS uploads
    - PINATA_SECRET_KEY: Pinata secret API key
    """

    def __init__(self):
        self.rpc_url = os.getenv("BLOCKCHAIN_RPC_URL", "https://sepolia.infura.io/v3/YOUR_INFURA_KEY")
        self.contract_address = os.getenv("CONTRACT_ADDRESS", "0x0000000000000000000000000000000000000000")
        self.chain_id = int(os.getenv("CHAIN_ID", "11155111"))  # Sepolia testnet by default
        self.private_key = os.getenv("PRIVATE_KEY", "")
        
        self.pinata_api_key = os.getenv("PINATA_API_KEY", "")
        self.pinata_secret_key = os.getenv("PINATA_SECRET_KEY", "")
        
        # Initialize Web3
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        
        # Load contract ABI
        self.contract: Optional[Contract] = None
        self._load_contract()
    
    def _load_contract(self):
        """Load smart contract ABI and create contract instance."""
        try:
            contract_abi_path = Path(__file__).parent.parent / "contracts" / "QimaChainNFT.json"
            
            if not contract_abi_path.exists():
                print(f"Warning: Contract ABI not found at {contract_abi_path}")
                return
            
            with open(contract_abi_path, "r") as f:
                contract_data = json.load(f)
            
            # Support both full contract JSON and ABI-only JSON
            abi = contract_data.get("abi", contract_data)
            
            self.contract = self.w3.eth.contract(
                address=Web3.to_checksum_address(self.contract_address),
                abi=abi
            )
            
            print(f"✓ Loaded contract at {self.contract_address}")
            
        except Exception as e:
            print(f"Warning: Failed to load contract: {e}")
            self.contract = None
    
    def is_configured(self) -> bool:
        """Check if blockchain service is properly configured."""
        return (
            self.w3.is_connected() and
            self.contract is not None and
            bool(self.private_key) and
            bool(self.pinata_api_key)
        )
    
    def get_status(self) -> Dict[str, Any]:
        """Get blockchain service status for debugging."""
        return {
            "web3_connected": self.w3.is_connected(),
            "contract_loaded": self.contract is not None,
            "contract_address": self.contract_address,
            "chain_id": self.chain_id,
            "has_private_key": bool(self.private_key),
            "has_pinata_keys": bool(self.pinata_api_key and self.pinata_secret_key),
        }
    
    async def upload_to_ipfs(
        self,
        metadata: Dict[str, Any],
        name: str = "certificate_metadata.json"
    ) -> str:
        """
        Upload JSON metadata to IPFS via Pinata.
        
        Args:
            metadata: Certificate metadata dictionary
            name: Filename for the JSON
        
        Returns:
            IPFS URI (ipfs://Qm...)
        """
        if not self.pinata_api_key or not self.pinata_secret_key:
            raise ValueError("Pinata API keys not configured")
        
        url = "https://api.pinata.cloud/pinning/pinJSONToIPFS"
        
        headers = {
            "pinata_api_key": self.pinata_api_key,
            "pinata_secret_api_key": self.pinata_secret_key,
            "Content-Type": "application/json",
        }
        
        payload = {
            "pinataContent": metadata,
            "pinataMetadata": {
                "name": name,
                "keyvalues": {
                    "brand": metadata.get("brand", ""),
                    "model": metadata.get("model", ""),
                    "type": "watch_certificate"
                }
            }
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            
            result = response.json()
            ipfs_hash = result["IpfsHash"]
            
            return f"ipfs://{ipfs_hash}"
            
        except requests.exceptions.RequestException as e:
            raise RuntimeError(f"IPFS upload failed: {e}")
    
    async def upload_image_to_ipfs(
        self,
        image_data: bytes,
        filename: str = "watch_image.jpg"
    ) -> str:
        """
        Upload image bytes to IPFS via Pinata.
        
        Args:
            image_data: Raw image bytes
            filename: Name for the image file
        
        Returns:
            IPFS URI (ipfs://Qm...)
        """
        if not self.pinata_api_key or not self.pinata_secret_key:
            raise ValueError("Pinata API keys not configured")
        
        url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
        
        headers = {
            "pinata_api_key": self.pinata_api_key,
            "pinata_secret_api_key": self.pinata_secret_key,
        }
        
        files = {
            "file": (filename, image_data, "image/jpeg")
        }
        
        try:
            response = requests.post(url, files=files, headers=headers)
            response.raise_for_status()
            
            result = response.json()
            ipfs_hash = result["IpfsHash"]
            
            return f"ipfs://{ipfs_hash}"
            
        except requests.exceptions.RequestException as e:
            raise RuntimeError(f"Image IPFS upload failed: {e}")
    
    def create_certificate_metadata(
        self,
        brand: str,
        model: str,
        reference_number: str,
        valuation: Dict[str, Any],
        image_uri: Optional[str] = None,
        certificate_data: Optional[Dict[str, Any]] = None,
        analysis_confidence: float = 0.0,
    ) -> Dict[str, Any]:
        """
        Generate NFT metadata following OpenSea/ERC-721 standards.
        
        Args:
            brand: Watch brand (e.g., "Rolex")
            model: Watch model name (e.g., "Submariner")
            reference_number: Watch reference number
            valuation: Valuation data from ML engine
            image_uri: IPFS URI of watch image (optional)
            certificate_data: Additional certificate data from OCR/LLM
            analysis_confidence: AI analysis confidence score
        
        Returns:
            Metadata dictionary ready for IPFS upload
        """
        timestamp = datetime.utcnow().isoformat() + "Z"
        
        # Extract valuation details
        estimated_value = valuation.get("estimated_value_usd")
        lower_bound = valuation.get("lower_bound_usd")
        upper_bound = valuation.get("upper_bound_usd")
        condition = valuation.get("condition")
        
        metadata = {
            "name": f"{brand} {model} Certificate",
            "description": (
                f"QīmaChain Authentication Certificate for {brand} {model} "
                f"(Ref: {reference_number}). AI-verified luxury watch with "
                f"estimated value of ${estimated_value:,.0f} USD."
            ),
            "image": image_uri or "",
            "external_url": "https://qimachain.com",
            
            # OpenSea attributes
            "attributes": [
                {
                    "trait_type": "Brand",
                    "value": brand
                },
                {
                    "trait_type": "Model",
                    "value": model
                },
                {
                    "trait_type": "Reference Number",
                    "value": reference_number
                },
                {
                    "trait_type": "Condition",
                    "value": condition or "Not Specified"
                },
                {
                    "trait_type": "Estimated Value (USD)",
                    "value": estimated_value,
                    "display_type": "number"
                },
                {
                    "trait_type": "Value Range Lower (USD)",
                    "value": lower_bound,
                    "display_type": "number"
                },
                {
                    "trait_type": "Value Range Upper (USD)",
                    "value": upper_bound,
                    "display_type": "number"
                },
                {
                    "trait_type": "Has Box",
                    "value": "Yes" if valuation.get("has_box") else "No"
                },
                {
                    "trait_type": "Has Papers",
                    "value": "Yes" if valuation.get("has_papers") else "No"
                },
                {
                    "trait_type": "AI Confidence",
                    "value": round(analysis_confidence * 100, 1),
                    "display_type": "number"
                },
                {
                    "trait_type": "Certification Date",
                    "value": timestamp
                },
            ],
            
            # QīmaChain-specific data
            "qimachain": {
                "version": "1.0",
                "timestamp": timestamp,
                "valuation": valuation,
                "certificate": certificate_data,
                "analysis_confidence": analysis_confidence,
            }
        }
        
        return metadata
    
    async def mint_nft(
        self,
        recipient_address: str,
        metadata_uri: str,
    ) -> Dict[str, Any]:
        """
        Mint NFT certificate to recipient address.
        
        Args:
            recipient_address: Wallet address to receive the NFT
            metadata_uri: IPFS URI of the metadata JSON
        
        Returns:
            Dictionary with transaction hash, token ID, and status
        """
        if not self.is_configured():
            status = self.get_status()
            raise RuntimeError(f"Blockchain service not fully configured: {status}")
        
        if not self.contract:
            raise RuntimeError("Smart contract not loaded")
        
        try:
            # Get minter account from private key
            account = self.w3.eth.account.from_key(self.private_key)
            minter_address = account.address
            
            # Validate recipient address
            recipient_checksum = Web3.to_checksum_address(recipient_address)
            
            # Build transaction
            # Assumes contract has: function mint(address to, string memory tokenURI) public
            nonce = self.w3.eth.get_transaction_count(minter_address)
            
            txn = self.contract.functions.mint(
                recipient_checksum,
                metadata_uri
            ).build_transaction({
                "chainId": self.chain_id,
                "gas": 300000,  # Adjust as needed
                "gasPrice": self.w3.eth.gas_price,
                "nonce": nonce,
            })
            
            # Sign transaction
            signed_txn = self.w3.eth.account.sign_transaction(txn, self.private_key)
            
            # Send transaction
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            tx_hash_hex = tx_hash.hex()
            
            print(f"✓ Minting transaction sent: {tx_hash_hex}")
            
            # Wait for transaction receipt
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            # Extract token ID from logs (assumes Transfer event)
            token_id = None
            if receipt.logs:
                # Parse Transfer event: event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
                try:
                    transfer_event = self.contract.events.Transfer().process_receipt(receipt)
                    if transfer_event:
                        token_id = transfer_event[0]["args"]["tokenId"]
                except Exception:
                    # Fallback: token ID is usually the last topic in the log
                    if len(receipt.logs[0]["topics"]) > 3:
                        token_id = int(receipt.logs[0]["topics"][3].hex(), 16)
            
            success = receipt["status"] == 1
            
            return {
                "success": success,
                "transaction_hash": tx_hash_hex,
                "token_id": token_id,
                "block_number": receipt["blockNumber"],
                "contract_address": self.contract_address,
                "chain_id": self.chain_id,
                "recipient": recipient_checksum,
                "metadata_uri": metadata_uri,
            }
            
        except ContractLogicError as e:
            raise RuntimeError(f"Smart contract error: {e}")
        except Exception as e:
            raise RuntimeError(f"Minting transaction failed: {e}")
    
    async def get_token_uri(self, token_id: int) -> str:
        """
        Get metadata URI for a minted token.
        
        Args:
            token_id: NFT token ID
        
        Returns:
            IPFS URI of token metadata
        """
        if not self.contract:
            raise RuntimeError("Smart contract not loaded")
        
        try:
            uri = self.contract.functions.tokenURI(token_id).call()
            return uri
        except Exception as e:
            raise RuntimeError(f"Failed to get token URI: {e}")
    
    async def get_owner(self, token_id: int) -> str:
        """
        Get owner address of a token.
        
        Args:
            token_id: NFT token ID
        
        Returns:
            Owner wallet address
        """
        if not self.contract:
            raise RuntimeError("Smart contract not loaded")
        
        try:
            owner = self.contract.functions.ownerOf(token_id).call()
            return owner
        except Exception as e:
            raise RuntimeError(f"Failed to get token owner: {e}")
