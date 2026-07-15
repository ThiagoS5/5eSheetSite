import type { ReactNode } from "react";

export interface DetailDialogProps {
  title: string;
  description?: string;
  triggerLabel?: string;
  triggerClassName?: string;
  children: ReactNode;
}
