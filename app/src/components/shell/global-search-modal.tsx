"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, ShieldAlert } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { globalSearchAction, type GlobalSearchResult } from "@/lib/search-actions";

export function GlobalSearchModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const q = query.trim();
    const timeout = setTimeout(() => {
      if (q.length < 2) {
        setResults([]);
        return;
      }
      startTransition(async () => {
        setResults(await globalSearchAction(q));
      });
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  function handleSelect(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setQuery("");
      setResults([]);
    }
    onOpenChange(next);
  }

  return (
    <Modal open={open} onOpenChange={handleOpenChange} title="Cari" className="max-w-[480px]">
      <div className="flex items-center gap-2 rounded-[8px] border border-border bg-elevated px-3 py-[9px]">
        <Search className="size-4 shrink-0 text-ink-3" strokeWidth={1.5} />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama/kode anggota, kode misi, lokasi..."
          className="w-full bg-transparent text-[13px] text-ink placeholder:text-ink-3 focus:outline-none"
        />
      </div>

      <div className="mt-3 flex flex-col gap-1">
        {pending && <div className="px-2 py-3 text-[11.5px] text-ink-3">Mencari...</div>}
        {!pending && query.trim().length >= 2 && results.length === 0 && (
          <div className="px-2 py-3 text-[11.5px] text-ink-3">Tidak ada hasil untuk &quot;{query}&quot;.</div>
        )}
        {!pending && query.trim().length < 2 && (
          <div className="px-2 py-3 text-[11.5px] text-ink-3">Ketik minimal 2 karakter.</div>
        )}
        {results.map((r) => (
          <button
            key={`${r.type}-${r.id}`}
            onClick={() => handleSelect(r.href)}
            className="flex items-center gap-[10px] rounded-[8px] px-[10px] py-[9px] text-left transition-colors hover:bg-surface-hover"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-[7px] border border-border bg-surface text-ink-2">
              {r.type === "anggota" ? (
                <Users className="size-4" strokeWidth={1.5} />
              ) : (
                <ShieldAlert className="size-4" strokeWidth={1.5} />
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[12.5px] font-bold">{r.title}</div>
              <div className="truncate text-[10.5px] text-ink-2">{r.subtitle}</div>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}
