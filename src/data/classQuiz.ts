/**
 * Quiz guiado de escolha de classe (modo guiado / novato).
 *
 * Banco com mais perguntas do que o quiz usa por sessão: cada sessão sorteia
 * QUIZ_QUESTION_COUNT perguntas e embaralha a ordem das respostas, para que o
 * jogador sempre se questione algo novo ao refazer o quiz.
 *
 * O resultado destaca exatamente DUAS classes: a principal (recomendada) e a
 * segunda opção — sugestão, nunca trava: todas as classes seguem disponíveis.
 */

export const QUIZ_QUESTION_COUNT = 5;

export interface ClassQuizOption {
  id: string;
  /** Resposta curta, na voz do jogador. */
  label: string;
  /** Uma linha didática ligando a resposta à experiência na mesa. */
  flavor: string;
  /** Pontos que a resposta dá a cada classe (classId -> peso). */
  weights: Record<string, number>;
}

export interface ClassQuizQuestion {
  id: string;
  /** Pergunta imersiva, que coloca o jogador numa cena de mesa. */
  prompt: string;
  /** Por que essa pergunta importa na hora de escolher a classe. */
  helper: string;
  options: ClassQuizOption[];
}

export interface ClassQuizRecommendation {
  primaryClassId: string;
  secondaryClassId: string;
  /** classId -> respostas escolhidas que apontaram para essa classe. */
  reasons: Record<string, string[]>;
}

/**
 * Resumo didático de cada classe para o card de resultado: o que ela faz e
 * como é jogá-la na mesa.
 */
export const classQuizPitches: Record<string, string> = {
  "barbarian-xphb":
    "Fúria em estado bruto: você entra na frente, aguenta pancada como ninguém e devolve em dobro. Na mesa é direto e visceral — poucas decisões por turno e muito impacto.",
  "bard-xphb":
    "Você vence com carisma: inspira aliados, atrapalha inimigos e resolve metade das cenas conversando. Na mesa, é quem transforma qualquer situação social em espetáculo.",
  "cleric-xphb":
    "Canal direto de um poder divino: cura quem caiu, protege quem luta e ainda castiga o mal de armadura. Na mesa, o grupo respira aliviado quando você está por perto.",
  "druid-xphb":
    "A natureza atende ao seu chamado: você conjura tempestades, cura feridas e vira animais selvagens. Na mesa, é versatilidade pura — sempre há uma forma ou magia para o problema.",
  "fighter-xphb":
    "Mestre de armas e armaduras: confiável em qualquer combate e simples de aprender. Na mesa, você sempre sabe o que fazer no seu turno — e faz muito bem feito.",
  "monk-xphb":
    "Corpo e disciplina como armas: você corre pelas paredes, acerta rajadas de golpes e escapa do que ninguém escaparia. Na mesa, seus turnos são pura coreografia.",
  "paladin-xphb":
    "Um juramento sagrado guia sua lâmina: você protege os fracos, cura aliados e explode inimigos com golpes divinos. Na mesa, é o herói que todo grupo quer ao lado.",
  "ranger-xphb":
    "Caçador dos ermos: rastreia qualquer presa, atira com precisão letal e conhece cada trilha. Na mesa, você brilha na exploração e nunca deixa o grupo se perder.",
  "rogue-xphb":
    "Sombras, astúcia e o golpe perfeito: você abre fechaduras, some da vista e causa dano absurdo quando ninguém espera. Na mesa, é quem resolve o impossível em silêncio.",
  "sorcerer-xphb":
    "Magia corre no seu sangue: você molda feitiços por instinto e os turbina como nenhum estudioso consegue. Na mesa, seus momentos de glória são explosivos — literalmente.",
  "warlock-xphb":
    "Um pacto com algo poderoso te deu magia — e um preço: poucos feitiços, todos devastadores, e um patrono cheio de segredos. Na mesa, é combustível infinito para boas histórias.",
  "wizard-xphb":
    "O maior grimório do jogo: você estuda a magia como ciência e tem uma resposta para quase tudo. Na mesa, é quem vira o combate com a magia certa no momento certo.",
};

/** Ordem fixa para desempate determinístico entre classes com mesma pontuação. */
const TIE_BREAK_ORDER = [
  "fighter-xphb",
  "cleric-xphb",
  "rogue-xphb",
  "wizard-xphb",
  "paladin-xphb",
  "ranger-xphb",
  "barbarian-xphb",
  "bard-xphb",
  "druid-xphb",
  "sorcerer-xphb",
  "warlock-xphb",
  "monk-xphb",
];

export const classQuizQuestionPool: ClassQuizQuestion[] = [
  {
    id: "instinto-de-combate",
    prompt:
      "A porta da masmorra range e um ogro avança rugindo. Qual é o seu primeiro instinto?",
    helper:
      "Isso define onde seu personagem fica no combate — e quanto perigo ele aguenta de perto.",
    options: [
      {
        id: "instinto-de-combate-aco",
        label: "Partir para cima com aço na mão",
        flavor: "Linha de frente: trocar golpes olhando no olho.",
        weights: {
          "barbarian-xphb": 3,
          "fighter-xphb": 3,
          "paladin-xphb": 2,
          "monk-xphb": 2,
        },
      },
      {
        id: "instinto-de-combate-mira",
        label: "Manter distância e mirar num ponto fraco",
        flavor: "Ataques precisos e seguros, longe das garras.",
        weights: {
          "ranger-xphb": 3,
          "rogue-xphb": 2,
          "fighter-xphb": 1,
        },
      },
      {
        id: "instinto-de-combate-magia",
        label: "Erguer as mãos e deixar a magia falar",
        flavor: "Poder arcano resolve o que músculos não resolvem.",
        weights: {
          "wizard-xphb": 3,
          "sorcerer-xphb": 3,
          "warlock-xphb": 2,
          "druid-xphb": 1,
        },
      },
      {
        id: "instinto-de-combate-escudo",
        label: "Me colocar entre o perigo e meus aliados",
        flavor: "Ninguém cai enquanto você estiver de pé.",
        weights: {
          "paladin-xphb": 3,
          "cleric-xphb": 3,
          "fighter-xphb": 1,
        },
      },
    ],
  },
  {
    id: "papel-no-grupo",
    prompt: "No fim da sessão, qual papel te daria mais orgulho de ter cumprido?",
    helper:
      "Todo grupo precisa de papéis diferentes — o seu favorito diz muito sobre a classe ideal.",
    options: [
      {
        id: "papel-no-grupo-escudo",
        label: "Fui o escudo que segurou o perigo",
        flavor: "Tanque: você absorve os golpes para o grupo brilhar.",
        weights: {
          "paladin-xphb": 3,
          "fighter-xphb": 2,
          "barbarian-xphb": 2,
          "cleric-xphb": 1,
        },
      },
      {
        id: "papel-no-grupo-dano",
        label: "Fui a maior fonte de dano da mesa",
        flavor: "Quando você age, a ficha do inimigo chora.",
        weights: {
          "rogue-xphb": 2,
          "sorcerer-xphb": 2,
          "warlock-xphb": 2,
          "barbarian-xphb": 2,
        },
      },
      {
        id: "papel-no-grupo-suporte",
        label: "Mantive todo mundo vivo",
        flavor: "Curas e proteções na hora exata mudam o jogo.",
        weights: {
          "cleric-xphb": 3,
          "druid-xphb": 2,
          "bard-xphb": 2,
          "paladin-xphb": 1,
        },
      },
      {
        id: "papel-no-grupo-controle",
        label: "Controlei o campo e venci com astúcia",
        flavor: "Uma magia bem posicionada vale por dez espadas.",
        weights: {
          "wizard-xphb": 3,
          "bard-xphb": 2,
          "druid-xphb": 2,
        },
      },
    ],
  },
  {
    id: "estilo-de-turno",
    prompt: "Chegou o seu turno e a mesa inteira olha para você. O que soa mais divertido?",
    helper:
      "Classes têm complexidades diferentes: algumas são diretas, outras dão muitas opções por turno.",
    options: [
      {
        id: "estilo-de-turno-direto",
        label: "Agir rápido: golpe certeiro, sem dilema",
        flavor: "Simples de jogar e sempre eficiente — ideal para começar.",
        weights: {
          "fighter-xphb": 3,
          "barbarian-xphb": 2,
          "rogue-xphb": 1,
        },
      },
      {
        id: "estilo-de-turno-truques",
        label: "Ter um truque na manga para cada situação",
        flavor: "Muitas escolhas por turno — para quem gosta de planejar.",
        weights: {
          "wizard-xphb": 3,
          "bard-xphb": 2,
          "druid-xphb": 2,
        },
      },
      {
        id: "estilo-de-turno-devastador",
        label: "Poucos poderes, mas devastadores",
        flavor: "Cada recurso gasto precisa valer a cena.",
        weights: {
          "warlock-xphb": 3,
          "sorcerer-xphb": 2,
          "paladin-xphb": 1,
        },
      },
      {
        id: "estilo-de-turno-combo",
        label: "Encadear movimento e golpes em sequência",
        flavor: "Turnos ágeis, cheios de deslocamento e estilo.",
        weights: {
          "monk-xphb": 3,
          "rogue-xphb": 2,
          "ranger-xphb": 1,
        },
      },
    ],
  },
  {
    id: "origem-do-poder",
    prompt: "De onde vem a força do seu herói?",
    helper:
      "A origem do poder molda a história do personagem — e define se ele usa magia e de que tipo.",
    options: [
      {
        id: "origem-do-poder-treino",
        label: "Anos de treino e disciplina",
        flavor: "Nada de atalhos: cada habilidade foi conquistada com suor.",
        weights: {
          "monk-xphb": 3,
          "fighter-xphb": 2,
          "ranger-xphb": 1,
        },
      },
      {
        id: "origem-do-poder-fe",
        label: "Fé em algo maior que eu",
        flavor: "Um deus, um juramento ou a própria natureza respondem ao seu chamado.",
        weights: {
          "cleric-xphb": 3,
          "paladin-xphb": 2,
          "druid-xphb": 2,
        },
      },
      {
        id: "origem-do-poder-estudo",
        label: "Estudo, pesquisa e segredos antigos",
        flavor: "Conhecimento é poder — literalmente.",
        weights: {
          "wizard-xphb": 3,
          "warlock-xphb": 1,
        },
      },
      {
        id: "origem-do-poder-sangue",
        label: "Um dom que corre no meu sangue",
        flavor: "Você não aprendeu magia. Você nasceu com ela.",
        weights: {
          "sorcerer-xphb": 3,
          "warlock-xphb": 2,
          "bard-xphb": 1,
        },
      },
    ],
  },
  {
    id: "cena-na-cidade",
    prompt:
      "A cidade está em festa e o grupo precisa de informações sobre o vilão. O que você faz?",
    helper:
      "Boa parte do jogo acontece fora do combate — pense em como você quer brilhar nessas cenas.",
    options: [
      {
        id: "cena-na-cidade-palco",
        label: "Encanto o salão inteiro com uma história",
        flavor: "Enquanto todos riem, as línguas se soltam.",
        weights: {
          "bard-xphb": 3,
          "sorcerer-xphb": 1,
          "warlock-xphb": 1,
        },
      },
      {
        id: "cena-na-cidade-sombras",
        label: "Sumo na multidão e escuto o que não devia",
        flavor: "Ninguém guarda segredo de quem ninguém vê.",
        weights: {
          "rogue-xphb": 3,
          "ranger-xphb": 1,
          "monk-xphb": 1,
        },
      },
      {
        id: "cena-na-cidade-templo",
        label: "Procuro o templo e os sábios locais",
        flavor: "Quem conhece o passado, prevê o perigo.",
        weights: {
          "cleric-xphb": 2,
          "wizard-xphb": 2,
          "paladin-xphb": 1,
        },
      },
      {
        id: "cena-na-cidade-guarda",
        label: "Fico de olho nas saídas e nos encrenqueiros",
        flavor: "Festa é onde emboscada acontece — alguém precisa vigiar.",
        weights: {
          "fighter-xphb": 2,
          "ranger-xphb": 2,
          "barbarian-xphb": 1,
        },
      },
    ],
  },
  {
    id: "lar-do-heroi",
    prompt: "Feche os olhos: onde o seu personagem se sente em casa?",
    helper:
      "O ambiente natural do herói ajuda a mestre e jogador a criarem cenas onde a classe brilha.",
    options: [
      {
        id: "lar-do-heroi-ermos",
        label: "Nos ermos selvagens, longe da civilização",
        flavor: "Trilhas, feras e o céu aberto como teto.",
        weights: {
          "ranger-xphb": 3,
          "druid-xphb": 3,
          "barbarian-xphb": 1,
        },
      },
      {
        id: "lar-do-heroi-torre",
        label: "Entre livros, torres e ruínas antigas",
        flavor: "Cada tomo empoeirado esconde uma resposta.",
        weights: {
          "wizard-xphb": 3,
          "warlock-xphb": 1,
          "cleric-xphb": 1,
        },
      },
      {
        id: "lar-do-heroi-taverna",
        label: "Em tavernas, palcos e salões nobres",
        flavor: "Onde há gente, há plateia — e oportunidade.",
        weights: {
          "bard-xphb": 3,
          "rogue-xphb": 2,
          "sorcerer-xphb": 1,
        },
      },
      {
        id: "lar-do-heroi-fortaleza",
        label: "Em campos de treino e fortalezas",
        flavor: "Disciplina, aço e o cheiro de batalha no ar.",
        weights: {
          "fighter-xphb": 3,
          "paladin-xphb": 2,
          "monk-xphb": 1,
        },
      },
    ],
  },
  {
    id: "dilema-do-vilao",
    prompt: "O vilão está derrotado aos seus pés e implora por piedade. O que seu herói faz?",
    helper:
      "Não existe resposta certa — mas o seu instinto moral combina mais com algumas classes.",
    options: [
      {
        id: "dilema-do-vilao-piedade",
        label: "Poupo. Todos merecem uma chance de redenção",
        flavor: "Honra e compaixão acima da vingança.",
        weights: {
          "paladin-xphb": 3,
          "cleric-xphb": 2,
          "monk-xphb": 1,
        },
      },
      {
        id: "dilema-do-vilao-fim",
        label: "Termino o serviço. Piedade custa caro",
        flavor: "Pragmatismo frio: vilão vivo é problema adiado.",
        weights: {
          "rogue-xphb": 2,
          "warlock-xphb": 2,
          "barbarian-xphb": 2,
        },
      },
      {
        id: "dilema-do-vilao-informacao",
        label: "Transformo ele numa fonte de informação",
        flavor: "Um inimigo falando vale mais que um inimigo morto.",
        weights: {
          "bard-xphb": 2,
          "wizard-xphb": 2,
          "rogue-xphb": 1,
        },
      },
      {
        id: "dilema-do-vilao-destino",
        label: "Deixo a natureza — ou o destino — decidir",
        flavor: "Você é instrumento de algo maior, não juiz.",
        weights: {
          "druid-xphb": 3,
          "ranger-xphb": 2,
          "sorcerer-xphb": 1,
        },
      },
    ],
  },
  {
    id: "momento-de-gloria",
    prompt: "Qual cena você sonha em contar para os amigos depois da sessão?",
    helper:
      "Os grandes momentos que você imagina são a melhor pista da classe que vai te divertir.",
    options: [
      {
        id: "momento-de-gloria-muralha",
        label: "Segurei o chefe sozinho enquanto o grupo escapava",
        flavor: "Resistência heroica: o último a cair.",
        weights: {
          "fighter-xphb": 2,
          "paladin-xphb": 2,
          "barbarian-xphb": 2,
          "monk-xphb": 1,
        },
      },
      {
        id: "momento-de-gloria-magia",
        label: "Virei o combate com uma única magia no momento certo",
        flavor: "A mesa inteira gritando com a bola de fogo perfeita.",
        weights: {
          "wizard-xphb": 3,
          "sorcerer-xphb": 2,
          "warlock-xphb": 1,
        },
      },
      {
        id: "momento-de-gloria-resgate",
        label: "Salvei um aliado à beira da morte",
        flavor: "A cura no último segundo que ninguém esquece.",
        weights: {
          "cleric-xphb": 3,
          "druid-xphb": 2,
          "paladin-xphb": 1,
        },
      },
      {
        id: "momento-de-gloria-roubo",
        label: "Roubei a chave do plano inteiro sem ninguém notar",
        flavor: "O golpe silencioso que resolveu a campanha.",
        weights: {
          "rogue-xphb": 3,
          "bard-xphb": 1,
          "ranger-xphb": 1,
        },
      },
    ],
  },
  {
    id: "forma-da-magia",
    prompt: "Se a magia atendesse ao seu chamado, como ela seria?",
    helper:
      "Mesmo quem prefere aço pode ter um toque místico — e isso separa bem as classes conjuradoras.",
    options: [
      {
        id: "forma-da-magia-pacto",
        label: "Um pacto misterioso com algo poderoso",
        flavor: "Poder emprestado tem juros — e histórias incríveis.",
        weights: {
          "warlock-xphb": 3,
          "sorcerer-xphb": 1,
        },
      },
      {
        id: "forma-da-magia-bencao",
        label: "Bênçãos que curam e protegem",
        flavor: "Sua magia existe para os outros, não para você.",
        weights: {
          "cleric-xphb": 3,
          "druid-xphb": 2,
          "paladin-xphb": 2,
        },
      },
      {
        id: "forma-da-magia-formula",
        label: "Fórmulas estudadas com precisão de relojoeiro",
        flavor: "Magia é ciência: quem estuda mais, conjura melhor.",
        weights: {
          "wizard-xphb": 3,
          "bard-xphb": 1,
        },
      },
      {
        id: "forma-da-magia-instinto",
        label: "Energia pura, guiada pelo instinto",
        flavor: "Você sente a magia antes de entendê-la.",
        weights: {
          "sorcerer-xphb": 3,
          "monk-xphb": 1,
          "bard-xphb": 1,
        },
      },
    ],
  },
  {
    id: "mochila-do-heroi",
    prompt: "O grupo parte amanhã ao amanhecer. O que não pode faltar na sua mochila?",
    helper:
      "O equipamento que você valoriza revela como pretende resolver os problemas da aventura.",
    options: [
      {
        id: "mochila-do-heroi-arma",
        label: "Uma arma bem afiada e armadura confiável",
        flavor: "Preparado para o pior — e o pior sempre chega.",
        weights: {
          "fighter-xphb": 3,
          "paladin-xphb": 2,
          "barbarian-xphb": 1,
        },
      },
      {
        id: "mochila-do-heroi-livros",
        label: "Livros, mapas e componentes estranhos",
        flavor: "Conhecimento pesa pouco e salva vidas.",
        weights: {
          "wizard-xphb": 3,
          "cleric-xphb": 1,
          "druid-xphb": 1,
        },
      },
      {
        id: "mochila-do-heroi-ferramentas",
        label: "Cordas, gazuas e um bom par de adagas",
        flavor: "Toda porta trancada é um convite.",
        weights: {
          "rogue-xphb": 3,
          "ranger-xphb": 2,
          "monk-xphb": 1,
        },
      },
      {
        id: "mochila-do-heroi-instrumento",
        label: "Um instrumento e boas histórias",
        flavor: "Quem anima o acampamento, comanda a jornada.",
        weights: {
          "bard-xphb": 3,
          "sorcerer-xphb": 1,
          "warlock-xphb": 1,
        },
      },
    ],
  },
];

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

/**
 * Sorteia as perguntas da sessão do quiz e embaralha a ordem das respostas.
 * Aceita um gerador de aleatoriedade para sessões determinísticas em testes.
 */
export function createClassQuizSession(
  random: () => number = Math.random,
): ClassQuizQuestion[] {
  return shuffle(classQuizQuestionPool, random)
    .slice(0, QUIZ_QUESTION_COUNT)
    .map((question) => ({
      ...question,
      options: shuffle(question.options, random),
    }));
}

/**
 * Calcula a recomendação final: exatamente 2 classes (principal + segunda
 * opção), com as respostas que apontaram para cada uma como justificativa.
 * Retorna null enquanto a sessão não estiver completa.
 */
export function getClassQuizRecommendation(
  questions: readonly ClassQuizQuestion[],
  answerOptionIds: readonly string[],
): ClassQuizRecommendation | null {
  if (
    questions.length < QUIZ_QUESTION_COUNT ||
    answerOptionIds.length < questions.length
  ) {
    return null;
  }

  const chosenOptions = questions
    .map((question, index) =>
      question.options.find((option) => option.id === answerOptionIds[index]),
    )
    .filter((option): option is ClassQuizOption => Boolean(option));

  const scores = new Map<string, number>();
  const reasons = new Map<string, Array<{ label: string; weight: number }>>();

  for (const option of chosenOptions) {
    for (const [classId, weight] of Object.entries(option.weights)) {
      scores.set(classId, (scores.get(classId) ?? 0) + weight);
      const entries = reasons.get(classId) ?? [];
      entries.push({ label: option.label, weight });
      reasons.set(classId, entries);
    }
  }

  const ranked = [...scores.entries()].sort((a, b) => {
    if (b[1] !== a[1]) {
      return b[1] - a[1];
    }

    return TIE_BREAK_ORDER.indexOf(a[0]) - TIE_BREAK_ORDER.indexOf(b[0]);
  });

  const [primary = "fighter-xphb", secondary = "cleric-xphb"] = ranked.map(
    ([classId]) => classId,
  );

  const buildReasons = (classId: string): string[] =>
    (reasons.get(classId) ?? [])
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .map((entry) => entry.label);

  return {
    primaryClassId: primary,
    secondaryClassId: secondary,
    reasons: {
      [primary]: buildReasons(primary),
      [secondary]: buildReasons(secondary),
    },
  };
}
