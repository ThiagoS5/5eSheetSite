interface TagListProps {
  items: readonly string[];
  emptyLabel: string;
}

export function TagList({ items, emptyLabel }: TagListProps) {
  if (items.length === 0) {
    return <p className="text-sm italic text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={emptyLabel}>
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="rounded border border-white/[0.08] bg-white/5 px-2 py-0.5 text-xs font-medium text-subdued"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
