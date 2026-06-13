"use client";

import { useId, type ReactNode } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

interface HoverTooltipProps {
  children: ReactNode;
  content: ReactNode;
}

export function HoverTooltip({ children, content }: HoverTooltipProps) {
  const descriptionId = useId();

  return (
    <Tooltip.Provider delayDuration={150} skipDelayDuration={100}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            aria-describedby={descriptionId}
            className="rounded-sm text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[#f3c969]"
          >
            {children}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            id={descriptionId}
            sideOffset={8}
            collisionPadding={16}
            className="z-50 max-w-sm rounded-md border border-white/10 bg-[#10121b] px-4 py-3 text-sm leading-6 text-[#e8e9f0] shadow-2xl shadow-black/40"
          >
            {content}
            <Tooltip.Arrow className="fill-[#10121b]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
