"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Campaign = { id: string; title: string; description: string; createdAt: string };

export default function Campanhas() {
  const [items, setItems] = useState<Campaign[]>([]);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    api<Campaign[]>("/campaigns").then(setItems).catch((e) => setErr(String(e)));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-rcc-green">Campanhas</h2>
      {err ? <div className="text-sm text-red-700">{err}</div> : null}
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((c) => (
          <Link key={c.id} href={`/campanhas/${c.id}`} className="rounded-2xl border border-rcc-blue p-5 hover:border-rcc-green">
            <h3 className="font-semibold text-rcc-green">{c.title}</h3>
            <p className="mt-2 text-sm text-rcc-dark line-clamp-3">{c.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
