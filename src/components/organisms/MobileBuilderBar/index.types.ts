export interface MobileBuilderBarIdentity {
  name: string;
  className: string;
  level: number;
  hp: number;
  ac: number;
}

export interface MobileBuilderBarProps {
  currentStepIndex: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  nextBlockedReason?: string;
  identity: MobileBuilderBarIdentity;
  onOpenSheet: () => void;
  onOpenSteps: () => void;
  hasPreviousStep?: boolean;
  hasNextStep?: boolean;
}
