"use client";

import Link from "next/link";
import { useLang } from "./i18n";

/** Top nav sobre hero oscuro + toggle de idioma EN/ES. */
export function Nav() {
  const { lang, setLang, t } = useLang();
  return (
    <nav
      className="flex items-center justify-between h-16 px-6 md:px-12"
      style={{ background: "var(--cb-surface-dark)", color: "var(--cb-on-dark)" }}
    >
      <span className="flex items-center gap-2 text-xl font-medium tracking-tight">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold"
          style={{ background: "var(--cb-celo)", color: "#000" }}
        >
          R
        </span>
        Remi
      </span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setLang(lang === "en" ? "es" : "en")}
          className="text-sm font-medium px-2 py-1 rounded"
          style={{ color: "var(--cb-on-dark-soft)" }}
          aria-label="Toggle language"
        >
          {lang === "en" ? "ES" : "EN"}
        </button>
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
          style={{ background: "var(--cb-primary)", color: "var(--cb-on-dark)", borderRadius: "var(--cb-radius-pill)" }}
        >
          {t("openApp")}
        </Link>
      </div>
    </nav>
  );
}
