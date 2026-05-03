# VibeScan AI — On-Chain Vibe Intelligence

> **Decode the market vibe in seconds.** Stream any token through the Vibe Engine to fuse real-time DEX/CEX prices with social signal into a single verdict.

🔗 **Live Demo:** [vibe-scan-ai.vercel.app](https://vibe-scan-ai.vercel.app)

---

## What is VibeScan AI?

VibeScan AI is an on-chain intelligence dashboard for **Solana and Ethereum traders**. It aggregates live price data from DexScreener and Gate.io, combines it with on-chain metrics, and runs it through an AI Vibe Engine to produce a single **Vibe Score (0–100)** — a Bear-to-Bull signal for any token.

No noise. No tab-switching. One verdict.

---

## Features

- **AI Vibe Analyzer** — Enter any token symbol (e.g. `$SOL`, `$WIF`, `$PEPE`) and get an instant AI-generated vibe score fusing price momentum, liquidity depth, and social signal
- **Live Price Feed** — Real-time DEX prices sourced from DexScreener (Raydium, Uniswap) with 24h price chart sparklines
- **Liquidity Depth** — 24h pool depth indicator showing market health
- **Vibe Score (0–100)** — Proprietary Bear→Bull gauge updated on every analysis
- **Trending Vibe Board** — Live leaderboard of top tokens with Whale Alerts, sorted by vibe momentum
- **Connect Wallet** — Web3 wallet integration via RainbowKit (supports MetaMask, Coinbase Wallet, WalletConnect)
- **Multi-chain Support** — Solana and Ethereum tokens in one unified interface
- **Version v0.2.0** — Production-ready MVP

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Web3 | RainbowKit + wagmi v2 + viem v2 |
| Data — DEX | DexScreener API |
| Data — CEX | Gate.io API |
| State | TanStack Query (React Query v5) |
| Deployment | Vercel |

---

## Project Structure

```
src/
  app/
    api/
      vibe/          # AI Vibe Score streaming endpoint
      token/[symbol] # Token price & metadata
      trending/      # Trending tokens feed
    layout.tsx
    page.tsx
  components/
    dashboard/
      VibeAnalyzer.tsx   # Main AI analyzer input
      VibeList.tsx       # Trending vibe leaderboard
      DataCards.tsx      # Price / Liquidity / Vibe cards
      Sparkline.tsx      # Mini price chart
      Header.tsx
      ConnectWallet.tsx
    providers/           # Web3 & Query providers
    ui/                  # Shared UI components
  lib/
    dexscreener.ts       # DexScreener API client
    gateio.ts            # Gate.io API client
    marketData.ts        # Unified market data layer
    motion.ts            # Animation variants
    utils.ts
  hooks/                 # Custom React hooks
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/Claire356/vibe-scan-ai.git
cd vibe-scan-ai
npm install --legacy-peer-deps
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the root:

```env
# Add any required API keys here
```

### Build for Production

```bash
npm run build
npm start
```

---

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Claire356/vibe-scan-ai)

Set the **Install Command** to:
```
npm install --legacy-peer-deps
```

---

## Roadmap

- [ ] Wallet portfolio vibe scan
- [ ] AI-generated trade thesis (streaming)
- [ ] Alerts & push notifications
- [ ] Multi-wallet watchlist
- [ ] Historical vibe score chart
- [ ] Mobile app (React Native)

---

## License

MIT © [Claire356](https://github.com/Claire356)

---

> *Vibes are signals, not strategies.*
