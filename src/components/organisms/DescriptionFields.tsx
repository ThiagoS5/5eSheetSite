"use client";

import type { CharacterDescription } from "@/types/builder";

const fields: ReadonlyArray<{
  name: keyof CharacterDescription;
  label: string;
  rows: number;
  span?: "full";
}> = [
  { name: "nome", label: "Nome", rows: 1 },
  { name: "alinhamento", label: "Alinhamento", rows: 1 },
  { name: "faith", label: "Faith", rows: 1 },
  { name: "lifestyle", label: "Lifestyle", rows: 1 },
  { name: "age", label: "Idade", rows: 1 },
  { name: "gender", label: "Genero", rows: 1 },
  { name: "height", label: "Altura", rows: 1 },
  { name: "weight", label: "Peso", rows: 1 },
  { name: "eyes", label: "Olhos", rows: 1 },
  { name: "skin", label: "Pele", rows: 1 },
  { name: "hair", label: "Cabelo", rows: 1 },
  { name: "aparencia", label: "Aparencia", rows: 4, span: "full" },
  { name: "personalidade", label: "Personalidade", rows: 4, span: "full" },
  { name: "tracos", label: "Tracos", rows: 3, span: "full" },
  { name: "notas", label: "Notas", rows: 4, span: "full" },
];

interface DescriptionFieldsProps {
  description: CharacterDescription;
  onFieldChange: (field: keyof CharacterDescription, value: string) => void;
}

export function DescriptionFields({
  description,
  onFieldChange,
}: DescriptionFieldsProps) {
  return (
    <section aria-labelledby="description-title" className="grid gap-5">
      <div>
        <h2
          id="description-title"
          className="font-serif text-xl font-bold tracking-wide text-foreground"
        >
          Descricao
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Dados narrativos ficam separados das escolhas mecanicas e sao exportados ao Foundry.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <label
            key={field.name}
            className={field.span === "full" ? "grid gap-2 md:col-span-2" : "grid gap-2"}
          >
            <span className="text-sm font-semibold text-foreground">
              {field.label}
            </span>
            <textarea
              value={description[field.name]}
              rows={field.rows}
              onChange={(event) => onFieldChange(field.name, event.target.value)}
              className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition focus:border-brand-crimson-alt focus:ring-2 focus:ring-brand-crimson-alt/50"
            />
          </label>
        ))}
      </div>
    </section>
  );
}
