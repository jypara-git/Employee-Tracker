const inquirer = require('inquirer');
const db = require('./db/connection');
const cTable = require('console.table');
const promptUser = () => {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'options',
            message: 'What would you like to do?',
            choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role']
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
            const sql = ` SELECT roles.id, roles.title, roles.salary, departments.name AS department FROM roles LEFT JOIN departments ON roles.department_id = departments.id;`;
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
            const sql = `SELECT empl1.id, empl1.first_name, empl1.last_name, roles.title, roles.salary, departments.name AS department, (SELECT CONCAT(first_name, ' ', last_name) FROM employees WHERE id=empl1.manager_id) AS manager FROM employees AS empl1 LEFT JOIN roles ON empl1.role_id = roles.id LEFT JOIN departments ON roles.department_id = departments.id`;
            db.query(sql, (err, rows) => {
                if (err) {
                    console.log(err);
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
                        return;
                    }
                    console.log(params + ' was added to departments!');
                    promptUser();
                })
            })
        } else if (option.options === 'Add a role') {
            const sql = `SELECT name FROM departments`;
            db.query(sql, (err, rows) => {
                if (err) {
                    console.log('error');
                    return;
                }
                const departmentList = rows.map(textRow => textRow.name);
                promptRole(departmentList)
                .then((roleResponse) => {
                    const sql = `INSERT INTO roles (title, salary, department_id) VALUES (?, ?, (SELECT id FROM departments WHERE name=?))`;
                    const params = [roleResponse.title, roleResponse.salary, roleResponse.department_name];
                    db.query(sql, params, (err, _)=>{
                        if (err) {
                            console.log(err);
                            return;
                        }
                        console.log(roleResponse.title + '  was added to roles!');
                        promptUser();
                    })
                })
            })
        } else if (option.options === 'Add an employee') {
            const sql = `SELECT title FROM roles`;
            db.query(sql, (err, rows) => {
                if (err) {
                    console.log(err);
                    return;
                }
                const rolesList = rows.map(textRow => textRow.title); 
                const sql2 = `SELECT first_name, last_name FROM employees`;
                db.query(sql2, (err, rows) => {
                    if (err) {
                        console.log(err);
                    }
                    const employeesList = rows.map(textRow => textRow.first_name + ' ' +  textRow.last_name);
                    employeesList.push('None');
                    promptEmployee(rolesList, employeesList)
                    .then((promptValues) => {
                        if ( promptValues.manager === 'None') {
                            const sql = `INSERT INTO employees (first_name, last_name, role_id) VALUES (?, ?,(SELECT id FROM roles WHERE title=?))`;
                            const params = [promptValues.first_name, promptValues.last_name, promptValues.roles];
                            db.query(sql, params, (err, result) => {
                                if (err) {
                                    console.log(err);
                                    return;
                                }
                                console.log('Employee was added!');
                                promptUser();
                            })
                        } else {
                            const sql = `SELECT id FROM employees WHERE first_name=? and last_name=?`;
                            const params = promptValues.manager.split(' ');
                            db.query(sql, params, (err, rows) => {
                                if (err) {
                                    console.log(err);
                                    return;
                                }
                                const manager_id = rows[0].id;
    
                                const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?,(SELECT id FROM roles WHERE title=?), ?)`;
                                const params = [promptValues.first_name, promptValues.last_name, promptValues.roles, manager_id];
                                db.query(sql, params, (err, result) => {
                                    if (err) {
                                        console.log(err);
                                        return;
                                    }
                                    console.log('Employee was added!');
                                    promptUser();
                                })
                            })
                        }
                    })
                });
            })
        } else if (option.options === 'Update an employee role') {
            const sql = `SELECT first_name, last_name FROM employees`;
            db.query(sql, (err, rows) => {
                if (err) {
                    console.log(err);
                    return;
                }
                const employeesList = rows.map(textRow => textRow.first_name + ' ' + textRow.last_name);
                const sql2 = `SELECT title FROM roles`;
                db.query(sql2, (err, rows) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    const rolesList = rows.map(textRow => textRow.title);
                    promptUpdate(employeesList, rolesList)
                    .then((updatedRole) => {
                        const sql = `UPDATE employees SET role_id = (SELECT id FROM roles WHERE title=?) WHERE first_name=? and last_name=?`;
                        const params = [updatedRole.roles, updatedRole.employees.split(' ')[0], updatedRole.employees.split(' ')[1]];
                        db.query(sql, params, (err, result) => {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            console.log('Role updated!');
                            promptUser();
                        })

                    })
                })
            })
        } else {
            return;
        }
    })
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
const promptRole = (departmentList) => {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'What is the title name?',
            validate: (nameInput)=> {
                if (nameInput) {
                    return true;
                }
                console.log('Please enter the title name!');
                return false;
            }
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Enter the salary for the role',
            validate: (nameInput) => {
                if (nameInput) {
                    return true;
                }
                console.log('Please enter the salary!');
                return false;
            }
        },
        {
            type: 'list',
            name: 'department_name',
            message: 'What is the department?',
            choices: departmentList
        }
    ])
};

const promptEmployee = (rolesList, employeesList) => {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: "What is the employee's name?",
            validate: (nameInput) => {
                if (nameInput) {
                    return true;
                }
                console.log('Please enter the name!');
                return false;
            }
        },
        {
            type: 'input',
            name: 'last_name',
            message: "What is the employee's last name?",
            validate: (nameInput) => {
                if (nameInput) {
                    return true;
                }
                console.log('Please enter last name!');
                return false;
            }
        },
        {
            type: 'list',
            name: 'roles',
            message: "What is the employee's role?",
            choices: rolesList
        },
        {
            type: 'list',
            name: 'manager',
            message: "Who is the employee's manager?",
            choices: employeesList
        }
    ])
};
const promptUpdate = (employeesList, rolesList) => {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'employees',
            message: "Which employee's role you want to update?",
            choices: employeesList
        },
        {
            type: 'list',
            name: 'roles',
            message: "Which role would you like to set as a new role for selected employee?",
            choices: rolesList
        }
    ])
}
promptUser();
