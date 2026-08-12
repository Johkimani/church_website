// Semester helpers shared across admin dashboards.
// The CSA-configured current semester (start_date) determines which semester
// number (1 or 2) we are in; falls back to the historical month rule
// (month >= 5 → Sem 2) when no config has been set.
export const semNumFromConfig = (semester: { start_date?: string } | null): 1 | 2 => {
  if (semester?.start_date) {
    const month = new Date(semester.start_date + "T00:00:00Z").getUTCMonth() + 1;
    return month >= 6 ? 2 : 1;
  }
  return new Date().getMonth() >= 5 ? 2 : 1;
};

// Map a year of study (1-4) + semester number to its sem_*_reg column.
export const semColForYearSem = (yearOfStudy: string | number, semNum: 1 | 2): string | null => {
  const yos = parseInt(String(yearOfStudy));
  if (!yos || yos < 1 || yos > 4) return null;
  const isSecondSem = semNum === 2;
  const semIndex = (yos - 1) * 2 + (isSecondSem ? 2 : 1);
  return `sem_${semIndex}_reg`;
};

// "2.1", "3.2", etc. for a year of study + current semester number.
export const yearSemLabel = (yearOfStudy: string | number, semNum: 1 | 2): string => {
  const yos = parseInt(String(yearOfStudy));
  if (!yos || yos < 1 || yos > 4) return "—";
  return `${yos}.${semNum}`;
};
