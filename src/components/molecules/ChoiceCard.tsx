import type { ReactNode } from "react";

interface ChoiceCardProps {
  title: string;
  eyebrow?: string;
  selected: boolean;
  disabled?: boolean;
  actionLabel?: string;
  showDefaultAction?: boolean;
  footer?: ReactNode;
  onSelect: () => void;
  children: ReactNode;
}

export function ChoiceCard({
  title,
  eyebrow,
  selected,
  disabled = false,
  actionLabel = "Selecionar",
  showDefaultAction = true,
  footer,
  onSelect,
  children,
}: ChoiceCardProps) {
  return (
    <article
      className={`relative overflow-hidden rounded-lg border bg-card transition ${
        selected
          ? "border-brand-crimson-alt shadow-[0_0_24px_rgba(196,30,30,0.25)]"
          : "border-white/[0.06] hover:border-white/15"
      }`}
    >
      <div
        aria-hidden="true"
        className="h-1.5 bg-gradient-to-r from-brand-crimson-alt to-transparent"
      />
      <div className="flex h-full flex-col p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-foreground">
                {eyebrow}
              </p>
            ) : null}
            <h3 className="font-serif text-lg font-bold tracking-wide text-foreground">
              {title}
            </h3>
          </div>
          {showDefaultAction ? (
            <button
              type="button"
              onClick={onSelect}
              disabled={disabled}
              aria-pressed={selected}
              className="shrink-0 rounded-md border border-border bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-subdued outline-none transition hover:border-brand-crimson-alt/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70 disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:border-brand-crimson-alt aria-pressed:bg-brand-crimson-alt aria-pressed:text-foreground"
            >
              {selected ? "Selecionado" : actionLabel}
            </button>
          ) : null}
        </div>
        <div className="mt-4 flex flex-1 flex-col text-sm leading-6 text-subdued">
          <div className="flex-1">{children}</div>
          {footer ? <div className="mt-4">{footer}</div> : null}
        </div>
      </div>
    </article>
  );
}
