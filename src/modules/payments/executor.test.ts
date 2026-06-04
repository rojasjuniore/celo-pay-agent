import { describe, it, expect, vi } from "vitest";
import { executePayment, type ExecutorDeps } from "./executor";
import type { PaymentIntent } from "@/modules/agent/payment-intent";
import { computeFee } from "@/modules/revenue/fee";

const intent: PaymentIntent = {
  type: "remittance",
  amountUsd: 50,
  recipient: "mom",
  country: "CO",
  schedule: "once",
};

function deps(over: Partial<ExecutorDeps> = {}): ExecutorDeps {
  return {
    wallet: {
      address: () => "0xagent00000000000000000000000000000000000a",
      transferStablecoin: vi.fn().mockResolvedValue("0xtransfer"),
      balanceOf: vi.fn().mockResolvedValue(0n),
    },
    revenue: {
      split: (amount: bigint) => computeFee(amount, 50),
      collect: vi.fn().mockResolvedValue("0xfee"),
    },
    ramp: {
      depositAddress: () => "0xnoah00000000000000000000000000000000000b",
      offRamp: vi.fn().mockResolvedValue({ reference: "noah-1", status: "initiated", fiatCurrency: "COP" }),
    },
    logTx: vi.fn().mockResolvedValue(undefined),
    ...over,
  };
}

describe("executePayment", () => {
  it("ejecuta fee → transfer → offramp en orden, todo onchain", async () => {
    const d = deps();
    const r = await executePayment(intent, d);
    expect(r.completed).toBe(true);
    expect(r.steps.map((s) => s.key)).toEqual(["fee", "transfer", "offramp"]);
    expect(r.transferHash).toBe("0xtransfer");
    expect(r.offRampRef).toBe("noah-1");
    // El neto (49.75) se transfiere, no el total.
    expect(d.wallet.transferStablecoin).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 49_750_000n }),
    );
    // 4 logs: fee, transfer, ramp (logTx llamado por cada tx).
    expect(d.logTx).toHaveBeenCalledTimes(3);
  });

  it("fail-fast: si el transfer falla, no llama al off-ramp", async () => {
    const failing = deps({
      wallet: {
        address: () => "0xa",
        transferStablecoin: vi.fn().mockRejectedValue(new Error("no funds")),
        balanceOf: vi.fn().mockResolvedValue(0n),
      },
    });
    const r = await executePayment(intent, failing);
    expect(r.completed).toBe(false);
    expect(failing.ramp.offRamp).not.toHaveBeenCalled();
    expect(r.steps.some((s) => !s.ok && s.error?.includes("no funds"))).toBe(true);
  });
});
