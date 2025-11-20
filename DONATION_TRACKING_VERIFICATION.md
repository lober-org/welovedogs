# How to Verify On-Chain Donation Tracking

This guide explains how to verify that donations are being tracked on-chain using the Soroban smart contract.

## Quick Verification Methods

### 1. **Visual Verification in UI**

The donation stats component is automatically displayed on the homepage if `NEXT_PUBLIC_DEFAULT_DONATION_RECIPIENT` is set. It shows:

- Total number of donations tracked
- Total amount donated to the recipient
- Recent donations with donor addresses, amounts, and memos

**To check:**

1. Make a donation using the "💝 Donar USDC" button
2. Scroll down to see the "Donation Tracking" section
3. Click "Refresh" to update the stats
4. Verify your donation appears in the list

### 2. **API Endpoint Verification**

Query the donation stats API directly:

```bash
# Get total donations and recipient stats
curl "http://localhost:3000/api/donation/stats?recipient=GASUYFRZKQHWO57WUFXPU6BTR45IL2AELIXYXM5G7C5HTBEV73MZMOTT"

# Get donations from a specific donor
curl "http://localhost:3000/api/donation/stats?donor=GARD33XQ2ZPZLI3H7ORNLKCYIK5AABG7G6S..."

# Get a specific donation by ID
curl "http://localhost:3000/api/donation/stats?donationId=0"
```

### 3. **Check Browser Console**

After making a donation, check the browser console for:

- Success messages showing the transaction hash
- Any errors related to contract invocation
- Logs from the donation API route

### 4. **Check Server Logs**

The API route logs contract errors. Check your terminal/console for:

- `"Contract recording skipped:"` - This means the contract wasn't invoked (bindings missing or contract not deployed)
- Transaction hashes from successful donations
- Any error messages from the Soroban RPC

### 5. **Verify Contract is Deployed**

Ensure the contract is deployed and configured:

```bash
# Check if contract ID is set
echo $DONATION_CONTRACT_ID

# Verify contract bindings are installed
ls contracts/packages/donation/src/index.ts

# Test contract query directly using Stellar CLI
stellar contract invoke \
  --id YOUR_CONTRACT_ID \
  --network testnet \
  -- donation_count
```

### 6. **Check Transaction Details**

When a donation is made, the transaction includes:

1. **Payment Operation**: The USDC transfer from donor to recipient
2. **Contract Invocation Operation**: The `donate` function call to record the donation on-chain

**To verify:**

1. Get the transaction hash from the success message
2. View it on Stellar Explorer: `https://stellar.expert/explorer/testnet/tx/YOUR_TX_HASH`
3. Check that the transaction has multiple operations:
   - One `Payment` operation
   - One `Invoke Host Function` operation (the contract call)

### 7. **Common Issues and Solutions**

#### Issue: "Donation contract bindings not available"

**Solution:**

- Ensure `DONATION_CONTRACT_ID` is set in your `.env` file
- Verify contract bindings are installed: `npm install` in `contracts/packages/donation`
- Check that the contract package is linked in `apps/web/package.json`

#### Issue: Stats show 0 donations

**Possible causes:**

- Contract wasn't initialized (run `initialize()` once)
- Donations were made before contract was deployed
- Contract ID mismatch between deployment and configuration

**Solution:**

- Initialize the contract: `stellar contract invoke --id YOUR_CONTRACT_ID -- initialize`
- Verify `DONATION_CONTRACT_ID` matches the deployed contract

#### Issue: Contract operations not appearing in transactions

**Possible causes:**

- Contract bindings not loaded (check server logs)
- Contract invocation failed silently
- Transaction building failed before contract operation was added

**Solution:**

- Check server logs for "Contract recording skipped" messages
- Verify contract bindings are available: `curl http://localhost:3000/api/donation/stats`
- Ensure Soroban RPC URL is correct: `NEXT_PUBLIC_STELLAR_SOROBAN_RPC_URL`

## Expected Behavior

When everything is working correctly:

1. **Making a donation:**
   - User clicks "💝 Donar USDC"
   - Enters amount and optional memo
   - Signs transaction with wallet
   - Transaction includes both payment AND contract invocation
   - Success message shows transaction hash

2. **Viewing stats:**
   - Stats component loads automatically
   - Shows total donations count
   - Shows total amount donated
   - Lists recent donations with details
   - Refresh button updates the data

3. **API responses:**
   - `/api/donation/stats` returns `{ ok: true, totalDonations: N, ... }`
   - Includes `recipientTotal` with formatted amounts
   - Includes `recipientDonations` array with donation records

## Testing Checklist

- [ ] Contract is deployed and `DONATION_CONTRACT_ID` is set
- [ ] Contract bindings are installed (`contracts/packages/donation`)
- [ ] Contract is initialized (`initialize()` called once)
- [ ] `NEXT_PUBLIC_DEFAULT_DONATION_RECIPIENT` is set
- [ ] Make a test donation
- [ ] Check transaction hash on Stellar Explorer (should have 2 operations)
- [ ] Verify stats component shows the donation
- [ ] Query API endpoint directly to verify data
- [ ] Check server logs for any errors

## Debugging Commands

```bash
# Check contract state
stellar contract invoke \
  --id $DONATION_CONTRACT_ID \
  --network testnet \
  -- donation_count

# Get total donated to recipient
stellar contract invoke \
  --id $DONATION_CONTRACT_ID \
  --network testnet \
  -- total_donated \
  --recipient GASUYFRZKQHWO57WUFXPU6BTR45IL2AELIXYXM5G7C5HTBEV73MZMOTT

# Get recent donations for recipient
stellar contract invoke \
  --id $DONATION_CONTRACT_ID \
  --network testnet \
  -- get_recipient_donations \
  --recipient GASUYFRZKQHWO57WUFXPU6BTR45IL2AELIXYXM5G7C5HTBEV73MZMOTT \
  --limit 10
```
