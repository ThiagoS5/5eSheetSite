import type { BuilderEquipmentOption } from "@/types/builder";

interface EquipmentCardProps {
  equipment: BuilderEquipmentOption[];
}

export function EquipmentCard({ equipment }: EquipmentCardProps) {
  return (
    <section
      aria-labelledby="equipment-summary-title"
      className="rounded-md border border-white/[0.08] bg-[#10121b] p-4"
    >
      <h3
        id="equipment-summary-title"
        className="font-serif text-lg font-bold tracking-wide text-white"
      >
        Equipamento
      </h3>
      {equipment.length > 0 ? (
        <ul className="mt-4 grid gap-2">
          {equipment.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-md border border-white/[0.06] bg-white/[0.03] px-3 py-2"
            >
              <span className="font-medium text-[#e8e9f0]">{item.name}</span>
              <span className="text-xs uppercase tracking-[0.1em] text-[#7a7e99]">
                {item.source}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-6 text-[#7a7e99]">
          Nenhum equipamento selecionado.
        </p>
      )}
    </section>
  );
}
