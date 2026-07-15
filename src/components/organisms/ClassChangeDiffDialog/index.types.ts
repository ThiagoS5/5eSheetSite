export interface ClassChangeDiffDialogProps {
  open: boolean;
  items: string[];
  onConfirm: () => void;
  onCancel: () => void;
}
