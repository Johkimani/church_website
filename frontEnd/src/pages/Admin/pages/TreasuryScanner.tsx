import { useRef, useState } from "react";
import { apiClient } from "../../../api/axiosInstance";
import { toast } from "react-hot-toast";
import {
  ScanLine, Upload, Loader2, Plus, Trash2, X, CheckCircle2, AlertCircle, FileText,
} from "lucide-react";

interface Candidate {
  date: string;
  description: string;
  income: string;
  expense: string;
  category: string;
  payment_method: string;
}

const CATEGORIES = ["Dues", "Trips", "Semester Activities", "Transport", "Welfare", "T-Shirts", "Concert", "Donations", "Other"];

const empty = (): Candidate => ({
  date: "", description: "", income: "", expense: "",
  category: "General", payment_method: "cash",
});

const normDate = (d: string) => {
  if (!d) return "";
  const p = new Date(d);
  if (!Number.isNaN(p.getTime())) return p.toISOString().slice(0, 10);
  return d;
};

interface Props {
  onSaved: () => void;
  recordedBy: string;
}

export default function TreasuryScanner({ onSaved, recordedBy }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<Candidate[] | null>(null);
  const [rawText, setRawText] = useState("");

  const pick = () => inputRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setScanning(true);
    setRows(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await apiClient.post("/treasury/scan", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 90000,
      });
      const cands: any[] = res.data?.candidates || [];
      if (!cands.length) {
        toast.error("No records detected in the image. Try a clearer, straighter photo.");
        return;
      }
      setRows(cands.map((c) => ({
        date: normDate(c.date),
        description: c.description || "Record",
        income: c.income || "",
        expense: c.expense || "",
        category: "General",
        payment_method: "cash",
      })));
      setRawText(res.data?.text || "");
      toast.success(`Read ${cands.length} record(s) — please verify before saving`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Scan failed. Try a clearer image.");
    } finally {
      setScanning(false);
    }
  };

  const set = (i: number, patch: Partial<Candidate>) =>
    setRows((prev) => prev?.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) || null);

  const addRow = () => setRows((prev) => (prev ? [...prev, empty()] : [empty()]));
  const removeRow = (i: number) => setRows((prev) => prev?.filter((_, idx) => idx !== i) || null);

  const saveAll = async () => {
    if (!rows) return;
    const toSave = rows.filter((r) => r.description.trim() && (Number(r.income) > 0 || Number(r.expense) > 0));
    if (!toSave.length) {
      toast.error("No complete records to save (need a description and an amount).");
      return;
    }
    setSaving(true);
    let ok = 0;
    try {
      for (const r of toSave) {
        const income = Number(r.income) || 0;
        const expense = Number(r.expense) || 0;
        const isExpense = expense > 0 || income <= 0;
        await apiClient.post("/table/finance_ledger", {
          entry_type: isExpense ? "expense" : "income",
          title: r.description.trim(),
          amount: isExpense ? expense || income : income,
          category: r.category || "General",
          payment_method: r.payment_method || "cash",
          entry_date: r.date || new Date().toISOString().slice(0, 10),
          recorded_by: recordedBy || "treasurer",
          notes: r.date ? "" : "Scanned record (no date on page)",
        });
        ok += 1;
      }
      toast.success(`Saved ${ok} record(s) to the ledger.`);
      setRows(null);
      setRawText("");
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || `Failed after ${ok} records. Try again.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/60 p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
          <ScanLine size={22} />
        </span>
        <div>
          <h3 className="text-lg font-black text-slate-900">Scan a written records page</h3>
          <p className="text-sm text-slate-500">Upload a photo/scanned page of your records — the system reads every line, then you verify and save it to the ledger.</p>
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />

      {!rows && (
        <button
          onClick={pick}
          disabled={scanning}
          className="w-full flex items-center justify-center gap-3 p-6 border-2 border-dashed border-indigo-300 rounded-2xl bg-indigo-50/60 text-indigo-700 hover:bg-indigo-100/60 transition disabled:opacity-60"
        >
          {scanning ? (
            <>
              <Loader2 size={22} className="animate-spin" />
              <span className="font-bold">Reading the page… this can take ~10-30s</span>
            </>
          ) : (
            <>
              <Upload size={22} />
              <span className="font-bold">Upload an image of your records</span>
            </>
          )}
        </button>
      )}

      {rows && (
        <>
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={14} /> {rows.length} record(s) extracted
            </span>
            <button onClick={pick} className="text-xs font-bold text-indigo-600 hover:underline">
              Rescan / different image
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-left">
                  <th className="px-3 py-2 font-black whitespace-nowrap min-w-[110px]">Date</th>
                  <th className="px-3 py-2 font-black min-w-[200px]">Particulars</th>
                  <th className="px-3 py-2 font-black whitespace-nowrap min-w-[120px]">Income (KES)</th>
                  <th className="px-3 py-2 font-black whitespace-nowrap min-w-[120px]">Expense (KES)</th>
                  <th className="px-3 py-2 font-black min-w-[130px]">Category</th>
                  <th className="px-3 py-2 font-black min-w-[120px]">Method</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2">
                      <input type="date" value={r.date} onChange={(e) => set(i, { date: e.target.value })} className="w-32 px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700" />
                    </td>
                    <td className="px-3 py-2">
                      <input value={r.description} onChange={(e) => set(i, { description: e.target.value })} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" value={r.income} onChange={(e) => set(i, { income: e.target.value })} className="w-full px-2 py-1.5 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-700" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" value={r.expense} onChange={(e) => set(i, { expense: e.target.value })} className="w-full px-2 py-1.5 border border-rose-200 rounded-lg text-xs font-bold text-rose-700" />
                    </td>
                    <td className="px-3 py-2">
                      <select value={r.category} onChange={(e) => set(i, { category: e.target.value })} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select value={r.payment_method} onChange={(e) => set(i, { payment_method: e.target.value })} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
                        {["cash", "mpesa", "bank", "card", "other"].map((m) => <option key={m}>{m}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <button onClick={() => removeRow(i)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg" title="Remove row"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rawText && (
            <details className="mt-3 text-xs text-slate-500">
              <summary className="inline-flex items-center gap-1 font-bold cursor-pointer"><FileText size={14} /> Show raw OCR text</summary>
              <pre className="mt-2 p-3 bg-slate-50 rounded-xl whitespace-pre-wrap font-mono text-[11px] text-slate-600 max-h-40 overflow-auto">{rawText}</pre>
            </details>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button onClick={addRow} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm font-bold hover:bg-slate-50">
              <Plus size={16} /> Add row
            </button>
            <div className="flex-1" />
            <button onClick={() => setRows(null)} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm font-bold hover:bg-slate-50 disabled:opacity-50">
              <X size={16} /> Discard
            </button>
            <button onClick={saveAll} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-black hover:bg-emerald-700 disabled:opacity-60 shadow-lg shadow-emerald-600/25">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              {saving ? "Saving…" : `Save ${rows.filter((r) => r.description.trim() && (Number(r.income) > 0 || Number(r.expense) > 0)).length} record(s)`}
            </button>
          </div>

          <p className="mt-3 flex items-start gap-1.5 text-[11px] text-amber-700">
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
            Please check every row matches the page before saving — this keeps your ledger accurate.
          </p>
        </>
      )}
    </div>
  );
}
