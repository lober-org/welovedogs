# We Love Dogs 🐕

A Web3 crowdfunding platform built on Stellar blockchain to help dogs in need get the care they deserve. Care providers can create fundraising campaigns for dogs, and donors can contribute using Stellar USDC while receiving Proof of Donation (POD) NFTs as commemorative tokens.

## 🌟 Features

- **🐕 Dog Campaigns**: Care providers create fundraising campaigns for dogs needing medical care, surgery, food, shelter, and more
- **💝 Stellar Donations**: Donate USDC directly on the Stellar network with transparent, on-chain transactions
- **🎖️ POD POAP NFTs**: Receive Proof of Donation NFTs as commemorative tokens for your contributions
- **👥 Multiple User Roles**: Support for care providers, donors, rescuers, shelters, and veterinarians
- **📊 Campaign Tracking**: Real-time tracking of funds raised, spent, and campaign progress
- **🔐 Secure Authentication**: Supabase-powered authentication with role-based access
- **💼 Care Provider Dashboard**: Manage dogs, campaigns, expenses, and updates
- **🔍 Campaign Discovery**: Browse active campaigns and find dogs in need

## 🏗️ Structure

This monorepo uses [Turborepo](https://turbo.build/repo) and contains:

```
welovedogs/
├── apps/
│   ├── web/          # Next.js frontend with Stellar SDK
│   └── backend/      # Supabase backend configuration
├── contracts/        # Stellar Soroban smart contracts
│   ├── donation/     # Donation tracking contract
│   └── pod-poap/     # Proof of Donation NFT contract
└── packages/         # Shared packages
    └── tsconfig/     # Shared TypeScript configurations
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools) (for contract development)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for backend development)
- Docker (for local Supabase)

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Set up the web app environment:**

```bash
cd apps/web
cp .env.local.example .env.local
# Edit .env.local with your configuration (see Environment Variables below)
```

3. **Initialize and start Supabase:**

```bash
cd apps/backend
npx supabase init
npm run dev
npm run status  # Get credentials for .env.local
```

4. **Build Soroban contracts:**

```bash
cd contracts
npm run build
```

5. **Start the development server:**

```bash
npm run dev
```

## 📦 Apps & Packages

### Web (`apps/web`)

Next.js 16 application featuring:

- TypeScript for type safety
- Tailwind CSS for styling
- Supabase client for backend services
- Stellar SDK integration for blockchain operations
- Stellar Wallets Kit for multi-wallet support
- Campaign management and donation flows
- POD POAP NFT minting and gallery

**Commands:**

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Backend (`apps/backend`)

Supabase configuration for:

- PostgreSQL database with Row Level Security (RLS)
- Authentication (email/password, OAuth)
- Real-time subscriptions for campaign updates
- Storage buckets for dog images and campaign media
- Edge Functions for serverless operations

**Commands:**

```bash
npm run dev        # Start local Supabase
npm run stop       # Stop local Supabase
npm run status     # Show connection details
npm run types      # Generate TypeScript types
```

### Contracts (`contracts`)

Stellar Soroban smart contracts:

- **donation**: Tracks donation transactions on-chain
- **pod-poap**: Mints Proof of Donation NFTs for donors

**Commands:**

```bash
npm run build      # Build contracts
npm run test       # Run tests
npm run optimize   # Optimize WASM
```

## 🔧 Development

### Root Commands

```bash
npm run dev        # Start all apps in development mode
npm run build      # Build all apps
npm run lint       # Lint all apps
npm run format     # Format code with Prettier
```

### Git Hooks

This project uses Husky for git hooks:

- **pre-commit**: Runs lint-staged to lint and format staged files

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Blockchain**: Stellar Network, Soroban Smart Contracts (Rust)
- **Wallets**: Stellar Wallets Kit (xBull, Freighter, WalletConnect)
- **Build System**: Turborepo
- **Package Manager**: npm
- **Code Quality**: ESLint, Prettier, Husky

## 🌍 Environment Variables

Set these in `apps/web/.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stellar Network Configuration
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_STELLAR_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org

# App Configuration
NEXT_PUBLIC_APP_NAME=We Love Dogs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Wallet Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Contract Bindings (generated by Stellar CLI)
DONATION_BINDING=donation
POD_POAP_BINDING=pod_poap
```

## 🔐 Wallet Connection

The app supports multiple Stellar wallets:

- **xBull Wallet**: Browser extension
- **Freighter Wallet**: Browser extension
- **WalletConnect**: Mobile wallet support
- **Auto-reconnect**: Wallet selection and address persisted in localStorage

## 📚 Learn More

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Documentation](https://soroban.stellar.org/docs)
- [Stellar Wallets Kit](https://github.com/creit-tech/stellar-wallets-kit)

## 🧩 Smart Contracts

### Donation Contract

Tracks donation transactions on the Stellar network, providing transparency and verifiability for all contributions.

### POD POAP Contract

Mints Proof of Donation NFTs as commemorative tokens for donors, built with OpenZeppelin Stellar Soroban Contracts.

See `apps/web/CONTRACTS_GUIDE.md` for detailed contract integration instructions.

## 📄 License

ISC
