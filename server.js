const express = require('express')
const Handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const app = express()

const { Project, Task, User, sequelize } = require('./models/models.js')

const handlebars = expressHandlebars({
    handlebars: allowInsecurePrototypeAccess(Handlebars)
})



app.use(express.static('public'))
app.engine('handlebars', handlebars)
app.set('view engine', 'handlebars')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())





//get all projects {id, name}, render home view
app.get('/', async (req, res) => {
    const projects = await Project.findAll({ logging: false })
    res.render('home', {projects})
})

//get full project with nested tasks, sort tasks by task.status, return project, sorted tasks and users, render projects view
app.get('/project/:id', async (req, res) => {
    const project = await Project.findByPk(req.params.id,{ 
        include: [{all : true, nested: true}], 
        logging: false 
    })
    
    const users = await User.findAll({ logging: false })
    const tasks = await Task.findAll({ where : {ProjectId : req.params.id }});
    res.render('project', {tasks: JSON.stringify(tasks), users: JSON.stringify(users), project: JSON.stringify(project)});
})



//get user from taskid, return user
app.get('/task/:taskid/user', async (req, res) => {
    const task = await Task.findByPk(req.params.taskid)
    const user = await User.findByPk(task.UserId)
    return user
})





//create user, redirect back
app.post('/user/create', async (req, res) => {
    await User.create(req.body)
    res.redirect('back')
})

// find from id and update user, redirect back
app.post('/user/:userid/update', async (req, res) => {
    const user = await User.findByPk(req.params.userid,{ logging: false })
    await user.update(req.body)
    res.redirect('back')
})

// find from id and destroy user, currently unused
app.post('/user/:userid/destroy', async (req, res) => {
    const user = await User.findByPk(req.params.userid)
    await user.destroy()
})



//create project, redirect back
app.post('/project/create', async (req, res) => {
    await Project.create(req.body)
    res.redirect('back')
})

//find from id and update project, redirect back
app.post('/project/:projectid/update', async (req, res) => {
    const project = await Project.findByPk(req.params.projectid,{ logging: false })
    await project.update(req.body)
    res.redirect('back')
})

//find from id and destroy project, redirect to home
app.get('/project/:projectid/destroy', async (req, res) => {
    const project = await Project.findByPk(req.params.projectid)
    await project.destroy()
    res.redirect('/')
})





//create task, find project from id and assign, redirect back
app.post('/task/project/:projectid/create', async (req, res) => {
    const task = await Task.create(req.body)
    const project = await Project.findByPk(req.params.projectid,{ logging: false })
    await project.addTask(task)
    res.redirect('back')
})

// find from id and update task, redirect back
app.post('/task/:taskid/update', async (req, res) => {
    const task = await Task.findByPk(req.params.taskid,{ logging: false })
    await task.update(req.body);
    res.redirect('back');
})

//find from id and destroy task, redirect back
app.get('/task/:taskid/destroy', async (req, res) => {
    const task = await Task.findByPk(req.params.taskid)
    await task.destroy()
    res.redirect('back')
})

//assign userid from body to task from id, redirect back
app.post('/task/:taskid/assign', async (req, res) => {
    const task = await Task.findByPk(req.params.taskid,{ logging: false })
    await task.update({UserId: req.body.UserId});
    res.redirect('back')
})



//host of port 3000
app.listen(process.env.PORT, async () => {
    await sequelize.sync();
    console.log('Listening on', process.env.PORT);
})