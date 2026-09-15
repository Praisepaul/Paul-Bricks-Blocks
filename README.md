# Paul Bricks & Blocks

Simple, mobile-first business management software for Paul Bricks & Blocks.

## Current foundation
The project is an installable PWA for Android-friendly use with multiple users and role-based permissions. The current application includes authentication, customers, products, sales, purchases, expenses and labour payments, with bills, stock, history, documents and GST planned for later phases.

See `docs/ARCHITECTURE.md` for the current architecture and `docs/PROJECT-STATUS.md` for the current delivery status.

## Run locally

After cloning the repository:

```bash
npm install
npm run dev
```

The API is run from the `server` folder with its own dependencies and development command.

## Build

```bash
npm run build
```

For the backend:

```bash
cd server
npm install
npm run build
```

## Current branch
All current foundation work is on `main`.
