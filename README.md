# celo-pay-agent 🟡

Agente de pagos en chat sobre **Celo**: hablas en lenguaje natural (ES/EN) y el agente paga en
**USDT gasless** (gas pagado en el propio stablecoin vía fee abstraction), registrado en
**ERC-8004**, con utilidad real de remesas **USDT → COP**.

Proyecto para el **Onchain Agents Hackathon** de Celo (22 may – 15 jun 2026).

> **Estrategia:** un agente que compite en los 3 tracks — Best Agent (utilidad real),
> Most Activity (tx onchain consistentes) y Highest Rank en 8004scan (identidad ERC-8004).

## Stack

| Capa | Tech |
|---|---|
| UI / Chat | Next.js 16 (App Router) + Vercel AI SDK |
| Cerebro | OpenRouter → Claude Sonnet 4.6 (bilingüe ES/EN) |
| Wallet + gasless | viem + `feeCurrency` (CIP-64) |
| Pagos | thirdweb x402 |
| Identidad | ERC-8004 (`@chaoschain/sdk`) → 8004scan |
| Verificación | Self Agent ID (anti-sybil) |
| Bridge | Li.Fi (Celo → Polygon) |
| Off-ramp | Mento cCOP |
| Persistencia | Drizzle + Neon Postgres |
| Tests | Vitest (TDD) |
| Scheduler | Vercel Cron |

## Arquitectura

Ports & adapters — el dominio es puro y testeable; el I/O (blockchain, LLM, DB) vive en los bordes.

```
src/
├─ modules/{agent,wallet,payments,identity,verify,bridge,ramp}/   # dominio
├─ ports/        # interfaces
├─ adapters/     # impls concretas (viem, thirdweb, chaoschain, lifi, mento)
├─ lib/          # config, db, llm, env (Zod), design-tokens
└─ app/api/{chat,x402/quote,cron/execute}/                        # endpoints
```

## Desarrollo

```bash
npm install
cp .env.example .env.local   # completar con credenciales reales
npm run test                 # Vitest
npm run dev                  # http://localhost:3000
```

**TDD:** Red → Green → Refactor. `npm run test && npm run typecheck && npm run lint` antes de cada commit.

## Estado

- [x] Día 0 — Scaffold + dominio bilingüe `parseIntent` (8 tests verdes) + arquitectura de puertos
- [ ] Día 1 — WalletPort: transfer USDT gasless (`feeCurrency`)
- [ ] Día 2 — ERC-8004 register → visible en 8004scan
- [ ] Día 3 — x402 (server + cliente)
- [ ] Día 4 — Chat OpenRouter → PaymentIntent
- [ ] Día 5 — Cron executor (autonomía → volumen)
- [ ] … (ver `CLAUDE.md` para el plan completo)

## Licencia

MIT
