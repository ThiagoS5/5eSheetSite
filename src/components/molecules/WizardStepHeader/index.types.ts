export interface WizardStepHeaderProps {
  id: string;
  eyebrow?: string;
  title: string;
  description: string;
  searchId?: string;
  searchLabel?: string;
  searchValue?: string;
  searchPlaceholder?: string;
  resultCountLabel?: string;
  onSearch?: (value: string) => void;
}
