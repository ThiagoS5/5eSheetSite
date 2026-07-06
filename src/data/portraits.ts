export interface PortraitOption {
  id: string;
  src: string;
  alt: string;
}

/** Galeria local autoral (master plan §28.1 nº 6). Upload próprio: pós-v1. */
export const PORTRAIT_OPTIONS: PortraitOption[] = [
  { id: "portrait-ember-knight", src: "/portraits/portrait-ember-knight.svg", alt: "Armored knight silhouette on ember red" },
  { id: "portrait-moon-mage", src: "/portraits/portrait-moon-mage.svg", alt: "Hooded mage silhouette on midnight violet" },
  { id: "portrait-wild-hunter", src: "/portraits/portrait-wild-hunter.svg", alt: "Hooded hunter silhouette on forest green" },
  { id: "portrait-gold-cleric", src: "/portraits/portrait-gold-cleric.svg", alt: "Haloed cleric silhouette on radiant gold" },
  { id: "portrait-shadow-rogue", src: "/portraits/portrait-shadow-rogue.svg", alt: "Masked rogue silhouette on deep blue" },
  { id: "portrait-storm-bard", src: "/portraits/portrait-storm-bard.svg", alt: "Long-haired bard silhouette on magenta dusk" },
  { id: "portrait-iron-guard", src: "/portraits/portrait-iron-guard.svg", alt: "Helmeted guard silhouette on steel gray" },
  { id: "portrait-sea-sorcerer", src: "/portraits/portrait-sea-sorcerer.svg", alt: "Crowned sorcerer silhouette on teal depths" },
];

export function getPortraitById(
  id: string | undefined,
): PortraitOption | null {
  if (!id) {
    return null;
  }

  return PORTRAIT_OPTIONS.find((portrait) => portrait.id === id) ?? null;
}
