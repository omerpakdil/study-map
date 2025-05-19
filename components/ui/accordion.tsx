"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDownIcon, PlusIcon, MinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" className={cn("space-y-4", className)} {...props} />
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "relative my-4 overflow-hidden rounded-xl border-0 bg-gradient-to-br from-background to-background/80 shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5", 
        className
      )}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "flex flex-1 items-center justify-between gap-4 p-6 text-left text-base font-medium transition-all outline-none bg-gradient-to-r from-transparent to-background/10 backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group",
          className
        )}
        {...props}
      >
        {children}
        <div className="relative size-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:bg-primary/20 group-data-[state=open]:bg-primary/20">
          <PlusIcon className="h-4 w-4 text-primary absolute transition-all duration-300 group-data-[state=open]:opacity-0 group-data-[state=open]:scale-0" />
          <MinusIcon className="h-4 w-4 text-primary absolute transition-all duration-300 opacity-0 scale-0 group-data-[state=open]:opacity-100 group-data-[state=open]:scale-100" />
        </div>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down border-t border-border/10"
      {...props}
    >
      <div className={cn("p-6 pt-4 text-sm bg-accent/5", className)}>
        {children}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background/80 to-transparent pointer-events-none opacity-50"></div>
      </div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
