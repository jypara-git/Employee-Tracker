INSERT INTO departments (name)
VALUES 
    ('Sales'),
    ('Engineering'),
    ('Finance'),
    ('Legal');

INSERT INTO roles (title, salary, department_id)
VALUES 
    ('Accountant', 100000, 3),
    ('Software Engineer', 150000, 2),
    ('Lead Engineer', 200000, 2),
    ('Lawyer', 180000, 4),
    ('Legal Team Lead', 220000, 4),
    ('Sales Lead', 110000, 1),
    ('Salesperson', 95000, 1);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES  
    ('Judy', 'Lee', 1, null),
    ('Alex', 'Strenfel', 3, null),
    ('Stacy', 'Huonder', 2, 2),
    ('Kevin', 'Lao', 2, 2),
    ('Rene', 'Malonis', 5, null),
    ('Nick', 'Napo', 4, 5),
    ('Nina', 'Karol', 6, null),
    ('Tim', 'Smith', 7, 6);