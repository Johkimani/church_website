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

const JUMUIYA_META: Record<string, { id: string; name: string; fullName: string; color: string; saintImage: string }> = {
  "st-anthony": { id: "st-anthony", name: "St. Anthony", fullName: "St. Anthony of Padua", color: "#8b5cf6", saintImage: "/images/Anthony.png" },
  "st-augustine": { id: "st-augustine", name: "St. Augustine", fullName: "St. Augustine of Hippo", color: "#3b82f6", saintImage: "/images/Augustine.png" },
  "st-catherine": { id: "st-catherine", name: "St. Catherine", fullName: "St. Catherine of Alexandria", color: "#800000", saintImage: "/images/Catherine.png" },
  "st-dominic": { id: "st-dominic", name: "St. Dominic", fullName: "St. Dominic Guzman", color: "#475569", saintImage: "/images/Dominic.png" },
  "st-elizabeth": { id: "st-elizabeth", name: "St. Elizabeth", fullName: "St. Elizabeth of Hungary", color: "#059669", saintImage: "/images/Elizabeth.png" },
  "st-maria-goretti": { id: "st-maria-goretti", name: "St. Maria Goretti", fullName: "St. Maria Goretti", color: "#0284c7", saintImage: "/images/Goretti.png" },
  "st-monica": { id: "st-monica", name: "St. Monica", fullName: "St. Monica of Hippo", color: "#dc2626", saintImage: "/images/Monica.png" },
};

export function useUserJumuiya(): UserJumuiyaInfo | null {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user || !user.jumuiya_id) return null;

    const raw = String(user.jumuiya_id).trim().toLowerCase();

    // 1. Direct match by slug
    let matched = JUMUIYA_META[raw] || null;

    // 2. Lookup in jumuiyaList by group_id, id, or name
    if (!matched) {
      const fromList = jumuiyaList.find((j) => {
        const jId = (j.id || "").toLowerCase();
        const jName = (j.name || "").toLowerCase();
        const jGroupId = (j.group_id || "").toLowerCase();
        return (
          jId === raw ||
          jGroupId === raw ||
          jName === raw ||
          raw.includes(jId.replace("st-", "")) ||
          jName.includes(raw)
        );
      });

      if (fromList) {
        matched = {
          id: fromList.id,
          name: fromList.name,
          fullName: fromList.fullName || fromList.name,
          color: fromList.color || "#3b82f6",
          saintImage: fromList.saintImage || "/images/cross.png",
        };
      }
    }

    if (!matched) {
      // Fallback if jumuiya_id contains saint name directly
      for (const [slug, item] of Object.entries(JUMUIYA_META)) {
        if (raw.includes(slug.replace("st-", "")) || raw.includes(item.name.toLowerCase())) {
          matched = item;
          break;
        }
      }
    }

    if (!matched) return null;

    const rawYear = String(user.year || "").toLowerCase();
    const isFirstYear =
      rawYear === "1" ||
      rawYear === "1st" ||
      rawYear.includes("1st") ||
      rawYear.includes("first") ||
      rawYear.includes("yr 1") ||
      rawYear.includes("year 1");

    return {
      id: matched.id,
      name: matched.name,
      fullName: matched.fullName,
      color: matched.color,
      saintImage: matched.saintImage,
      path: `/jumuiya/${matched.id}`,
      isFirstYear,
      yearLabel: isFirstYear ? "1st Year" : user.year ? `${user.year} Yr` : "",
    };
  }, [user]);
}
