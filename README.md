# CryptoCorp Vesting Oracle & NFT

Full-stack Web3 app: signup grants a **Member Badge NFT** and **1000 CCT** tokens vested for 1 day. Users view their NFT and vesting schedules on a dashboard and claim tokens when unlocked.

## Tech Stack

- **Contracts**: Solidity, Hardhat, OpenZeppelin (ERC20, ERC721, Ownable)
- **Backend**: Node.js, Express, Mongoose (MongoDB), Ethers.js, Pinata (IPFS)
- **Frontend**: React, TypeScript-safe JSX, Tailwind CSS, Ethers.js, Vite

## Running on Local Network (Hardhat)

Since there is no Polygon faucet, the app is set up to use a **local Hardhat node** (chainId 31337).

### 1. Environment variables

**Backend** (`backend/.env`):

- Copy from `backend/.env.example`.
- Set `MONGO_URI` (MongoDB connection string).
- For local:
  - `RPC_URL=http://127.0.0.1:8545`
  - `ADMIN_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` (Hardhat account #0)
- After deploying (step 3), set:
  - `TOKEN_ADDRESS=...`
  - `NFT_ADDRESS=...`
  - `VESTING_ADDRESS=...`
- Pinata (IPFS): `PINATA_API_KEY`, `PINATA_SECRET_KEY` from [Pinata](https://app.pinata.cloud).
- Optional: `CORS_ORIGIN=http://localhost:3000` (default).

**Frontend** (`frontend/.env`):

- Copy from `frontend/.env.example`.
- After deploying, set `VITE_VESTING_ADDRESS=<VESTING_ADDRESS from deploy output>`.
- Defaults: `VITE_CHAIN_ID=31337`, `VITE_RPC_URL=http://127.0.0.1:8545`.

### 2. Install dependencies

```bash
cd contracts && npm install
cd ../backend && npm install
cd ../frontend && npm install
```

### 3. Start local chain and deploy contracts

Terminal 1 – start Hardhat node:

```bash
cd contracts
npx hardhat node
```

Leave it running. In **Terminal 2** – deploy:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

Copy the printed `TOKEN_ADDRESS`, `NFT_ADDRESS`, and `VESTING_ADDRESS` into `backend/.env` and `VITE_VESTING_ADDRESS` (Vesting only) into `frontend/.env`. The deploy script also copies ABIs to `backend/abis/`.

### 4. Start backend

```bash
cd backend
npm start
```

This starts the API and the vesting indexer (listens for `ScheduleCreated` and writes to MongoDB).

### 5. Start frontend

```bash
cd frontend
npm run dev
```

Open the app (e.g. `http://localhost:3000`). The Vite dev server proxies `/api` to the backend.

### 6. Use the app

1. **MetaMask**: Add network “Localhost 8545” with RPC `http://127.0.0.1:8545` and chainId `31337`, or use “Switch to Local Network” on the dashboard.
2. **Login**: Connect wallet → if user exists, redirect to Dashboard; else redirect to Signup.
3. **Signup**: Enter name and email (wallet auto-filled) → Register → backend stores user, uploads NFT metadata to IPFS, mints Member Badge NFT, creates 1000 CCT vesting (unlock in 1 day).
4. **Dashboard**: View Member Badge NFT (metadata from Token URI), vesting table, and **Claim** when a schedule is unlocked.

## Project layout

```
cryptocorp-vesting-nft/
├── contracts/          # Solidity + Hardhat
│   ├── contracts/      # OrganizationToken, Vesting, MemberNFT
│   └── scripts/       # deploy.js (deploy + copy ABIs)
├── backend/            # Express + MongoDB + indexer
│   ├── abis/           # MemberNFT.json, Vesting.json (filled by deploy)
│   └── src/            # routes, services, indexer, models
└── frontend/           # React + Vite + Tailwind
    └── src/            # pages, contexts, api, config
```

## API summary

- `POST /api/signup` – name, email, walletAddress → store user, IPFS metadata, mint NFT, create vesting.
- `POST /api/login` – walletAddress → user profile or 404.
- `GET /api/vesting/:walletAddress` – vesting schedules for user.
- `GET /api/analytics/total-vested` – total tokens locked in vesting (from indexer data).
