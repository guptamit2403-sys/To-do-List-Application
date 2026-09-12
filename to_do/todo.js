const form = document.querySelector('#taskForm');
const input = document.querySelector('#taskInput');
const category = document.querySelector('#category');
const priority = document.querySelector('#priority');
const dueDate = document.querySelector('#dueDate');
const list = document.querySelector('#taskList');
const template = document.querySelector('#taskTemplate');
const emptyState = document.querySelector('#emptyState');
const formMessage = document.querySelector('#formMessage');
const submitButton = document.querySelector('#submitButton');
const searchInput = document.querySelector('#searchInput');
const themeToggle = document.querySelector('#themeToggle');
let activeFilter = 'all';
let editingId = null;
let tasks = JSON.parse(localStorage.getItem('focusflow-tasks') || '[]');

function saveTasks() { localStorage.setItem('focusflow-tasks', JSON.stringify(tasks)); }
function formatDate(value) { return value ? new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`)) : 'No due date'; }
function updateCounts() { document.querySelector('#totalCount').textContent = tasks.length; document.querySelector('#completedCount').textContent = tasks.filter(t => t.completed).length; document.querySelector('#pendingCount').textContent = tasks.filter(t => !t.completed).length; }
function renderTasks() {
  const query = searchInput.value.trim().toLowerCase();
  const shown = tasks.filter(t => (activeFilter === 'all' || activeFilter === (t.completed ? 'completed' : 'pending')) && t.title.toLowerCase().includes(query));
  list.innerHTML = '';
  shown.forEach(task => {
    const item = template.content.cloneNode(true);
    const row = item.querySelector('.task-item'); row.classList.toggle('completed', task.completed);
    const checkbox = item.querySelector('.task-check'); checkbox.checked = task.completed;
    item.querySelector('.task-title').textContent = task.title;
    item.querySelector('.task-meta').innerHTML = `<span class="badge">${task.category}</span><span class="priority-${task.priority}">${task.priority} priority</span><span>${formatDate(task.dueDate)}</span>`;
    checkbox.addEventListener('change', () => { task.completed = checkbox.checked; saveTasks(); renderTasks(); });
    item.querySelector('.edit-button').addEventListener('click', () => editTask(task));
    item.querySelector('.delete-button').addEventListener('click', () => { tasks = tasks.filter(t => t.id !== task.id); saveTasks(); renderTasks(); });
    list.append(item);
  });
  emptyState.classList.toggle('hidden', shown.length > 0); updateCounts();
}
function editTask(task) { editingId = task.id; input.value = task.title; category.value = task.category; priority.value = task.priority; dueDate.value = task.dueDate; submitButton.textContent = 'Save changes'; input.focus(); }
form.addEventListener('submit', event => { event.preventDefault(); const title = input.value.trim(); if (!title) { formMessage.textContent = 'Please enter a task before adding it.'; input.focus(); return; } const data = { title, category: category.value, priority: priority.value, dueDate: dueDate.value }; if (editingId) { const task = tasks.find(t => t.id === editingId); Object.assign(task, data); editingId = null; submitButton.textContent = 'Add Task'; } else { tasks.unshift({ id: crypto.randomUUID(), ...data, completed: false }); } form.reset(); formMessage.textContent = ''; saveTasks(); renderTasks(); });
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => { activeFilter = button.dataset.filter; document.querySelectorAll('.filter').forEach(b => b.classList.toggle('active', b === button)); renderTasks(); }));
searchInput.addEventListener('input', renderTasks);
document.querySelector('#clearCompleted').addEventListener('click', () => { tasks = tasks.filter(t => !t.completed); saveTasks(); renderTasks(); });
themeToggle.addEventListener('click', () => { document.body.classList.toggle('dark'); const dark = document.body.classList.contains('dark'); localStorage.setItem('focusflow-dark', dark); themeToggle.textContent = dark ? '☀' : '☾'; });
if (localStorage.getItem('focusflow-dark') === 'true') { document.body.classList.add('dark'); themeToggle.textContent = '☀'; }
renderTasks();
