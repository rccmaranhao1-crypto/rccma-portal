"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Diocese = { id: string; name: string };

export default function MeuGo() {
  const [dioceses, setDioceses] = useState<Diocese[]>([]);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    api<Diocese[]>("/diocese").then(setDioceses).catch((e) => setStatus(String(e)));
  }, []);

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-2xl font-bold text-rcc-green">Meu GO Nota 10</h2>
      <p className="text-sm text-rcc-dark">
        Contribuição por PIX ou cartão via PagBank (v1.0). Fluxo final: verificar WhatsApp cadastrado e, se não existir, redirecionar para cadastro.
      </p>

      {status ? <div className="text-sm text-red-700">{status}</div> : null}

      <div className="rounded-2xl border border-rcc-blue p-5 space-y-3">
        <label className="block text-sm">Diocese</label>
        <select className="w-full border border-rcc-blue rounded-xl p-2">
          {dioceses.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-rcc-dark">
          Endpoint de doação (autenticado): <code>POST /donations</code>
        </p>
      </div>
    </div>
  );
}
