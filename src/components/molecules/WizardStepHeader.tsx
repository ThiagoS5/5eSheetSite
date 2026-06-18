interface WizardStepHeaderProps {
  id: string;
  eyebrow?: string;
  title: string;
  description: string;
  searchId?: string;
  searchLabel?: string;
  searchValue?: string;
  searchPlaceholder?: string;
  resultCountLabel?: string;
  onSearch?: (value: string) => void;
}

export function WizardStepHeader({
  id,
  eyebrow,
  title,
  description,
  searchId,
  searchLabel = "Filtrar opcoes",
  searchValue,
  searchPlaceholder = "Buscar...",
  resultCountLabel,
  onSearch,
}: WizardStepHeaderProps) {
  const hasSearch = Boolean(onSearch && searchId);
  const resultId = hasSearch ? `${searchId}-results` : undefined;

  return (
    <div className="flex flex-col gap-4 border-b border-white/[0.06] pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-brand-crimson-alt">
            {eyebrow}
          </p>
        ) : null}
        <h2 id={id} className="mt-1 font-serif text-3xl font-bold text-foreground">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-subdued">
          {description}
        </p>
      </div>

      {hasSearch ? (
        <div className="w-full lg:max-w-xs">
          <label
            htmlFor={searchId}
            className="mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.14em] text-subdued"
          >
            {searchLabel}
          </label>
          <input
            id={searchId}
            type="search"
            value={searchValue}
            onChange={(event) => onSearch?.(event.target.value)}
            onInput={(event) => onSearch?.(event.currentTarget.value)}
            onKeyUp={(event) => onSearch?.(event.currentTarget.value)}
            aria-describedby={resultId}
            placeholder={searchPlaceholder}
            className="min-h-11 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground hover:border-white/20 focus:border-brand-gold-alt focus:ring-2 focus:ring-brand-gold-alt/40"
          />
          {resultCountLabel ? (
            <p
              id={resultId}
              className="mt-2 text-xs leading-5 text-muted-foreground"
              aria-live="polite"
            >
              {resultCountLabel}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
