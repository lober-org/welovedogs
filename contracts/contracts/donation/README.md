# Donation Contract

A Soroban smart contract for tracking USDC donations on Stellar.

## Features

- Record donations from donors to recipients
- Track total donations per recipient
- Query donation history for donors and recipients
- Support for custom memos/notes with donations

## Functions

- `initialize()` - Initialize the contract
- `donate(donor, recipient, amount, asset, memo)` - Record a donation
- `donation_count()` - Get total number of donations
- `get_donation(donation_id)` - Get a specific donation by ID
- `total_donated(recipient)` - Get total amount donated to a recipient
- `get_donor_donations(donor, limit)` - Get donations made by a donor
- `get_recipient_donations(recipient, limit)` - Get donations received by a recipient

## Note

This contract tracks donations but does not handle the actual asset transfer. The actual USDC transfer must be done via a Stellar payment operation in the same transaction that calls `donate()`.
