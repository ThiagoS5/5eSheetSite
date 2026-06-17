"use client";

import type { CharacterDescription } from "@/types/builder";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { Input } from "@/src/components/ui/input";

const ALIGNMENTS = [
  "Leal e Bom",
  "Neutro e Bom",
  "Caótico e Bom",
  "Leal e Neutro",
  "Verdadeiro Neutro",
  "Caótico e Neutro",
  "Leal e Mau",
  "Neutro e Mau",
  "Caótico e Mau",
];

const LIFESTYLES = [
  "Miserável (0 PO/dia)",
  "Esquálido (1 PC/dia)",
  "Pobre (2 PP/dia)",
  "Modesto (1 PO/dia)",
  "Confortável (2 PO/dia)",
  "Rico (4 PO/dia)",
  "Aristocrático (10+ PO/dia)",
];

const inputCls =
  "bg-[#12131a] border-white/10 text-white placeholder:text-[#7a7e99] focus-visible:border-[#e61c23] focus-visible:ring-[#e61c23]/30";

const selectCls =
  "w-full rounded-lg border border-white/10 bg-[#12131a] px-3 py-2 text-sm text-white outline-none transition focus:border-[#e61c23] focus:ring-2 focus:ring-[#e61c23]/30 appearance-none cursor-pointer";

const textareaCls =
  "w-full rounded-lg border border-white/10 bg-[#12131a] px-3 py-2 text-sm text-white placeholder:text-[#7a7e99] outline-none transition focus:border-[#e61c23] focus:ring-2 focus:ring-[#e61c23]/30 resize-none";

const labelCls =
  "mb-1.5 block text-[0.65rem] font-semibold uppercase tracking-widest text-[#7a7e99]";

export function PersonalDetailsEditor() {
  const description = useCharacterStore((s) => s.description);
  const setDescriptionField = useCharacterStore((s) => s.setDescriptionField);

  function bind(name: keyof CharacterDescription) {
    return {
      value: description[name],
      onChange: (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
      ) => setDescriptionField(name, e.target.value),
    };
  }

  return (
    <div className="space-y-5">
      {/* Identidade */}
      <section className="glass-card rounded-xl p-4 sm:p-6">
        <h3 className="mb-5 flex items-center gap-2.5 border-b border-white/5 pb-3 text-sm font-semibold uppercase tracking-widest text-white">
          <i aria-hidden="true" className="fa-solid fa-fingerprint text-[#e61c23]" />
          Identidade
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          <div>
            <label className={labelCls}>Nome do Personagem</label>
            <Input
              className={inputCls}
              placeholder="Nome do seu personagem"
              {...bind("nome")}
            />
          </div>
          <div>
            <label className={labelCls}>Alinhamento</label>
            <select className={selectCls} {...bind("alinhamento")}>
              <option value="">Escolher…</option>
              {ALIGNMENTS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Fé / Divindade</label>
            <Input
              className={inputCls}
              placeholder="Divindade ou crença"
              {...bind("faith")}
            />
          </div>
          <div>
            <label className={labelCls}>Estilo de Vida</label>
            <select className={selectCls} {...bind("lifestyle")}>
              <option value="">Escolher…</option>
              {LIFESTYLES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Características Físicas */}
      <section className="glass-card rounded-xl p-4 sm:p-6">
        <h3 className="mb-5 flex items-center gap-2.5 border-b border-white/5 pb-3 text-sm font-semibold uppercase tracking-widest text-white">
          <i aria-hidden="true" className="fa-solid fa-person text-[#e61c23]" />
          Características Físicas
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          <div>
            <label className={labelCls}>Idade</label>
            <Input
              className={inputCls}
              placeholder="Ex.: 24"
              {...bind("age")}
            />
          </div>
          <div>
            <label className={labelCls}>Gênero</label>
            <Input
              className={inputCls}
              placeholder="Ex.: Masculino"
              {...bind("gender")}
            />
          </div>
          <div>
            <label className={labelCls}>Altura</label>
            <Input
              className={inputCls}
              placeholder="Ex.: 1,72 m"
              {...bind("height")}
            />
          </div>
          <div>
            <label className={labelCls}>Peso</label>
            <Input
              className={inputCls}
              placeholder="Ex.: 75 kg"
              {...bind("weight")}
            />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:mt-5 md:grid-cols-3 md:gap-5">
          <div>
            <label className={labelCls}>Olhos</label>
            <Input
              className={inputCls}
              placeholder="Cor dos olhos"
              {...bind("eyes")}
            />
          </div>
          <div>
            <label className={labelCls}>Pele</label>
            <Input
              className={inputCls}
              placeholder="Tom da pele"
              {...bind("skin")}
            />
          </div>
          <div>
            <label className={labelCls}>Cabelo</label>
            <Input
              className={inputCls}
              placeholder="Cor e estilo"
              {...bind("hair")}
            />
          </div>
        </div>
      </section>

      {/* Narrativa & Histórico */}
      <section className="glass-card rounded-xl p-4 sm:p-6">
        <h3 className="mb-5 flex items-center gap-2.5 border-b border-white/5 pb-3 text-sm font-semibold uppercase tracking-widest text-white">
          <i aria-hidden="true" className="fa-solid fa-book-open text-[#e61c23]" />
          Narrativa & Histórico
        </h3>
        <div className="space-y-4 md:space-y-5">
          <div>
            <label className={labelCls}>Aparência Física</label>
            <textarea
              className={textareaCls}
              rows={4}
              placeholder="Descreva como seu personagem aparece aos outros…"
              {...bind("aparencia")}
            />
          </div>
          <div>
            <label className={labelCls}>Personalidade & Maneirismos</label>
            <textarea
              className={textareaCls}
              rows={4}
              placeholder="Como o personagem age, fala e o que acredita…"
              {...bind("personalidade")}
            />
          </div>
          <div>
            <label className={labelCls}>História Prévia</label>
            <textarea
              className={textareaCls}
              rows={4}
              placeholder="De onde veio, o que viveu e o que o trouxe até aqui…"
              {...bind("tracos")}
            />
          </div>
          <div>
            <label className={labelCls}>Notas Adicionais</label>
            <textarea
              className={textareaCls}
              rows={3}
              placeholder="Anotações livres, segredos, objetivos…"
              {...bind("notas")}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
