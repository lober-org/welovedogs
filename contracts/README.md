# Contracts: Build, Test, Deploy, and Invoke

This guide walks you through building, testing, deploying, and invoking the smart contracts in this workspace using the Stellar CLI.

Contracts in this folder:

- `contracts/donation` - Donation tracking contract for recording USDC donations
- `contracts/pod-poap` - Proof of Donation NFT contract (POAP-style commemorative tokens)

## Prerequisites

- Rust & Cargo
- Stellar CLI
  - Install: `cargo install --locked stellar-cli --features opt`
- WASM target
  - Install: `rustup target add wasm32-unknown-unknown`
- Testnet account funded via Friendbot
  - You'll need a public key `G...` and secret key `S...` on Testnet.

## Environment Setup (Testnet)

1. Set your keys (replace with your values):

```bash
export PUBLIC_KEY=GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
export SECRET_KEY=SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

2. Fund on Testnet (Friendbot):

```bash
curl "https://friendbot.stellar.org?addr=$PUBLIC_KEY"
```

3. Verify balances in Explorer or with your preferred tool.

## Build

You can build contracts individually or all in a loop.

- Build one contract:

```bash
cd contracts/contracts/donation
stellar contract build
```

- Build all contracts in this workspace:

```bash
cd contracts
for d in contracts/*; do (cd "$d" && stellar contract build); done
```

Or use npm scripts:

```bash
cd contracts
npm run build
```

WASM output is placed under `target/wasm32-unknown-unknown/release/<crate_name>.wasm` inside each contract directory.

## Test

- Test one contract:

```bash
cd contracts/contracts/donation
cargo test
```

- Test all contracts:

```bash
cd contracts
for d in contracts/*; do (cd "$d" && cargo test); done
```

Or use npm scripts:

```bash
cd contracts
npm run test
```

## Deploy (Testnet)

General pattern:

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/<crate_name>.wasm \
  --network testnet \
  --source $SECRET_KEY
```

Copy the resulting Contract ID printed by the CLI for subsequent invocations.

### Examples

- Donation Contract

```bash
cd contracts/contracts/donation
stellar contract build
CONTRACT_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/donation.wasm \
  --network testnet \
  --source $SECRET_KEY | tail -n 1)
```

After deployment, initialize the contract:

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  --source $SECRET_KEY \
  -- \
  initialize
```

- POD POAP Contract

```bash
cd contracts/contracts/pod-poap
stellar contract build
CONTRACT_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/pod_poap.wasm \
  --network testnet \
  --source $SECRET_KEY | tail -n 1)
```

After deployment, initialize the contract with an owner:

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  --source $SECRET_KEY \
  -- \
  __constructor \
  --owner $PUBLIC_KEY
```

> Note: Capturing `CONTRACT_ID` with `tail -n 1` is a convenience. If the output format differs, copy the printed ID manually.

## Invoke

General pattern:

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  --source $SECRET_KEY \
  -- \
  <fn_name> [--arg1 value1] [--arg2 value2] ...
```

### Donation Contract

- Initialize the contract:

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  --source $SECRET_KEY \
  -- \
  initialize
```

- Record a donation (donor must authorize):

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  --source $DONOR_SECRET_KEY \
  -- \
  donate \
  --donor G_DONOR_PUBLIC_KEY \
  --recipient G_RECIPIENT_PUBLIC_KEY \
  --amount 1000000000 \
  --asset G_USDC_CONTRACT_ADDRESS
```

With memo:

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  --source $DONOR_SECRET_KEY \
  -- \
  donate \
  --donor G_DONOR_PUBLIC_KEY \
  --recipient G_RECIPIENT_PUBLIC_KEY \
  --amount 1000000000 \
  --asset G_USDC_CONTRACT_ADDRESS \
  --memo "Thank you for rescuing dogs!"
```

- Get donation count:

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  --source $SECRET_KEY \
  -- \
  donation_count
```

- Get a specific donation:

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  --source $SECRET_KEY \
  -- \
  get_donation \
  --donation_id 0
```

- Get total donated to a recipient:

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  --source $SECRET_KEY \
  -- \
  total_donated \
  --recipient G_RECIPIENT_PUBLIC_KEY
```

- Get donations by donor:

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  --source $SECRET_KEY \
  -- \
  get_donor_donations \
  --donor G_DONOR_PUBLIC_KEY \
  --limit 10
```

- Get donations by recipient:

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  --source $SECRET_KEY \
  -- \
  get_recipient_donations \
  --recipient G_RECIPIENT_PUBLIC_KEY \
  --limit 10
```

### POD POAP Contract

The POD POAP contract uses OpenZeppelin Stellar Soroban Contracts and follows standard NFT patterns.

- Mint a token (owner only):

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  --source $SECRET_KEY \
  -- \
  mint \
  --to G_RECIPIENT_PUBLIC_KEY \
  --caller $PUBLIC_KEY
```

- Set token URI (owner only):

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  --source $SECRET_KEY \
  -- \
  set_token_uri \
  --token_id 0 \
  --uri "https://pod.example/api/pod-poap/metadata/0" \
  --caller $PUBLIC_KEY
```

- Get owner of token:

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  --source $SECRET_KEY \
  -- \
  owner_of \
  --id 0
```

- Transfer token:

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  --source $OWNER_SECRET_KEY \
  -- \
  transfer \
  --from G_OWNER_PUBLIC_KEY \
  --to G_RECIPIENT_PUBLIC_KEY \
  --id 0
```

For more information about OpenZeppelin Stellar Soroban Contracts, see the [official documentation](https://developers.stellar.org/docs/tools/openzeppelin-contracts).

## Optimize (optional, for production)

```bash
# Run from each contract dir after build
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/<crate_name>.wasm
```

Or use npm scripts:

```bash
cd contracts
npm run optimize
```

## Tips & Troubleshooting

- If build fails, ensure `rustup target add wasm32-unknown-unknown` is installed and you're on `soroban-sdk = "22.0.8"`.
- For auth-required methods, the `--source` key must be the account that needs to authorize the call.
- The donation contract tracks donations but does not handle the actual asset transfer. The actual USDC transfer must be done via a Stellar payment operation in the same transaction that calls `donate()`.
- POD POAP contract requires initialization with `__constructor` after deployment to set the owner and metadata.
- For deeper context on Soroban contracts, see the [Stellar Developer Docs](https://developers.stellar.org/docs/build/smart-contracts).
