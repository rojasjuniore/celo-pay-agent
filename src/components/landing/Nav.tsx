import Link from "next/link";

/** Top nav sobre hero oscuro (estilo Coinbase: wordmark izq, CTA der). */
export function Nav() {
  return (
    <nav
      className="flex items-center justify-between h-16 px-6 md:px-12"
      style={{ background: "var(--cb-surface-dark)", color: "var(--cb-on-dark)" }}
    >
      <span className="flex items-center gap-2 text-xl font-medium tracking-tight">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm"
          style={{ background: "var(--cb-celo)", color: "#000" }}
        >
          R
        </span>
        Remi
      </span>
      <div className="flex items-center gap-3">
        <a
          href="https://github.com/rojasjuniore/celo-pay-agent"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:inline text-sm font-medium"
          style={{ color: "var(--cb-on-dark-soft)" }}
        >
          GitHub
        </a>
        <Link
          href="/app"
          className="inline-flex items-center h-11 px-5 text-base font-semibold"
          style={{
            background: "var(--cb-primary)",
            color: "var(--cb-on-dark)",
            borderRadius: "var(--cb-radius-pill)",
          }}
        >
          Abrir app
        </Link>
      </div>
    </nav>
  );
}
