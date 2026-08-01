/**
 * ICS Calendar Export for Catholic Novenas
 * Generates downloadable .ics files for Google Calendar, Apple Calendar, Outlook
 */

export interface NovenaExportEvent {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  feastDay?: string;
  intention?: string;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toICSDate(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

function escapeICS(text: string): string {
  return text.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\n/g, '\\n');
}

export function generateNovenaICS(event: NovenaExportEvent): string {
  const now = new Date();
  const dtstamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const title = event.feastDay
    ? `${event.title} — ${event.feastDay}`
    : event.title;
  const parts = [`Novena: ${event.title}`, `Feast: ${event.feastDay || 'N/A'}`];
  if (event.intention) parts.push(`Intention: ${event.intention}`);
  if (event.description) parts.push(event.description);
  const description = parts.join('\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Catholic Church//Daily Missal//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${toICSDate(event.startDate)}`,
    `DTEND;VALUE=DATE:${toICSDate(event.endDate)}`,
    `DTSTAMP:${dtstamp}`,
    `UID:${event.title.toLowerCase().replace(/\s+/g, '-')}@catholic-missal`,
    `SUMMARY:${escapeICS(title)}`,
    `DESCRIPTION:${description}`,
    'STATUS:CONFIRMED',
    'TRANSP:TRANSPARENT',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Novena begins tomorrow',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadNovenaCalendar(event: NovenaExportEvent): void {
  const icsContent = generateNovenaICS(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.toLowerCase().replace(/\s+/g, '-')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
