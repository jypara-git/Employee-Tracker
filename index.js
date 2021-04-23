const inquirer = require('inquirer');
const db = require('./db/connection');
const cTable = require('console.table');
const promptUser = () => {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'options',
            message: 'What would you like to do?',
            choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role'],
        }
    ])
    .then((option) => {
        if (option.options === 'View all departments') {
            const sql = `SELECT * FROM departments`;
            db.query(sql, (err, rows) => {
                if(err) {
                    console.log('error');
                    return;
                }
                console.log('');
                console.log('');
                console.table(rows);
                promptUser();
            })
        } else if (option.options === 'View all roles') {
            console.log('roles are here')
        }
    });
};
promptUser();
