import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { CalendarRange, Download, FileSpreadsheet, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

interface LedgerEntry {
  id: number | string;
  entry_type: string;
  title: string;
  amount: number | string;
  category: string;
  payment_method?: string;
  entry_date?: string;
  created_at?: string;
  recorded_by?: string | null;
}

interface Props {
  ledger: LedgerEntry[];
}

const fmt = (n: number) => `KES ${Number(n || 0).toLocaleString("en-KE", { maximumFractionDigits: 2 })}`;

const asDay = (d?: string) => {
  if (!d) return Number.POSITIVE_INFINITY;
  const p = new Date(d as any);
  return Number.isNaN(p.getTime()) ? Number.POSITIVE_INFINITY : p.getTime();
};

const dayKey = (d?: string) => {
  if (!d) return "";
  const p = new Date(d as any);
  return Number.isNaN(p.getTime()) ? String(d).slice(0, 10) : p.toISOString().slice(0, 10);
};

export default function TreasuryAsOfReport({ ledger }: Props) {
  const now = new Date();
  const y = now.getFullYear();

  const blockOptions = useMemo(() => [
    { id: "jan-apr", label: `Jan–Apr ${y}`, start: new Date(y, 0, 1) },
    { id: "may-aug", label: `May–Aug ${y}`, start: new Date(y, 4, 1) },
    { id: "sept-dec", label: `Sept–Dec ${y}`, start: new Date(y, 8, 1) },
    { id: "year", label: `Full Year ${y}`, start: new Date(y, 0, 1) },
  ], [y]);

  const [block, setBlock] = useState(blockOptions[2]);
  const [asOf, setAsOf] = useState(new Date().toISOString().slice(0, 10));

  const result = useMemo(() => {
    const cutoff = new Date(asOf + "T23:59:59");
    const blockStart = block.start.getTime();
    const rows = ledger.filter((e) => {
      const t = asDay(e.entry_date || e.created_at);
      return t <= cutoff.getTime() && t >= blockStart;
    });

    let income = 0, expense = 0;
    const byCat: Record<string, { income: number; expense: number }> = {};
    for (const e of rows) {
      const amt = Number(e.amount) || 0;
      const cat = e.category || "General";
      if (!byCat[cat]) byCat[cat] = { income: 0, expense: 0 };
      if (e.entry_type === "income") { income += amt; byCat[cat].income += amt; }
      else { expense += amt; byCat[cat].expense += amt; }
    }
    const balance = income - expense;
    const sorted = ledger
      .filter((e) => {
        const t = asDay(e.entry_date || e.created_at);
        return t <= cutoff.getTime() && t >= blockStart;
      })
      .sort((a, b) => asDay(a.entry_date || a.created_at) - asDay(b.entry_date || b.created_at));
    return { income, expense, balance, byCat, rows: sorted };
  }, [ledger, asOf, block]);

  const exportPDF = () => {
    const doc = new jsPDF();
    let yY = 14;
    doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text("CSA KYU - Treasury Statement", 14, yY);
    yY += 7;
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(`Period: ${block.label}   |   As at: ${asOf}`, 14, yY);
    yY += 6;
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, yY);
    yY += 9;
    doc.setFontSize(11); doc.setFont("helvetica", "bold");
    doc.text(`Total Inflows:  ${fmt(result.income)}`, 14, yY); yY += 6;
    doc.text(`Total Outflows: ${fmt(result.expense)}`, 14, yY); yY += 6;
    doc.text(`Balance:        ${fmt(result.balance)}`, 14, yY); yY += 10;

    doc.setFontSize(9);
    const head = ["Date", "Particulars", "Category", "Type", "Amount"];
    const w = [30, 70, 45, 20, 30];
    let x = 14;
    doc.setFont("helvetica", "bold");
    doc.setFillColor(241, 245, 249); doc.rect(10, yY - 4, 190, 7, "F");
    head.forEach((h, i) => { doc.text(h, x, yY); x += w[i]; });
    yY += 8;
    doc.setFont("helvetica", "normal");
    if (!result.rows.length) { doc.text("No records in this period.", 14, yY); }
    for (const r of result.rows) {
      if (yY > 280) { doc.addPage(); yY = 14; }
      const date = dayKey(r.entry_date || r.created_at);
      const amount = Number(r.amount) || 0;
      doc.setFillColor(255, 255, 255);
      doc.rect(10, yY - 4, 190, 6, "F");
      x = 14;
      [date, r.title, r.category || "General", r.entry_type === "income" ? "In" : "Out", fmt(amount)].forEach((t, i) => {
        doc.text(String(t).slice(0, 32), x, yY); x += w[i];
      });
      yY += 6;
    }
    doc.save(`csa-treasury-${asOf}.pdf`);
    toast.success("PDF statement downloaded");
  };

  const exportExcel = () => {
    const rows = result.rows.map((r) => ({
      Date: dayKey(r.entry_date || r.created_at),
      Particulars: r.title,
      Category: r.category || "General",
      Type: r.entry_type === "income" ? "Income" : "Expense",
      Amount: Number(r.amount) || 0,
      Method: r.payment_method || "",
    }));
    if (rows.length) rows.push({ Date: "", Particulars: "TOTAL INFLOWS", Category: "", Type: "Income", Amount: result.income, Method: "" });
    rows.push({ Date: "", Particulars: "TOTAL OUTFLOWS", Category: "", Type: "Expense", Amount: result.expense, Method: "" });
    rows.push({ Date: "", Particulars: "BALANCE", Category: "", Type: "", Amount: result.balance, Method: "" });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Statement");
    XLSX.writeFile(wb, `csa-treasury-${asOf}.xlsx`);
    toast.success("Excel statement downloaded");
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/60 p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-5">
        <span className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
          <CalendarRange size={22} />
        </span>
        <div>
          <h3 className="text-lg font-black text-slate-900">Statement as at a date</h3>
          <p className="text-sm text-slate-500">Pick a period and a cutoff date — totals every recorded entry up to that day.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <select value={block.id} onChange={(e) => setBlock(blockOptions.find((b) => b.id === e.target.value) || block)} className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700">
          {blockOptions.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
        </select>
        <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700" />
        <div className="flex-1" />
        <button onClick={exportPDF} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-black hover:bg-rose-700 shadow-lg shadow-rose-600/25">
          <Download size={16} /> PDF
        </button>
        <button onClick={exportExcel} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-black hover:bg-emerald-700 shadow-lg shadow-emerald-600/25">
          <FileSpreadsheet size={16} /> Excel
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
          <TrendingUp size={22} className="text-emerald-600" />
          <div>
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">Inflows</p>
            <p className="text-lg font-black text-emerald-800">{fmt(result.income)}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-center gap-3">
          <TrendingDown size={22} className="text-rose-600" />
          <div>
            <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wide">Outflows</p>
            <p className="text-lg font-black text-rose-800">{fmt(result.expense)}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex items-center gap-3">
          <Wallet size={22} className="text-white" />
          <div>
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">Balance</p>
            <p className="text-lg font-black text-white">{fmt(result.balance)}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-left">
              <th className="px-3 py-2 font-black">Category</th>
              <th className="px-3 py-2 font-black text-right">Income (KES)</th>
              <th className="px-3 py-2 font-black text-right">Expense (KES)</th>
              <th className="px-3 py-2 font-black text-right">Net (KES)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Object.entries(result.byCat).map(([cat, v]) => (
              <tr key={cat}>
                <td className="px-3 py-2 font-bold text-slate-700">{cat}</td>
                <td className="px-3 py-2 text-right font-semibold text-emerald-700">{fmt(v.income)}</td>
                <td className="px-3 py-2 text-right font-semibold text-rose-700">{fmt(v.expense)}</td>
                <td className="px-3 py-2 text-right font-black text-slate-800">{fmt(v.income - v.expense)}</td>
              </tr>
            ))}
            {!Object.keys(result.byCat).length && (
              <tr><td colSpan={4} className="px-3 py-4 text-center text-sm text-slate-400 font-semibold">No records in this period as at the chosen date.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
