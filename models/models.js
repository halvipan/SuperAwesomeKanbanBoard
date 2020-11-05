const {Model, DataTypes, Sequelize} = require('sequelize');
const path = require('path');
const connectionSettings = {
    test: {dialect: 'sqlite', storage: 'sqlite::memory:'},
    dev: {dialect: 'sqlite', storage: path.join(__dirname, 'data.db')},
    production: {dialect: 'postgres', protocal: 'postgres'}
}
const sequelize = process.env.NODE_ENV === 'production'
    ? new Sequelize(process.env.DATABASE_URL, connectionSettings[process.env.NODE_ENV])
    : new Sequelize(connectionSettings[process.env.NODE_ENV])

class Project extends Model {};
class Task extends Model {};
class User extends Model {};
class Day extends Model {};

Project.init(
    {
        name: DataTypes.STRING,
        image: DataTypes.STRING
    },
    {sequelize}
);
Task.init(
    {
        description: DataTypes.STRING,
        DayId: DataTypes.STRING,
        status: {type:  DataTypes.INTEGER, defaultValue: 0}
    },
    {sequelize}
);
User.init(
    {
        name: DataTypes.STRING,
        avatar: DataTypes.STRING
    },
    {sequelize}
)

Project.hasMany(Task, {as: 'tasks'});
Task.belongsTo(Project);
User.hasMany(Task, {as: 'tasks'});

module.exports = {Project, Task, User, Day, sequelize};