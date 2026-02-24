"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Diocese = { id: string; name: string };

export default function SouCarismatico() {
  const [dioceses, setDioceses] = useState<Diocese[]>([]);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    api<Diocese[]>("/diocese").then(setDioceses).catch((e) => setMsg(String(e)));
  }, []);

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-2xl font-bold text-rcc-green">Sou Carismático</h2>
      <p className="text-sm text-rcc-dark">
        Cadastro/Login oficial (v1.0). Aqui está o formulário base; a UI pode ser refinada sem mudar as regras.
      </p>

      {msg ? <div className="text-sm text-red-700">{msg}</div> : null}

      <div className="rounded-2xl border border-rcc-blue p-5 space-y-3">
        <label className="block text-sm">Diocese (lista suspensa)</label>
        <select className="w-full border border-rcc-blue rounded-xl p-2">
          {dioceses.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-rcc-dark">
          Para completar cadastro/login e integrar com a API: use endpoints <code>/auth/register</code> e <code>/auth/login</code>.
        </p>
      </div>
    </div>
  );
}
