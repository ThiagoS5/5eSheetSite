"use client";

import { createContext, useContext, type ReactNode } from "react";

const BuilderHeaderToolbarContext = createContext<ReactNode>(null);

export function BuilderHeaderToolbarProvider({
  children,
  toolbar,
}: {
  children: ReactNode;
  toolbar: ReactNode;
}) {
  return (
    <BuilderHeaderToolbarContext.Provider value={toolbar}>
      {children}
    </BuilderHeaderToolbarContext.Provider>
  );
}

export function useBuilderHeaderToolbar(): ReactNode {
  return useContext(BuilderHeaderToolbarContext);
}
