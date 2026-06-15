import Image from "next/image";
import type { ReactNode } from "react";

interface WizardChoiceCardTone {
  topBorder?: string;
  selectedBorder?: string;
  selectedShadow?: string;
  activeBadge?: string;
  activeButton?: string;
  fallbackGradient?: string;
  focusRing?: string;
}

interface WizardChoiceCardProps {
  title: string;
  subtitle?: string;
  imageSrc?: string;
  imageAlt?: string;
  icon?: ReactNode;
  onClickDetails: () => void;
  onClickSelect: () => void;
  isActive: boolean;
  disabled?: boolean;
  detailsLabel?: string;
  selectLabel?: string;
  selectedLabel?: string;
  imageSizes?: string;
  tone?: WizardChoiceCardTone;
  children: ReactNode;
}

const defaultTone: Required<WizardChoiceCardTone> = {
  topBorder: "via-[#e61c23]",
  selectedBorder: "border-[#e61c23]/80",
  selectedShadow: "shadow-[0_0_24px_rgba(230,28,35,0.22)]",
  activeBadge: "bg-[#e61c23]",
  activeButton: "border-[#e61c23] bg-[#e61c23]",
  fallbackGradient: "via-[#3d1820]",
  focusRing: "focus-visible:ring-[#f3c969]",
};

export function WizardChoiceCard({
  title,
  subtitle,
  imageSrc,
  imageAlt,
  icon,
  onClickDetails,
  onClickSelect,
  isActive,
  disabled = false,
  detailsLabel = "DETAILS",
  selectLabel = "SELECT",
  selectedLabel = "SELECTED",
  imageSizes = "(min-width: 1280px) 24rem, (min-width: 768px) 50vw, 100vw",
  tone,
  children,
}: WizardChoiceCardProps) {
  const resolvedTone = { ...defaultTone, ...tone };

  return (
    <article
      className={`group relative flex min-w-0 flex-col overflow-hidden rounded-lg border bg-[#1c1e2a] shadow-black/20 transition duration-200 hover:-translate-y-1 hover:shadow-xl ${
        isActive
          ? `${resolvedTone.selectedBorder} ${resolvedTone.selectedShadow}`
          : "border-white/[0.06] hover:border-white/15"
      }`}
    >
      <div
        aria-hidden="true"
        className={`absolute left-0 right-0 top-0 z-10 h-0.5 bg-gradient-to-r from-transparent ${resolvedTone.topBorder} to-transparent opacity-70 transition-opacity group-hover:opacity-100`}
      />

      {isActive ? (
        <span
          aria-hidden="true"
          className={`absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full ${resolvedTone.activeBadge} text-xs text-white shadow-lg`}
        >
          <i className="fa-solid fa-check" />
        </span>
      ) : null}

      <div className="relative h-44 overflow-hidden bg-[#0f1018]">
        {imageSrc ? (
          <Image
            unoptimized
            src={imageSrc}
            alt={imageAlt ?? title}
            fill
            sizes={imageSizes}
            className={`object-cover object-top transition duration-300 ${
              isActive
                ? "opacity-90"
                : "opacity-65 saturate-[0.75] group-hover:opacity-90 group-hover:saturate-100"
            }`}
          />
        ) : (
          <div
            aria-hidden="true"
            className={`h-full w-full bg-gradient-to-br from-[#0f1018] ${resolvedTone.fallbackGradient} to-[#1c1e2a]`}
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#1c1e2a] via-[#1c1e2a]/20 to-transparent"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex min-w-0 items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-serif text-xl font-bold tracking-wide text-white">
              {title}
            </h3>
            {subtitle ? (
              <p className="mt-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#7a7e99]">
                {subtitle}
              </p>
            ) : null}
          </div>
          {icon ? (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.06] bg-[#1c1e2a] text-2xl text-[#e61c23]">
              {icon}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col">{children}</div>

        <div className="mt-5 flex w-full gap-2">
          <button
            type="button"
            onClick={onClickDetails}
            className={`flex-1 rounded-md border border-white/10 bg-transparent px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white outline-none transition hover:bg-white/5 focus-visible:ring-2 ${resolvedTone.focusRing}`}
          >
            {detailsLabel}
          </button>
          <button
            type="button"
            onClick={onClickSelect}
            disabled={disabled}
            aria-pressed={isActive}
            className={`flex-1 rounded-md border px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] outline-none transition focus-visible:ring-2 ${resolvedTone.focusRing} disabled:cursor-not-allowed disabled:opacity-50 ${
              isActive
                ? `${resolvedTone.activeButton} text-white`
                : "border-white/10 bg-[#0f1018] text-white hover:border-white/20 hover:bg-[#292a2f]"
            }`}
          >
            {isActive ? selectedLabel : selectLabel}
          </button>
        </div>
      </div>
    </article>
  );
}
