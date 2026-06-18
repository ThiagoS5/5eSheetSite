"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

function joinClasses(...classes: Array<string | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const Accordion = AccordionPrimitive.Root;

const AccordionItem = forwardRef<
  ElementRef<typeof AccordionPrimitive.Item>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={joinClasses("border-b border-white/[0.08]", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = forwardRef<
  ElementRef<typeof AccordionPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
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
        <i className="fa-solid fa-plus group-data-[state=open]:hidden" />
        <i className="fa-solid fa-angle-down hidden group-data-[state=open]:inline" />
      </span>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
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
