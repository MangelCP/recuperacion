//Contador ID
let taskIdCounter = 1;

// Clase Task
function Task(title, description, dueDate, state, members, priority) {
    this.id = taskIdCounter++;
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.state = state;
    this.members = members;
    this.priority = priority;
    this.creationDate = new Date();
    this.tasksDone = 0;
}

//Clase TeamMember
function TeamMember(name, photo, identifier) {
    this.name = name;
    this.photo = photo;
    this.identifier = identifier;
    this.tasksDone = 0;
}

// Array para almacenar las tareas
const tasks = [];
//Agregar tareas ya hechas!!

// Array para almacenar los miembros del equipo
const teamMembers = [];

function addTask() {
    const titleInput = document.getElementById("taskTitle");
    const title = titleInput.value;

    const descriptionInput = document.getElementById("taskDescription");
    const description = descriptionInput.value;

    // Obtener la prioridad seleccionada
    const prioritySelect = document.getElementById("priority");
    const priority = prioritySelect.value;

    // Conseguir el miembro seleccionado si hay alguno
    const selectedMemberRadio = document.querySelector('input[name="member"]:checked');
    let selectedMember = null;
    if (selectedMemberRadio) {
        const selectedMemberId = selectedMemberRadio.value;
        selectedMember = teamMembers.find(member => member.identifier === selectedMemberId);
    }

    // Crear instancia de Task 
    const newTask = new Task(title, description, new Date(), "ToDo", selectedMember ? [selectedMember] : []);
    //que tenga una fecha distinta a la de hoy!!! dependiendo de la prioridad que tega una fecha (alta =1 dia/ media = 1 semana/ baja = 1 mes) 

    // Agregar la prioridad a la tarea
    newTask.priority = priority;

    // Agregar la nueva tarea
    tasks.unshift(newTask); // Insertar la tarea al principio del array de tareas

    // Actualizar visualizacion
    renderTasksByState();

    // Limpiar el cuadro de texto
    titleInput.value = '';
    descriptionInput.value = '';
}

function updateDueDate() {
    const taskId = parseInt(prompt("Ingrese el ID de la tarea a actualizar:"));
    const dueDateInput = document.getElementById('dueDateInput');
    const newDueDate = new Date(dueDateInput.value);
    
    if (isNaN(taskId) || taskId < 1 || taskId > tasks.length) {
        alert("ID de tarea no valido.");
        return;
    }

    tasks[taskId - 1].dueDate = newDueDate;

    // Comprobar si la fecha es anterior a la fecha actual
    const currentDate = new Date();

    // Renderizar las tareas actualizadas
    renderTasksByState();
}

const updateButton = document.querySelector('button');


function renderTasksByState() {
    // Referencias a los contenedores de las columnas Task
    const tasksToDoContainer = document.getElementById('tasksToDo');
    const tasksInProgressContainer = document.getElementById('tasksInProgress');
    const tasksDoneContainer = document.getElementById('tasksDone');

    // Limpiar los contenedores
    tasksToDoContainer.innerHTML = '';
    tasksInProgressContainer.innerHTML = '';
    tasksDoneContainer.innerHTML = '';

    // Ordenar de las tareas
    const sortedTasks = tasks.slice().sort((a, b) => b.creationDate.getTime() - a.creationDate.getTime());

    // Contar las tareas en cada estado
    function countTasksByState(state) {
        return sortedTasks.filter(task => task.state === state).length;
    }

    tasksToDoContainer.innerHTML = `<h3>To Do (${countTasksByState('ToDo')})</h3>`;
    tasksInProgressContainer.innerHTML = `<h3>In Progress (${countTasksByState('InProgress')})</h3>`;
    tasksDoneContainer.innerHTML = `<h3>Done (${countTasksByState('Done')})</h3>`;

    sortedTasks.forEach((task, index) => {
        const taskElement = document.createElement('div');
        taskElement.classList.add('task');
        taskElement.draggable = true;
        taskElement.dataset.id = index;
        taskElement.addEventListener('dragstart', (event) => dragStart(event, index)); 

        taskElement.innerHTML = `
        ${task.state === 'Done' ? `
            <div class="task-done">
                <div>DONE</div>
            </div>` : ''}
            <h4>${task.title}</h4>
            <p><strong>Description:</strong> ${task.description}</p>
            <p>Prioridad: ${task.priority}</p>
            <p>Members:</p>
            <div class="task-members"></div>
            <p>Creation Date: ${task.creationDate}</p>
            <p>Due Date: ${task.dueDate}</p>
            <p>ID: ${task.id}</p>
            <p>State: ${task.state}</p>
            ${task.state === 'InProgress' ? `<input type="checkbox" onchange="moveTaskToDone(${index}, this)">Tarea Acabada` : ''}

        `;
        
        // Obtener contenedor members 
        const taskMembersContainer = taskElement.querySelector('.task-members');
    
        // Datos Tareas 
        if (task.members.length > 0) {
            task.members.forEach(member => {
                const memberIcon = document.createElement('img');
                memberIcon.src = member.photo;
                memberIcon.alt = member.name;
                memberIcon.title = member.name;
                memberIcon.style.width = "100px"; //Tamanio de los Icons
                taskMembersContainer.appendChild(memberIcon);
            });
        }
        
        // Estado de la Tarea
        if (task.state === 'ToDo') {
            tasksToDoContainer.appendChild(taskElement);
        } else if (task.state === 'InProgress') {
            tasksInProgressContainer.appendChild(taskElement);
        } else if (task.state === 'Done') {
            tasksDoneContainer.appendChild(taskElement);
        }

        // Estilo fecha
        const currentDate = new Date();
        if (task.dueDate <= currentDate) {
            taskElement.classList.add('Timeout');
        }
    });
}


// Arrastre para iconos
function dragMember(event, memberId) {
    event.dataTransfer.setData("text", memberId);
}

// ToDo con miembros
function dropMember(event) {
    event.preventDefault();

    const taskIdElement = event.target.closest('.task');
    if (!taskIdElement) return;

    const taskId = taskIdElement.dataset.id; // Obtener identificador
    const memberId = event.dataTransfer.getData('text');

    // Asignar el miembro tarea
    const task = tasks[taskId];
    if (task) {
        const selectedMember = teamMembers.find(member => member.identifier === memberId);
        if (selectedMember) {
            const existingMember = task.members.find(member => member.identifier === selectedMember.identifier);
            
            // Agregar si no esta
            if (!existingMember) {
                task.members.push(selectedMember);

                const taskMembersContainer = taskIdElement.querySelector('.task-members');

                const memberIcon = document.createElement('img');
                memberIcon.src = selectedMember.photo;
                memberIcon.alt = selectedMember.name;
                memberIcon.title = selectedMember.name;
                memberIcon.style.width = "100px"; 

                taskMembersContainer.appendChild(memberIcon);

                renderTasksByState();
            } else {
                alert("Este miembro ya está asignado a la tarea.");
            }
        }
    }
}


//Arrastre de datos de los miembros
const memberElements = document.querySelectorAll(".team-member");
memberElements.forEach(memberElement => {
    memberElement.addEventListener("dragstart", dragMember);
});

const tasksToDoContainer = document.getElementById("tasksToDo");
tasksToDoContainer.addEventListener("dragover", dragOver);
tasksToDoContainer.addEventListener("drop", dropMember);


// De InProgress a Done
function moveTaskToDone(index, checkbox) {
    if (checkbox.checked) {
        // Obtener la tarea
        const task = tasks[index];
        
        // Comprobar Estado
        if (task.state === 'InProgress') {
            // Revisar miembros
            task.members.forEach(member => {
                // Contador Tareas Finalizadas
                member.tasksDone++;
            });
            
            // Cambiar a Done
            task.state = 'Done';
            
            // Ver Cambios
            renderTasksByState();
            renderTeamMembers();
        } else {
            console.error("Hay un error");
        }
    }
}

function renderTeamMembers() {  
  
    const teamMembersDiv = document.getElementById("team-members"); 


    teamMembersDiv.innerHTML = "";    

  
    teamMembers.forEach(member => { 
        // div de members
        const memberDiv = document.createElement("div");
        memberDiv.classList.add("team-member");

        // Informacion de Members 
        memberDiv.innerHTML = `
            <img src="${member.photo}" alt="${member.name}">
            <p>Nombre: ${member.name}</p>
            <p>ID: ${member.identifier}</p>
            <p>Tareas Realizadas: ${member.tasksDone}</p>
        `;

        teamMembersDiv.appendChild(memberDiv);
    });
}

// Datos de los miembros y mas
const member1 = new TeamMember("Jose", "icono1.png", "001");
const member2 = new TeamMember("Mario", "icono2.png", "002");
const member3 = new TeamMember("Noelia", "icono3.png", "003");
const member4 = new TeamMember("Luis", "icono4.png", "004");
const member5 = new TeamMember("Sara", "icono5.png", "005");

// Incluirlos en Arrays
teamMembers.push(member1, member2, member3, member4, member5);

renderTeamMembers();

renderTasksByState();

// Arrastre
function dragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.dataset.id);
}

// De ToDo a InProgress
function drop(event) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('text/plain');
    const taskIndex = parseInt(taskId);
    const taskElement = document.querySelector(`[data-id="${taskId}"]`);
    const tasksInProgressContainer = document.getElementById('tasksInProgress');
    
    // Ver si tiene un member
    if (tasks[taskIndex].state === 'ToDo' && tasks[taskIndex].members.length > 0) {
        tasksInProgressContainer.appendChild(taskElement);
        
        // Actualizar a InProgress
        tasks[taskIndex].state = 'InProgress';
        
        renderTasksByState();
    } else {

        alert("Debes asignarle un encargado.");
    }
}


const tasksInProgressContainer = document.getElementById('tasksInProgress');
tasksInProgressContainer.addEventListener('dragover', dragOver);
tasksInProgressContainer.addEventListener('drop', drop);


function dragOver(event) {
    event.preventDefault();
}

function changePriority() {
    const taskId = parseInt(prompt("Ingrese el ID:"));
    const task = tasks.find(task => task.id === taskId); 

    if (!task) {
        alert("No hay una tarea con este ID, intentelo con otro ID.");
        return;
    }

    let newPriority = prompt("Cual sera la nueva categoria?(Alta, Media o Baja):");
    const validPriorities = ["alta", "media", "baja"];
    newPriority = newPriority.toLowerCase(); 

    if (!validPriorities.includes(newPriority)) {
        alert("Prioridad no aceptada, escoga entre 'Alta', 'Media' o 'Baja'.");
        return;
    }

    // Asignar la nueva prioridad a la tarea
    task.priority = newPriority;

    renderTasksByState();
}


// Informacion Arrays
const consoleContainer = document.createElement('div');
consoleContainer.id = 'console-container';

// Botones Array
const showAllButton = document.createElement('button');
showAllButton.textContent = 'Mostrar todas las tareas';
showAllButton.addEventListener('click', () => displayTasks('all'));

const showToDoButton = document.createElement('button');
showToDoButton.textContent = 'Mostrar tareas en ToDo';
showToDoButton.addEventListener('click', () => displayTasks('ToDo'));

const showInProgressButton = document.createElement('button');
showInProgressButton.textContent = 'Mostrar tareas en In Progress';
showInProgressButton.addEventListener('click', () => displayTasks('InProgress'));

const showDoneButton = document.createElement('button');
showDoneButton.textContent = 'Mostrar tareas en Done';
showDoneButton.addEventListener('click', () => displayTasks('Done'));

const showAllMembersButton = document.createElement('button');
showAllMembersButton.textContent = 'Mostrar todos los miembros';
showAllMembersButton.addEventListener('click', () => displayMembers());

// Botones en Contenedor
consoleContainer.appendChild(showAllButton);
consoleContainer.appendChild(showToDoButton);
consoleContainer.appendChild(showInProgressButton);
consoleContainer.appendChild(showDoneButton);
consoleContainer.appendChild(showAllMembersButton); 

document.body.appendChild(consoleContainer);

function displayTasks(state) {
    const tasksToShow = state === 'all' ? tasks : tasks.filter(task => task.state === state);
    alert(JSON.stringify(tasksToShow, null, 2));
} 

function displayMembers() {
    alert(JSON.stringify(teamMembers, null, 2));
}
 