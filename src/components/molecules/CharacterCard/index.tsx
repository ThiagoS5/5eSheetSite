import Image from "next/image";
import type { CharacterAttributes } from "@/src/types/Character";

import type { CharacterCardProps } from "./index.types";
export type { CharacterCardProps } from "./index.types";
const attributeLabels: Record<keyof CharacterAttributes, string> = {
  forca: "Strength",
  destreza: "Dexterity",
  constituicao: "Constitution",
  inteligencia: "Intelligence",
  sabedoria: "Wisdom",
  carisma: "Charisma",
};

export function CharacterCard({ character }: CharacterCardProps) {
  return (
    <article
      aria-labelledby={`${character.id}-title`}
      className="h-full rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg shadow-slate-950/30"
    >
      <div className="flex items-start gap-3">
        {character.portraitUrl ? (
          <Image
            src={character.portraitUrl}
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 shrink-0 rounded-lg border border-slate-800 object-cover"
          />
        ) : null}
        <div className="flex flex-col gap-1">
          <h3 translate="no" id={`${character.id}-title`} className="notranslate text-xl font-semibold text-foreground">
            {character.nome}
          </h3>
          <p className="text-sm text-slate-300">
            <span translate="no" className="notranslate font-medium text-cyan-200">{character.classe}</span>
            {" · "}
            <span translate="no" className="notranslate">{character.species}</span>
          </p>
        </div>
      </div>

      <dl
        aria-label={`Ability scores for ${character.nome}`}
        className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3"
      >
        {Object.entries(attributeLabels).map(([attribute, label]) => {
          const attributeKey = attribute as keyof CharacterAttributes;

          return (
            <div
              key={attribute}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2"
            >
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {label}
              </dt>
              <dd translate="no" className="notranslate mt-1 text-lg font-semibold text-foreground">
                {character.atributos[attributeKey]}
              </dd>
            </div>
          );
        })}
      </dl>
    </article>
  );
}
