const terms = [
  ["Species", "Espécie", "A origem biológica ou fantástica do personagem; chamada de raça em edições anteriores."],
  ["Background", "Antecedente", "A vida antes das aventuras. Em 2024, define aumentos de atributos, perícias e um talento de origem."],
  ["Feat", "Talento", "Uma capacidade especial. Não significa feito ou façanha neste contexto."],
  ["Cantrip", "Truque", "Magia de nível 0, normalmente conjurada sem gastar espaços de magia."],
  ["Spell slot", "Espaço de magia", "Recurso gasto para conjurar magias. O nível do espaço não é o nível do personagem."],
  ["Prepared spells", "Magias preparadas", "As magias disponíveis para conjurar. Preparar uma magia não gasta um espaço."],
  ["Saving throw / DC", "Teste de resistência / CD", "O teste para resistir a um efeito e a Classe de Dificuldade que deve ser alcançada."],
  ["Hit Points / Hit Dice", "Pontos de vida / Dados de vida", "PV medem a vitalidade. Dados de vida são gastos para recuperar PV durante um descanso curto."],
  ["Ability Score Improvement", "Aumento no Valor de Atributo", "Escolha de evolução: aumentar um atributo em 2 ou dois em 1, respeitando o limite aplicável."],
];

export function PortugueseRulesGlossary() {
  return <details lang="pt-BR" translate="no" className="notranslate rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground">
    <summary className="cursor-pointer font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring">Ajuda em português · termos de D&D 2024</summary>
    <p className="mt-3 max-w-prose text-muted-foreground">Use estas definições para conferir a tradução do navegador. Nomes de personagens, livros e opções de regras podem continuar em inglês para facilitar a busca no Foundry.</p>
    <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {terms.map(([english, portuguese, explanation]) => <div key={english} className="min-w-0"><dt className="font-semibold">{portuguese} <span lang="en" className="font-normal text-muted-foreground">({english})</span></dt><dd className="mt-1 leading-relaxed text-muted-foreground">{explanation}</dd></div>)}
    </dl>
  </details>;
}
