"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm animate-overlay-show" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-[2001] w-full max-w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-[12px] border border-border bg-surface shadow-2xl animate-modal-show",
            className
          )}
        >
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <div className="flex-1">
              <Dialog.Title className="text-[15px] font-extrabold">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1 text-[11.5px] text-ink-2">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                aria-label="Tutup"
                className="flex size-[30px] items-center justify-center rounded-[6px] border border-border bg-elevated text-ink-2 hover:text-ink"
              >
                <X className="size-4" strokeWidth={1.5} />
              </button>
            </Dialog.Close>
          </div>
          <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
