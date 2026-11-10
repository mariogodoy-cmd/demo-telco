/** Ventana de portación: la madrugada siguiente, 00:00 hora de Guatemala (06:00 UTC). */
export function nextPortWindow(now = new Date()) {
  const window = new Date(now.getTime() + 24 * 3600_000);
  window.setUTCHours(6, 0, 0, 0);
  return window;
}
