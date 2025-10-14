// Builds a Google Calendar template URL without inviting attendees
// We intentionally do not include any email addresses.

const monthMap = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
};

function tryParseStart(dateString) {
  // Expected formats like: "June 18, 20:00" or "Jun 18, 20:00"
  if (!dateString || typeof dateString !== 'string') return null;
  const cleaned = dateString.trim();
  const match = cleaned.match(/^(\w+)\s+(\d{1,2}),\s*(\d{1,2}):(\d{2})$/i);
  if (!match) return null;

  const monthName = match[1].toLowerCase();
  const day = Number(match[2]);
  const hour = Number(match[3]);
  const minute = Number(match[4]);
  const month = monthMap[monthName];
  if (month == null) return null;

  const now = new Date();
  const year = now.getFullYear();
  const dt = new Date(year, month, day, hour, minute, 0);

  // If parsed date already passed by > 6 months, assume next year
  const sixMonthsMs = 1000 * 60 * 60 * 24 * 30 * 6;
  if (dt.getTime() < now.getTime() - sixMonthsMs) {
    dt.setFullYear(year + 1);
  }
  return dt;
}

function toGCalDateTimeUTC(date) {
  const pad = (n) => String(n).padStart(2, '0');
  const y = date.getUTCFullYear();
  const m = pad(date.getUTCMonth() + 1);
  const d = pad(date.getUTCDate());
  const hh = pad(date.getUTCHours());
  const mm = pad(date.getUTCMinutes());
  const ss = pad(date.getUTCSeconds());
  return `${y}${m}${d}T${hh}${mm}${ss}Z`;
}

export function buildGoogleCalendarUrl({ title, dateText, endDate, durationMinutes = 240, location, description }) {
  let startLocal = null;
  if (dateText instanceof Date) {
    startLocal = dateText;
  } else if (typeof dateText === 'string' && !Number.isNaN(Date.parse(dateText))) {
    startLocal = new Date(dateText);
  } else {
    startLocal = tryParseStart(dateText);
  }
  startLocal = startLocal || new Date(Date.now() + 15 * 60 * 1000);
  const endLocal = endDate ? new Date(endDate) : new Date(startLocal.getTime() + durationMinutes * 60 * 1000);

  const dates = `${toGCalDateTimeUTC(startLocal)}/${toGCalDateTimeUTC(endLocal)}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || 'Event',
    details: description || '',
    location: location || ''
  });
  params.append('dates', dates);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}


