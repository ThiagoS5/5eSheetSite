import type { CharacterSheetSummary } from "@/types/builder";
import { AttributeBlock } from "@/src/components/molecules/sheet/AttributeBlock";

interface AttributesColumnProps {
  summary: CharacterSheetSummary;
}

export function AttributesColumn({ summary }: AttributesColumnProps) {
  return (
    <section
      aria-labelledby="attrs-col-title"
      className="flex flex-col gap-2 md:w-fit md:self-start"
    >
      <h2
        id="attrs-col-title"
        className="flex items-center justify-center gap-1.5 border-b border-border pb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground"
      >
        <i aria-hidden="true" className="fa-solid fa-dumbbell" />
        Atributos
      </h2>
      <div className="grid grid-cols-3 justify-items-center gap-2 sm:grid-cols-6 md:grid-cols-1">
        {summary.attributes.map((attr) => (
          <AttributeBlock key={attr.key} attribute={attr} />
        ))}
      </div>
    </section>
  );
}
