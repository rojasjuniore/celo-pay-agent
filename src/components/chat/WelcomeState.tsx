const SUGGESTIONS = [
  { icon: "💸", text: "Manda $50 a Colombia" },
  { icon: "🔁", text: "Pago recurrente cada mes" },
  { icon: "🧾", text: "Divide una cuenta" },
  { icon: "📊", text: "¿Cómo va mi actividad?" },
];

/** Estado inicial del chat. onPick envía la sugerencia como mensaje. */
export function WelcomeState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-6 py-12">
      <div className="flex items-center gap-2">
        <span
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-xl"
          style={{ background: "var(--color-celo)" }}
        >
          🤖
        </span>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--color-primary)" }}>
          PagaBot
        </h1>
      </div>
      <p className="max-w-sm" style={{ color: "var(--color-secondary)" }}>
        Tu agente de pagos en Celo. Habla normal, en español o inglés.
      </p>
      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.text}
            onClick={() => onPick(s.text)}
            className="rounded-[12px] border p-4 text-left text-sm transition-colors"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
          >
            <span className="mr-2" aria-hidden>{s.icon}</span>
            {s.text}
          </button>
        ))}
      </div>
    </div>
  );
}
