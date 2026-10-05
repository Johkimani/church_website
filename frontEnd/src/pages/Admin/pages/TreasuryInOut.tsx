import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Inbox, LogOut, Search, Plus, Pencil, Trash2, X, Download, FileSpreadsheet,
  Globe, User, CheckCircle2, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

export interface UnifiedEntry {
  key: string;
  side: "in" | "out";
  source: "Website" | "Treasurer";
  date: string;
  title: string;
  category: string;
  method: string;
  amount: number;
  status?: string;
  receipt_url?: string | null;
  readonly: boolean;
  ref: any;
}

interface SiteTxn {
  id: string;
  code: string;
  source: "T-Shirt Order" | "Equipment Hire" | "Contribution";
  user: string;
  detail: string;
  amount: number;
  status: string;
  date: string;
}

interface LedgerEntry {
  id: number | string;
  entry_type: string;
  title: string;
  amount: number | string;
  category: string;
  payment_method?: string;
  receipt_url?: string | null;
  entry_date?: string;
  notes?: string | null;
}

const fmt = (n: number) => `KES ${Number(n || 0).toLocaleString("en-KE", { maximumFractionDigits: 2 })}`;
const dateOf = (d?: string) => (d ? String(d).slice(0, 10) : "");
const PAID = ["paid", "success", "delivered", "completed"];

const CATEGORY_COLORS: Record<string, string> = {
  'T-Shirt Order': 'bg-violet-50 text-violet-700 border-violet-200',
  'Equipment Hire': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Dues: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Trips: 'bg-sky-50 text-sky-700 border-sky-200',
  'Semester Activities': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Transport: 'bg-amber-50 text-amber-700 border-amber-200',
  Welfare: 'bg-rose-50 text-rose-700 border-rose-200',
  'T-Shirts': 'bg-violet-50 text-violet-700 border-violet-200',
  Concert: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  Donations: 'bg-teal-50 text-teal-700 border-teal-200',
  Other: 'bg-slate-100 text-slate-600 border-slate-200',
  General: 'bg-slate-100 text-slate-600 border-slate-200',
};

interface Props {
  ledger: LedgerEntry[];
  siteTxns: SiteTxn[];
  onAdd: (side: "in" | "out") => void;
  onEdit: (e: LedgerEntry) => void;
  onDelete: (id: number | string) => void;
}

export default function TreasuryInOut({ ledger, siteTxns, onAdd, onEdit, onDelete }: Props) {
  const [tab, setTab] = useState<"in" | "out">("in");
  const [q, setQ] = useState("");

  const all = useMemo<UnifiedEntry[]>(() => {
    const fromLedger: UnifiedEntry[] = ledger.map((e) => ({
      key: `led-${e.id}`,
      side: e.entry_type === "income" ? "in" : "out",
      source: "Treasurer",
      date: dateOf(e.entry_date || e.notes && ""),
      title: e.title,
      category: e.category || "General",
      method: e.payment_method || "cash",
      amount: Number(e.amount) || 0,
      receipt_url: e.receipt_url,
      readonly: false,
      ref: e,
    }));

    const fromSite: UnifiedEntry[] = siteTxns
      .filter((t) => PAID.includes(String(t.status).toLowerCase()))
      .map((t) => ({
        key: t.id,
        side: "in" as const,
        source: "Website" as const,
        date: dateOf(t.date),
        title: `${t.detail} — ${t.user}`,
        category: t.source,
        method: "Online",
        amount: t.amount,
        status: t.status,
        readonly: true,
        ref: t,
      }));

    return [...fromLedger, ...fromSite].sort(
      (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    );
  }, [ledger, siteTxns]);

  const filtered = useMemo(() => {
    let rows = all.filter((r) => r.side === tab);
    if (q.trim()) {
      const s = q.toLowerCase();
      rows = rows.filter(
        (r) => r.title.toLowerCase().includes(s) || r.category.toLowerCase().includes(s) || String(r.amount).includes(s)
      );
    }
    return rows;
  }, [all, tab, q]);

  const totals = useMemo(() => {
    const t = { in: 0, out: 0, inCount: 0, outCount: 0 };
    for (const r of all) {
      if (r.side === "in") { t.in += r.amount; t.inCount += 1; }
      else { t.out += r.amount; t.outCount += 1; }
    }
    return t;
  }, [all]);

  const exportExcel = () => {
    const rows = all.map((r) => ({
      Side: r.side === "in" ? "Inflow" : "Outflow",
      Date: r.date || "",
      Particulars: r.title,
      Category: r.category,
      Method: r.method,
      Source: r.source,
      Status: r.status || "",
      Amount: r.side === "in" ? r.amount : -r.amount,
    }));
    if (!rows.length) { toast.error("Nothing to export yet."); return; }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "All Treasury Records");
    XLSX.writeFile(wb, `csa-treasury-all-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success(`Exported ${rows.length} record(s) — inflows & outflows`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    let y = 18;
    doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text("CSA KYU - Full Treasury Statement", 14, y); y += 7;
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y); y += 8;
    doc.setFontSize(11); doc.setFont("helvetica", "bold");
    doc.text(`Total Inflows:  ${fmt(totals.in)}`, 14, y); y += 6;
    doc.text(`Total Outflows: ${fmt(totals.out)}`, 14, y); y += 6;
    doc.text(`Balance:        ${fmt(totals.in - totals.out)}`, 14, y); y += 8;

    doc.setFontSize(9);
    const head = ["Side", "Date", "Particulars", "Source", "Amount"];
    const w = [18, 28, 78, 24, 30];
    doc.setFont("helvetica", "bold");
    doc.setFillColor(241, 245, 249); doc.rect(10, y - 4, 190, 7, "F");
    let x = 14;
    head.forEach((h, i) => { doc.text(h, x, y); x += w[i]; });
    y += 7; doc.setFont("helvetica", "normal");
    if (!all.length) doc.text("No records yet.", 14, y);
    for (const r of all) {
      if (y > 280) { doc.addPage(); y = 14; }
      doc.rect(10, y - 4, 190, 6, "F");
      x = 14;
      [r.side === "in" ? "In" : "Out", r.date, r.title.slice(0, 34), r.source, fmt(r.amount)].forEach((t, i) => {
        doc.text(String(t), x, y); x += w[i];
      });
      y += 6;
    }
    doc.save(`csa-treasury-all-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("Full PDF statement downloaded");
  };

  const TABS: { id: "in" | "out"; label: string; icon: any; total: number; count: number; chip: string }[] = [
    { id: "in", label: "Inflows", icon: Inbox, total: totals.in, count: totals.inCount, chip: "bg-emerald-600" },
    { id: "out", label: "Outflows", icon: LogOut, total: totals.out, count: totals.outCount, chip: "bg-rose-600" },
  ];

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left ${
              tab === t.id ? `border-${t.chip.replace('bg-', '')} shadow-lg bg-white` : "border-slate-200 bg-white/70 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-12 h-12 rounded-2xl ${t.chip} text-white flex items-center justify-center shadow-md`}>
                <t.icon size={22} />
              </span>
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">{t.label}</p>
                <p className="text-xl font-black text-slate-800">{fmt(t.total)}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black text-slate-600 bg-slate-100">
                {t.count} {t.count === 1 ? "record" : "records"}
              </span>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">incl. website + manual</p>
            </div>
          </button>
        ))}
      </div>

      {/* Section panel */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={`w-9 h-9 rounded-xl ${tab === "in" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"} flex items-center justify-center`}>
              {tab === "in" ? <ArrowUpRight size={17} /> : <ArrowDownRight size={17} />}
            </span>
            <div>
              <h2 className="text-sm font-black text-slate-800">{tab === "in" ? "All Inflow Records" : "All Outflow Records (Activities)"}</h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {tab === "in" ? "Website orders + hire payments + treasurer-entered income" : "Every activity/expense the treasurer has recorded"}
              </p>
            </div>
          </div>
          <div className="flex-1" />
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…"
              className="pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white w-44 focus:outline-none focus:border-slate-400" />
          </div>
          <button
            onClick={() => onAdd(tab)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-700 transition-all shadow-md min-h-[40px]"
          >
            <Plus size={14} /> Add {tab === "in" ? "Inflow" : "Expense"}
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-14 px-4">
            {tab === "in" ? <Inbox size={36} className="mx-auto text-slate-300 mb-3" /> : <LogOut size={36} className="mx-auto text-slate-300 mb-3" />}
            <p className="font-bold text-slate-600 text-sm">{tab === "in" ? "No inflow records yet" : "No outflow records yet"}</p>
            <p className="text-xs text-slate-400 mt-1">
              {tab === "in"
                ? "Website sales and added income will appear here automatically."
                : "Record your first activity/expense to get started."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 bg-slate-50/60">
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-3">Particulars / Activity</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Source</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.key} className="border-b border-slate-50 hover:bg-slate-50/60 text-xs transition-colors">
                    <td className="py-3 px-5 text-slate-500 whitespace-nowrap">{r.date || "—"}</td>
                    <td className="py-3 px-3 font-bold text-slate-800 max-w-[230px] truncate">{r.title}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${CATEGORY_COLORS[r.category] || CATEGORY_COLORS.Other}`}>{r.category}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${
                        r.source === "Website"
                          ? "bg-sky-50 text-sky-700 border-sky-200"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}>
                        {r.source === "Website" ? <Globe size={10} /> : <User size={10} />} {r.source}
                      </span>
                    </td>
                    <td className={`py-3 px-3 font-black ${r.side === "in" ? "text-emerald-600" : "text-rose-600"}`}>
                      {r.side === "in" ? "+" : "−"}{fmt(r.amount)}
                    </td>
                    <td className="py-3 px-5 text-right whitespace-nowrap">
                      {!r.readonly ? (
                        <>
                          <button onClick={() => onEdit(r.ref)} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 mr-1" title="Edit"><Pencil size={13} /></button>
                          <button onClick={() => onDelete(r.ref.id)} className="p-2 border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50" title="Delete"><Trash2 size={13} /></button>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                          <CheckCircle2 size={12} className="text-emerald-500" /> {r.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Export everything */}
        <div className="px-5 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400 font-semibold">
            Showing {filtered.length} of {all.length} record(s). Exports include <b className="text-slate-600">both inflows & outflows</b> (website + manual).
          </p>
          <div className="flex gap-2">
            <button onClick={exportExcel} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md">
              <FileSpreadsheet size={15} /> Export Excel
            </button>
            <button onClick={exportPDF} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md">
              <Download size={15} /> Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
