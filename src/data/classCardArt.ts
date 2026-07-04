import type { BuilderClassImage } from "@/types/builder";

/**
 * Enquadramento curado das artes de classe quando exibidas como fundo do card
 * do builder (`HeroChoiceCard`).
 *
 * As splashes de capítulo do XPHB 2024 (Bardo, Clérigo, Mago, etc.) trazem uma
 * moldura decorativa dourada embutida ~6% para dentro da borda da imagem, além
 * de, em algumas, um painel de arte secundário na base. Renderizadas com
 * `background-size: cover`, essa moldura + margem aparecem como um "fundo
 * colorido atrás da arte", em vez de a arte preencher o card até a borda — ao
 * contrário do Artificer (EFA) e do Barbarian, cujas artes já são full-bleed.
 *
 * Cada override recorta a moldura ampliando a arte (`cardBackgroundSize`) e,
 * quando preciso, reposiciona verticalmente (`cardBackgroundPosition`) para
 * manter o herói centralizado e empurrar o painel inferior para fora. Os valores
 * são relativos (%), então continuam válidos em qualquer largura de card.
 *
 * Classes já full-bleed (Artificer, Barbarian) ficam de fora e usam o `cover`
 * padrão. A chave é o slug `${nome}-${fonte}` (igual ao `toSlug` do adapter).
 */
type CardFraming = Required<
  Pick<BuilderClassImage, "cardBackgroundSize" | "cardBackgroundPosition">
>;

function framing(size: number, positionY: number): CardFraming {
  return {
    cardBackgroundSize: `${size}% auto`,
    cardBackgroundPosition: `50% ${positionY}%`,
  };
}

export const classCardArtFraming: Record<string, CardFraming> = {
  "bard-xphb": framing(124, 6),
  "cleric-xphb": framing(128, 10),
  "druid-xphb": framing(122, 4),
  "fighter-xphb": framing(124, 6),
  "monk-xphb": framing(124, 6),
  "paladin-xphb": framing(124, 6),
  "ranger-xphb": framing(122, 4),
  "rogue-xphb": framing(130, 8),
  "sorcerer-xphb": framing(124, 6),
  "warlock-xphb": framing(128, 9),
  "wizard-xphb": framing(128, 10),
};

/**
 * Aplica o enquadramento curado (se houver) a uma arte de classe, mantendo a
 * imagem intacta quando a classe não precisa de recorte.
 */
export function applyClassCardFraming(
  slug: string,
  image: BuilderClassImage | undefined,
): BuilderClassImage | undefined {
  if (!image) {
    return image;
  }

  const override = classCardArtFraming[slug];
  return override ? { ...image, ...override } : image;
}
