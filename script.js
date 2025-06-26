document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // COLE A SUA CONFIGURAÇÃO DO FIREBASE AQUI
    // =================================================================
    const firebaseConfig = {
      apiKey: "AIza...",
      authDomain: "magesta-app-final.firebaseapp.com",
      databaseURL: "https://console.firebase.google.com/u/1/project/central-dfdd9/database/central-dfdd9-default-rtdb/data/~2F?hl=pt-br",
      projectId: "central-dfdd9",
      storageBucket: "magesta-app-final.appspot.com",
      messagingSenderId: "...",
      appId: "1:233453649750:android:60d464f8160015608060f7"
    };
    // =================================================================

    // Inicializa o Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();
    const tasksRef = db.ref('tasks');

    // --- SELETORES DO DOM ---
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
    
    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    const renderTasks = (tasksObject) => {
        taskListContainer.innerHTML = '';
        if (!tasksObject) {
            taskListContainer.innerHTML = '<p class="no-tasks">✨ Nenhuma tarefa por aqui. Que tal adicionar uma?</p>';
            return;
        }

        const tasksArray = Object.entries(tasksObject).map(([id, data]) => ({ id, ...data }));
        const sortedTasks = tasksArray.sort((a, b) => b.createdAt - a.createdAt);

        sortedTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskElement.dataset.id = task.id;
            
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

    // --- FUNÇÕES DE DADOS (AGORA COM FIREBASE REALTIME DB) ---

    // OUVINTE EM TEMPO REAL: Esta função roda automaticamente sempre que os dados mudam no Firebase
    tasksRef.on('value', (snapshot) => {
        const tasks = snapshot.val();
        renderTasks(tasks);
    });
    
    // ADICIONAR OU EDITAR TAREFA
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = taskIdInput.value;
        const title = taskTitleInput.value.trim();
        const description = taskDescriptionInput.value.trim();

        if (!title) return alert('O título é obrigatório.');

        if (id) { // Editando tarefa existente
            db.ref('tasks/' + id).update({ title, description });
        } else { // Criando nova tarefa
            tasksRef.push({
                title,
                description,
                completed: false,
                createdAt: firebase.database.ServerValue.TIMESTAMP
            });
        }
        closeModal();
    });

    // AÇÕES NA LISTA DE TAREFAS
    taskListContainer.addEventListener('click', (e) => {
        const taskElement = e.target.closest('.task-item');
        if (!taskElement) return;

        const taskId = taskElement.dataset.id;

        // Concluir/Desmarcar tarefa
        if (e.target.classList.contains('task-checkbox-input')) {
            const isCompleted = e.target.checked;
            db.ref('tasks/' + taskId).update({ completed: isCompleted });
        }
        // Abrir modal para edição
        if (e.target.closest('.edit-btn')) {
            tasksRef.child(taskId).once('value', (snapshot) => {
                const task = snapshot.val();
                if(task) openModalForEditTask(taskId, task);
            });
        }
        // Deletar tarefa
        if (e.target.closest('.delete-btn')) {
            if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                db.ref('tasks/'' + taskId).remove();
            }
        }
    });

    // --- FUNÇÕES DO MODAL E TEMA (NÃO MUDAM) ---
    const openModalForNewTask = () => {
        modalTitle.textContent = 'Adicionar Nova Tarefa';
        taskForm.reset();
        taskIdInput.value = '';
        modalOverlay.classList.add('active');
    };
    const openModalForEditTask = (id, taskData) => {
        modalTitle.textContent = 'Editar Tarefa';
        taskIdInput.value = id;
        taskTitleInput.value = taskData.title;
        taskDescriptionInput.value = taskData.description;
        modalOverlay.classList.add('active');
    };
    const closeModal = () => { modalOverlay.classList.remove('active'); };
    const loadTheme = () => { /* Código do tema continua igual */ };
    const toggleTheme = () => { /* Código do tema continua igual */ };

    /* Cole aqui as implementações completas do loadTheme e toggleTheme que já tínhamos */

    // --- INICIALIZAÇÃO ---
    openModalBtn.addEventListener('click', openModalForNewTask);
    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
    themeToggleBtn.addEventListener('click', toggleTheme);
    loadTheme();
});