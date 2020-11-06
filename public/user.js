const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const view = (state) => `
    <div class="userTopBar">
        <h1>${state.user.name}</h1>
        <img src="${state.user.avatar}" />
    </div>
    <div class="userTaskBox" ondragover="event.preventDefault();" ondrop="app.run('onDrop', event)">
        ${(state.user.tasks).map(task).join("")}
    </div>

    <div class=month>
        <a onclick="app.run('changeMonthDown')">&#8592;</a>
        <h5>${monthNames[state.date.getMonth()]} ${state.date.getFullYear()}</h5>
        <a onclick="app.run('changeMonthUp')">&#8594;</a>
    </div>

    <div class="calendar">
        <h1 class="header">Monday</h1>
        <h1 class="header">Tuesday</h1>
        <h1 class="header">Wednesday</h1>
        <h1 class="header">Thursday</h1>
        <h1 class="header">Friday</h1>
        <h1 class="header">Saturday</h1>
        <h1 class="header">Sunday</h1>
        ${calendar(state.date)}
    </div>
`

const task = (task) => { 
    if (!task.DayId == 0) { return ``}
    else { return `
        <div id="task${task.id}" class="userTask" draggable=true ondragstart="app.run('onDragStart', event)">
            <div class="userTaskProjectName">
                <h2>${task.Project.name}</h2>
            </div>
            <h2>${task.description}</h2>
        </div>
    `}
}

const calendar = (date) => {
    const daysInMonth = new Date(date.getFullYear(), date.getMonth()+1, 0).getDate()
    const blocks = new Date(date.getFullYear(), date.getMonth()+2, 1).getDay() + 1
    const calendar = []
    for (let step = 0; step < blocks; step++) {
        calendar.push(`
        <div class="block">
        </div>
    `)}
    for (let day = 0; day < daysInMonth; day++) {
        calendar.push(`
        <div id="${day+1}" class="day" ondragover="event.preventDefault();" ondrop="app.run('onDrop', event)">
            <h4>${day+1}</h4>
            ${dayTask(state, day+1)}
        </div>
    `)
    }
    return calendar.join("")
}

const dayTask = (state, dayId) => {
    return state.user.tasks.filter((task) => task.DayId === dayId).map(task => `
    <div id="taskcal${task.id}" class="dayTask" draggable=true ondragstart="app.run('onDragStart', event)">
        <h2>${task.description}</h2>
    </div>
    `).join("")
}

const update = {
    onDragStart: (state, event) => {
        event.dataTransfer.setData("taskid", event.target.id)
        return state
    },
    onDrop: async (state, event) => {
        event.preventDefault()
        const id = (event.dataTransfer.getData("taskid").match(/\d+/g))[0]
        const task = state.user.tasks.find((task) => task.id == Number(id));
        task.DayId = Number(event.target.id)
        const DayId = event.target.id
        await fetch(`/task/${task.id}/day`, {
            method: "POST",
            headers: {
              "Content-type": "application/json",
            },
            body: JSON.stringify({ DayId: DayId }),
        });
        return state
    },
    changeMonthUp: (state) => {
        const date = state.date
        date.setMonth(date.getMonth()+1)
        return state
    },
    changeMonthDown: (state) => {
        const date = state.date
        date.setMonth(date.getMonth()-1)
        return state
    }
}

app.start("user", state, view, update);