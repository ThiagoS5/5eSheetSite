import type { CSSProperties, ReactNode } from "react";

export interface HeroChoiceTheme {
  /** Cor base do card (fundo do banner, gradiente e badges). */
  theme: string;
  /** Cor de destaque (borda das badges). */
  accent: string;
}

interface HeroChoiceCardProps {
  title: string;
  badges: string[];
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  icon?: ReactNode;
  theme?: HeroChoiceTheme;
  isActive: boolean;
  disabled?: boolean;
  onClickDetails: () => void;
  onClickSelect: () => void;
  detailsLabel?: string;
  selectLabel?: string;
  selectedLabel?: string;
  children?: ReactNode;
}

export const defaultHeroChoiceTheme: HeroChoiceTheme = {
  theme: "#2E200F",
  accent: "#B56906",
};

const FRAME_GOLD_DARK = "#C19429";
const FRAME_GOLD_LIGHT = "#ECCF83";
const BUTTON_DARK = "#12181C";
const TEXT_SOFT = "#ECEDEE";

/**
 * Moldura de canto dourada (64x64) do card, com trilho duplo.
 * Paths transcritos do card de classes do character builder da D&D Beyond.
 */
function FrameCorner({ flipped = false }: { flipped?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={`h-16 w-16 shrink-0 ${flipped ? "-scale-x-100" : ""}`}
    >
      <path
        d="M2 28C16.2774 27.4857 27.4859 16.2774 28 2.00001H64.001V7.62939e-06H26V1.00001C26 14.9679 14.9679 26 1 26H0V64H2V28Z"
        fill={FRAME_GOLD_DARK}
      />
      <path
        d="M8.99999 26.8477C18.3223 25.7139 25.7137 18.3224 26.8476 9.00005H64V4.00006H22V6.50006C21.9999 15.0594 15.0593 22 6.5 22H4L4 64H8.99999V26.8477Z"
        fill={FRAME_GOLD_LIGHT}
      />
    </svg>
  );
}

/** Trilho horizontal duplo que liga os dois cantos superiores. */
function FrameTopRail() {
  return (
    <div className="flex flex-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="2"
        height="9"
        viewBox="0 0 2 9"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="h-[9px] w-full"
      >
        <path d="M3.12224e-08 4L0 9H2V4H3.12224e-08Z" fill={FRAME_GOLD_LIGHT} />
        <path d="M4.68333e-09 0L0 1.99999L2 2V1.6319e-06L4.68333e-09 0Z" fill={FRAME_GOLD_DARK} />
      </svg>
    </div>
  );
}

/** Trilho vertical duplo com esmaecimento em direção à base do card. */
function FrameSideRail({ flipped = false }: { flipped?: boolean }) {
  const idSuffix = flipped ? "right" : "left";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="9"
      height="299"
      viewBox="0 0 9 299"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`h-full w-[9px] ${flipped ? "-scale-x-100" : ""}`}
    >
      <path d="M4 0H9V299H4V0Z" fill={`url(#hero-rail-light-${idSuffix})`} />
      <path d="M0 0H2V299H0V0Z" fill={`url(#hero-rail-dark-${idSuffix})`} />
      <defs>
        <linearGradient
          id={`hero-rail-light-${idSuffix}`}
          x1="6.5"
          y1="0"
          x2="6.5"
          y2="299"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={FRAME_GOLD_LIGHT} />
          <stop offset="1" stopColor={FRAME_GOLD_LIGHT} stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id={`hero-rail-dark-${idSuffix}`}
          x1="1"
          y1="1"
          x2="1"
          y2="299"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={FRAME_GOLD_DARK} />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Flâmula que atravessa a moldura no topo esquerdo, abrigando o ícone. */
function BannerRibbon({ icon }: { icon: ReactNode }) {
  return (
    <div className="pointer-events-none absolute left-[27px] top-[53px] z-[2] h-[108px] w-16">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 108"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
      >
        <path
          d="M2 0H62V88L32 106L2 88V0Z"
          fill="var(--hero-theme)"
        />
        <path
          d="M2 0V88L32 106L62 88V0H60V86.8L32 103.6L4 86.8V0H2Z"
          fill={FRAME_GOLD_LIGHT}
        />
      </svg>
      <span className="absolute left-1/2 top-4 flex h-[60px] w-[60px] -translate-x-1/2 items-center justify-center text-3xl text-[var(--hero-frame-light)]">
        {icon}
      </span>
    </div>
  );
}

/** Ponta em seta do botão Select, com fundo escuro e fio dourado. */
function SelectButtonCap() {
  return (
    <span aria-hidden="true" className="relative h-10 w-[26px]">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="40"
        viewBox="0 0 32 40"
        fill="none"
        preserveAspectRatio="none"
        className="absolute inset-y-0 left-[-6px] z-0 h-10 w-8 -scale-x-100"
      >
        <path
          d="M10.4717 35.6924C13.4798 39.6545 24.2028 39.9937 31.8252 40V0C24.2028 0.00628088 13.4798 0.345512 10.4717 4.30762L9.83789 5.1416C6.62561 9.35748 0.00047548 16.7401 0 20C0 23.2592 6.62324 30.6401 9.83594 34.8564L10.4717 35.6924Z"
          fill={BUTTON_DARK}
        />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="40"
        viewBox="0 0 32 40"
        fill="none"
        preserveAspectRatio="none"
        className="absolute inset-y-0 left-[-6px] z-[1] h-10 w-8 -scale-x-100"
      >
        <path
          d="M32 40C24.3357 39.9937 13.5538 39.6545 10.5292 35.6924L9.88996 34.8564C6.65962 30.6401 0 23.2592 0 20C0.000448206 16.9439 5.85552 10.2646 9.24876 5.96777L9.89193 5.1416L10.5292 4.30762C13.5538 0.34551 24.3357 0.00628099 32 0V2.01172H29.989C26.6608 2.0477 23.0277 2.18632 19.8133 2.64941C17.8751 2.92867 16.1633 3.31596 14.7976 3.83301C13.4053 4.36018 12.5624 4.95126 12.1307 5.5166L11.4934 6.35156L11.4915 6.35352C10.6637 7.43396 9.61737 8.71627 8.5516 10.0361C7.47421 11.3704 6.36044 12.7636 5.3515 14.1191C4.33721 15.4819 3.46423 16.76 2.8525 17.8623C2.19603 19.0452 2.01116 19.7314 2.01099 20C2.01099 20.2681 2.19522 20.9539 2.85151 22.1367C3.46301 23.2388 4.33544 24.5173 5.34953 25.8799C6.35823 27.2352 7.47238 28.6278 8.54963 29.9619C9.34886 30.9517 10.1372 31.9207 10.8306 32.7988L11.4895 33.6445L11.4905 33.6455L12.1297 34.4814L12.1307 34.4834C12.5624 35.0487 13.4052 35.6398 14.7976 36.167C16.1633 36.684 17.8751 37.0713 19.8133 37.3506C23.0277 37.8137 26.6608 37.9513 29.989 37.9873H32L32 40Z"
          fill={FRAME_GOLD_LIGHT}
        />
      </svg>
    </span>
  );
}

/** Máscara que recorta os cantos superiores da arte, acompanhando a moldura. */
const CORNER_MASK = [
  "radial-gradient(circle at 0% 0%, transparent 0px, transparent 16px, #000 17px)",
  "radial-gradient(circle at 100% 0%, transparent 0px, transparent 16px, #000 17px)",
  "radial-gradient(circle at 0% 100%, transparent 0px, transparent 0px, #000 0px)",
  "radial-gradient(circle at 100% 100%, transparent 0px, transparent 0px, #000 0px)",
].join(", ");

/**
 * Card de escolha do builder no estilo do character builder 2024 da D&D Beyond:
 * moldura SVG dourada, arte de fundo, gradiente temático, flâmula com ícone,
 * badges em pílula e ações Learn More / Select.
 */
export function HeroChoiceCard({
  title,
  badges,
  description,
  imageSrc,
  imageAlt,
  icon,
  theme = defaultHeroChoiceTheme,
  isActive,
  disabled = false,
  onClickDetails,
  onClickSelect,
  detailsLabel = "Saiba Mais",
  selectLabel = "Selecionar",
  selectedLabel = "Selecionado",
  children,
}: HeroChoiceCardProps) {
  const themeVars = {
    "--hero-theme": theme.theme,
    "--hero-accent": theme.accent,
    "--hero-frame-light": FRAME_GOLD_LIGHT,
  } as CSSProperties;

  return (
    <article
      style={themeVars}
      className={`group relative flex min-h-[424px] min-w-0 flex-col transition duration-200 ${
        isActive ? "" : "hover:-translate-y-1"
      }`}
    >
      {imageSrc && imageAlt ? (
        <span role="img" aria-label={imageAlt} className="sr-only" />
      ) : null}
      {/* Moldura + arte de fundo (desloca 44px para a arte "vazar" acima) */}
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 bottom-0 top-11 overflow-hidden rounded-xl ${
          isActive
            ? "shadow-[0_0_0_3px_var(--hero-accent),0_0_28px_rgba(236,207,131,0.25)]"
            : "shadow-black/40 group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.55)]"
        }`}
        style={{ maskImage: CORNER_MASK, WebkitMaskImage: CORNER_MASK }}
      >
        {/* Arte de fundo */}
        <div
          className="absolute inset-x-[9px] bottom-0 top-[9px] rounded-lg bg-cover bg-top bg-no-repeat transition-transform duration-300 group-hover:scale-[1.03]"
          style={{
            backgroundColor: "var(--hero-theme)",
            backgroundImage: imageSrc
              ? `url("${imageSrc}")`
              : `radial-gradient(120% 90% at 50% 0%, color-mix(in srgb, var(--hero-accent) 35%, var(--hero-theme)) 0%, var(--hero-theme) 65%, color-mix(in srgb, var(--hero-theme) 60%, #000) 100%)`,
          }}
          role={imageSrc && imageAlt ? "img" : undefined}
          aria-label={imageSrc ? imageAlt : undefined}
        />

        {/* Gradiente inferior temático */}
        <div
          className="absolute inset-x-[9px] bottom-0 top-[84px] rounded-b-lg"
          style={{
            backgroundImage: `linear-gradient(transparent 9.72%, color-mix(in srgb, var(--hero-theme) 80%, transparent) 49.84%, color-mix(in srgb, var(--hero-theme) 90%, transparent) 61.95%)`,
          }}
        />

        {/* Moldura dourada: cantos + trilho superior */}
        <div className="absolute inset-x-0 top-0 z-[1] flex justify-between">
          <FrameCorner />
          <FrameTopRail />
          <FrameCorner flipped />
        </div>

        {/* Moldura dourada: trilhos laterais */}
        <div className="absolute inset-x-0 bottom-0 top-16 z-[1] flex justify-between">
          <FrameSideRail />
          <FrameSideRail flipped />
        </div>
      </div>

      {icon ? <BannerRibbon icon={icon} /> : null}

      {isActive ? (
        <span
          aria-hidden="true"
          className="absolute right-4 top-[60px] z-[2] flex h-7 w-7 items-center justify-center rounded-full text-xs shadow-lg"
          style={{ backgroundColor: "var(--hero-accent)", color: BUTTON_DARK }}
        >
          <i className="fa-solid fa-check" />
        </span>
      ) : null}

      {/* Conteúdo */}
      <div className="relative z-[1] flex flex-1 flex-col justify-end px-5 pb-4 pt-[176px]">
        <div className="mb-4 flex flex-col gap-2">
          <h3 className="font-serif text-[34px] font-extrabold leading-[38px] text-white">
            {title}
          </h3>

          {badges.length ? (
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="flex h-8 items-center justify-center overflow-hidden whitespace-nowrap rounded-full border-2 px-4 text-sm uppercase tracking-[0.8px]"
                  style={{
                    borderColor: "var(--hero-accent)",
                    backgroundColor:
                      "color-mix(in srgb, var(--hero-theme) 50%, transparent)",
                    color: TEXT_SOFT,
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          ) : null}

          <p
            className="line-clamp-3 text-base leading-6"
            style={{ color: TEXT_SOFT }}
          >
            {description}
          </p>

          {children}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClickDetails}
            className="flex h-10 items-center justify-center rounded-lg border-2 border-[#A2ACB2] px-6 text-sm font-bold uppercase leading-6 tracking-[0.8px] outline-none backdrop-blur-[2px] transition hover:border-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
            style={{ color: TEXT_SOFT }}
          >
            {detailsLabel}
          </button>

          <button
            type="button"
            onClick={onClickSelect}
            disabled={disabled}
            aria-pressed={isActive}
            className="flex h-10 items-stretch outline-none transition hover:brightness-150 focus-visible:drop-shadow-[0_0_6px_rgba(236,207,131,0.9)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span
              className="relative z-[1] flex h-10 items-center justify-center gap-2 rounded-l-lg py-2 pl-4 text-sm font-bold uppercase leading-6 tracking-[0.8px] shadow-[inset_0_2px_0_rgba(236,207,131,1),inset_0_-2px_0_rgba(236,207,131,1),inset_2px_0_0_rgba(236,207,131,1)]"
              style={{ backgroundColor: BUTTON_DARK, color: TEXT_SOFT }}
            >
              {isActive ? selectedLabel : selectLabel}
            </span>
            <SelectButtonCap />
          </button>
        </div>
      </div>
    </article>
  );
}
