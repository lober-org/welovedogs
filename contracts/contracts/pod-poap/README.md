# Proof of Donation (POD) NFT Contract

This contract implements a sequentially minted, event-style NFT inspired by POAPs. It is built with the OpenZeppelin Stellar Soroban Contracts toolkit and is intended to be deployed on Stellar for the `apps/web` front-end to mint commemorative tokens for rescued dog donation events.

## Features

- Sequential token IDs for frictionless distribution (`Enumerable::sequential_mint`)
- Metadata configured during initialization (`Base::set_metadata`)
- Role-based ownership control via the `Ownable` extension
- Pause/unpause hooks to protect against unexpected issues
- Optional burn functionality for revocation scenarios

## Build & Deploy

Use the Soroban CLI to build, deploy, and interact with the contract:

```bash
cd /Users/brandonfdez/Documents/code/pod/contracts
cargo build --target wasm32-unknown-unknown --package pod-poap --release
```

Follow the [Stellar developer docs](https://developers.stellar.org/docs/tools/openzeppelin-contracts) for deployment and admin role assignment steps.
