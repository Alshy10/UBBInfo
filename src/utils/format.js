// Shared formatting helpers

// "Sâmbătă, 14 Iunie 2025" — Romanian locale, first letter capitalized
export function formatRomanianDate(date = new Date()) {
  const formatted = new Intl.DateTimeFormat('ro-RO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

// Extract first name: text after the last space in the full name
export function firstNameOf(fullName = '') {
  const parts = fullName.trim().split(/\s+/);
  return parts.length ? parts[parts.length - 1] : '';
}

// Weighted average: Σ(grade × credits) / Σ(credits), only graded courses
export function weightedAverage(enrollments) {
  const graded = enrollments.filter(
    (e) => e.grade !== null && e.grade !== undefined
  );
  if (graded.length === 0) return null;
  let sumGC = 0;
  let sumC = 0;
  for (const e of graded) {
    const credits = e.courses?.credits ?? 0;
    sumGC += e.grade * credits;
    sumC += credits;
  }
  if (sumC === 0) return null;
  return sumGC / sumC;
}

export function sumCredits(enrollments) {
  return enrollments.reduce((acc, e) => acc + (e.courses?.credits ?? 0), 0);
}
