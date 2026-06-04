# celo-pay-agent 🟡

Agente de pagos en chat sobre **Celo**: hablas en lenguaje natural (ES/EN) y el agente paga en
**USDT gasless** (gas pagado en el propio stablecoin vía fee abstraction CIP-64), registrado en
**ERC-8004**, con remesas reales a moneda local. El onchain ocurre **todo en Celo** (swap USDT→cCOP
vía Mento, sin bridges) y el off-ramp es **global vía Noah** (120+ monedas; Colombia es el demo).

Proyecto para el **Onchain Agents Hackathon** de Celo (22 may – 15 jun 2026).

> **Estrategia:** un agente que compite en los 3 tracks — Best Agent (utilidad real),
> Most Activity (tx onchain consistentes) y Highest Rank en 8004scan (identidad ERC-8004).

## Stack

| Capa | Tech |
|---|---|
| UI / Chat | Next.js 16 (App Router) + AI SDK v6 |
| Cerebro | OpenRouter → Claude Sonnet 4.6 (bilingüe ES/EN) |
| Wallet + gasless | viem + `feeCurrency` (CIP-64) |
| Pagos | thirdweb x402 |
| Identidad | ERC-8004 (ABI oficial) → 8004scan |
| Verificación | Self Agent ID (anti-sybil) |
| Swap | **Mento cCOP en Celo** (USDT→cCOP, onchain) |
| Off-ramp | **Noah — global (120+ monedas, corredor por país)** |
| Monetización | Fee de servicio real, configurable, cobrado onchain |
| Persistencia | Drizzle + Neon Postgres |
| Tests | Vitest (TDD) |
| Scheduler | Vercel Cron |

## Flujo (100% en Celo)

```
Usuario (ES/EN) → Claude (OpenRouter) → PaymentIntent (Zod)
  → policy ($/tx) → fee de servicio (transparente) → confirmación
  → ejecución gasless en Celo:
     fee → tesorería · x402 quote · swap USDT→cCOP (Mento) · off-ramp cCOP→COP
  → recibo con links a Celoscan + 8004scan
  → si recurrente: cron lo re-ejecuta (actividad consistente)
```

No hay bridge a otras redes: toda la actividad onchain ocurre en Celo. El **fee de servicio** es una
transacción real más en Celo — modelo de negocio honesto y transparente (se muestra en el recibo),
que además suma volumen onchain.

## Arquitectura

Ports & adapters — el dominio es puro y testeable; el I/O (blockchain, LLM, DB) vive en los bordes.

```
src/
├─ modules/{agent,wallet,payments,identity,verify,ramp,revenue,scheduler}/   # dominio puro
├─ ports/        # interfaces (Wallet, Payment, Identity, LLM, Ramp, Revenue, Verify)
├─ adapters/     # impls (viem, thirdweb, erc8004, openrouter, mento, treasury, self)
├─ components/chat/   # UI tipada (DESIGN.md + acento Celo)
├─ lib/          # env (Zod), celo-constants, db, design-tokens
└─ app/api/{chat,x402/quote,cron/execute}/                        # endpoints
```

## Desarrollo

```bash
npm install
cp .env.example .env.local   # completar con credenciales reales (sin esto, falla fuerte; nada mockeado)
npm run test                 # Vitest (49 tests)
npm run typecheck            # tsc --noEmit
npm run build                # build de producción
npm run dev                  # http://localhost:3000
```

**Registro del agente en ERC-8004:** `npm run register-agent` (requiere `AGENT_PRIVATE_KEY`,
`CELO_RPC_URL`, `PINATA_JWT`). Imprime el `agentId` y el link a 8004scan.

**TDD:** Red → Green → Refactor. `npm run test && npm run typecheck && npm run lint` antes de cada commit.

## Datos onchain (Celo Mainnet)

- ERC-8004 Identity: `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`
- USDT: `0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e`
- cCOP (Mento): `0x8A567e2aE79CA692Bd748aB832081C45de4041eA`
- feeCurrency adapter USDC (verificado): `0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B`
- ⚠️ Mento Broker y feeCurrency-USDT: configurar/verificar antes de mover dinero (ver `.env.example`).

## Estado

- [x] Dominio bilingüe `parseIntent` (ES/EN)
- [x] WalletPort gasless (viem + `feeCurrency`)
- [x] IdentityPort ERC-8004 (register → 8004scan)
- [x] PaymentPort x402 (thirdweb)
- [x] LLMPort + chat streaming (AI SDK v6)
- [x] DB Drizzle/Neon + cron autónomo
- [x] RampPort cCOP (Mento) + RevenuePort (fee real) — todo en Celo
- [x] VerifyPort Self Agent ID
- [x] UI chat 3 zonas (DESIGN.md) · build de producción OK
- [ ] Cableado E2E del flujo de ejecución en la UI (tool calls) + feed de actividad real
- [ ] Registro onchain real + submission por Celopedia

## Roadmap de negocio

- v2: monetización por **spread FX** (margen en la tasa USD→COP) además del fee de servicio.

## Licencia

MIT
