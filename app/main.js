import {parseMinutes, decodeTasks} from './core.js';
import {renderTitle, renderDescription} from './rendering.js';
const byId = id => document.getElementById(id);
const storageKey = 'notas-seguras-v1';
let tasks = [];
try { tasks = decodeTasks(localStorage.getItem(storageKey)); }
catch { byId('status').textContent = 'El almacenamiento local no está disponible.'; }
function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(tasks)); }
  catch { byId('status').textContent = 'No se pudo guardar. Las tareas estarán disponibles durante esta sesión.'; }
}
function render() {
  const query = byId('search').value.toLocaleLowerCase('es');
  const filter = byId('filter').value;
  const visible = tasks.filter(task => (task.title + ' ' + task.description).toLocaleLowerCase('es').includes(query) &&
    (filter === 'all' || (filter === 'done' ? task.done : !task.done)));
  byId('tasks').replaceChildren();
  for (const task of visible) {
    const card = document.createElement('article'); card.className = 'task' + (task.done ? ' done' : '');
    const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', 'Completar ' + task.title);
    checkbox.addEventListener('change', () => { task.done = checkbox.checked; save(); render(); });
    const content = document.createElement('div');
    const title = document.createElement('h3'); renderTitle(title, task.title);
    const description = document.createElement('p'); renderDescription(description, task.description);
    const footer = document.createElement('div'); footer.className = 'task-footer';
    const meta = document.createElement('div'); meta.className = 'task-meta';
    const priority = document.createElement('span'); priority.className = 'priority ' + task.priority;
    priority.textContent = task.priority[0].toUpperCase() + task.priority.slice(1);
    const duration = document.createElement('span'); duration.textContent = task.minutes + ' min';
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'delete'; remove.textContent = 'Eliminar';
    remove.setAttribute('aria-label', 'Eliminar ' + task.title);
    remove.addEventListener('click', () => { tasks = tasks.filter(item => item.id !== task.id); save(); render(); byId('status').textContent = 'Tarea eliminada.'; });
    meta.append(priority, duration); footer.append(meta, remove); content.append(title, description, footer); card.append(checkbox, content); byId('tasks').append(card);
  }
  byId('empty').hidden = visible.length > 0;
  byId('total').textContent = String(tasks.length);
  const pending = tasks.filter(task => !task.done);
  byId('pending').textContent = String(pending.length);
  byId('minutes').textContent = String(pending.reduce((sum, task) => sum + task.minutes, 0));
}
byId('task-form').addEventListener('submit', event => {
  event.preventDefault();
  try {
    if (tasks.length >= 200) throw new Error('Tu tablero admite hasta 200 tareas.');
    const title = byId('title').value.trim();
    if (!title) throw new Error('Escribe un título.');
    tasks.unshift({id: crypto.randomUUID(), title, description: byId('description').value.trim(), minutes: parseMinutes(byId('duration').value), priority: byId('priority').value, done: false});
    byId('status').textContent = 'Tarea agregada.'; save(); render(); byId('task-form').reset(); byId('title').focus();
  } catch (error) { byId('status').textContent = error.message; }
});
byId('search').addEventListener('input', render);
byId('filter').addEventListener('change', render);
render();
