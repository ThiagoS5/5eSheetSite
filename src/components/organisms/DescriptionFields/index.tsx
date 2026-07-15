"use client";

import type { CharacterDescription } from "@/src/types/builder";

import type { DescriptionFieldsProps } from "./index.types";
export type { DescriptionFieldsProps } from "./index.types";
const fields: ReadonlyArray<{
  name: keyof CharacterDescription;
  label: string;
  rows: number;
  span?: "full";
}> = [
  { name: "nome", label: "Name", rows: 1 },
  { name: "alinhamento", label: "Alignment", rows: 1 },
  { name: "faith", label: "Faith", rows: 1 },
  { name: "lifestyle", label: "Lifestyle", rows: 1 },
  { name: "age", label: "Age", rows: 1 },
  { name: "gender", label: "Gender", rows: 1 },
  { name: "height", label: "Height", rows: 1 },
  { name: "weight", label: "Weight", rows: 1 },
  { name: "eyes", label: "Eyes", rows: 1 },
  { name: "skin", label: "Skin", rows: 1 },
  { name: "hair", label: "Hair", rows: 1 },
  { name: "aparencia", label: "Appearance", rows: 4, span: "full" },
  { name: "personalidade", label: "Personality", rows: 4, span: "full" },
  { name: "tracos", label: "Backstory", rows: 3, span: "full" },
  { name: "notas", label: "Notes", rows: 4, span: "full" },
];

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
          Description
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Narrative data stays separate from mechanical choices and is exported to Foundry.
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
