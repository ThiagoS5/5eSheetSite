import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ActionBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  intent?: "primary" | "secondary";
  size?: "md" | "sm";
}
