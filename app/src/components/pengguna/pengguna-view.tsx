"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/constants";
import type { UserListItem } from "@/lib/user-data";
import { toggleUserStatusAction } from "@/lib/user-actions";
import { UserFormModal } from "./user-form-modal";

export function PenggunaView({
  users,
  roleSummary,
  currentUserId,
}: {
  users: UserListItem[];
  roleSummary: { role: string; jumlah: number }[];
  currentUserId: string;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [formTarget, setFormTarget] = useState<UserListItem | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setFormTarget(null);
    setFormOpen(true);
  }
  function openEdit(u: UserListItem) {
    setFormTarget(u);
    setFormOpen(true);
  }

  function handleToggleStatus(u: UserListItem) {
    setError(null);
    startTransition(async () => {
      const res = await toggleUserStatusAction(u.id);
      if (res.error) setError(res.error);
    });
  }

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="mb-4 rounded-[8px] border border-border bg-surface p-[14px]">
        <h3 className="mb-2 text-[12px] font-extrabold">Ringkasan Role</h3>
        {roleSummary.map((r) => (
          <div key={r.role} className="flex items-center justify-between border-b border-border-soft py-2 last:border-b-0">
            <div className="text-[12.5px] font-semibold">{ROLE_LABELS[r.role as keyof typeof ROLE_LABELS]}</div>
            <Badge color="green">{r.jumlah} pengguna</Badge>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-[6px] border border-red bg-red/10 px-3 py-2 text-[11.5px] text-[#F5A9A5]">
          {error}
        </div>
      )}

      <div className="rounded-[8px] border border-border bg-surface p-[14px]">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[12px] font-extrabold">Daftar Pengguna</h3>
          <Button variant="solid" size="sm" onClick={openCreate}>
            <Plus className="size-3.5" strokeWidth={2} />
            Tambah Pengguna
          </Button>
        </div>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              {["NAMA", "EMAIL", "ROLE", "STATUS", ""].map((h) => (
                <th key={h} className="border-b border-border px-3 py-[10px] text-[10px] font-extrabold tracking-wide text-ink-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border-soft last:border-b-0">
                <td className="px-3 py-[10px] text-[12px] font-semibold">
                  {u.name} {u.id === currentUserId && <span className="text-ink-3">(Anda)</span>}
                </td>
                <td className="px-3 py-[10px] text-[12px] text-ink-2">{u.email}</td>
                <td className="px-3 py-[10px] text-[12px]">{ROLE_LABELS[u.role as keyof typeof ROLE_LABELS]}</td>
                <td className="px-3 py-[10px]">
                  <Badge color={u.status === "Aktif" ? "green" : "gray"}>{u.status}</Badge>
                </td>
                <td className="px-3 py-[10px] text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="default" size="sm" onClick={() => openEdit(u)}>
                      Edit
                    </Button>
                    <Button
                      variant={u.status === "Aktif" ? "danger" : "outline"}
                      size="sm"
                      onClick={() => handleToggleStatus(u)}
                      disabled={pending || u.id === currentUserId}
                    >
                      {u.status === "Aktif" ? "Nonaktifkan" : "Aktifkan"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserFormModal
        key={formTarget ? `edit-${formTarget.id}` : "create"}
        open={formOpen}
        onOpenChange={setFormOpen}
        user={formTarget}
        onSaved={() => setFormOpen(false)}
      />
    </div>
  );
}
