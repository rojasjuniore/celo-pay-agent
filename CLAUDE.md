# celo-pay-agent

Agente de pagos en chat sobre **Celo**: remesas USDT → COP, gasless, registrado en ERC-8004.
Proyecto para el **Onchain Agents Hackathon** (22 may – 15 jun 2026).

## Reglas heredadas (leer primero)

- **Reglas globales del usuario:** `~/.claude/CLAUDE.md` — las Cuatro Principios (think before coding,
  TDD, simplicity first, surgical changes), no-mock-data, fail-fast, conventional commits, flujo git
  (trabajar en `development`, nunca push directo a `main`). **Aplican a este proyecto.**
- **Reglas de Next.js 16:** `@AGENTS.md` (delega a las reglas de Next que avisan de breaking changes;
  leer `node_modules/next/dist/docs/` antes de escribir código Next).
- **Design system:** `~/.claude/DESIGN.md` (Factory Base) + acento Celo amarillo `#FCFF52`. Tokens
  espejados en `src/lib/design-tokens.ts` y `globals.css`.

@AGENTS.md

## Arquitectura

Ports & adapters. Negocio puro y testeable; I/O en los bordes.

- `src/ports/` — interfaces (LLMPort, WalletPort, PaymentPort, IdentityPort, VerifyPort, BridgePort, RampPort)
- `src/adapters/` — implementaciones (viem, thirdweb, chaoschain, lifi, mento)
- `src/modules/` — lógica de dominio por capa (agent, wallet, payments, identity, verify, bridge, ramp)
- `src/lib/` — config, db, llm, env (Zod), design-tokens
- `src/app/api/{chat,x402/quote,cron/execute}/` — endpoints

## Stack

Next.js 16 · Vercel AI SDK + OpenRouter (Claude Sonnet 4.6) · viem + `feeCurrency` (gasless CIP-64) ·
thirdweb x402 · `@chaoschain/sdk` (ERC-8004) · `@lifi/sdk` · Mento cCOP · Self Agent ID ·
Drizzle + Neon · Zod · **Vitest (TDD)** · Vercel Cron.

## Datos onchain verificados (Celo Mainnet)

- ERC-8004 Identity: `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`
- ERC-8004 Reputation: `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63`
- USDm (Mento Dollar): `0x765DE816845861e75A25fCA122bb6898B8B1282a`
- feeCurrency adapter USDC: `0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B`
- ⚠️ feeCurrency adapter USDT: **POR CONFIRMAR** en `docs.celo.org/llms.txt` antes de mover dinero.

## TDD

Red → Green → Refactor. Unit puros primero (sin red), integración idempotente en Celo Sepolia, E2E
solo del happy path. Gate por commit: `npm run test` + `npm run typecheck` + `npm run lint`.
Cobertura ≥90% en paths críticos. **Sin mock data en producción.**
