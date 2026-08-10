"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Drawer({
  open,
  onOpenChange,
  title,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm animate-overlay-show" />
        <Dialog.Content
          className={cn(
            "fixed right-0 top-0 z-[2001] h-screen w-full max-w-[440px] overflow-y-auto border-l border-border bg-gradient-to-b from-[#070a0b] to-black shadow-[-30px_0_70px_rgba(0,0,0,0.9)] animate-drawer-slide-in",
            className
          )}
        >
          <div className="hud-head sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-[#070a0b] px-5 py-4">
            <Dialog.Title className="flex-1 text-[15px] font-extrabold">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="Tutup"
                className="flex size-[30px] items-center justify-center rounded-[6px] border border-border bg-elevated text-ink-2 hover:text-ink"
              >
                <X className="size-4" strokeWidth={1.5} />
              </button>
            </Dialog.Close>
          </div>
          <div className="p-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
