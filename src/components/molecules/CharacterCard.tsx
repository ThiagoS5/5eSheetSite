import type { Character, CharacterAttributes } from "@/types/Character";

interface CharacterCardProps {
  character: Character;
}

const attributeLabels: Record<keyof CharacterAttributes, string> = {
  forca: "Forca",
  destreza: "Destreza",
  constituicao: "Constituicao",
  inteligencia: "Inteligencia",
  sabedoria: "Sabedoria",
  carisma: "Carisma",
};

export function CharacterCard({ character }: CharacterCardProps) {
  return (
    <article
      aria-labelledby={`${character.id}-title`}
      className="h-full rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg shadow-slate-950/30"
    >
      <div className="flex flex-col gap-1">
        <h3 id={`${character.id}-title`} className="text-xl font-semibold text-white">
          {character.nome}
        </h3>
        <p className="text-sm text-slate-300">
          <span className="font-medium text-cyan-200">{character.classe}</span>
          {" · "}
          {character.species}
        </p>
      </div>

      <dl
        aria-label={`Atributos de ${character.nome}`}
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
              <dd className="mt-1 text-lg font-semibold text-white">
                {character.atributos[attributeKey]}
              </dd>
            </div>
          );
        })}
      </dl>
    </article>
  );
}
