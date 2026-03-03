"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { setAuth } from "@/lib/auth";

export default function LoginPage() {
  const [whatsapp, setWhatsapp] = useState("(99)9824-7746");
  const [password, setPassword] = useState("ucra01");
  const [err, setErr] = useState<string>("");
  const [ok, setOk] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setOk("");
    try {
      const res = await api<{ accessToken: string; refreshToken: string; user: { id: string; name: string; role: string } }>(
        "/auth/login",
        { method: "POST", body: JSON.stringify({ whatsapp, password }) }
      );
      setAuth(res.accessToken, res.refreshToken, res.user);
      setOk("Login realizado. Acesse a Área do ADM.");
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <h2 className="text-2xl font-bold text-rcc-green">Login</h2>
      <p className="text-sm text-rcc-dark">Entre com WhatsApp e senha para acessar a Área do ADM.</p>

      <form onSubmit={onSubmit} className="rounded-2xl border border-rcc-blue p-5 space-y-4">
        <div>
          <label className="text-sm">WhatsApp</label>
          <input
            className="w-full mt-1 border border-rcc-blue rounded-xl p-2"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="(99) 99999-9999"
          />
        </div>
        <div>
          <label className="text-sm">Senha</label>
          <input
            type="password"
            className="w-full mt-1 border border-rcc-blue rounded-xl p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {err ? <div className="text-sm text-red-700 break-words">{err}</div> : null}
        {ok ? <div className="text-sm text-rcc-green font-semibold">{ok}</div> : null}

        <button className="w-full px-4 py-2 rounded-xl bg-rcc-green text-rcc-white font-semibold" type="submit">
          Entrar
        </button>

        <div className="text-sm">
          <Link className="text-rcc-green font-semibold" href="/adm">Ir para Área do ADM →</Link>
        </div>
      </form>
    </div>
  );
}
