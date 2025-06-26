document.addEventListener('DOMContentLoaded', () => {
    // --- SELETORES DO DOM ---
    const body = document.body;
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const taskListContainer = document.getElementById('task-list-container');

    // Seletores do Modal
    const modalOverlay = document.getElementById('task-modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // Seletores do Formulário do Modal
    const taskForm = document.getElementById('task-form');
    const taskIdInput = document.getElementById('task-id');
    const taskTitleInput = document.getElementById('task-title');
    const taskDescriptionInput = document.getElementById('task-description');

    // --- ESTADO DA APLICAÇÃO ---
    let tasks = [];

    // --- FUNÇÕES DO MODAL ---
    const openModalForNewTask = () => {
        modalTitle.textContent = 'Adicionar Nova Tarefa';
        taskForm.reset();
        taskIdInput.value = '';
        modalOverlay.classList.add('active');
    };

    const openModalForEditTask = (task) => {
        modalTitle.textContent = 'Editar Tarefa';
        taskIdInput.value = task.id;
        taskTitleInput.value = task.title;
        taskDescriptionInput.value = task.description;
        modalOverlay.classList.add('active');
    };

    const closeModal = () => {
        modalOverlay.classList.remove('active');
    };

    // --- FUNÇÕES DE DADOS (LocalStorage) ---
    const loadTasks = () => {
        const storedTasks = localStorage.getItem('magesta_tasks');
        tasks = storedTasks ? JSON.parse(storedTasks) : [];
        renderTasks();
    };

    const saveTasks = () => {
        localStorage.setItem('magesta_tasks', JSON.stringify(tasks));
    };

    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    const renderTasks = () => {
        taskListContainer.innerHTML = '';
        if (tasks.length === 0) {
            taskListContainer.innerHTML = '<p class="no-tasks">✨ Nenhuma tarefa por aqui. Que tal adicionar uma?</p>';
            return;
        }

        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item';
            if (task.completed) {
                taskElement.classList.add('completed');
            }
            taskElement.dataset.id = task.id;
            taskElement.classList.add('task-item-enter'); 

            // MUDANÇA AQUI: A linha do checkbox antigo foi trocada por esta estrutura de <label>
            taskElement.innerHTML = `
                <div class="task-info">
                    <label class="toggle-switch" title="Marcar como concluída">
                        <input type="checkbox" class="task-checkbox-input" ${task.completed ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                    <div class="task-content">
                        <h3>${task.title}</h3>
                        <p>${task.description || 'Sem descrição'}</p>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="action-btn edit-btn" title="Editar"><i class="fa-solid fa-pencil"></i></button>
                    <button class="action-btn delete-btn" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            taskListContainer.appendChild(taskElement);
        });
    };

    // --- MANIPULADORES DE EVENTOS ---
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = taskIdInput.value;
        const title = taskTitleInput.value.trim();
        const description = taskDescriptionInput.value.trim();

        if (!title) {
            alert('O título é obrigatório.');
            return;
        }

        if (id) {
            const task = tasks.find(t => t.id == id);
            task.title = title;
            task.description = description;
        } else {
            const newTask = {
                id: Date.now(),
                title,
                description,
                completed: false
            };
            tasks.unshift(newTask);
        }

        saveTasks();
        renderTasks();
        closeModal();
    });

    taskListContainer.addEventListener('click', (e) => {
        const taskElement = e.target.closest('.task-item');
        if (!taskElement) return;

        const taskId = Number(taskElement.dataset.id);

        // MUDANÇA AQUI: A classe do checkbox foi atualizada para "task-checkbox-input"
        if (e.target.classList.contains('task-checkbox-input')) {
            const task = tasks.find(t => t.id === taskId);
            task.completed = e.target.checked;
            saveTasks();
            taskElement.classList.toggle('completed', task.completed);
        }

        if (e.target.closest('.edit-btn')) {
            const task = tasks.find(t => t.id === taskId);
            openModalForEditTask(task);
        }

        if (e.target.closest('.delete-btn')) {
            taskElement.classList.add('task-item-exit');
            taskElement.addEventListener('animationend', () => {
                tasks = tasks.filter(t => t.id !== taskId);
                saveTasks();
                renderTasks();
            }, { once: true });
        }
    });

    // --- GERENCIAMENTO DE TEMA ---
    const loadTheme = () => {
        const savedTheme = localStorage.getItem('magesta_theme');
        if (savedTheme === 'dark') {
            body.classList.add('dark-mode');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else {
            body.classList.remove('dark-mode');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
    };

    const toggleTheme = () => {
        body.classList.toggle('dark-mode');
        const isDarkMode = body.classList.contains('dark-mode');
        localStorage.setItem('magesta_theme', isDarkMode ? 'dark' : 'light');
        themeToggleBtn.innerHTML = isDarkMode ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    };

    // --- INICIALIZAÇÃO ---
    openModalBtn.addEventListener('click', openModalForNewTask);
    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    themeToggleBtn.addEventListener('click', toggleTheme);

    loadTheme();
    loadTasks();
});
