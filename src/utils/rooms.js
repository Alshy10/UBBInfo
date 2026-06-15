// Format an embedded room ({ code, note, location, buildings:{name} }) for display.
// Falls back to a plain text room code when no room row is linked.
export function formatRoom(room, fallbackText = '') {
  if (!room) return fallbackText || '—';
  const building = room.buildings?.name;
  const base = room.note ? `${room.code} (${room.note})` : room.code;
  return building ? `${building} · ${base}` : base;
}

export function shortRoom(room, fallbackText = '') {
  if (!room) return fallbackText || '—';
  return room.note ? `${room.code} (${room.note})` : room.code;
}
