// Navigation model. Page labels also drive the topbar breadcrumb.

export const NAV_ITEMS_STUDENT = [
  { to: '/', key: 'acasa', label: 'Acasă', icon: 'home', end: true },
  { to: '/identitate', key: 'identitate', label: 'Identitatea Ta', icon: 'badge' },
  { to: '/note', key: 'note', label: 'Consultă Note', icon: 'bar_chart' },
  { to: '/orar', key: 'orar', label: 'Orar', icon: 'calendar_month' },
  { to: '/evaluare', key: 'evaluare', label: 'Evaluare Profesori', icon: 'rate_review' },
  { to: '/examen', key: 'examen', label: 'Înscriere Examen', icon: 'event_available' },
  { to: '/taxe', key: 'taxe', label: 'Plata Taxe', icon: 'payments' },
];

export const NAV_ITEMS_PROFESSOR = [
  { to: '/', key: 'acasa', label: 'Acasă', icon: 'home', end: true },
  { to: '/catalog', key: 'catalog', label: 'Catalog Note', icon: 'edit_note' },
  { to: '/examene', key: 'examene', label: 'Examene', icon: 'event' },
];

export const NAV_ITEMS_OTHER = [
  { to: '/', key: 'acasa', label: 'Acasă', icon: 'home', end: true },
];

export function navItemsForRole(roleName) {
  if (roleName === 'student') return NAV_ITEMS_STUDENT;
  if (roleName === 'profesor') return NAV_ITEMS_PROFESSOR;
  return NAV_ITEMS_OTHER;
}

// Map a pathname to a breadcrumb label (search across all role navs)
const ALL_ITEMS = [
  ...NAV_ITEMS_STUDENT,
  ...NAV_ITEMS_PROFESSOR,
];

export function breadcrumbForPath(pathname) {
  const match = ALL_ITEMS.filter((i) => !i.end).find((i) =>
    pathname.startsWith(i.to)
  );
  return match ? match.label : 'Acasă';
}
