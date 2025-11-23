# We Love Dogs 🐕

A Web3 crowdfunding platform built on Stellar blockchain to help dogs in need get the care they deserve. Care providers can create fundraising campaigns for dogs, and donors can contribute using Stellar USDC with two donation options: **Escrow** (proof-based release) or **Instant** (immediate access). All donations are transparent and tracked on-chain, with Proof of Donation (POD) NFTs as commemorative tokens.

## 🌟 Features

### 🐕 Dog Campaigns

- **Campaign Creation**: Care providers create fundraising campaigns for dogs needing medical care, surgery, food, shelter, and more
- **Campaign Management**: Full dashboard for managing dogs, campaigns, expenses, and updates
- **Real-time Tracking**: Track funds raised, spent, and campaign progress in real-time
- **Campaign Updates**: Post updates with images and progress reports
- **Expense Tracking**: Record and track expenses with proof documentation

### 💝 Stellar Donations

#### Escrow Donations (Proof-Based Release)

- **Secure Escrow**: Funds held in escrow accounts via Trustless Work smart contracts
- **Proof of Expense**: Care providers must provide proof of expense before funds are released
- **Transparency**: All escrow transactions are tracked on-chain
- **Multi-party Security**: Platform, dispute resolver, and release signer roles ensure fund security

#### Instant Donations

- **Immediate Access**: Funds sent directly to campaign's Stellar wallet address
- **Quick Support**: Care providers can access funds immediately for urgent needs
- **Simple Flow**: One-click donation with wallet connection

#### Donation Features

- **Dual Donation Types**: Choose between escrow or instant donations per campaign
- **USDC Support**: Donate using Stellar USDC (testnet and mainnet)
- **On-chain Transparency**: All transactions recorded on Stellar blockchain
- **Real-time Statistics**: Track escrow vs instant donation breakdowns
- **Donation History**: Complete transaction history with explorer links

### 🎖️ Proof of Donation (POD) NFTs

- **Commemorative Tokens**: Receive POD POAP NFTs as proof of your contribution
- **NFT Gallery**: View your collection of donation NFTs
- **Metadata Rich**: NFTs include campaign and dog information
- **Soroban Smart Contracts**: Built on Stellar Soroban for on-chain verification

### 👥 Multiple User Roles

- **Care Providers**: Create and manage dog profiles, campaigns, and expenses
- **Donors**: Browse campaigns, make donations, and collect POD NFTs
- **Rescuers**: Profile pages showcasing rescued dogs
- **Shelters**: Organization profiles with multiple campaigns
- **Veterinarians**: Professional profiles with specialized care campaigns

### 🔐 Security & Trust

- **Supabase Authentication**: Secure email/password and OAuth authentication
- **Row Level Security**: Database-level security policies
- **Wallet Integration**: Multiple Stellar wallet support (xBull, Freighter, WalletConnect)
- **Smart Contract Escrow**: Trustless Work escrow contracts for secure fund management
- **On-chain Verification**: All donations verifiable on Stellar blockchain

### 📊 Campaign Discovery

- **Browse Campaigns**: Discover active campaigns on homepage
- **Filter & Sort**: Filter by care provider type, location, urgency, funding status
- **Campaign Cards**: Beautiful cards showing progress, images, and key information
- **Progress Visualization**: Visual progress bars showing escrow vs instant donations
- **Care Provider Directory**: Browse and discover care providers

## 🏗️ Architecture

This monorepo uses [Turborepo](https://turbo.build/repo) and contains:

```
welovedogs/
├── apps/
│   ├── web/          # Next.js 16 frontend with Stellar SDK
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

1. **Clone and install dependencies:**

```bash
git clone <repository-url>
cd welovedogs
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

- **TypeScript** for type safety
- **Tailwind CSS** for styling with custom design system
- **Supabase** client for backend services
- **Stellar SDK** integration for blockchain operations
- **Stellar Wallets Kit** for multi-wallet support
- **Trustless Work** escrow integration for secure donations
- Campaign management and donation flows
- POD POAP NFT minting and gallery
- Real-time updates via Supabase Realtime

**Commands:**

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Backend (`apps/backend`)

Supabase configuration for:

- **PostgreSQL** database with Row Level Security (RLS)
- **Authentication** (email/password, OAuth)
- **Real-time subscriptions** for campaign updates
- **Storage buckets** for dog images and campaign media
- **Edge Functions** for serverless operations

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

### Frontend

- **Next.js 16**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Accessible component primitives

### Backend

- **Supabase**: Backend-as-a-Service
  - PostgreSQL database with RLS
  - Authentication (email/password, OAuth)
  - Real-time subscriptions
  - Storage buckets
  - Edge Functions

### Blockchain

- **Stellar Network**: Public blockchain for payments
- **Soroban Smart Contracts**: Rust-based smart contracts
- **Stellar SDK**: Core blockchain operations
- **Stellar Wallets Kit**: Multi-wallet support (xBull, Freighter, WalletConnect)
- **Trustless Work**: Escrow smart contract platform

### Build & Tools

- **Turborepo**: Monorepo build system
- **npm**: Package manager
- **ESLint & Prettier**: Code quality
- **Husky**: Git hooks

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

# Trustless Work Escrow Configuration
NEXT_PUBLIC_TRUSTLESS_WORK_API_KEY=your_trustless_work_api_key
NEXT_PUBLIC_PLATFORM_ADDRESS=your_platform_stellar_address
NEXT_PUBLIC_DISPUTE_RESOLVER_ADDRESS=your_dispute_resolver_address
NEXT_PUBLIC_RELEASE_SIGNER_ADDRESS=your_release_signer_address
NEXT_PUBLIC_TRUSTLINE_ADDRESS=your_trustline_address
```

## 🔐 Wallet Connection

The app supports multiple Stellar wallets:

- **xBull Wallet**: Browser extension
- **Freighter Wallet**: Browser extension
- **WalletConnect**: Mobile wallet support
- **Auto-reconnect**: Wallet selection and address persisted in localStorage

## 💼 Escrow System

### How Escrow Works

1. **Campaign Creation**: Care provider creates a campaign with fundraising goal
2. **Escrow Setup**: Campaign can optionally set up an escrow account via Trustless Work
3. **Donor Choice**: Donors can choose between:
   - **Escrow Donation**: Funds held securely until proof of expense
   - **Instant Donation**: Immediate transfer to campaign wallet
4. **Fund Release**: For escrow donations, care provider submits proof of expense
5. **Verification**: Release signer verifies proof and releases funds
6. **Transparency**: All transactions tracked on-chain

### Escrow Benefits

- **Donor Confidence**: Funds only released after proof of expense
- **Care Provider Trust**: Builds trust through transparency
- **Dispute Resolution**: Built-in dispute resolution mechanism
- **Multi-party Security**: Multiple roles ensure fund security

## 📚 Documentation

- [Getting Started Guide](./GETTING_STARTED.md)
- [Donation Feature](./DONATION_FEATURE.md)
- [Contracts Guide](./apps/web/CONTRACTS_GUIDE.md)
- [NFT Setup](./apps/web/NFT_SETUP.md)
- [Supabase Setup](./apps/backend/SUPABASE_SETUP.md)

## 🧩 Smart Contracts

### Donation Contract

Tracks donation transactions on the Stellar network, providing transparency and verifiability for all contributions.

### POD POAP Contract

Mints Proof of Donation NFTs as commemorative tokens for donors, built with OpenZeppelin Stellar Soroban Contracts.

See `apps/web/CONTRACTS_GUIDE.md` for detailed contract integration instructions.

## 🔄 Donation Flow

### Escrow Donation Flow

1. Donor browses campaigns and selects a dog
2. Connects wallet via WalletMenu
3. Chooses "Escrow" donation type
4. Enters donation amount
5. Signs transaction to fund escrow account
6. Funds held in escrow until proof of expense
7. Care provider submits expense proof
8. Release signer verifies and releases funds
9. Donor receives POD NFT (optional)

### Instant Donation Flow

1. Donor browses campaigns and selects a dog
2. Connects wallet via WalletMenu
3. Chooses "Instant" donation type
4. Enters donation amount
5. Signs transaction to send USDC directly to campaign wallet
6. Funds immediately available to care provider
7. Donor receives POD NFT (optional)

## 🎨 UI Features

- **Sticky Donation Widget**: Always-visible donation interface on campaign pages
- **Progress Bars**: Visual progress indicators showing escrow vs instant donations
- **Campaign Cards**: Beautiful cards with images, progress, and key stats
- **Real-time Updates**: Live campaign updates and donation notifications
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Glass Morphism**: Modern UI with backdrop blur effects
- **Gradient Branding**: Custom purple/green gradient theme

## 🚢 Deployment

### Build Process

1. TypeScript compilation
2. Next.js production build
3. Contract bindings bundled
4. Static assets optimized

### Environment Variables

Required for production:

- Supabase URL and keys
- Stellar network configuration (testnet/mainnet)
- Contract IDs and bindings
- WalletConnect project ID
- Trustless Work API key and addresses

### Hosting

- Compatible with Vercel, Netlify, or any Node.js host
- Edge runtime support for middleware
- Static export possible for static routes

## 📈 Future Enhancements

- [ ] Multi-chain support
- [ ] Advanced NFT features (rarity, collections)
- [ ] Real-time notifications
- [ ] Analytics dashboard for care providers
- [ ] Mobile app (React Native)
- [ ] Recurring donations
- [ ] Social sharing features
- [ ] Campaign milestones and updates
- [ ] Donor badges and achievements
- [ ] Care provider reputation system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

ISC

## 🙏 Acknowledgments

- [Stellar Development Foundation](https://www.stellar.org/)
- [Supabase](https://supabase.com/)
- [Trustless Work](https://trustless.work/)
- [OpenZeppelin Stellar Contracts](https://github.com/OpenZeppelin/stellar-contracts)

---

**Built with ❤️ for dogs in need**
