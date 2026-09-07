/** Element IDs for the four countdown digit groups. */
export interface CountdownTargetIds {
  days: string;
  hours: string;
  mins: string;
  secs: string;
}

/**
 * Drives a "days:hours:mins:secs" countdown to `targetIso`, updating the
 * given element IDs every second. Used on the homepage and events page,
 * both counting down to the same KYDEEI Cohort 1 start date.
 */
export function initCountdown(targetIso: string, ids: CountdownTargetIds): void {
  const target = new Date(targetIso).getTime();

  const setText = (id: string, value: string) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  function update(): void {
    const diff = target - Date.now();

    if (diff <= 0) {
      [ids.days, ids.hours, ids.mins, ids.secs].forEach((id) => setText(id, '00'));
      return;
    }

    setText(ids.days, String(Math.floor(diff / 86400000)).padStart(2, '0'));
    setText(ids.hours, String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'));
    setText(ids.mins, String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'));
    setText(ids.secs, String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'));
  }

  update();
  window.setInterval(update, 1000);
}
