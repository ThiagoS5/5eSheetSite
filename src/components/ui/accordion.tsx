"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import type { ComponentPropsWithoutRef, ElementRef, ReactNode } from "react";
import { createContext, forwardRef, useContext, useMemo, useState } from "react";

function joinClasses(...classes: Array<string | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Values currently expanded in the enclosing accordion. */
const OpenValuesContext = createContext<readonly string[]>([]);
/** Value owned by the nearest accordion item. */
const ItemValueContext = createContext<string | undefined>(undefined);

function toArray(value: string | string[] | undefined): readonly string[] {
  if (Array.isArray(value)) {
    return value;
  }
  return value ? [value] : [];
}

type AccordionRootProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>;

/**
 * Wraps Radix' Root so the open state is readable from React (not only via CSS
 * `data-state`). We keep Radix as the source of truth, mirroring its value into
 * context so triggers can render their icon with true conditional logic.
 */
const Accordion = forwardRef<ElementRef<typeof AccordionPrimitive.Root>, AccordionRootProps>(
  (props, ref) => {
    const { children, value, defaultValue, onValueChange, ...rest } = props as {
      children?: ReactNode;
      value?: string | string[];
      defaultValue?: string | string[];
      onValueChange?: (value: string | string[]) => void;
    } & Record<string, unknown>;

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<string | string[] | undefined>(
      defaultValue,
    );
    const currentValue = isControlled ? value : internalValue;

    const handleValueChange = (next: string | string[]) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    };

    const openValues = useMemo(() => toArray(currentValue), [currentValue]);

    return (
      <OpenValuesContext.Provider value={openValues}>
        <AccordionPrimitive.Root
          ref={ref}
          {...(rest as AccordionRootProps)}
          value={currentValue as never}
          onValueChange={handleValueChange as never}
        >
          {children}
        </AccordionPrimitive.Root>
      </OpenValuesContext.Provider>
    );
  },
);
Accordion.displayName = "Accordion";

const AccordionItem = forwardRef<
  ElementRef<typeof AccordionPrimitive.Item>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, value, ...props }, ref) => (
  <ItemValueContext.Provider value={value}>
    <AccordionPrimitive.Item
      ref={ref}
      value={value}
      className={joinClasses("border-b border-white/[0.08]", className)}
      {...props}
    />
  </ItemValueContext.Provider>
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = forwardRef<
  ElementRef<typeof AccordionPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const itemValue = useContext(ItemValueContext);
  const openValues = useContext(OpenValuesContext);
  const isOpen = itemValue !== undefined && openValues.includes(itemValue);

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={joinClasses(
          "group flex flex-1 items-center justify-between gap-3 py-4 text-left text-sm font-semibold text-foreground outline-none transition hover:text-accent focus-visible:ring-2 focus-visible:ring-accent",
          className,
        )}
        {...props}
      >
        <span>{children}</span>
        <span aria-hidden="true" className="leading-none text-accent">
          {isOpen ? (
            <i className="fa-solid fa-angle-down" />
          ) : (
            <i className="fa-solid fa-plus" />
          )}
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = forwardRef<
  ElementRef<typeof AccordionPrimitive.Content>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={joinClasses(
      "overflow-hidden pb-4 text-sm leading-7 text-subdued",
      className,
    )}
    {...props}
  >
    {children}
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
