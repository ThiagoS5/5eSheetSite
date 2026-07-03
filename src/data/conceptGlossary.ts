export const requiredConceptIds = [
  "class",
  "species",
  "background",
  "attribute",
  "modifier",
  "proficiency",
  "skill",
  "armor-class",
  "hit-points",
  "initiative",
  "speed",
  "saving-throw",
  "spell",
  "cantrip",
  "spell-level",
  "spell-slot",
  "spell-save-dc",
  "spell-attack",
  "subclass",
  "feat",
  "asi",
  "starting-equipment",
  "inventory",
  "hit-die",
  "rest",
  "table-use",
] as const;

export type ConceptId = (typeof requiredConceptIds)[number];

export interface BeginnerConcept {
  term: string;
  short: string;
  long: string;
}

export const conceptGlossary: Record<ConceptId, BeginnerConcept> = {
  class: {
    term: "Classe",
    short: "A classe e o papel principal do heroi: como ele luta, resiste e resolve problemas.",
    long: "Pense na classe como a profissao de aventura do personagem. Um guerreiro resolve muita coisa com treino marcial, um mago com estudo arcano, e um clerigo com poder divino. Ela define dado de vida, proficiencias, recursos e boa parte do que voce usara em mesa.",
  },
  species: {
    term: "Especie",
    short: "A especie descreve a origem biologica fantastica do personagem e alguns tracos naturais.",
    long: "Humano, elfo, anao e outras especies trazem deslocamento, sentidos, tracos especiais e escolhas de idioma. Ela nao decide sua personalidade; ela fornece ferramentas de regra e uma base narrativa.",
  },
  background: {
    term: "Antecedente",
    short: "O antecedente mostra o que o personagem fazia antes da vida de aventureiro.",
    long: "Antecedentes concedem bonus de atributo, pericias, ferramentas, equipamento e um talento de origem. Eles ajudam a responder de onde o heroi veio e por que ele sabe fazer certas coisas.",
  },
  attribute: {
    term: "Atributo",
    short: "Atributos sao os seis numeros centrais: forca, destreza, constituicao, inteligencia, sabedoria e carisma.",
    long: "Quase toda rolagem importante usa um atributo. Valores altos aumentam suas chances; valores baixos criam fraquezas interessantes. O modificador derivado e o numero que normalmente entra na rolagem.",
  },
  modifier: {
    term: "Modificador",
    short: "O modificador e o bonus ou penalidade que sai de um atributo.",
    long: "Um atributo 16 gera modificador +3; atributo 8 gera -1. Quando o mestre pede um teste, voce rola d20 e soma esse modificador, alem de proficiencia quando aplicavel.",
  },
  proficiency: {
    term: "Proficiencia",
    short: "Proficiencia representa treinamento e soma um bonus que cresce com o nivel.",
    long: "Quando seu personagem e proficiente em uma pericia, arma ou salvaguarda, ele soma o bonus de proficiencia. Esse bonus comeca em +2 e cresce conforme o nivel total.",
  },
  skill: {
    term: "Pericia",
    short: "Pericias sao usos especializados dos atributos, como Atletismo, Furtividade e Percepcao.",
    long: "O mestre pede pericias quando a acao tem risco ou incerteza. Furtividade usa Destreza; Percepcao usa Sabedoria. Se voce for proficiente, soma tambem o bonus de proficiencia.",
  },
  "armor-class": {
    term: "Classe de Armadura",
    short: "Classe de Armadura, ou CA, e o numero que inimigos precisam alcancar para acertar voce.",
    long: "Quando alguem ataca seu personagem, ele rola d20 e soma o bonus de ataque. Se o resultado igualar ou superar sua CA, o ataque acerta. Armadura, escudo e Destreza normalmente influenciam esse valor.",
  },
  "hit-points": {
    term: "Pontos de Vida",
    short: "Pontos de Vida medem quanto dano o personagem aguenta antes de cair.",
    long: "PV nao sao apenas ferimentos; representam folego, sorte e resistencia. Ao chegar a 0 PV, o personagem fica em perigo e pode fazer salvaguardas contra morte.",
  },
  initiative: {
    term: "Iniciativa",
    short: "Iniciativa define a ordem de turno quando o combate comeca.",
    long: "Cada criatura rola d20 e soma o modificador de Destreza. Quem tira maior resultado age primeiro. Bons valores de Destreza ajudam personagens que precisam agir cedo.",
  },
  speed: {
    term: "Deslocamento",
    short: "Deslocamento indica quantos pes o personagem anda em um turno.",
    long: "A maior parte dos personagens anda 30 pes por turno. Terreno dificil, magias, armaduras e tracos de especie podem alterar esse numero.",
  },
  "saving-throw": {
    term: "Teste de resistencia",
    short: "Testes de resistencia reagem a perigos, magias e efeitos que tentam afetar voce.",
    long: "Diferente de uma pericia, a salvaguarda geralmente acontece quando algo atinge o personagem. Classes concedem proficiencias em algumas salvaguardas.",
  },
  spell: {
    term: "Magia",
    short: "Magias sao efeitos sobrenaturais que conjuradores aprendem, preparam ou conhecem.",
    long: "Magias podem causar dano, curar, proteger, controlar o campo ou resolver problemas. Cada classe conjuradora tem suas proprias regras de aprendizado e preparo.",
  },
  cantrip: {
    term: "Truque",
    short: "Truques sao magias simples que nao gastam slots.",
    long: "Um truque pode ser usado repetidas vezes. Eles sao a base do conjurador quando nao vale gastar um recurso maior.",
  },
  "spell-level": {
    term: "Circulo de magia",
    short: "O circulo indica a potencia da magia, de 1 ate 9.",
    long: "Nivel do personagem e circulo de magia nao sao a mesma coisa. Um mago de nivel 5, por exemplo, pode acessar magias de circulos maiores que um iniciante.",
  },
  "spell-slot": {
    term: "Slot de magia",
    short: "Slots sao recursos gastos para conjurar magias de circulo 1 ou maior.",
    long: "Ao conjurar uma magia, voce gasta um slot do circulo apropriado ou maior. Descansos e regras de classe recuperam esses slots.",
  },
  "spell-save-dc": {
    term: "CD de magia",
    short: "CD de magia e a dificuldade que alvos precisam vencer em uma salvaguarda contra sua magia.",
    long: "A CD normalmente e 8 + proficiencia + modificador do atributo de conjuracao. Quanto maior, mais dificil resistir aos seus efeitos.",
  },
  "spell-attack": {
    term: "Ataque magico",
    short: "Ataque magico e o bonus usado quando a magia pede uma rolagem de ataque.",
    long: "Algumas magias miram como um ataque: voce rola d20 e soma proficiencia e atributo de conjuracao. Outras pedem que o alvo faca uma salvaguarda.",
  },
  subclass: {
    term: "Subclasse",
    short: "Subclasse e uma especializacao dentro da classe principal.",
    long: "Ela aprofunda o estilo do personagem. Guerreiros podem seguir caminhos marciais diferentes; magos escolhem tradicoes. O nivel de desbloqueio depende da classe.",
  },
  feat: {
    term: "Talento",
    short: "Talentos sao melhorias especiais que concedem novas capacidades.",
    long: "Alguns talentos vem do antecedente; outros aparecem em niveis especificos. Eles podem mudar atributos, conceder magias, proficiencias ou novas opcoes de combate.",
  },
  asi: {
    term: "ASI",
    short: "ASI e aumento de atributo, uma escolha de evolucao em certos niveis.",
    long: "Quando a classe concede ASI, voce melhora atributos ou escolhe certos talentos. Melhorar um atributo pode aumentar modificadores e varios numeros derivados.",
  },
  "starting-equipment": {
    term: "Equipamento inicial",
    short: "Equipamento inicial e o kit que o personagem recebe ao comecar a aventura.",
    long: "Classe e antecedente sugerem armas, armaduras, ferramentas e itens. Voce tambem pode escolher ouro quando a regra permitir e montar o inventario manualmente.",
  },
  inventory: {
    term: "Inventario",
    short: "Inventario e a lista de itens carregados pelo personagem.",
    long: "Ele registra armas, armaduras, ferramentas, moedas e objetos de aventura. Conforme a campanha avanca, o inventario vira parte viva da ficha.",
  },
  "hit-die": {
    term: "Dado de vida",
    short: "Dado de vida define quanto PV a classe ganha ao subir de nivel.",
    long: "Classes resistentes usam dados maiores, como d10 ou d12. Em descansos curtos, dados de vida tambem podem ser gastos para recuperar PV.",
  },
  rest: {
    term: "Descanso",
    short: "Descansos recuperam parte dos recursos, PV e capacidades do personagem.",
    long: "Descanso curto e longo tem efeitos diferentes. A ficha viva usa essas regras para restaurar recursos sem alterar escolhas permanentes do personagem.",
  },
  "table-use": {
    term: "O que voce vai usar na mesa",
    short: "Na mesa, voce consultara ataques, CA, PV, pericias, magias e recursos restantes.",
    long: "O builder existe para produzir uma ficha facil de jogar. Durante a sessao, os numeros derivados precisam estar claros, confiaveis e rapidos de encontrar.",
  },
};
