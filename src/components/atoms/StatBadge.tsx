interface StatBadgeProps {
  label: string;
  value: string | number;
  detail?: string;
}

export function StatBadge({ label, value, detail }: StatBadgeProps) {
  return (
    <div className="rounded-md border border-white/[0.08] bg-surface-elevated px-3 py-3">
      <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 flex items-baseline gap-2">
        <span className="font-serif text-2xl font-bold text-foreground">{value}</span>
        {detail ? <span className="text-xs font-medium text-subdued">{detail}</span> : null}
      </dd>
    </div>
  );
}
