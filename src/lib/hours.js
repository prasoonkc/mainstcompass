const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_LABELS = { sun: 'Sunday', mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday' };

export { DAY_KEYS, DAY_LABELS };

export function getTodayKey() {
  return DAY_KEYS[new Date().getDay()];
}

export function isOpenNow(hours) {
  if (!hours) return null;
  const todayKey = getTodayKey();
  const todayHours = hours[todayKey];
  if (!todayHours || todayHours === 'Closed') return false;

  const match = todayHours.match(/(\d+:\d+\s?[AP]M)\s*[–-]\s*(\d+:\d+\s?[AP]M)/i);
  if (!match) return false;

  const now = new Date();
  const toMinutes = (str) => {
    const [time, period] = str.trim().split(/\s+/);
    let [h, m] = time.split(':').map(Number);
    if (period?.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (period?.toUpperCase() === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  const open = toMinutes(match[1]);
  const close = toMinutes(match[2]);
  const current = now.getHours() * 60 + now.getMinutes();
  return current >= open && current < close;
}
