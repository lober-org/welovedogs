# NFT Integration Setup Guide

This guide explains how the Proof of Donation (POD) NFT system works and how to configure it.

## Overview

The NFT system integrates with the donation tracking flow to automatically mint commemorative NFTs when donors make contributions. NFTs are stored on IPFS for decentralized, permanent storage.

## Features

- **IPFS Integration**: NFT metadata and images are uploaded to IPFS using Pinata
- **Automatic Minting**: NFTs can be minted after successful donations
- **Quest Integration**: NFTs are linked to quest achievements
- **17 Unique POD Images**: AI-generated artwork representing different donation tiers
- **OpenZeppelin Stellar Contracts**: Uses the non-fungible token standard

## Environment Variables

Add these to your `.env.local`:

```env
# IPFS Configuration (Pinata)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_api_key
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs

# POD POAP Contract Configuration
POD_POAP_CONTRACT_ID=your_contract_id
POD_POAP_ADMIN_SECRET=your_admin_secret_key
POD_POAP_BINDING=pod_poap
```

## Getting Pinata API Keys

1. Sign up at [Pinata](https://www.pinata.cloud/)
2. Go to API Keys section
3. Create a new API key with `pinFileToIPFS` and `pinJSONToIPFS` permissions
4. Copy the API Key and Secret API Key to your `.env.local`

## Pre-uploading POD Images (Recommended)

**You don't need to manually upload anything to Pinata!** The system will automatically upload images when NFTs are minted. However, for better performance, you can pre-upload all POD images:

1. **Install tsx** (if not already installed):

```bash
npm install -D tsx
```

2. **Run the upload script**:

```bash
npm run upload-pod-images
```

This will:

- Upload all 17 POD images to IPFS
- Save IPFS hashes to `lib/utils/pod-ipfs-mapping.json`
- Make NFT minting faster (no need to upload images each time)

**Note**: If you skip this step, images will be uploaded automatically when NFTs are minted, but it will be slower.

## NFT Minting Flow

1. **Donation Made**: User makes a donation (escrow or instant)
2. **Donation Recorded**: Transaction is recorded in the database
3. **NFT Minting Option**: Donation success page shows "Mint NFT" button
4. **IPFS Upload**:
   - POD image is uploaded to IPFS
   - Metadata JSON is created and uploaded to IPFS
5. **NFT Minted**: NFT is minted on Stellar using the POD-POAP contract
6. **Token URI Set**: IPFS metadata URL is set as the token URI
7. **Achievement Updated**: Achievement record is updated with NFT info

## POD Images

The system includes 17 unique POD images located in `/public/images/POD/`:

- Images are selected based on donation amount
- Each image has a unique label (Aurora, Harbor, Summit, etc.)
- Images are uploaded to IPFS when minting

## API Endpoints

### `POST /api/nft/mint-for-donation`

Mints an NFT for a specific donation transaction.

**Request Body:**

```json
{
  "donorId": "uuid",
  "transactionId": "uuid",
  "donorAddress": "G..."
}
```

**Response:**

```json
{
  "ok": true,
  "hash": "transaction_hash",
  "tokenId": 123,
  "tokenUri": "ipfs://Qm...",
  "metadata": { ... }
}
```

### `POST /api/ipfs/upload-metadata`

Uploads JSON metadata to IPFS.

**Request Body:**

```json
{
  "metadata": {
    "name": "...",
    "description": "...",
    "image": "ipfs://...",
    "attributes": [...]
  }
}
```

## NFT Metadata Structure

```json
{
  "name": "Proof of Donation - Dog Name",
  "description": "Commemorative Proof of Donation NFT...",
  "image": "ipfs://Qm...",
  "attributes": [
    { "trait_type": "Collection", "value": "Proof of Donation" },
    { "trait_type": "Series", "value": "Aurora" },
    { "trait_type": "Donation Amount", "value": "$50.00" },
    { "trait_type": "Dog", "value": "Dog Name" },
    { "trait_type": "Transaction Hash", "value": "..." },
    { "trait_type": "Donation Type", "value": "escrow" }
  ],
  "external_url": "https://..."
}
```

## Integration Points

### Donation Success Page

- Shows "Mint NFT" button after donation is recorded
- Displays success message when NFT is minted
- Links to donor profile to view NFTs

### Donor Profile

- Displays minted NFTs in the gallery
- Shows NFT metadata and images
- Links to Stellar Expert for on-chain verification

### Quest System

- NFTs are linked to achievements
- Achievement records store NFT token ID and transaction hash
- Quest progress updates trigger NFT eligibility

## IPFS Gateway

The system uses Pinata's IPFS gateway by default, but you can configure a custom gateway:

```env
NEXT_PUBLIC_IPFS_GATEWAY=https://your-gateway.com/ipfs
```

Popular IPFS gateways:

- Pinata: `https://gateway.pinata.cloud/ipfs`
- Cloudflare: `https://cloudflare-ipfs.com/ipfs`
- IPFS.io: `https://ipfs.io/ipfs`

## Contract Deployment

The POD-POAP contract uses OpenZeppelin Stellar Contracts. To deploy:

1. Build the contract:

```bash
cd contracts
cargo build --target wasm32-unknown-unknown --package pod-poap --release
```

2. Deploy using Soroban CLI:

```bash
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/pod_poap.wasm
```

3. Initialize the contract:

```bash
soroban contract invoke --id CONTRACT_ID --fn __constructor --arg OWNER_ADDRESS
```

4. Set environment variables with the contract ID and admin secret.

## Troubleshooting

### IPFS Upload Fails

- Check Pinata API keys are correct
- Verify API keys have correct permissions
- System falls back to HTTP URLs if IPFS fails

### NFT Minting Fails

- Ensure wallet is connected
- Verify POD_POAP_CONTRACT_ID is set
- Check POD_POAP_ADMIN_SECRET has minting permissions
- Verify donor has made a qualifying donation

### Metadata Not Loading

- Check IPFS gateway is accessible
- Verify metadata was uploaded successfully
- Check token URI is set correctly on the contract

## Future Enhancements

- Automatic NFT minting on donation (without user action)
- Multiple NFT tiers based on donation amounts
- Special edition NFTs for milestones
- NFT marketplace integration
- Cross-chain NFT support
