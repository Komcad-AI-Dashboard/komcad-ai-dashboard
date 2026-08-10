"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { ROLES, ROLE_LABELS } from "@/lib/constants";
import type { UserListItem } from "@/lib/user-data";
import { createUserAction, updateUserAction } from "@/lib/user-actions";

const COMMAND_ROLES = [ROLES.SUPER_ADMIN, ROLES.OPERATOR, ROLES.ANALIS] as const;

export function UserFormModal({
  open,
  onOpenChange,
  user,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserListItem | null;
  onSaved: () => void;
}) {
  const [email, setEmail] = useState(user?.email ?? "");
  const [name, setName] = useState(user?.name ?? "");
  const [role, setRole] = useState<string>(user?.role ?? ROLES.OPERATOR);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = user
        ? await updateUserAction(user.id, { name, role })
        : await createUserAction({ email, name, role, password });
      if (res.error) {
        setError(res.error);
        return;
      }
      onSaved();
      onOpenChange(false);
    });
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={user ? "Edit Pengguna" : "Tambah Pengguna"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!!user}
            required
          />
        </div>
        <div>
          <Label htmlFor="name">Nama</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <Select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
            {COMMAND_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </Select>
        </div>
        {!user && (
          <div>
            <Label htmlFor="password">Kata Sandi (minimal 6 karakter)</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
        )}

        {error && (
          <div className="rounded-[6px] border border-red bg-red/10 px-3 py-2 text-[11.5px] text-[#F5A9A5]">
            {error}
          </div>
        )}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button type="submit" variant="solid" disabled={pending}>
            {pending ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
