// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title QimaChainNFT
 * @dev ERC-721 NFT contract for QīmaChain luxury watch authentication certificates
 * 
 * Features:
 * - ERC-721 compliant NFT tokens
 * - IPFS metadata storage (tokenURI)
 * - Owner-controlled minting
 * - Sequential token IDs
 * - OpenSea compatible
 * 
 * Each NFT represents a blockchain-verified certificate containing:
 * - Watch identification (brand, model, reference)
 * - AI-powered valuation data
 * - Certificate metadata (OCR/LLM extracted)
 * - Analysis confidence scores
 * - Images and IPFS storage
 */
contract QimaChainNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    // Token ID counter (starts at 1)
    Counters.Counter private _tokenIds;
    
    // Contract metadata
    string public constant VERSION = "1.0.0";
    
    // Events
    event CertificateMinted(
        address indexed recipient,
        uint256 indexed tokenId,
        string tokenURI
    );
    
    /**
     * @dev Constructor sets NFT name and symbol
     * Deployer becomes the owner with minting permissions
     */
    constructor() ERC721("QimaChain Certificate", "QIMA") Ownable(msg.sender) {
        // Token IDs will start at 1 (first mint increments to 1)
    }
    
    /**
     * @dev Mints a new certificate NFT to the specified address
     * @param to Address that will receive the NFT
     * @param tokenURI IPFS URI containing the certificate metadata
     * @return tokenId The newly minted token ID
     * 
     * Requirements:
     * - Only owner can call this function
     * - `to` cannot be the zero address
     * - `tokenURI` should be a valid IPFS URI (ipfs://...)
     */
    function mint(address to, string memory tokenURI) 
        public 
        onlyOwner 
        returns (uint256) 
    {
        require(to != address(0), "QimaChainNFT: mint to zero address");
        require(bytes(tokenURI).length > 0, "QimaChainNFT: empty tokenURI");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        emit CertificateMinted(to, newTokenId, tokenURI);
        
        return newTokenId;
    }
    
    /**
     * @dev Batch mint multiple certificates in a single transaction
     * @param recipients Array of addresses that will receive NFTs
     * @param tokenURIs Array of IPFS URIs for each certificate
     * @return tokenIds Array of newly minted token IDs
     * 
     * Requirements:
     * - Only owner can call this function
     * - `recipients` and `tokenURIs` must have the same length
     * - All recipients must be non-zero addresses
     */
    function batchMint(address[] memory recipients, string[] memory tokenURIs)
        public
        onlyOwner
        returns (uint256[] memory)
    {
        require(
            recipients.length == tokenURIs.length,
            "QimaChainNFT: arrays length mismatch"
        );
        
        uint256[] memory tokenIds = new uint256[](recipients.length);
        
        for (uint256 i = 0; i < recipients.length; i++) {
            tokenIds[i] = mint(recipients[i], tokenURIs[i]);
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Returns the total number of tokens minted
     * @return Current token supply
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
    
    /**
     * @dev Returns all token IDs owned by a specific address
     * @param owner Address to query
     * @return Array of token IDs
     * 
     * Note: This is a gas-intensive operation, use with caution
     * Consider using The Graph or off-chain indexing for production
     */
    function tokensOfOwner(address owner) 
        public 
        view 
        returns (uint256[] memory) 
    {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= _tokenIds.current(); i++) {
            if (_ownerOf(i) == owner) {
                tokenIds[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Override to make all QimaChain certificates non-transferable (soulbound)
     * Uncomment this function to enable soulbound behavior
     */
    /*
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override {
        require(
            from == address(0) || to == address(0),
            "QimaChainNFT: token is non-transferable"
        );
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    */
}
