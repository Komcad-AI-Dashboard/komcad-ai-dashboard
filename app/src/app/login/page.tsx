"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState: LoginState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-base p-6">
      <div className="w-full max-w-[380px] rounded-[12px] border border-border bg-surface p-6">
        <div className="mb-6 flex items-center gap-[9px]">
          <div className="flex h-[22px] w-[28px] shrink-0 flex-col overflow-hidden rounded-[3px] border border-border">
            <div className="flex-1 bg-[#D8302A]" />
            <div className="flex-1 bg-[#F2F2F2]" />
          </div>
          <div>
            <div className="text-[13.5px] font-extrabold tracking-wide">AI KOMCAD</div>
            <div className="mt-px text-[9.5px] font-semibold tracking-widest text-ink-3">
              COMMAND CENTER
            </div>
          </div>
        </div>

        <h1 className="mb-1 text-[16px] font-extrabold">Masuk</h1>
        <p className="mb-5 text-[12px] text-ink-2">
          Masuk ke platform AI Komcad sesuai role Anda.
        </p>

        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="nama@komcad.mil.id" required />
          </div>
          <div>
            <Label htmlFor="password">Kata Sandi</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required />
          </div>

          {state.error && (
            <div className="rounded-[6px] border border-red bg-red/10 px-3 py-2 text-[11.5px] text-[#F5A9A5]">
              {state.error}
            </div>
          )}

          <Button type="submit" variant="solid" disabled={pending} className="mt-2 h-[38px] w-full">
            {pending ? "Memproses..." : "Masuk"}
          </Button>
        </form>

        <div className="mt-6 rounded-[6px] border border-border bg-elevated p-3 text-[10.5px] leading-relaxed text-ink-3">
          <div className="mb-1 font-bold text-ink-2">Akun demo (data dummy):</div>
          admin@komcad.mil.id · operator@komcad.mil.id · analis@komcad.mil.id ·
          anggota@komcad.mil.id — kata sandi: <span className="font-mono">komcad123</span>
        </div>
      </div>
    </div>
  );
}
