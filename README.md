<div align="center">

# celo-pay-agent 🟡

### Envía dinero hablando. Gasless en Celo. Liquidado en moneda local, en cualquier país.

**Un agente de IA conversacional que ejecuta pagos y remesas reales onchain** — hablas en
español o inglés, y el agente paga en USDT sobre Celo (gas pagado en el propio stablecoin),
registrado on-chain en ERC-8004, y liquida a la moneda local del destinatario vía Noah.

[![Tests](https://img.shields.io/badge/tests-56%20passing-16A34A)](#desarrollo)
[![Build](https://img.shields.io/badge/build-passing-16A34A)](#desarrollo)
[![Celo](https://img.shields.io/badge/network-Celo%20Mainnet-FCFF52)](https://celo.org)
[![License](https://img.shields.io/badge/license-MIT-2563EB)](#licencia)

Proyecto para el **[Onchain Agents Hackathon de Celo](https://celoplatform.notion.site/Onchain-Agents-Hackathon-Build-for-Real-World-Payments-Everyday-Applications-364d5cb803de800c9502d8a384716324)** · 22 may – 15 jun 2026

</div>

---

## El problema

Las remesas tradicionales cobran **3–7%** y tardan días. Las cripto-nativas son rápidas y baratas,
pero exigen que el usuario entienda wallets, gas, redes y swaps. **Nadie quiere aprender eso para
mandarle plata a su mamá.**

## La solución

Le hablas normal a un agente — *"manda $50 a mi mamá en Bogotá cada quincena"* — y él hace todo:
interpreta la intención, te muestra el costo de forma transparente, y ejecuta el pago **sin que
toques una sola pieza de cripto**. El gas se paga en USDT (no necesitas CELO), y el destinatario
recibe pesos (o su moneda local) en su cuenta.

```
"send $50 to my mom in Bogotá every two weeks"
        ↓
  💸 $50 USDT · fee $0.25 (0.5%) · recibe ~$200.000 COP · gas $0 · 100% en Celo
        ↓
  ✅ enviado — ver en Celoscan ↗
```

## Por qué compite en los 3 tracks

| Track | Cómo lo gana |
|---|---|
| 🥇 **Best Agent on Celo** | Utilidad real: remesas gasless con off-ramp global. Agente con **agencia económica real** (cobra su propio fee onchain). |
| ⚡ **Most Activity** | Cada remesa = varias tx en Celo (fee + x402 + transfer). El **cron autónomo** re-ejecuta pagos recurrentes → volumen consistente y legítimo. |
| 🏆 **Highest 8004scan Rank** | Identidad registrada en **ERC-8004**, verificada con **Self Agent ID** (proof-of-human, anti-sybil). |

> **Diseño clave:** todo el onchain ocurre **dentro de Celo** (sin bridges a otras redes). El agente
> envía USDT directo a Noah en Celo; Noah liquida a moneda local. Más simple, más barato, y mantiene
> toda la actividad en la cadena del hackatón.

## Cómo funciona

```
┌─ Usuario (ES/EN) ──────────────────────────────────────────────┐
│  "manda $50 a mi mamá en Bogotá cada quincena"                  │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
   🧠  Claude Sonnet 4.6 (OpenRouter)  →  PaymentIntent (validado con Zod)
                             ▼
   🛡️  Policy (límite por tx)  +  fee de servicio 0.5% (transparente)
                             ▼
   ✅  Tarjeta de confirmación  →  el usuario confirma
                             ▼
   ⛓️  Ejecución gasless, 100% en Celo:
        1. fee → tesorería (USDT)
        2. quote de FX (x402)
        3. transfer USDT → deposit address de Noah (Celo)
        4. Noah liquida → moneda local del destinatario (120+ monedas)
                             ▼
   🧾  Recibo con links a Celoscan + 8004scan
        └─ si es recurrente → el cron lo re-ejecuta automáticamente
```

## Stack

| Capa | Tecnología | Por qué |
|---|---|---|
| Chat / UI | Next.js 16 (App Router) + AI SDK v6 | streaming, RSC, useChat |
| Cerebro | OpenRouter → Claude Sonnet 4.6 | bilingüe ES/EN, tool calling |
| Wallet + gasless | viem + `feeCurrency` (CIP-64) | gas pagado en USDT, sin CELO |
| Pagos agente-a-agente | thirdweb x402 | micro-pagos onchain |
| Identidad | ERC-8004 (ABI oficial) | registro on-chain → 8004scan |
| Anti-sybil | Self Agent ID | proof-of-human |
| Off-ramp | **Noah** (global, USDT directo en Celo) | 120+ monedas, corredor por país |
| Monetización | fee de servicio configurable, onchain | modelo de negocio real y transparente |
| Persistencia | Drizzle + Neon Postgres | intents + log de tx (datos reales) |
| Autonomía | Vercel Cron | pagos programados/recurrentes |
| Tests | Vitest (TDD) | 56 tests, dominio puro testeable |

## Arquitectura — Ports & Adapters

El dominio es **puro y testeable**; todo el I/O (blockchain, LLM, DB, off-ramp) vive en los bordes
como adapters intercambiables. Esto permite testear la lógica de negocio sin red ni credenciales.

```
src/
├─ modules/        # dominio puro (sin I/O): parseIntent, policy, fee, execution-plan…
│  └─ {agent, wallet, payments, identity, verify, ramp, revenue, scheduler}/
├─ ports/          # interfaces: Wallet · Payment · Identity · LLM · Ramp · Revenue · Verify
├─ adapters/       # implementaciones: viem · thirdweb · erc8004 · openrouter · noah · treasury · self
├─ components/chat/ # UI tipada (DESIGN.md + acento Celo #FCFF52)
├─ lib/            # env (Zod), celo-constants, db (Drizzle), design-tokens
└─ app/api/        # endpoints: /chat · /x402/quote · /cron/execute
```

**Principios:** sin mock data (si falta una credencial, **falla fuerte**, no inventa); funciones
< 50 líneas; comentarios solo para el *por qué*. Ver `CLAUDE.md`.

## Desarrollo

```bash
npm install
cp .env.example .env.local   # completar con credenciales reales

npm run dev          # http://localhost:3000
npm run test         # Vitest — 56 tests
npm run typecheck    # tsc --noEmit
npm run lint
npm run build        # build de producción
```

> **Demo mínima:** con solo `OPENROUTER_API_KEY` en `.env.local`, el chat ya conversa, entiende
> ES/EN y propone pagos con el fee real. El flujo onchain se activa al añadir las llaves de wallet.

### Scripts

| Comando | Qué hace |
|---|---|
| `npm run register-agent` | Registra el agente en ERC-8004 (IPFS + mint) → imprime `agentId` y link a 8004scan. Requiere `AGENT_PRIVATE_KEY`, `CELO_RPC_URL`, `PINATA_JWT`. |
| `npm run check-noah` | Consulta la API de Noah (`/channels/sell`) para ver qué cripto/redes acepta tu cuenta. |
| `npm run db:generate` / `db:migrate` | Migraciones Drizzle (Neon Postgres). |

## Datos onchain (Celo Mainnet)

| Qué | Dirección |
|---|---|
| ERC-8004 Identity Registry | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` |
| USDT (Celo) | `0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e` |
| feeCurrency adapter USDC (gasless) | `0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B` |
| Noah deposit (Celo) | configurable en `NOAH_DEPOSIT_ADDRESS` |

> ⚠️ El adapter `feeCurrency` de USDT y el contrato exacto de la API de Noah deben verificarse antes
> de mover dinero real — el código falla fuerte hasta confirmarlos (nada hardcodeado a ciegas).

### Noah: sandbox vs producción

El off-ramp tiene dos entornos, intercambiables con **una sola variable** (`NOAH_API_BASE`):

| Entorno | Uso | Onboarding |
|---|---|---|
| **Sandbox** | Demo y video del hackatón — flujo completo sin liquidar fiat real | Ninguno (registro autogestionado) |
| **Producción** (`https://api.noah.com`) | Liquidar a moneda local de verdad | KYC/KYB + contrato (vía VelaFi para LATAM) |

El **onchain en Celo es siempre real** (registro ERC-8004, transfers, x402, fee) — eso es lo que
puntúan los tracks. El off-ramp a fiat es el último paso, fuera de la cadena: para el demo va por
**sandbox** (sin esperar el onboarding de prod), y el código queda **listo para prod** cambiando solo
`NOAH_API_BASE`.

## Estado

**Listo:**
- ✅ Dominio bilingüe (`parseIntent` ES/EN) · policy · fee
- ✅ WalletPort gasless (viem + `feeCurrency`)
- ✅ IdentityPort ERC-8004 (register → 8004scan)
- ✅ PaymentPort x402 (thirdweb)
- ✅ LLMPort + chat streaming con tool `proposePayment` (AI SDK v6)
- ✅ DB Drizzle/Neon + cron autónomo
- ✅ RampPort Noah (off-ramp global) + RevenuePort (fee real)
- ✅ VerifyPort Self Agent ID
- ✅ UI chat 3 zonas (DESIGN.md) · **build de producción OK**

**Pendiente:**
- ⏳ Ejecutor onchain end-to-end (firma y encadena las tx reales) — requiere credenciales
- ⏳ Confirmar el contrato de la API de Noah (`npm run check-noah`)
- ⏳ Registro onchain real + submission por Celopedia

## Roadmap

- **v2 — Monetización por spread FX**: margen en la tasa de cambio además del fee de servicio.
- **v2 — Más corredores**: ampliar el mapa país→moneda más allá de LATAM.
- **v2 — Feed de actividad real**: panel live alimentado desde el log de tx onchain.

## Licencia

MIT © [rojasjuniore](https://github.com/rojasjuniore)
