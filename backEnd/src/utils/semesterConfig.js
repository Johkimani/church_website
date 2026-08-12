// Shared helpers for the central "current semester" configuration.
// The CSA chair sets the current semester's start/end dates; every module that
// previously derived the semester from the calendar month now reads this config.
import { testDb } from "../Configs/dbConfig.js";

// Map a config start date to the semester number (1 or 2) within its academic
// year. Matches the historical month rule: a semester starting Jan–May is Sem 1,
// a semester starting Jun–Dec is Sem 2.
export const semesterNumberFromStart = (startDate) => {
  const month = new Date(startDate + "T00:00:00Z").getUTCMonth() + 1;
  return month >= 6 ? 2 : 1;
};

// Fetch the current semester row (or null). `queryable` defaults to the shared
// pool but may be a transaction client so callers can reuse an open transaction.
export const getCurrentSemester = async (queryable) => {
  const q = queryable || testDb;
  const result = await q.query(
    `SELECT id,
            label,
            to_char(start_date, 'YYYY-MM-DD') AS start_date,
            to_char(end_date, 'YYYY-MM-DD') AS end_date,
            is_current,
            created_by
     FROM semester_configs
     WHERE is_current = true
     ORDER BY id DESC
     LIMIT 1`
  );
  const row = result.rows[0];
  if (!row) return null;
  return { ...row, semester_number: semesterNumberFromStart(row.start_date) };
};

// True when `date` (YYYY-MM-DD) falls within the semester window (inclusive).
export const isDateInSemester = (date, semester) =>
  !!semester && date >= semester.start_date && date <= semester.end_date;

// True when today falls within the semester window.
export const isSemesterActive = (semester) =>
  isDateInSemester(new Date().toISOString().slice(0, 10), semester);
