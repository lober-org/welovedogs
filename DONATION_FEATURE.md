# Donation Feature Implementation

This document describes the donation feature implementation that allows users to donate USDC to Stellar wallet addresses.

## Overview

The donation feature consists of:

1. **Smart Contract** - A Soroban contract for tracking donations (optional, for future use)
2. **API Route** - Server-side endpoint for processing donation transactions
3. **React Hook** - `useDonation` hook for handling donation logic
4. **UI Component** - `DonationButton` component for the donation interface
5. **Integration** - Added to the pod detail page

## Architecture

### Smart Contract (`contracts/contracts/donation`)

The donation contract provides functions to track donations:

- `initialize()` - Initialize the contract
- `donate()` - Record a donation
- `donation_count()` - Get total donation count
- `get_donation()` - Get a specific donation by ID
- `total_donated()` - Get total donated to a recipient
- `get_donor_donations()` - Get donations by a donor
- `get_recipient_donations()` - Get donations to a recipient

**Note:** The contract is built and ready, but the current implementation uses native Stellar payments for USDC transfers. The contract can be integrated later for tracking purposes.

### API Route (`apps/web/app/api/donation/route.ts`)

Handles donation transaction submission:

- **POST** `/api/donation` - Submit a signed donation transaction
- **GET** `/api/donation` - Build a donation transaction (for reference)

### React Hook (`apps/web/hooks/useDonation.ts`)

Provides donation functionality:

```typescript
const { donate, isLoading, error, isConnected } = useDonation();

// Make a donation
await donate(recipientAddress, amount, memo);
```

### UI Component (`apps/web/components/DonationButton.tsx`)

A complete donation interface component:

- Wallet connection handling
- Amount input
- Optional memo field
- Transaction status feedback
- Error handling

## Usage

### Basic Usage

```tsx
import { DonationButton } from "@/components/DonationButton";

<DonationButton
  recipientAddress="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  recipientName="Campaign Name"
  defaultAmount="10"
/>;
```

### Configuration

Set the recipient address via:

1. **Environment Variable**: `NEXT_PUBLIC_DEFAULT_DONATION_RECIPIENT`
2. **Metadata Attribute**: Add `recipient_address` to pod metadata attributes
3. **Component Prop**: Pass directly to `DonationButton`

### USDC Configuration

The feature uses USDC on Stellar:

- **Testnet**: `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5E34NC4P3WZ`
- **Mainnet**: `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5E34NC4P3WZ`

Update these constants in:

- `apps/web/app/api/donation/route.ts`
- `apps/web/hooks/useDonation.ts`

## Integration Points

### Pod Detail Page

The donation button is integrated into `/app/pod/[tokenId]/page.tsx`:

- Displays in a styled card below the pod attributes
- Automatically extracts recipient address from metadata or environment
- Shows warning if recipient address is not configured

## Deployment

### 1. Build the Contract

```bash
cd contracts/contracts/donation
stellar contract build
```

The WASM file will be at: `target/wasm32v1-none/release/donation.wasm`

### 2. Deploy the Contract (Optional)

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/donation.wasm \
  --network testnet \
  --source $SECRET_KEY
```

### 3. Set Environment Variables

Add to `apps/web/.env.local`:

```env
NEXT_PUBLIC_DEFAULT_DONATION_RECIPIENT=GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 4. Update Metadata (Optional)

Add recipient address to pod metadata:

```json
{
  "attributes": [
    {
      "trait_type": "recipient_address",
      "value": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    }
  ]
}
```

## Testing

### Test Donation Flow

1. Navigate to a pod detail page (`/pod/[tokenId]`)
2. Click "Connect Wallet to Donate"
3. Select and connect a wallet
4. Click "Donate USDC"
5. Enter amount and optional memo
6. Confirm transaction in wallet
7. Verify success message

### Testnet USDC

For testing, you'll need testnet USDC. You can:

1. Use Stellar Testnet Friendbot to fund accounts
2. Use a testnet USDC faucet (if available)
3. Create test USDC via Stellar Laboratory

## Future Enhancements

1. **Contract Integration**: Use the donation contract to track all donations on-chain
2. **Donation History**: Display donation history for campaigns
3. **Recurring Donations**: Support for recurring/subscription donations
4. **Multiple Assets**: Support for donations in other Stellar assets
5. **Donation Goals**: Track progress toward donation goals
6. **Analytics**: Dashboard for donation statistics

## Troubleshooting

### "Recipient address is not configured"

Set `NEXT_PUBLIC_DEFAULT_DONATION_RECIPIENT` in your `.env.local` or add `recipient_address` to pod metadata.

### "Invalid Stellar address format"

Ensure the recipient address is a valid Stellar public key (starts with `G` and is 56 characters).

### Transaction Fails

- Check that the sender has sufficient USDC balance
- Verify the recipient has a USDC trustline
- Ensure network (testnet/mainnet) matches configuration
- Check transaction fees (minimum XLM balance required)

### Wallet Connection Issues

- Ensure wallet extension is installed
- Check browser console for errors
- Verify network configuration matches wallet network

## Files Created/Modified

### New Files

- `contracts/contracts/donation/src/lib.rs` - Smart contract
- `contracts/contracts/donation/src/test.rs` - Contract tests
- `contracts/contracts/donation/Cargo.toml` - Contract dependencies
- `contracts/contracts/donation/README.md` - Contract documentation
- `apps/web/app/api/donation/route.ts` - API endpoint
- `apps/web/hooks/useDonation.ts` - React hook
- `apps/web/components/DonationButton.tsx` - UI component

### Modified Files

- `apps/web/app/pod/[tokenId]/page.tsx` - Added donation button

## Security Considerations

1. **Transaction Signing**: All transactions are signed client-side using the wallet
2. **Address Validation**: Server validates Stellar addresses before processing
3. **Amount Validation**: Amounts are validated to prevent invalid transactions
4. **Network Matching**: Ensures transaction network matches configuration
5. **Error Handling**: Comprehensive error handling at all levels

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review Stellar documentation: https://developers.stellar.org/
3. Check contract build logs for compilation errors
4. Verify environment variables are set correctly
