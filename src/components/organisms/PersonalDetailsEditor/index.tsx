"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleQuestionMark, Dices, Sparkles } from "lucide-react";
import Image from "next/image";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { Input } from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";
import { PORTRAIT_OPTIONS } from "@/src/data/portraits";
import { prepareCharacterPortrait } from "@/src/services/portraitService";
import {
  buildPersonalDetailsFieldHelp,
  getPersonalDetailsRecommendations,
} from "@/src/data/personalDetailsRecommendations";
import { generateRandomName } from "@/src/data/nameGenerator";
import {
  personalDetailsSchema,
  parseWeight,
  formatWeight,
  type PersonalDetailsForm,
  type WeightUnit,
} from "@/src/schemas/personalDetailsSchema";

import type { PersonalDetailsEditorProps } from "./index.types";
export type { PersonalDetailsEditorProps } from "./index.types";
const ALIGNMENTS = [
  "Lawful Good",
  "Neutral Good",
  "Chaotic Good",
  "Lawful Neutral",
  "True Neutral",
  "Chaotic Neutral",
  "Lawful Evil",
  "Neutral Evil",
  "Chaotic Evil",
];

const LIFESTYLES = [
  "Wretched (0 GP/day)",
  "Squalid (1 CP/day)",
  "Poor (2 SP/day)",
  "Modest (1 GP/day)",
  "Comfortable (2 GP/day)",
  "Wealthy (4 GP/day)",
  "Aristocratic (10+ GP/day)",
];

const inputCls =
  "bg-surface-nested border-border text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/30";

const selectCls =
  "w-full rounded-lg border border-border bg-surface-nested px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer";

const textareaCls =
  "w-full rounded-lg border border-border bg-surface-nested px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 resize-none";

const labelCls =
  "mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground";

const AGE_MAX = 999999;

type NarrativeSuggestionField = "aparencia" | "personalidade" | "historia" | "notas";

function SuggestButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`Suggest ${label}`}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-brand-gold-alt/50 px-2.5 py-1 text-xs font-bold text-foreground outline-none transition hover:bg-brand-gold-alt/10 focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
    >
      <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
      Suggest
    </button>
  );
}

export function PersonalDetailsEditor({
  beginnerMode = false,
  selectedSpecies,
  selectedBackground,
  selectedClass,
}: PersonalDetailsEditorProps) {
  const description = useCharacterStore((s) => s.description);
  const setDescriptionField = useCharacterStore((s) => s.setDescriptionField);
  const [portraitBusy, setPortraitBusy] = useState(false);
  const [portraitError, setPortraitError] = useState("");
  const saveId = useCharacterStore((s) => s.characterBuild.exportMetadata.saveId);
  const portraitRequest = useRef(0);
  useEffect(() => () => { portraitRequest.current += 1; }, [saveId]);
  const { weightValue, weightUnit } = parseWeight(description.weight);
  const [suggestionIndexes, setSuggestionIndexes] = useState<
    Record<NarrativeSuggestionField, number>
  >({
    aparencia: 0,
    personalidade: 0,
    historia: 0,
    notas: 0,
  });

  const { register, control, setValue, getValues, formState: { errors } } =
    useForm<PersonalDetailsForm>({
      resolver: zodResolver(personalDetailsSchema),
      mode: "onBlur",
      defaultValues: {
        nome: description.nome ?? "",
        alinhamento: description.alinhamento ?? "",
        faith: description.faith ?? "",
        lifestyle: description.lifestyle ?? "",
        age: description.age ?? "",
        gender: description.gender ?? "",
        height: description.height ?? "",
        weightValue,
        weightUnit,
        eyes: description.eyes ?? "",
        skin: description.skin ?? "",
        hair: description.hair ?? "",
        aparencia: description.aparencia ?? "",
        personalidade: description.personalidade ?? "",
        tracos: description.tracos ?? "",
        historia: description.historia || description.tracos || "",
        notas: description.notas ?? "",
      },
    });

  const currentUnit = useWatch({ control, name: "weightUnit" });
  const currentAlignment = useWatch({ control, name: "alinhamento" });
  const recommendations = useMemo(
    () =>
      getPersonalDetailsRecommendations({
        species: selectedSpecies,
        background: selectedBackground,
        characterClass: selectedClass,
        alignment: currentAlignment || description.alinhamento,
      }),
    [
      currentAlignment,
      description.alinhamento,
      selectedBackground,
      selectedClass,
      selectedSpecies,
    ],
  );
  const guidedFieldHelp = useMemo(
    () => buildPersonalDetailsFieldHelp(recommendations),
    [recommendations],
  );

  const narrativeSuggestions = recommendations.suggestions;

  function applySuggestion(field: NarrativeSuggestionField) {
    const suggestions = narrativeSuggestions[field];
    const index = suggestionIndexes[field] % suggestions.length;
    setValue(field, suggestions[index], {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setSuggestionIndexes((current) => ({
      ...current,
      [field]: current[field] + 1,
    }));
    void persist();
  }

  function persist() {
    const data = getValues();
    const fields = ["nome", "alinhamento", "faith", "lifestyle", "age", "gender", "height", "eyes", "skin", "hair", "aparencia", "personalidade", "historia", "notas"] as const;
    for (const field of fields) {
      const value = data[field] ?? "";
      if (value !== (description[field] ?? "")) setDescriptionField(field, value);
    }
    const weight = formatWeight(data.weightValue, data.weightUnit);
    if (weight !== (description.weight ?? "")) setDescriptionField("weight", weight);
  }

  function selectWeightUnit(unit: WeightUnit) {
    setValue("weightUnit", unit);
    void persist();
  }

  return (
    <form onBlur={() => void persist()} className="space-y-5">

      <section
        aria-labelledby="pd-portrait-title"
        className="glass-card rounded-xl p-4 sm:p-6"
      >
        <h3
          id="pd-portrait-title"
          className="mb-5 flex items-center gap-2.5 border-b border-border/50 pb-3 text-sm font-semibold uppercase tracking-widest text-foreground"
        >
          <i aria-hidden="true" className="fa-solid fa-image-portrait text-primary" />
          Portrait
        </h3>
        <div
          role="radiogroup"
          aria-label="Character portrait"
          className="grid grid-cols-4 gap-3 sm:grid-cols-8"
        >
          {PORTRAIT_OPTIONS.map((portrait) => {
            const isSelected = !description.portraitDataUrl && description.portraitId === portrait.id;

            return (
              <button
                key={portrait.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={portrait.alt}
                disabled={portraitBusy}
                onClick={() => {
                  setDescriptionField("portraitDataUrl", "");
                  setDescriptionField("portraitId", isSelected ? "" : portrait.id);
                }}
                className={cn(
                  "overflow-hidden rounded-lg border-2 outline-none transition focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70",
                  isSelected
                    ? "border-brand-gold-alt shadow-[0_0_16px_rgba(235,193,98,0.35)]"
                    : "border-border hover:border-brand-gold-alt/50",
                )}
              >
                <Image
                  src={portrait.src}
                  alt=""
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {description.portraitDataUrl ? (
            <Image src={description.portraitDataUrl} alt="Your character portrait" width={96} height={96} unoptimized className="h-24 w-24 rounded-lg object-cover" />
          ) : null}
          <div className="min-w-0 flex-1">
            <label htmlFor="pd-portrait-upload" className={labelCls}>Upload character portrait</label>
            <Input id="pd-portrait-upload" type="file" accept="image/png,image/jpeg,image/webp" disabled={portraitBusy}
              aria-describedby="pd-portrait-help" className={inputCls}
              onChange={async (event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = "";
                if (!file) return;
                const request = ++portraitRequest.current;
                setPortraitBusy(true);
                setPortraitError("");
                try {
                  const portrait = await prepareCharacterPortrait(file);
                  if (portraitRequest.current === request) {
                    setDescriptionField("portraitDataUrl", portrait);
                  }
                } catch (error) {
                  setPortraitError(error instanceof Error ? error.message : "This image could not be opened. Try another image.");
                } finally {
                  setPortraitBusy(false);
                }
              }} />
            <p id="pd-portrait-help" className="mt-2 text-xs text-muted-foreground">PNG, JPEG, or WebP, up to 5 MB. Saved on this device and included in PDF and Foundry exports.</p>
          </div>
          {description.portraitDataUrl ? <button type="button" disabled={portraitBusy} onClick={() => setDescriptionField("portraitDataUrl", "")} className="rounded-md border border-border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring">Use gallery portrait</button> : null}
        </div>
        {portraitBusy ? <p role="status" className="mt-2 text-sm">Preparing portrait…</p> : null}
        {portraitError ? <p role="alert" className="mt-2 text-sm text-foreground">{portraitError}</p> : null}
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Pick a portrait for the Vault card and printed sheet. Click again to remove it.
        </p>
      </section>

      <section className="glass-card rounded-xl p-4 sm:p-6">
        <h3 className="mb-5 flex items-center gap-2.5 border-b border-border/50 pb-3 text-sm font-semibold uppercase tracking-widest text-foreground">
          <i aria-hidden="true" className="fa-solid fa-fingerprint text-primary" />
          Identity
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          <div>
            <FieldLabel
              htmlFor="pd-nome"
              label="Character Name"
              help={guidedFieldHelp.nome}
              showHelp={beginnerMode}
            />
            <div className="flex gap-2">
              <Input
                id="pd-nome"
                className={cn(inputCls, "flex-1")}
                placeholder="Your character's name"
                {...register("nome")}
              />
              <button
                type="button"
                aria-label="Roll a random name"
                onClick={() => {
                  setValue("nome", generateRandomName(recommendations), {
                    shouldDirty: true,
                  });
                  void persist();
                }}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground outline-none transition hover:border-brand-gold-alt/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
              >
                <Dices aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            {errors.nome && (
              <p className="mt-1 text-xs text-primary">{errors.nome.message}</p>
            )}
          </div>
          <div>
            <FieldLabel
              htmlFor="pd-alinhamento"
              label="Alignment"
              help={guidedFieldHelp.alinhamento}
              showHelp={beginnerMode}
            />
            <select id="pd-alinhamento" className={selectCls} {...register("alinhamento")}>
              <option value="">Choose...</option>
              {ALIGNMENTS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel
              htmlFor="pd-faith"
              label="Faith / Deity"
              help={guidedFieldHelp.faith}
              showHelp={beginnerMode}
            />
            <Input
              id="pd-faith"
              className={inputCls}
              placeholder="Deity or belief"
              {...register("faith")}
            />
          </div>
          <div>
            <FieldLabel
              htmlFor="pd-lifestyle"
              label="Lifestyle"
              help={guidedFieldHelp.lifestyle}
              showHelp={beginnerMode}
            />
            <select id="pd-lifestyle" className={selectCls} {...register("lifestyle")}>
              <option value="">Choose...</option>
              {LIFESTYLES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>


      <section className="glass-card rounded-xl p-4 sm:p-6">
        <h3 className="mb-5 flex items-center gap-2.5 border-b border-border/50 pb-3 text-sm font-semibold uppercase tracking-widest text-foreground">
          <i aria-hidden="true" className="fa-solid fa-person text-primary" />
          Physical Characteristics
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          <div>
            <FieldLabel
              htmlFor="pd-age"
              label="Age"
              help={guidedFieldHelp.age}
              showHelp={beginnerMode}
            />
            <Input
              id="pd-age"
              type="number"
              min={0}
              max={AGE_MAX}
              className={inputCls}
              placeholder="e.g. 24"
              {...register("age")}
              onInput={(e) => {
                const el = e.currentTarget;
                if (Number(el.value) > AGE_MAX) el.value = String(AGE_MAX);
              }}
            />
          </div>
          <div>
            <FieldLabel
              htmlFor="pd-gender"
              label="Gender"
              help={guidedFieldHelp.gender}
              showHelp={beginnerMode}
            />
            <Input
              id="pd-gender"
              className={inputCls}
              placeholder="e.g. Male"
              {...register("gender")}
            />
          </div>
          <div>
            <FieldLabel
              htmlFor="pd-height"
              label="Height"
              help={guidedFieldHelp.height}
              showHelp={beginnerMode}
            />
            <Input
              id="pd-height"
              className={inputCls}
              placeholder="e.g. 5 ft. 8 in."
              {...register("height")}
            />
          </div>
          <div>
            <FieldLabel
              htmlFor="pd-weight"
              label="Weight"
              help={guidedFieldHelp.weight}
              showHelp={beginnerMode}
            />
            <div className="flex gap-2">
              <Input
                id="pd-weight"
                type="number"
                min={0}
                step={0.1}
                className={cn(inputCls, "flex-1")}
                placeholder="e.g. 170"
                {...register("weightValue")}
              />
              <div className="flex overflow-hidden rounded-md border border-border">
                {(["kg", "lb"] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => selectWeightUnit(unit)}
                    className={cn(
                      "px-2.5 py-2 text-xs font-semibold uppercase transition-colors",
                      currentUnit === unit
                        ? "bg-primary text-foreground"
                        : "bg-card text-muted-foreground hover:bg-surface-raised hover:text-foreground",
                    )}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:mt-5 md:grid-cols-3 md:gap-5">
          <div>
            <FieldLabel
              htmlFor="pd-eyes"
              label="Eyes"
              help={guidedFieldHelp.eyes}
              showHelp={beginnerMode}
            />
            <Input id="pd-eyes" className={inputCls} placeholder="Eye color" {...register("eyes")} />
          </div>
          <div>
            <FieldLabel
              htmlFor="pd-skin"
              label="Skin"
              help={guidedFieldHelp.skin}
              showHelp={beginnerMode}
            />
            <Input id="pd-skin" className={inputCls} placeholder="Skin tone" {...register("skin")} />
          </div>
          <div>
            <FieldLabel
              htmlFor="pd-hair"
              label="Hair"
              help={guidedFieldHelp.hair}
              showHelp={beginnerMode}
            />
            <Input id="pd-hair" className={inputCls} placeholder="Color and style" {...register("hair")} />
          </div>
        </div>
      </section>


      <section className="glass-card rounded-xl p-4 sm:p-6">
        <h3 className="mb-5 flex items-center gap-2.5 border-b border-border/50 pb-3 text-sm font-semibold uppercase tracking-widest text-foreground">
          <i aria-hidden="true" className="fa-solid fa-book-open text-primary" />
          Narrative & Backstory
        </h3>
        <div className="space-y-4 md:space-y-5">
          <div>
            <div className="flex items-start justify-between gap-2">
              <FieldLabel
                htmlFor="pd-aparencia"
                label="Physical Appearance"
                help={guidedFieldHelp.aparencia}
                showHelp={beginnerMode}
              />
              <SuggestButton
                label="Physical Appearance"
                onClick={() => applySuggestion("aparencia")}
              />
            </div>
            <textarea
              id="pd-aparencia"
              className={textareaCls}
              rows={4}
              placeholder="Describe how your character appears to others..."
              {...register("aparencia")}
            />
          </div>
          <div>
            <div className="flex items-start justify-between gap-2">
              <FieldLabel
                htmlFor="pd-personalidade"
                label="Personality & Mannerisms"
                help={guidedFieldHelp.personalidade}
                showHelp={beginnerMode}
              />
              <SuggestButton
                label="Personality & Mannerisms"
                onClick={() => applySuggestion("personalidade")}
              />
            </div>
            <textarea
              id="pd-personalidade"
              className={textareaCls}
              rows={4}
              placeholder="How the character acts, speaks, and what they believe..."
              {...register("personalidade")}
            />
          </div>
          <div>
            <div className="flex items-start justify-between gap-2">
              <FieldLabel
                htmlFor="pd-historia"
                label="Backstory"
                help={guidedFieldHelp.historia}
                showHelp={beginnerMode}
              />
              <SuggestButton
                label="Backstory"
                onClick={() => applySuggestion("historia")}
              />
            </div>
            <textarea
              id="pd-historia"
              className={textareaCls}
              rows={4}
              placeholder="Where they came from, what they lived through, and what brought them here..."
              {...register("historia")}
            />
          </div>
          <div>
            <div className="flex items-start justify-between gap-2">
              <FieldLabel
                htmlFor="pd-notas"
                label="Additional Notes"
                help={guidedFieldHelp.notas}
                showHelp={beginnerMode}
              />
              <SuggestButton
                label="Additional Notes"
                onClick={() => applySuggestion("notas")}
              />
            </div>
            <textarea
              id="pd-notas"
              className={textareaCls}
              rows={3}
              placeholder="Free notes, secrets, goals..."
              {...register("notas")}
            />
          </div>
        </div>
      </section>
    </form>
  );
}

function FieldLabel({
  htmlFor,
  label,
  help,
  showHelp,
}: {
  htmlFor: string;
  label: string;
  help: string;
  showHelp: boolean;
}) {
  const [open, setOpen] = useState(false);
  const helpId = useId();

  if (!showHelp) {
    return (
      <label className={labelCls} htmlFor={htmlFor}>
        {label}
      </label>
    );
  }

  return (
    <div className="mb-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className={cn(labelCls, "mb-0")} htmlFor={htmlFor}>
          {label}
        </label>
        <button
          type="button"
          aria-label={`Help with ${label}`}
          aria-expanded={open}
          aria-controls={helpId}
          onClick={() => setOpen((current) => !current)}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground outline-none transition hover:border-brand-gold-alt/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
        >
          <CircleQuestionMark aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
      {open ? (
        <p
          id={helpId}
          className="mt-2 rounded-md border border-brand-gold-alt/30 bg-brand-gold-alt/10 px-3 py-2 text-xs leading-5 text-subdued"
        >
          {help}
        </p>
      ) : null}
    </div>
  );
}
