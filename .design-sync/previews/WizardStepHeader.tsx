import { WizardStepHeader } from 'ficha-5e-app';

export function BasicStep() {
  return (
    <WizardStepHeader
      id="step-race"
      eyebrow="Passo 1 de 6"
      title="Escolha sua Raça"
      description="Sua raça define traços inatos: resistências, sentidos especiais e bônus de atributo que moldam seu personagem desde o início."
    />
  );
}

export function WithSearch() {
  return (
    <WizardStepHeader
      id="step-class"
      eyebrow="Passo 2 de 6"
      title="Escolha sua Classe"
      description="A classe determina as habilidades, magias e estilo de combate do seu personagem ao longo dos níveis."
      searchId="class-search"
      searchLabel="Filtrar classes"
      searchPlaceholder="Ex: Guerreiro, Mago…"
      resultCountLabel="13 classes disponíveis"
    />
  );
}
