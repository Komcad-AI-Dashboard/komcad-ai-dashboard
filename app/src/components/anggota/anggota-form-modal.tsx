"use client";

import { useActionState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { createAnggotaAction, updateAnggotaAction } from "@/lib/anggota-actions";
import type { AnggotaFull } from "@/lib/anggota-data";

const initialState = { error: null as string | null };

export function AnggotaFormModal({
  open,
  onOpenChange,
  anggota,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anggota: AnggotaFull | null;
  onSaved: () => void;
}) {
  const action = anggota ? updateAnggotaAction.bind(null, anggota.id) : createAnggotaAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !pending && state.error === null) {
      onSaved();
      onOpenChange(false);
    }
    wasPending.current = pending;
  }, [pending, state, onSaved, onOpenChange]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={anggota ? "Edit Data Anggota" : "Tambah Anggota"}
      description={
        anggota ? undefined : "Data awal minimal — lengkapi detail lain lewat drawer profil setelah dibuat."
      }
    >
      <form action={formAction} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="nik">NIK (16 digit)</Label>
            <Input id="nik" name="nik" defaultValue={anggota?.nik} maxLength={16} required />
          </div>
          <div>
            <Label htmlFor="nama">Nama Lengkap</Label>
            <Input id="nama" name="nama" defaultValue={anggota?.nama} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="unitAsal">Unit Asal</Label>
            <Input id="unitAsal" name="unitAsal" defaultValue={anggota?.unitAsal} required />
          </div>
          <div>
            <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
            <Select
              id="jenisKelamin"
              name="jenisKelamin"
              defaultValue={anggota?.profilDemografi?.jenisKelamin ?? "Laki-laki"}
            >
              <option>Laki-laki</option>
              <option>Perempuan</option>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="telepon">Telepon</Label>
            <Input id="telepon" name="telepon" defaultValue={anggota?.telepon ?? ""} />
          </div>
          <div>
            <Label htmlFor="whatsapp">WhatsApp (format 62...)</Label>
            <Input id="whatsapp" name="whatsapp" defaultValue={anggota?.whatsapp ?? ""} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={anggota?.email ?? ""} />
          </div>
          <div>
            <Label htmlFor="provinsi">Provinsi</Label>
            <Input id="provinsi" name="provinsi" defaultValue={anggota?.profilDemografi?.provinsi ?? ""} />
          </div>
        </div>

        {state.error && (
          <div className="rounded-[6px] border border-red bg-red/10 px-3 py-2 text-[11.5px] text-[#F5A9A5]">
            {state.error}
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
