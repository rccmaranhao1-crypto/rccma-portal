"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api, API_BASE } from "@/lib/api";
import { clearAuth, getAccessToken, getStoredUser } from "@/lib/auth";

type User = { id: string; name: string; whatsapp: string; role: string; city: string; prayerGroup: string; diocese?: { name: string } };
type Campaign = { id: string; title: string };
type CampaignFull = {
  id: string; title: string; description: string; reserveMinutes: number;
  sellers: { seller: { id: string; name: string; whatsapp: string } }[];
};
type CampaignDashboard = { totalTickets: number; paidTickets: number; pendingTickets: number; percentSold: number; ranking: { sellerId: string; sellerName: string; qty: number }[] };
type DonationGroup = { dioceseId: string; _sum: { amountCents: number | null } };
type Product = { id: string; name: string; description: string; priceCents: number; stockQty: number; images: string[]; sizes: string[] };

export default function Adm() {
  const [user, setUser] = useState(getStoredUser());
  const [tab, setTab] = useState<"doacoes" | "campanhas" | "produtos" | "usuarios">("doacoes");

  useEffect(() => { setUser(getStoredUser()); }, []);

  if (!user) {
    return (
      <div className="max-w-2xl space-y-6">
        <h2 className="text-2xl font-bold text-rcc-green">Área do ADM</h2>
        <div className="rounded-2xl border border-rcc-blue p-5">
          <p className="text-sm text-rcc-dark">Você precisa estar logado para acessar dashboards e gestão.</p>
          <Link className="inline-block mt-4 px-4 py-2 rounded-xl bg-rcc-green text-rcc-white font-semibold" href="/login">
            Fazer login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-rcc-blue p-5 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-rcc-green">Área do ADM</h2>
          <p className="text-sm text-rcc-dark">
            Logado como <span className="font-semibold">{user.name}</span> — <span className="font-semibold">{user.role}</span>
          </p>
        </div>
        <button
          onClick={() => { clearAuth(); location.href = "/login"; }}
          className="px-4 py-2 rounded-xl border border-rcc-green text-rcc-green font-semibold hover:bg-rcc-green hover:text-rcc-white transition"
        >
          Sair
        </button>
      </header>

      <nav className="flex flex-wrap gap-2">
        <Tab label="Doações" active={tab === "doacoes"} onClick={() => setTab("doacoes")} />
        <Tab label="Campanhas" active={tab === "campanhas"} onClick={() => setTab("campanhas")} />
        <Tab label="Produtos" active={tab === "produtos"} onClick={() => setTab("produtos")} />
        <Tab label="Usuários" active={tab === "usuarios"} onClick={() => setTab("usuarios")} />
      </nav>

      {tab === "doacoes" ? <DoacoesDashboard /> : null}
      {tab === "campanhas" ? <CampanhasAdmin /> : null}
      {tab === "produtos" ? <ProdutosAdmin /> : null}
      {tab === "usuarios" ? <UsuariosAdmin /> : null}
    </div>
  );
}

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-4 py-2 rounded-xl border font-semibold text-sm transition",
        active ? "bg-rcc-green text-rcc-white border-rcc-green" : "border-rcc-blue text-rcc-green hover:border-rcc-green",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function DoacoesDashboard() {
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [rows, setRows] = useState<DonationGroup[]>([]);
  const [dioceses, setDioceses] = useState<{ id: string; name: string }[]>([]);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      const ds = await api<{ id: string; name: string }[]>("/diocese");
      setDioceses(ds);
      const data = await api<DonationGroup[]>(`/donations/dashboard/by-diocese?year=${year}&month=${month}`);
      setRows(data);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    }
  }

  useEffect(() => { load(); }, [year, month]);

  const merged = dioceses.map((d) => {
    const found = rows.find((r) => r.dioceseId === d.id);
    const cents = found?._sum?.amountCents ?? 0;
    return { diocese: d.name, cents };
  }).sort((a,b)=> (b.cents ?? 0) - (a.cents ?? 0));

  const total = merged.reduce((acc, x) => acc + (x.cents ?? 0), 0);

  return (
    <section className="rounded-2xl border border-rcc-blue p-5 space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-sm text-rcc-dark">Ano</label>
          <input className="block mt-1 border border-rcc-blue rounded-xl p-2 w-28" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
        </div>
        <div>
          <label className="text-sm text-rcc-dark">Mês</label>
          <select className="block mt-1 border border-rcc-blue rounded-xl p-2 w-36" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i+1} value={i+1}>{String(i+1).padStart(2,"0")}</option>
            ))}
          </select>
        </div>
        <div className="ml-auto text-sm">
          <span className="text-rcc-dark">Receita total no período: </span>
          <span className="font-semibold text-rcc-green">R$ {(total/100).toFixed(2)}</span>
        </div>
      </div>

      {err ? <div className="text-sm text-red-700 break-words">{err}</div> : null}

      <BarList items={merged.map(x => ({ label: x.diocese, value: x.cents }))} valueFormatter={(v)=>`R$ ${(v/100).toFixed(2)}`} />

      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-rcc-dark">
              <th className="py-2">Diocese</th>
              <th className="py-2">Valor</th>
            </tr>
          </thead>
          <tbody>
            {merged.map((x) => (
              <tr key={x.diocese} className="border-t border-rcc-blue/60">
                <td className="py-2">{x.diocese}</td>
                <td className="py-2 font-semibold text-rcc-green">R$ {(Number(x.cents)/100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CampanhasAdmin() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [dash, setDash] = useState<CampaignDashboard | null>(null);
  const [err, setErr] = useState("");

  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api<Campaign[]>("/campaigns").then((c) => {
      setCampaigns(c);
      if (c[0]?.id) setSelected(c[0].id);
    }).catch((e) => setErr(String(e?.message ?? e)));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setErr("");
    setDash(null);
    api<CampaignDashboard>(`/campaigns/${selected}/dashboard`).then(setDash).catch((e) => setErr(String(e?.message ?? e)));
  }, [selected]);

  async function reloadCampaigns() {
    const c = await api<Campaign[]>("/campaigns");
    setCampaigns(c);
    if (c[0]?.id) setSelected(c[0].id);
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-rcc-blue p-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[260px]">
            <label className="text-sm text-rcc-dark">Campanha</label>
            <select className="block mt-1 border border-rcc-blue rounded-xl p-2 w-full" value={selected} onChange={(e) => setSelected(e.target.value)}>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <button
            className="px-4 py-2 rounded-xl bg-rcc-green text-rcc-white font-semibold"
            onClick={() => setCreating(true)}
          >
            Criar campanha
          </button>

          {dash ? (
            <div className="text-sm">
              <span className="text-rcc-dark">%</span>{" "}
              <span className="font-semibold text-rcc-green">{dash.percentSold}%</span>{" "}
              <span className="text-rcc-dark">vendido</span>
            </div>
          ) : null}
        </div>

        {err ? <div className="mt-3 text-sm text-red-700 break-words">{err}</div> : null}
        {!dash ? <div className="mt-3 text-sm text-rcc-dark">Carregando dashboard...</div> : (
          <>
            <div className="mt-4 grid md:grid-cols-3 gap-3">
              <Stat title="Total de cotas" value={dash.totalTickets} />
              <Stat title="Pagas" value={dash.paidTickets} />
              <Stat title="Pendentes" value={dash.pendingTickets} />
            </div>

            <div className="mt-4 rounded-2xl border border-rcc-blue p-4">
              <h3 className="font-semibold text-rcc-green">Ranking de vendedores (cotas pagas)</h3>
              <BarList items={dash.ranking.map(r => ({ label: r.sellerName, value: r.qty }))} />

              <div className="overflow-auto mt-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-rcc-dark">
                      <th className="py-2">Vendedor</th>
                      <th className="py-2">Cotas pagas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dash.ranking.map((r) => (
                      <tr key={r.sellerId} className="border-t border-rcc-blue/60">
                        <td className="py-2">{r.sellerName}</td>
                        <td className="py-2 font-semibold text-rcc-green">{r.qty}</td>
                      </tr>
                    ))}
                    {!dash.ranking.length ? (
                      <tr className="border-t border-rcc-blue/60">
                        <td className="py-2 text-rcc-dark" colSpan={2}>Ainda não há cotas pagas registradas.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {creating ? (
        <CreateCampaignModal
          onClose={() => setCreating(false)}
          onCreated={async () => { setCreating(false); await reloadCampaigns(); }}
        />
      ) : null}
    </section>
  );
}

function CreateCampaignModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [totalTickets, setTotalTickets] = useState(100);
  const [numberingMode, setNumberingMode] = useState<"sequential" | "custom">("sequential");
  const [drawDate, setDrawDate] = useState("");
  const [drawLocation, setDrawLocation] = useState("");
  const [reserveMinutes, setReserveMinutes] = useState<10 | 30>(10);

  const [users, setUsers] = useState<User[]>([]);
  const [sellerIds, setSellerIds] = useState<string[]>([]);
  const [prizeImages, setPrizeImages] = useState<string[]>([]);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    api<User[]>("/users").then((u) => {
      setUsers(u);
    }).catch((e) => setErr(String(e?.message ?? e)));
  }, []);

  async function uploadFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setErr(""); setOk("");
    const token = getAccessToken();
    if (!token) { setErr("Sem token. Faça login novamente."); return; }

    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_BASE}/uploads`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Falha no upload.");
      }
      const j = await res.json();
      urls.push(j.url);
    }
    setPrizeImages((prev) => [...prev, ...urls]);
    setOk("Imagens enviadas.");
  }

  function toggleSeller(id: string) {
    setSellerIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function submit() {
    setBusy(true); setErr(""); setOk("");
    try {
      if (!title.trim()) throw new Error("Título é obrigatório.");
      if (!description.trim()) throw new Error("Descrição é obrigatória.");
      if (!drawDate) throw new Error("Data do sorteio é obrigatória.");
      if (!drawLocation.trim()) throw new Error("Local do sorteio é obrigatório.");
      if (totalTickets <= 0) throw new Error("Quantidade de cotas inválida.");
      if (!sellerIds.length) throw new Error("Selecione pelo menos 1 vendedor.");

      await api("/campaigns", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          prizeImages,
          totalTickets,
          numberingMode,
          drawDate,
          drawLocation,
          reserveMinutes,
          sellerUserIds: sellerIds,
        }),
      });

      setOk("Campanha criada com sucesso.");
      await onCreated();
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-rcc-dark/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-rcc-white border border-rcc-blue p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-bold text-rcc-green">Criar campanha</h3>
          <button className="px-3 py-2 rounded-xl border border-rcc-blue text-rcc-green font-semibold" onClick={onClose}>
            Fechar
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Título">
            <input className="w-full border border-rcc-blue rounded-xl p-2" value={title} onChange={(e)=>setTitle(e.target.value)} />
          </Field>
          <Field label="Quantidade de cotas">
            <input className="w-full border border-rcc-blue rounded-xl p-2" type="number" value={totalTickets} onChange={(e)=>setTotalTickets(Number(e.target.value))} />
          </Field>

          <div className="md:col-span-2">
            <Field label="Descrição">
              <textarea className="w-full border border-rcc-blue rounded-xl p-2 min-h-[100px]" value={description} onChange={(e)=>setDescription(e.target.value)} />
            </Field>
          </div>

          <Field label="Modelo de numeração">
            <select className="w-full border border-rcc-blue rounded-xl p-2" value={numberingMode} onChange={(e)=>setNumberingMode(e.target.value as any)}>
              <option value="sequential">Sequencial</option>
              <option value="custom">Personalizada</option>
            </select>
          </Field>

          <Field label="Reserva (minutos)">
            <select className="w-full border border-rcc-blue rounded-xl p-2" value={reserveMinutes} onChange={(e)=>setReserveMinutes(Number(e.target.value) as any)}>
              <option value={10}>10</option>
              <option value={30}>30</option>
            </select>
          </Field>

          <Field label="Data do sorteio">
            <input className="w-full border border-rcc-blue rounded-xl p-2" type="datetime-local" value={drawDate} onChange={(e)=>setDrawDate(e.target.value)} />
          </Field>

          <Field label="Local do sorteio">
            <input className="w-full border border-rcc-blue rounded-xl p-2" value={drawLocation} onChange={(e)=>setDrawLocation(e.target.value)} />
          </Field>

          <div className="md:col-span-2 rounded-2xl border border-rcc-blue p-4">
            <p className="font-semibold text-rcc-green">Fotos do prêmio</p>
            <p className="text-xs text-rcc-dark mt-1">PNG/JPEG/WEBP até 5MB.</p>
            <input className="mt-3" type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(e)=>uploadFiles(e.target.files).catch((err)=>setErr(String(err?.message ?? err)))} />
            {prizeImages.length ? (
              <ul className="mt-3 text-xs list-disc ml-5 text-rcc-dark">
                {prizeImages.map((u) => <li key={u}>{u}</li>)}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-rcc-dark">Nenhuma imagem enviada ainda.</p>
            )}
          </div>

          <div className="md:col-span-2 rounded-2xl border border-rcc-blue p-4">
            <p className="font-semibold text-rcc-green">Vendedores oficiais</p>
            <p className="text-xs text-rcc-dark mt-1">Selecione usuários que já estão cadastrados.</p>
            <div className="mt-3 grid md:grid-cols-2 gap-2 max-h-56 overflow-auto pr-1">
              {users.map((u) => (
                <label key={u.id} className="flex items-center gap-2 text-sm text-rcc-dark border border-rcc-blue rounded-xl px-3 py-2">
                  <input type="checkbox" checked={sellerIds.includes(u.id)} onChange={()=>toggleSeller(u.id)} />
                  <span className="font-semibold text-rcc-green">{u.name}</span>
                  <span className="text-xs text-rcc-dark">({u.whatsapp})</span>
                </label>
              ))}
              {!users.length ? <p className="text-sm text-rcc-dark">Sem usuários cadastrados.</p> : null}
            </div>
          </div>
        </div>

        {err ? <div className="text-sm text-red-700 break-words">{err}</div> : null}
        {ok ? <div className="text-sm text-rcc-green font-semibold">{ok}</div> : null}

        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded-xl border border-rcc-blue text-rcc-green font-semibold" onClick={onClose}>
            Cancelar
          </button>
          <button disabled={busy} className="px-4 py-2 rounded-xl bg-rcc-green text-rcc-white font-semibold disabled:opacity-60" onClick={submit}>
            {busy ? "Criando..." : "Criar campanha"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProdutosAdmin() {
  const [items, setItems] = useState<Product[]>([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  // form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("49.90");
  const [stockQty, setStockQty] = useState(10);
  const [sizes, setSizes] = useState(""); // comma separated
  const [images, setImages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    setErr(""); setOk("");
    try {
      const p = await api<Product[]>("/products");
      setItems(p);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    }
  }

  useEffect(() => { load(); }, []);

  async function uploadFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setErr(""); setOk("");
    const token = getAccessToken();
    if (!token) { setErr("Sem token. Faça login novamente."); return; }

    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_BASE}/uploads`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Falha no upload.");
      }
      const j = await res.json();
      urls.push(j.url);
    }
    setImages((prev) => [...prev, ...urls]);
    setOk("Imagens enviadas.");
  }

  async function createProduct() {
    setBusy(true); setErr(""); setOk("");
    try {
      const priceCents = Math.round(Number(price.replace(",", ".")) * 100);
      if (!name.trim()) throw new Error("Nome é obrigatório.");
      if (!description.trim()) throw new Error("Descrição é obrigatória.");
      if (!Number.isFinite(priceCents) || priceCents <= 0) throw new Error("Preço inválido.");
      if (stockQty < 0) throw new Error("Estoque inválido.");

      const sizesArr = sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await api("/products", {
        method: "POST",
        body: JSON.stringify({
          name,
          description,
          priceCents,
          stockQty,
          images,
          sizes: sizesArr,
        }),
      });

      setOk("Produto cadastrado com sucesso.");
      setName(""); setDescription(""); setPrice("49.90"); setStockQty(10); setSizes(""); setImages([]);
      await load();
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-rcc-blue p-5 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-rcc-green">Cadastrar produto</h3>
        <p className="text-sm text-rcc-dark">O cadastro inclui imagens, preço, estoque e tamanhos (se aplicável).</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Nome">
          <input className="w-full border border-rcc-blue rounded-xl p-2" value={name} onChange={(e)=>setName(e.target.value)} />
        </Field>
        <Field label="Preço (R$)">
          <input className="w-full border border-rcc-blue rounded-xl p-2" value={price} onChange={(e)=>setPrice(e.target.value)} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Descrição">
            <textarea className="w-full border border-rcc-blue rounded-xl p-2 min-h-[90px]" value={description} onChange={(e)=>setDescription(e.target.value)} />
          </Field>
        </div>
        <Field label="Estoque (quantidade)">
          <input className="w-full border border-rcc-blue rounded-xl p-2" type="number" value={stockQty} onChange={(e)=>setStockQty(Number(e.target.value))} />
        </Field>
        <Field label="Tamanhos (opcional)">
          <input className="w-full border border-rcc-blue rounded-xl p-2" value={sizes} onChange={(e)=>setSizes(e.target.value)} placeholder="P, M, G, GG" />
        </Field>

        <div className="md:col-span-2 rounded-2xl border border-rcc-blue p-4">
          <p className="font-semibold text-rcc-green">Imagens do produto</p>
          <p className="text-xs text-rcc-dark mt-1">Envie uma ou mais imagens (PNG/JPEG/WEBP).</p>
          <input className="mt-3" type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(e)=>uploadFiles(e.target.files).catch((err)=>setErr(String(err?.message ?? err)))} />
          {images.length ? (
            <ul className="mt-3 text-xs list-disc ml-5 text-rcc-dark">
              {images.map((u) => <li key={u}>{u}</li>)}
            </ul>
          ) : (
            <p className="mt-3 text-xs text-rcc-dark">Nenhuma imagem enviada ainda.</p>
          )}
        </div>
      </div>

      {err ? <div className="text-sm text-red-700 break-words">{err}</div> : null}
      {ok ? <div className="text-sm text-rcc-green font-semibold">{ok}</div> : null}

      <div className="flex justify-end">
        <button disabled={busy} className="px-4 py-2 rounded-xl bg-rcc-green text-rcc-white font-semibold disabled:opacity-60" onClick={createProduct}>
          {busy ? "Salvando..." : "Cadastrar produto"}
        </button>
      </div>

      <div className="pt-2 border-t border-rcc-blue/60">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-rcc-green">Produtos cadastrados</h3>
          <button className="px-4 py-2 rounded-xl border border-rcc-blue text-rcc-green font-semibold hover:border-rcc-green" onClick={load}>
            Recarregar
          </button>
        </div>
        <div className="mt-3 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-rcc-dark">
                <th className="py-2">Produto</th>
                <th className="py-2">Preço</th>
                <th className="py-2">Estoque</th>
                <th className="py-2">Tamanhos</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-t border-rcc-blue/60">
                  <td className="py-2">{p.name}</td>
                  <td className="py-2 font-semibold text-rcc-green">R$ {(p.priceCents/100).toFixed(2)}</td>
                  <td className="py-2">{p.stockQty}</td>
                  <td className="py-2">{p.sizes?.length ? p.sizes.join(", ") : "—"}</td>
                </tr>
              ))}
              {!items.length ? (
                <tr className="border-t border-rcc-blue/60">
                  <td className="py-2 text-rcc-dark" colSpan={4}>Nenhum produto cadastrado.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function UsuariosAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function load() {
    setErr(""); setOk("");
    try {
      const u = await api<User[]>("/users");
      setUsers(u);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    }
  }

  useEffect(() => { load(); }, []);

  async function promote(userId: string, role: string) {
    setErr(""); setOk("");
    try {
      await api("/users/promote", { method: "PATCH", body: JSON.stringify({ userId, role }) });
      setOk("Perfil atualizado.");
      await load();
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    }
  }

  return (
    <section className="rounded-2xl border border-rcc-blue p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-rcc-green">Gestão de usuários</h3>
        <button className="px-4 py-2 rounded-xl border border-rcc-blue text-rcc-green font-semibold hover:border-rcc-green" onClick={load}>
          Recarregar
        </button>
      </div>

      {err ? <div className="text-sm text-red-700 break-words">{err}</div> : null}
      {ok ? <div className="text-sm text-rcc-green font-semibold">{ok}</div> : null}

      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-rcc-dark">
              <th className="py-2">Nome</th>
              <th className="py-2">WhatsApp</th>
              <th className="py-2">Diocese</th>
              <th className="py-2">Perfil</th>
              <th className="py-2">Ação</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-rcc-blue/60">
                <td className="py-2">{u.name}</td>
                <td className="py-2">{u.whatsapp}</td>
                <td className="py-2">{u.diocese?.name ?? "—"}</td>
                <td className="py-2 font-semibold text-rcc-green">{u.role}</td>
                <td className="py-2">
                  <select className="border border-rcc-blue rounded-xl p-2 text-sm" defaultValue={u.role} onChange={(e) => promote(u.id, e.target.value)}>
                    {["ADM","COMUNICACAO","TESOUREIRO","ARRECADACAO","USUARIO_PADRAO"].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {!users.length ? (
              <tr className="border-t border-rcc-blue/60">
                <td className="py-2 text-rcc-dark" colSpan={5}>Sem usuários.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-rcc-blue p-4">
      <p className="text-xs text-rcc-dark">{title}</p>
      <p className="text-2xl font-bold text-rcc-green">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm text-rcc-dark">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function BarList({
  items,
  valueFormatter,
}: {
  items: { label: string; value: number | null | undefined }[];
  valueFormatter?: (v: number) => string;
}) {
  const vals = items.map(i => Number(i.value ?? 0));
  const max = Math.max(1, ...vals);

  return (
    <div className="mt-3 space-y-2">
      {items.map((it) => {
        const v = Number(it.value ?? 0);
        const pct = Math.max(0, Math.min(100, Math.round((v / max) * 100)));
        return (
          <div key={it.label} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-5 md:col-span-4 text-xs text-rcc-dark truncate" title={it.label}>{it.label}</div>
            <div className="col-span-5 md:col-span-7">
              <div className="h-3 rounded-full bg-rcc-blue overflow-hidden">
                <div className="h-3 bg-rcc-green" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <div className="col-span-2 text-right text-xs font-semibold text-rcc-green">
              {valueFormatter ? valueFormatter(v) : (Number.isFinite(v) ? v : 0)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
