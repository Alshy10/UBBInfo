// Academic-week / parity engine.
// Rule: a week "counts" if it has at least one non-vacation day. Fully-vacation
// weeks are skipped (they don't advance the parity counter). Counted weeks are
// numbered 1,2,3…; odd = impară, even = pară.

// Parse 'YYYY-MM-DD' as a local date (avoid UTC shift)
export function parseDate(s) {
  if (s instanceof Date) return s;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function startOfMonday(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  return addDays(d, -day);
}

function ymd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isVacationDay(date, vacations) {
  const t = date.getTime();
  return vacations.some((v) => {
    const s = parseDate(v.start_date).getTime();
    const e = parseDate(v.end_date).getTime();
    return t >= s && t <= e;
  });
}

function vacationNameFor(weekStart, vacations) {
  // name of a vacation that covers the whole week (for display)
  for (const v of vacations) {
    const s = parseDate(v.start_date).getTime();
    const e = parseDate(v.end_date).getTime();
    let allCovered = true;
    for (let i = 0; i < 7; i++) {
      const t = addDays(weekStart, i).getTime();
      if (!(t >= s && t <= e)) {
        allCovered = false;
        break;
      }
    }
    if (allCovered) return v.name;
  }
  return null;
}

// Build the list of weeks for a semester.
// semester: { start_date, end_date }, vacations: [{start_date,end_date,name}]
// Returns [{ index, monday, sunday, counted, number, parity, vacationName }]
export function buildWeeks(semester, vacations = []) {
  if (!semester?.start_date) return [];
  const start = startOfMonday(parseDate(semester.start_date));
  const end = semester.end_date
    ? parseDate(semester.end_date)
    : addDays(start, 7 * 20); // fallback ~20 weeks

  const weeks = [];
  let cursor = start;
  let counter = 0;
  let idx = 0;

  while (cursor.getTime() <= end.getTime()) {
    const monday = cursor;
    const sunday = addDays(monday, 6);

    let nonVacationDays = 0;
    for (let i = 0; i < 7; i++) {
      if (!isVacationDay(addDays(monday, i), vacations)) nonVacationDays++;
    }
    const counted = nonVacationDays > 0;
    let number = null;
    let parity = null;
    if (counted) {
      counter += 1;
      number = counter;
      parity = number % 2 === 1 ? 'impar' : 'par';
    }

    weeks.push({
      index: idx,
      monday,
      sunday,
      mondayISO: ymd(monday),
      sundayISO: ymd(sunday),
      counted,
      number,
      parity,
      vacationName: counted ? null : vacationNameFor(monday, vacations),
    });

    idx += 1;
    cursor = addDays(cursor, 7);
  }
  return weeks;
}

// Find the index of the week containing `today` (clamped to range).
export function currentWeekIndex(weeks, today = new Date()) {
  if (!weeks.length) return 0;
  const t = startOfMonday(today).getTime();
  const found = weeks.findIndex((w) => w.monday.getTime() === t);
  if (found >= 0) return found;
  if (t < weeks[0].monday.getTime()) return 0;
  return weeks.length - 1;
}

// "23 feb – 1 mar"
export function formatWeekRange(week) {
  const fmt = (d) =>
    new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'short' }).format(d);
  return `${fmt(week.monday)} – ${fmt(week.sunday)}`;
}

// Pick the active semester config for today (else the most recent one).
export function pickActiveSemester(configs, today = new Date()) {
  if (!configs?.length) return null;
  const t = today.getTime();
  const active = configs.find((c) => {
    const s = parseDate(c.start_date).getTime();
    const e = c.end_date ? parseDate(c.end_date).getTime() : Infinity;
    return t >= s && t <= e;
  });
  if (active) return active;
  // most recent by start_date <= today, else earliest
  const sorted = [...configs].sort(
    (a, b) => parseDate(b.start_date) - parseDate(a.start_date)
  );
  return sorted.find((c) => parseDate(c.start_date).getTime() <= t) || sorted[sorted.length - 1];
}
