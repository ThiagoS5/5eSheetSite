import type { BuilderClassImage } from "@/types/builder";


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
