document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const taskListContainer = document.getElementById('task-list-container');
    const modalOverlay = document.getElementById('task-modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const taskForm = document.getElementById('task-form');
    const taskIdInput = document.getElementById('task-id');
    const taskTitleInput = document.getElementById('task-title');
    const taskDescriptionInput = document.getElementById('task-description');
    let tasks = [];

    const loadTasks = async () => {
        try {
            const response = await fetch('/api/tasks');
            tasks = await response.json();
            renderTasks();
        } catch (error) { console.error('Falha ao carregar tarefas:', error); }
    };

    const saveTasksToServer = async () => {
        try {
            await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tasks)
            });
        } catch (error) { console.error('Falha ao salvar tarefas:', error); }
    };

    const renderTasks = () => {
        taskListContainer.innerHTML = '';
        if (tasks.length === 0) {
            taskListContainer.innerHTML = '<p class="no-tasks">✨ Nenhuma tarefa por aqui. Que tal adicionar uma?</p>';
            return;
        }
        const sortedTasks = [...tasks].sort((a, b) => (b.id - a.id));
        sortedTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskElement.dataset.id = task.id;
            taskElement.innerHTML = `<div class="task-info"><label class="toggle-switch" title="Marcar como concluída"><input type="checkbox" class="task-checkbox-input" <span class="math-inline">\{task\.completed ? 'checked' \: ''\}\><span class\="slider"\></span\></label\><div class\="task\-content"\><h3\></span>{task.title}</h3><p>${task.description || 'Sem descrição'}</p></div></div><div class="task-actions"><button class="action-btn edit-btn" title="Editar"><i class="fa-solid fa-pencil"></i></button><button class="action-btn delete-btn" title="Excluir"><i class="fa-solid fa-trash"></i></button></div>`;
            taskListContainer.appendChild(taskElement);
        });
    };

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = taskIdInput.value;
        const title = taskTitleInput.value.trim();
        const description = taskDescriptionInput.value.trim();
        if (!title) return alert('O título é obrigatório.');
        if (id) {
            const task = tasks.find(t => t.id == id);
            if (task) { task.title = title; task.description = description; }
        } else {
            tasks.push({ id: Date.now(), title, description, completed: false });
        }
        renderTasks();
        saveTasksToServer();
        closeModal();
    });

    taskListContainer.addEventListener('click', (e) => {
        const taskElement = e.target.closest('.task-item');
        if (!taskElement) return;
        const taskId = Number(taskElement.dataset.id);
        let changed = false;
        if (e.target.classList.contains('task-checkbox-input')) {
            const task = tasks.find(t => t.id === taskId);
            if (task) { task.completed = e.target.checked; taskElement.classList.toggle('completed', task.completed); changed = true; }
        }
        if (e.target.closest('.edit-btn')) {
            const task = tasks.find(t => t.id === taskId);
            if(task) openModalForEditTask(task);
        }
        if (e.target.closest('.delete-btn')) {
            tasks = tasks.filter(t => t.id !== taskId);
            renderTasks();
            changed = true;
        }
        if (changed) saveTasksToServer();
    });

    const openModalForNewTask = () => { modalTitle.textContent = 'Adicionar Nova Tarefa'; taskForm.reset(); taskIdInput.value = ''; modalOverlay.classList.add('active'); };
    const openModalForEditTask = (task) => { modalTitle.textContent = 'Editar Tarefa'; taskIdInput.value = task.id; taskTitleInput.value = task.title; taskDescriptionInput.value = task.description; modalOverlay.classList.add('active'); };
    const closeModal = () => { modalOverlay.classList.remove('active'); };
    const loadTheme = () => { const theme = localStorage.getItem('magesta_theme'); if (theme === 'dark') { document.body.classList.add('dark-mode'); themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>'; } else { document.body.classList.remove('dark-mode'); themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>'; } };
    const toggleTheme = () => { document.body.classList.toggle('dark-mode'); const isDark = document.body.classList.contains('dark-mode'); localStorage.setItem('magesta_theme', isDark ? 'dark' : 'light'); themeToggleBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>'; };

    openModalBtn.addEventListener('click', openModalForNewTask);
    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
    themeToggleBtn.addEventListener('click', toggleTheme);
    loadTheme();
    loadTasks();
});