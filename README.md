# The Operator's Booth: Meera's Railway Delay API

This is the solution for Problem 1 of Road to Devcon VI.

## How it works

Meera's Railway Delay API exposes parsed railway notices via HTTP. It uses the `x402` Payment Required protocol to natively monetize the endpoints on the Base Sepolia testnet without needing API keys or sign-ups.

### Acceptance Criteria Handled:
1. **A route is gated by x402 payment requirements:** `x402Gate` middleware returns HTTP 402 with the exact x402 JSON payload.
2. **Payment configuration targets a testnet:** Configured entirely via `.env` variables to target the required testnets without hardcoding.
3. **A buyer script pays through an x402 client:** Included in `src/buyer.ts` via manual header construction.
4. **No credential appears in any tracked file:** `.env.example` has placeholders. `.env` is `.gitignore`d.
5. **Route price is not derived from request input:** Defined strictly as environment constants (`PRICE_SINGLE`, `PRICE_BULK`).
6. **payTo address comes from server-side configuration:** Defined strictly via environment variables.
7. **An unparseable notice returns a 4xx status:** Handled efficiently using `zod` schema validation which returns `422 Unprocessable Entity` if parsing fails.
8. **Input size is capped server-side:** Express body-parser enforces a 100kb limit.
9. **Parsed output is validated against a declared schema:** Utilized `zod` objects and arrays.
10. **A test exercises the parser on a malformed notice:** Addressed in `tests/parser.test.ts`.

## Setup

1. Copy `.env.example` to `.env` and fill in your testnet wallet details.
```bash
cp .env.example .env
```
2. Install dependencies:
```bash
npm install
```
3. Run the tests:
```bash
npm test
```
4. Start the server:
```bash
npm run dev
```

## Running the Buyer Script
Once the server is running on `http://localhost:3000`, run the automated buyer script in another terminal to demonstrate the x402 flow:
```bash
npm run buyer
```
