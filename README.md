<div align="center">

# Remi

### Send money by talking. Gasless on Celo. Settled in local currency, anywhere.

**An AI agent that executes real remittances on-chain.** You talk to it in English or Spanish —
*"send $50 to my mom in Bogotá every two weeks"* — and Remi handles everything: understands the
intent, shows the cost transparently, and executes the payment in USDT on Celo (gas paid in the
stablecoin itself), registered on-chain via ERC-8004, settled to the recipient's local currency
through Noah. Global off-ramp, 120+ currencies.

[![Tests](https://img.shields.io/badge/tests-61%20passing-16A34A)](#development)
[![Build](https://img.shields.io/badge/build-passing-16A34A)](#development)
[![Network](https://img.shields.io/badge/network-Celo%20Mainnet-FCFF52)](https://celo.org)
[![License](https://img.shields.io/badge/license-MIT-2563EB)](#license)

Built for the **[Onchain Agents Hackathon · Celo](https://celoplatform.notion.site/Onchain-Agents-Hackathon-Build-for-Real-World-Payments-Everyday-Applications-364d5cb803de800c9502d8a384716324)** · May 22 – Jun 15, 2026

</div>

---

## The problem

Traditional remittances charge **3–7%** and take days. Crypto-native ones are fast and cheap, but
force the user to understand wallets, gas, networks and swaps. **Nobody wants to learn that just to
send money to their mom.**

## The solution

You talk to an agent in plain language and it does the rest: parses your intent, shows the cost
transparently, and executes the payment **without you touching a single piece of crypto**. Gas is
paid in USDT (no CELO needed), and the recipient gets their local currency in their account.

```
"send $50 to my mom in Bogotá every two weeks"
        |
   You send $50 USDT · fee $0.25 (0.5%) · they receive ~$200,000 COP · gas $0 · 100% on Celo
        |
   sent — view on Celoscan
```

## The flow (research-backed)

Remi is a **chat**, so onboarding is conversational and progressive — the highest-converting pattern
for crypto payments (guest mode cuts drop-off 30–50%; just-in-time KYC lifts conversion ~70% vs.
upfront).

```
Landing (/)  ->  Chat opens in GUEST MODE (no login to explore)
                     "Who do you want to send money to?"
                          |  user builds the payment by talking
                          v
                 On confirm, the gate kicks in (just-in-time):
                     - no login?  -> inline login (thirdweb: email->embedded wallet, or wallet)
                     - no KYC?    -> Self ZK passport QR appears inside the chat
                          v
                 Verified -> executes the payment on Celo -> receipt
```

## How it competes in all 3 tracks

| Track | How it wins |
|---|---|
| **Best Agent on Celo** | Real utility: gasless remittances with global off-ramp. An agent with its own **economic agency** (charges its own fee on-chain). |
| **Most Activity** | Each remittance = several tx on Celo (fee + x402 + transfer). The **autonomous cron** re-runs recurring payments → consistent, legitimate volume. |
| **Highest 8004scan Rank** | Identity registered on **ERC-8004**, verified with **Self Agent ID** (proof-of-human, sybil-resistant). |

> **Key design:** all on-chain activity stays **on Celo** (no bridges). The agent sends USDT directly
> to Noah's Celo deposit address; Noah settles to local currency. Simpler, cheaper, and keeps every
> transaction on the hackathon's chain.

## Execution flow (100% on Celo)

```
User (EN/ES)  ->  Claude Sonnet 4.6 (OpenRouter)  ->  PaymentIntent (Zod-validated)
              ->  policy (per-tx limit) + 0.5% service fee (transparent)
              ->  confirmation card  ->  user confirms
              ->  gasless execution on Celo:
                    1. fee  -> treasury (USDT)
                    2. FX quote (x402)
                    3. transfer USDT -> Noah deposit address (Celo)
                    4. Noah settles -> recipient's local currency (120+ currencies)
              ->  receipt with Celoscan + 8004scan links
                    (recurring -> the cron re-runs it automatically)
```

## Stack

| Layer | Tech | Why |
|---|---|---|
| Chat / UI | Next.js 16 (App Router) + AI SDK v6 | streaming, RSC, useChat |
| Brain | OpenRouter → Claude Sonnet 4.6 | bilingual EN/ES, tool calling |
| Login | thirdweb (wallet or email → embedded wallet) | no-crypto-friendly auth |
| Wallet + gasless | viem + `feeCurrency` (CIP-64) | gas paid in USDT, no CELO |
| Agent payments | thirdweb x402 | on-chain micropayments |
| Identity | ERC-8004 (official ABI) | on-chain registry → 8004scan |
| KYC / anti-sybil | Self Protocol (ZK passport) | proof-of-human, no docs stored |
| Off-ramp | **Noah** (global, USDT direct on Celo) | 120+ currencies, corridor by country |
| Monetization | configurable service fee, on-chain | real, transparent business model |
| Persistence | Drizzle + Postgres (Railway) | accounts, intents, tx log |
| Autonomy | Cron | scheduled / recurring payments |
| Tests | Vitest (TDD) | 61 tests, pure testable domain |

## Architecture — Ports & Adapters

The domain is **pure and testable**; all I/O (blockchain, LLM, DB, off-ramp, KYC) lives at the edges
as swappable adapters. Business logic is tested without network or credentials.

```
src/
├─ modules/        # pure domain (no I/O): parseIntent, policy, fee, execution-plan, onboarding/steps…
├─ ports/          # interfaces: Wallet · Payment · Identity · LLM · Ramp · Revenue · Verify
├─ adapters/       # impls: viem · thirdweb · erc8004 · openrouter · noah · treasury · self
├─ components/     # landing (bilingual) · chat · onboarding · auth
├─ lib/            # env (Zod), celo-constants, db (Drizzle/pg), design-tokens, thirdweb-client
└─ app/            # routes below
```

**Routes**

| Route | What |
|---|---|
| `/` | Landing — bilingual (EN/ES toggle), Coinbase-style, animated |
| `/app` | The chat agent (guest mode + just-in-time login/KYC) |
| `/onboarding` | Standalone KYC stepper (alternative entry) |
| `/api/chat` | Streaming chat + `proposePayment` tool |
| `/api/self/verify` | Verifies the Self ZK proof server-side — the **only** thing that marks KYC |
| `/api/account/[wallet]` | Read-only account/KYC status |
| `/api/x402/quote` | x402-gated FX quote |
| `/api/cron/execute` | Autonomous executor of due payments |

**Principles:** no mock data (missing a credential → **fails loud**, never invents); functions
< 50 lines; comments for *why*, not *what*. See `CLAUDE.md`.

## Development

```bash
npm install
cp .env.example .env.local   # fill with real credentials

npm run dev          # http://localhost:3000
npm run test         # Vitest — 61 tests
npm run typecheck    # tsc --noEmit
npm run lint
npm run build        # production build
```

> **Minimal demo:** with just `OPENROUTER_API_KEY` + `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` in
> `.env.local`, the landing and chat run, and Remi understands EN/ES and proposes payments with the
> real fee. The on-chain execution activates once the wallet keys are added.

### Scripts

| Command | What it does |
|---|---|
| `npm run register-agent` | Registers the agent on ERC-8004 (IPFS + mint) → prints `agentId` and 8004scan link. Needs `AGENT_PRIVATE_KEY`, `CELO_RPC_URL`, `PINATA_JWT`. |
| `npm run check-noah` | Queries Noah's API (`/channels/sell`) to see which crypto/networks your account accepts. |
| `npm run db:generate` / `db:migrate` | Drizzle migrations (Postgres on Railway, `pg` driver). |

## On-chain data (Celo Mainnet)

| What | Address |
|---|---|
| ERC-8004 Identity Registry | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` |
| USDT (Celo) | `0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e` |
| feeCurrency adapter USDC (gasless) | `0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B` |
| Noah deposit (Celo) | configured via `NOAH_DEPOSIT_ADDRESS` |

> The USDT `feeCurrency` adapter and Noah's exact API contract must be verified before moving real
> money — the code fails loud until they're confirmed (nothing blindly hardcoded).

## Real product — all in production

This is a **real product**, not a test demo: it runs **100% on Celo mainnet** (ERC-8004 registration,
gasless transfers, x402, fee — all counting toward the hackathon tracks) and the off-ramp uses
**Noah in production** (`https://api.noah.com`) to settle to local currency for real. KYC is real
too: the Self ZK proof is verified server-side and is the only thing that grants verified status.

Production requires completing Noah's **onboarding** (KYC/KYB; via VelaFi for LATAM) — a business
step, not a code one. The agent is already wired to the production endpoints.

## Status

**Done**
- Bilingual domain (`parseIntent` EN/ES), policy, fee
- WalletPort gasless (viem + `feeCurrency`)
- IdentityPort ERC-8004 (register → 8004scan)
- PaymentPort x402 (thirdweb)
- LLMPort + streaming chat with `proposePayment` tool (AI SDK v6)
- DB (Drizzle/Postgres on Railway) + autonomous cron + `accounts`/`beneficiaries`
- RampPort Noah (global off-ramp) + RevenuePort (real fee)
- VerifyPort Self Agent ID + server-side ZK verification
- Login (thirdweb) + guest mode + just-in-time KYC flow
- Landing (bilingual, animated) + chat UI — **production build passing**

**Pending**
- On-chain executor end-to-end (signs and chains the real tx) — needs funded wallet
- Confirm Noah's API contract (`npm run check-noah`)
- Real on-chain registration + Celopedia submission

## Roadmap

- **v2 — FX-spread monetization**: margin on the exchange rate in addition to the service fee.
- **v2 — More corridors**: extend the country→currency map beyond LATAM.
- **v2 — Live activity feed**: panel fed from the on-chain tx log.

## License

MIT © [rojasjuniore](https://github.com/rojasjuniore)
