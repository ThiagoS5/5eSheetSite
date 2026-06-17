import type { CharacterSheetSummary } from "@/types/builder";
import { AttributeBlock } from "@/src/components/molecules/sheet/AttributeBlock";

interface AttributesColumnProps {
  summary: CharacterSheetSummary;
}

export function AttributesColumn({ summary }: AttributesColumnProps) {
  return (
    <section aria-labelledby="attrs-col-title" className="flex flex-col gap-2">
      <h2
        id="attrs-col-title"
        className="text-[0.65rem] font-semibold uppercase tracking-widest text-[#7a7e99]"
      >
        Atributos
      </h2>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
        {summary.attributes.map((attr) => (
          <AttributeBlock key={attr.key} attribute={attr} />
        ))}
      </div>
    </section>
  );
}
