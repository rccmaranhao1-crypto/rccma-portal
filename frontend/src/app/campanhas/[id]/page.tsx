"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Seller = { seller: { id: string; name: string; whatsapp: string } };
type Campaign = { id: string; title: string; description: string; reserveMinutes: number; sellers: Seller[] };

export default function CampaignPage({ params }: { params: { id: string } }) {
  const [c, setC] = useState<Campaign | null>(null);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    api<Campaign>(`/campaigns/${params.id}`).then(setC).catch((e) => setErr(String(e)));
  }, [params.id]);

  if (err) return <div className="text-sm text-red-700">{err}</div>;
  if (!c) return <div className="text-sm text-rcc-dark">Carregando...</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold text-rcc-green">{c.title}</h2>
      <p className="text-sm text-rcc-dark">{c.description}</p>

      <div className="rounded-2xl border border-rcc-blue p-5">
        <h3 className="font-semibold text-rcc-green">Vendedor obrigatório</h3>
        <p className="text-sm text-rcc-dark mt-2">
          Reserva: {c.reserveMinutes} minutos.
        </p>
        <ul className="mt-3 text-sm list-disc ml-5">
          {c.sellers.map((s) => (
            <li key={s.seller.id}>{s.seller.name} — {s.seller.whatsapp}</li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-rcc-dark">
          Reserva/compra via API: <code>POST /campaigns/{params.id}/reserve</code>
        </p>
      </div>
    </div>
  );
}
