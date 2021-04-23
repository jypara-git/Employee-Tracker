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
            const sql = `SELECT * FROM roles`;
            db.query(sql, (err, rows) => {
                if (err) {
                    console.log('error');
                    return;
                }
                console.log('');
                console.log('');
                console.table(rows);
                promptUser();
            })
        } else if (option.options === 'View all employees') {
            const sql = `SELECT * FROM employees`;
            db.query(sql, (err, rows) => {
                if (err) {
                    console.log('error');
                    return;
                }
                console.log('');
                console.log('');
                console.table(rows);
                promptUser();
            })
        } else if (option.options === 'Add a department') {
            promptDepartment()
            .then((depResponse) => {
                const sql = `INSERT INTO departments (name) VALUES (?)`;
                const params = depResponse.department_name;
                db.query(sql, params, (err, _) => {
                    if (err) {
                        console.log('Error');
                    }
                    console.log(params + ' added to departments');
                    promptUser();
                })
            })
        } 
    });
};
const promptDepartment = () => {
    return inquirer.prompt ([
    {
        type: 'input',
        name: 'department_name',
        message: 'What is the department name?',
        validate: nameInput => {
            if (nameInput) {
                return true;
            } else {
                console.log('Please enter the department name!');
                return false;
            }
        }
    }
    ])
};
promptUser();
