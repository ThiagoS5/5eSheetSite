export type DetailItem =
  | { kind: "weapon"; name: string; attackBonus: string; damage: string; notes: string }
  | {
      kind: "equipment";
      name: string;
      qty: number;
      source: string;
      category?: string;
      type?: string;
      cost?: string;
      weight?: string;
      armorClass?: number;
      rarity?: string;
      properties?: string;
      damage?: string;
      range?: string;
      description?: string;
    }
  | {
      kind: "spell";
      name: string;
      castingTime?: string;
      range?: string;
      target?: string;
      duration?: string;
      components?: string;
      classes?: string;
      description?: string;
    };

export interface ItemDetailModalProps {
  item: DetailItem | null;
  onClose: () => void;
}
