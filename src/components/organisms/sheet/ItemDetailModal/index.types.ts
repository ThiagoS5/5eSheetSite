export type DetailItem =
  | { kind: "weapon"; name: string; attackBonus: string; damage: string; notes: string }
  | { kind: "equipment"; name: string; qty: number; source: string; cost?: string; armorClass?: number }
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
