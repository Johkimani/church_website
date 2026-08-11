export interface Developer {
  name: string;
  role: string;
  avatar?: string;
  gradient: string;
}

export interface ChairpersonContact {
  name: string;
  role: string;
  phone: string;
}

export interface DeveloperTeamSettings {
  developers: Developer[];
  chairperson: ChairpersonContact;
  teamPhoto?: string;
}

const SETTINGS_KEY = "developer_team";

export const DEFAULT_DEVELOPERS: Developer[] = [
  { name: "Lead Developer", role: "Full-Stack Development", gradient: "linear-gradient(135deg, #2563EB, #7C3AED)" },
  { name: "Frontend Developer", role: "UI / UX & Interactions", gradient: "linear-gradient(135deg, #0EA5E9, #2563EB)" },
  { name: "Backend Developer", role: "APIs & Infrastructure", gradient: "linear-gradient(135deg, #059669, #0EA5E9)" },
  { name: "Data & Services", role: "Database & Integrations", gradient: "linear-gradient(135deg, #F59E0B, #EF4444)" },
];

export const DEFAULT_CHAIRPERSON: ChairpersonContact = {
  name: "CSA Chairperson",
  role: "Chairperson — St. Thomas Aquinas CSA",
  phone: "+254700000000",
};

export const DEFAULT_SETTINGS: DeveloperTeamSettings = {
  developers: DEFAULT_DEVELOPERS,
  chairperson: DEFAULT_CHAIRPERSON,
};

const STORAGE_KEY = "developer-team-settings";

export function loadDeveloperSettings(): DeveloperTeamSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<DeveloperTeamSettings>;
    return {
      developers: Array.isArray(parsed.developers) && parsed.developers.length > 0
        ? parsed.developers
        : DEFAULT_DEVELOPERS,
      chairperson: parsed.chairperson
        ? { ...DEFAULT_CHAIRPERSON, ...parsed.chairperson }
        : DEFAULT_CHAIRPERSON,
      teamPhoto: typeof parsed.teamPhoto === "string" ? parsed.teamPhoto : "",
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveDeveloperSettings(settings: DeveloperTeamSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error("Failed to save developer team settings:", err);
  }
}

export function resetDeveloperSettings() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("Failed to reset developer team settings:", err);
  }
}

function parseSettings(raw: string | undefined): DeveloperTeamSettings | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<DeveloperTeamSettings>;
    return {
      developers:
        Array.isArray(parsed.developers) && parsed.developers.length > 0
          ? parsed.developers
          : DEFAULT_DEVELOPERS,
      chairperson: parsed.chairperson
        ? { ...DEFAULT_CHAIRPERSON, ...parsed.chairperson }
        : DEFAULT_CHAIRPERSON,
      teamPhoto: typeof parsed.teamPhoto === "string" ? parsed.teamPhoto : "",
    };
  } catch {
    return null;
  }
}

export async function loadDeveloperSettingsFromServer(): Promise<DeveloperTeamSettings | null> {
  try {
    const { fetchSystemSettings } = await import("../api/axiosInstance");
    const { data } = await fetchSystemSettings();
    const raw = data?.[SETTINGS_KEY];
    return parseSettings(raw);
  } catch {
    return null;
  }
}

export async function saveDeveloperSettingsToServer(settings: DeveloperTeamSettings): Promise<void> {
  const { updateSystemSettings } = await import("../api/axiosInstance");
  await updateSystemSettings({ [SETTINGS_KEY]: JSON.stringify(settings) });
}

export async function resetDeveloperSettingsOnServer(): Promise<void> {
  const { updateSystemSettings } = await import("../api/axiosInstance");
  await updateSystemSettings({ [SETTINGS_KEY]: JSON.stringify(DEFAULT_SETTINGS) });
}
