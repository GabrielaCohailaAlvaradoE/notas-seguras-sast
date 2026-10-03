export function parseMinutes(userInput) {
  const value = String(userInput).trim();
  if (!/^\d{1,4}$/.test(value)) throw new Error('Usa minutos enteros entre 1 y 1440.');
  const minutes = Number(value);
  if (minutes < 1 || minutes > 1440) throw new Error('Usa minutos enteros entre 1 y 1440.');
  return minutes;
}
export function validateTask(task) {
  if (!task || typeof task !== 'object' || typeof task.id !== 'string' || task.id.length > 80) return false;
  if (typeof task.title !== 'string' || !task.title.trim() || task.title.length > 120) return false;
  if (typeof task.description !== 'string' || task.description.length > 1200) return false;
  return Number.isInteger(task.minutes) && task.minutes >= 1 && task.minutes <= 1440 &&
    ['normal', 'alta', 'baja'].includes(task.priority) && typeof task.done === 'boolean';
}
export function decodeTasks(raw) {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(validateTask).slice(0, 200) : [];
  } catch { return []; }
}
