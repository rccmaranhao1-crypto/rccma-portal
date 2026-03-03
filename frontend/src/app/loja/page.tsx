"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Product = { id: string; name: string; description: string; priceCents: number; stockQty: number };

export default function Loja() {
  const [items, setItems] = useState<Product[]>([]);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    api<Product[]>("/products").then(setItems).catch((e) => setErr(String(e)));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-rcc-green">Loja</h2>
      {err ? <div className="text-sm text-red-700">{err}</div> : null}
      <div className="grid md:grid-cols-3 gap-4">
        {items.map((p) => (
          <div key={p.id} className="rounded-2xl border border-rcc-blue p-5">
            <h3 className="font-semibold text-rcc-green">{p.name}</h3>
            <p className="mt-2 text-sm text-rcc-dark line-clamp-3">{p.description}</p>
            <p className="mt-3 text-sm font-semibold text-rcc-green">
              R$ {(p.priceCents/100).toFixed(2)}
            </p>
            <p className="text-xs text-rcc-dark">Estoque: {p.stockQty}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
