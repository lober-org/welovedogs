# Donation Contract Integration - Setup Complete ✅

## Contract Deployment

✅ **Contract Deployed**

- **Contract ID**: `CDLXGDMUHSAU5XBLLWLZUMS4KGU5BSBG3HHMLRXPXNO2CRLVCA3WJBJM`
- **Network**: Testnet
- **Status**: Initialized and ready
- **Explorer**: https://stellar.expert/explorer/testnet/contract/CDLXGDMUHSAU5XBLLWLZUMS4KGU5BSBG3HHMLRXPXNO2CRLVCA3WJBJM

## TypeScript Bindings

✅ **Bindings Generated**

- **Location**: `contracts/packages/donation`
- **Status**: Built and ready to use

## Environment Variables Required

Add these to your `apps/web/.env.local`:

```env
# Donation Contract Configuration
DONATION_BINDING=../../contracts/packages/donation
NEXT_PUBLIC_DONATION_BINDING=../../contracts/packages/donation
DONATION_CONTRACT_ID=CDLXGDMUHSAU5XBLLWLZUMS4KGU5BSBG3HHMLRXPXNO2CRLVCA3WJBJM

# Default recipient address (if not in metadata)
NEXT_PUBLIC_DEFAULT_DONATION_RECIPIENT=GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## How It Works

The donation flow now:

1. **User initiates donation** → Enters amount and memo
2. **Transaction built** → Combines:
   - USDC payment operation (native Stellar payment)
   - Contract invocation operation (records donation on-chain)
3. **User signs once** → Single transaction with both operations
4. **Transaction submitted** → Both operations execute atomically
5. **Donation recorded** → On-chain tracking via contract

## Contract Functions Available

- `donate()` - Record a donation (called automatically)
- `donation_count()` - Get total number of donations
- `get_donation(donation_id)` - Get specific donation details
- `total_donated(recipient)` - Get total donated to a recipient
- `get_donor_donations(donor, limit)` - Get donations by a donor
- `get_recipient_donations(recipient, limit)` - Get donations to a recipient

## Testing

1. Set environment variables in `apps/web/.env.local`
2. Install dependencies: `npm install` (in apps/web)
3. Start dev server: `npm run dev`
4. Navigate to a pod page: `/pod/[tokenId]`
5. Connect wallet and make a donation
6. Check contract on explorer to verify recording

## Notes

- The contract integration is **optional** - if bindings aren't configured, donations still work (payment only)
- Both operations (payment + contract call) are in a single transaction for atomicity
- The contract requires the donor to sign (handled automatically via wallet)
- Contract recording happens automatically when environment variables are set

## Troubleshooting

**"DONATION_BINDING is not set"**

- Add `DONATION_BINDING=../../contracts/packages/donation` to `.env.local`

**"Contract ID not found"**

- Add `DONATION_CONTRACT_ID=CDLXGDMUHSAU5XBLLWLZUMS4KGU5BSBG3HHMLRXPXNO2CRLVCA3WJBJM` to `.env.local`

**Contract recording skipped**

- Check browser console for errors
- Verify contract ID is correct
- Ensure bindings package is built (`cd contracts/packages/donation && npm run build`)

## Next Steps

1. ✅ Contract deployed
2. ✅ Bindings generated
3. ✅ Code integrated
4. ⏳ **Add environment variables** (required)
5. ⏳ **Test donation flow** (verify contract recording)
