import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { jumuiyaList } from "../pages/Jumuiya/data/jumuiyaData";

export interface UserJumuiyaInfo {
  id: string;
  name: string;
  fullName: string;
  color: string;
  saintImage: string;
  path: string;
  isFirstYear: boolean;
  yearLabel: string;
}

// Maps DB UUIDs (from sub_groups.group_id) → slug
const JUMUIYA_UUID_MAP: Record<string, string> = {
  "727990e6-6bb2-44b6-9a9d-4acee5fe3d7e": "st-anthony",
  "7ff48c24-2213-4268-9cbe-20c450c45910": "st-augustine",
  "5e6570d6-0793-46f6-8400-815e1490b7bc": "st-catherine",
  "eae305b2-700d-4680-ae02-753bf0221563": "st-dominic",
  "eac314b5-5f0e-4d9b-a9ef-25e48a1ca0e0": "st-elizabeth",
  "193d6461-78de-465e-acf6-1683df45fce1": "st-maria-goretti",
  "a7d71d66-094d-4ffb-aadd-e443c253d244": "st-monica",
  "5c643e86-0e29-4faf-a395-bd0e95eb7396": "st-thomas",
};

// Canonical display metadata keyed by slug
const JUMUIYA_META: Record<string, { id: string; name: string; fullName: string; color: string; saintImage: string }> = {
  "st-anthony":      { id: "st-anthony",      name: "St. Anthony",      fullName: "St. Anthony of Padua",        color: "#8b5cf6", saintImage: "/images/Anthony.png" },
  "st-augustine":    { id: "st-augustine",    name: "St. Augustine",    fullName: "St. Augustine of Hippo",       color: "#1d21ed", saintImage: "/images/Augustine.png" },
  "st-catherine":    { id: "st-catherine",    name: "St. Catherine",    fullName: "St. Catherine of Alexandria",  color: "#be123c", saintImage: "/images/Catherine.jpg" },
  "st-dominic":      { id: "st-dominic",      name: "St. Dominic",      fullName: "St. Dominic Guzman",           color: "#64748b", saintImage: "/images/Dominic.png" },
  "st-elizabeth":    { id: "st-elizabeth",    name: "St. Elizabeth",    fullName: "St. Elizabeth of Hungary",     color: "#16a34a", saintImage: "/images/Elizabeth.png" },
  "st-maria-goretti":{ id: "st-maria-goretti",name: "St. Maria Goretti",fullName: "St. Maria Goretti",            color: "#0284c7", saintImage: "/images/MariaGoretti.png" },
  "st-monica":       { id: "st-monica",       name: "St. Monica",       fullName: "St. Monica of Hippo",          color: "#dc2626", saintImage: "/images/Monica.png" },
  "st-thomas":       { id: "st-thomas",       name: "St. Thomas",       fullName: "St. Thomas Aquinas",           color: "#d97706", saintImage: "/images/cross.png" },
};

function detectFirstYear(yearValue: unknown): boolean {
  const raw = String(yearValue ?? "").trim().toLowerCase();
  return (
    raw === "1" ||
    raw === "1st" ||
    raw.startsWith("1st") ||
    raw.includes("first") ||
    raw.includes("yr 1") ||
    raw.includes("year 1") ||
    raw.includes("1st year")
  );
}

export function useUserJumuiya(): UserJumuiyaInfo | null {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user || !user.jumuiya_id) return null;

    const raw = String(user.jumuiya_id).trim();
    const rawLower = raw.toLowerCase();

    // 1. Primary: UUID → slug (accounts stored with Postgres group_id UUID)
    const slugFromUuid = JUMUIYA_UUID_MAP[rawLower];
    const metaFromUuid = slugFromUuid ? JUMUIYA_META[slugFromUuid] : null;
    if (metaFromUuid) {
      const isFirstYear = detectFirstYear(user.year);
      return {
        ...metaFromUuid,
        path: `/jumuiya/${metaFromUuid.id}`,
        isFirstYear,
        yearLabel: isFirstYear ? "1st Year" : user.year ? `${user.year} Yr` : "",
      };
    }

    // 2. Direct slug match (e.g. jumuiya_id stored as "st-augustine")
    const metaFromSlug = JUMUIYA_META[rawLower];
    if (metaFromSlug) {
      const isFirstYear = detectFirstYear(user.year);
      return {
        ...metaFromSlug,
        path: `/jumuiya/${metaFromSlug.id}`,
        isFirstYear,
        yearLabel: isFirstYear ? "1st Year" : user.year ? `${user.year} Yr` : "",
      };
    }

    // 3. Search jumuiyaList by id, group_id, or name fragment
    const fromList = jumuiyaList.find((j) => {
      const jId = (j.id || "").toLowerCase();
      const jName = (j.name || "").toLowerCase();
      const jGroupId = ((j as any).group_id || "").toLowerCase();
      return (
        jId === rawLower ||
        jGroupId === rawLower ||
        jName === rawLower ||
        rawLower.includes(jId.replace("st-", "")) ||
        jName.includes(rawLower)
      );
    });

    if (fromList) {
      const meta = JUMUIYA_META[fromList.id] ?? {
        id: fromList.id,
        name: fromList.name,
        fullName: fromList.fullName || fromList.name,
        color: fromList.color || "#3b82f6",
        saintImage: fromList.saintImage || "/images/cross.png",
      };
      const isFirstYear = detectFirstYear(user.year);
      return {
        ...meta,
        path: `/jumuiya/${meta.id}`,
        isFirstYear,
        yearLabel: isFirstYear ? "1st Year" : user.year ? `${user.year} Yr` : "",
      };
    }

    return null;
  }, [user]);
}
