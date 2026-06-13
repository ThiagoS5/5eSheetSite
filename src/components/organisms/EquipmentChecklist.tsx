"use client";

import type { EquipmentAcquisitionMode } from "@/store/characterStore.types";
import type { BuilderClass, BuilderEquipmentOption } from "@/types/builder";

interface EquipmentChecklistProps {
  equipment: BuilderEquipmentOption[];
  selectedClass?: BuilderClass;
  acquisitionMode: EquipmentAcquisitionMode;
  selectedEquipmentIds: readonly string[];
  onAcquisitionModeChange: (mode: EquipmentAcquisitionMode) => void;
  onToggleEquipment: (equipmentId: string) => void;
}

export function EquipmentChecklist({
  equipment,
  selectedClass,
  acquisitionMode,
  selectedEquipmentIds,
  onAcquisitionModeChange,
  onToggleEquipment,
}: EquipmentChecklistProps) {
  const itemMode = acquisitionMode === "items";

  return (
    <section aria-labelledby="equipment-title" className="grid gap-5">
      <div>
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[#c41e1e]">
          Starting Gear
        </p>
        <h2
          id="equipment-title"
          className="mt-1 font-serif text-xl font-bold tracking-wide text-white"
        >
          Equipamento Inicial
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#7a7e99]">
          Escolha entre os itens oferecidos pela classe ou o ouro inicial.
        </p>
      </div>

      <fieldset className="rounded-lg border border-white/[0.06] bg-[#1c1e2a] p-4">
        <legend className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#7a7e99]">
          Opcao da classe
        </legend>
        {selectedClass?.startingEquipment.length ? (
          <ul className="mb-4 grid gap-2 text-sm leading-6 text-[#b0b5cc]">
            {selectedClass.startingEquipment.map((entry) => (
              <li
                key={entry}
                className="rounded-md border border-white/[0.06] bg-white/[0.03] px-3 py-2"
              >
                {entry}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          <ModeCheckbox
            label="Itens oferecidos"
            checked={itemMode}
            onChange={() => onAcquisitionModeChange("items")}
          />
          <ModeCheckbox
            label={`Ouro${selectedClass?.startingEquipmentGold ? ` - ${selectedClass.startingEquipmentGold}` : ""}`}
            checked={acquisitionMode === "gold"}
            onChange={() => onAcquisitionModeChange("gold")}
          />
        </div>
        {itemMode && selectedClass?.startingEquipmentPackages.length ? (
          <div className="mt-4 grid gap-3">
            {selectedClass.startingEquipmentPackages.map((equipmentPackage) => (
              <button
                key={equipmentPackage.id}
                type="button"
                onClick={() => {
                  for (const item of equipmentPackage.items) {
                    if (
                      item.value === undefined &&
                      !selectedEquipmentIds.includes(item.id)
                    ) {
                      onToggleEquipment(item.id);
                    }
                  }
                }}
                className="rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-left text-sm text-[#b0b5cc] outline-none transition hover:border-[#c41e1e]/60 hover:text-white focus-visible:ring-2 focus-visible:ring-[#c41e1e]/70"
              >
                <span className="block font-bold text-white">
                  {equipmentPackage.label}
                </span>
                <span className="mt-1 block">{equipmentPackage.summary}</span>
              </button>
            ))}
          </div>
        ) : null}
        {!itemMode ? (
          <p className="mt-4 rounded-lg border border-[#f3c969]/20 bg-[#f3c969]/10 px-4 py-3 text-sm font-semibold text-[#f3c969]">
            {selectedClass?.startingEquipmentGold ||
              "O personagem usara a opcao de ouro inicial da classe selecionada."}
          </p>
        ) : null}
      </fieldset>

      <section className="mt-8 border-t border-white/10 pt-6">
        <h3 className="font-serif text-lg font-bold tracking-wide text-white">
          Adicionar Itens Opcionais / Equipamentos Extras
        </h3>
        <p className="mt-2 text-sm leading-6 text-[#7a7e99]">
          Use esta area apenas para equipamentos adicionais fora da escolha principal da
          classe.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {equipment.map((item) => {
            const checked = selectedEquipmentIds.includes(item.id);

            return (
              <label
                key={item.id}
                className={`grid cursor-pointer grid-cols-[auto_1fr_auto] items-start gap-3 rounded-lg border p-3 transition ${
                  checked
                    ? "border-[#c41e1e] bg-[#c41e1e]/10"
                    : "border-white/[0.06] bg-[#1c1e2a] hover:border-white/15"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleEquipment(item.id)}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-[#12131a] accent-[#c41e1e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c41e1e]"
                />
                <span>
                  <span className="block font-serif text-sm font-bold tracking-wide text-white">
                    {item.name}
                  </span>
                  <span className="mt-1 block text-xs text-[#7a7e99]">
                    {item.sourceType === "class" ? "Classe" : "Antecedente"}
                    {item.armorClass ? ` - CA ${item.armorClass}` : ""}
                  </span>
                </span>
                <span className="rounded border border-white/[0.08] bg-white/5 px-2 py-1 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-[#b0b5cc]">
                  {item.source}
                </span>
              </label>
            );
          })}
        </div>
      </section>
    </section>
  );
}

function ModeCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-3 transition ${
        checked
          ? "border-[#c41e1e] bg-[#c41e1e]/10 text-white"
          : "border-white/[0.08] bg-white/[0.03] text-[#b0b5cc]"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-white/20 bg-[#12131a] accent-[#c41e1e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c41e1e]"
      />
      <span className="text-sm font-bold uppercase tracking-[0.08em]">{label}</span>
    </label>
  );
}
