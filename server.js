const inquirer = require('inquirer');
const mysql = require('mysql2');
require("console.table");

const PORT = process.env.PORT || 3001;

const readDepartmentSQL = 'SELECT id, title FROM department';
const readRoleSQL = 'SELECT role.id, role.title, role.salary, department.title as department FROM role, department WHERE role.department_Id = department.id';
const readEmployeeSQL = `SELECT employee.id, employee.first_name, employee.last_name, role.title as role, role.salary, department.title as department
    FROM employee, role, department
    WHERE employee.role_id = role.id AND role.department_id = department.id`;
const readManagersSQL = 'SELECT * FROM employee WHERE manager_id is null';

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'and432!',
        database: 'company_db'
    },
    console.log(`Connected to the company_db database.`)
);

function addDepartment() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'departmentName',
            message: "What is the name of the new department?"
        }
    ]).then((answers) => {
        db.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");
            const addDepartmentSQL = `INSERT INTO department (title) VALUES ('`+answers.departmentName+`')`;
            db.query(addDepartmentSQL, function (err, result) {
                if (err) throw err;
                console.log("1 record inserted");
                init();
            });
        });

    })
}

function addRole() {
    db.query(readDepartmentSQL, function (err, departments) {
        if (err) throw err;
        var departmentTitlesArray = Array.from(departments,department => department.title)
        inquirer.prompt([
            {
                type: 'input',
                name: 'roleName',
                message: 'What is the name of the new role?'
            },
            {
                type: 'input',
                name: 'roleSalary',
                message: 'What is the salary of the new role?'
            },
            {
                type: 'list',
                name: 'departmentTitle',
                message: 'Which department does the role belong to?',
                choices: departmentTitlesArray
            }
        ]).then((answers) => {
            db.connect(function(err) { 
                if (err) throw err;
                console.log("Connected!");
                var selectedDepartment = departments.find(department => department.title === answers.departmentTitle);
                var departmentId = selectedDepartment.id;
                const addRoleSQL = `
                    INSERT INTO role (title, salary,department_id) 
                    VALUES ('`+answers.roleName+`','`+answers.roleSalary+`','`+departmentId+`')`;
                db.query(addRoleSQL, function (err, result) {
                    if (err) throw err;
                    console.log("1 record inserted");
                    init();
                });
            });
        })
    });
}

function addEmployee() {
    //Read the Roles from the DB
    db.query(readRoleSQL, function (err, roles) {
        if (err) throw err;
        var rolesTitlesArray = Array.from(roles,role => role.title)

        //Read the Managers from the DB
        db.query(readManagersSQL, function (err, managers) {
            if (err) throw err;
            var managerNamesArray = Array.from(managers,manager => manager.first_name+' '+manager.last_name)

            inquirer.prompt([
                {
                    type: 'input',
                    name: 'firstName',
                    message: 'What is the first name of the new employee?'
                },
                {
                    type: 'input',
                    name: 'lastName',
                    message: 'What is the last name of the new employee?'
                },
                {
                    type: 'list',
                    name: 'roleTitle',
                    message: 'Which role does the employee belong to?',
                    choices: rolesTitlesArray
                },
                {
                    type: 'list',
                    name: 'manager',
                    message: 'Which manager does the employee report to?',
                    choices: managerNamesArray,
                    when: (answers) => !answers.roleTitle.includes("Manager")
                }
            ]).then((answers) => {
                db.connect(function(err) {
                    if (err) throw err;
                    console.log("Connected!");

                    var selectedRole = roles.find(role => role.title === answers.roleTitle);
                    var roleId = selectedRole.id;

                    var managerId = null;
                    if(answers.manager) {
                        var managerFirstName = answers.manager.split(' ')[0]; //"Bob Fish" ---> ["Bob","Fish"]
                        var managerLastName = answers.manager.split(' ')[1];
                        var selectedManager = managers.find(manager => manager.first_name === managerFirstName && manager.last_name === managerLastName);
                        managerId = '\''+selectedManager.id+'\'';
                    }
                    
                    const addEmployeeSQL = `
                        INSERT INTO employee (first_name, last_name, role_id, manager_id) 
                        VALUES ('`+answers.firstName+`', '`+answers.lastName+`', '`+roleId+`', `+managerId+`)`;
                    db.query(addEmployeeSQL, function (err, result) {
                        if (err) throw err;
                        console.log("1 record inserted");
                        init();
                    });
                });
            })
        });
    });
}

function updateEmployeeRole() {
    //Read the Roles from the DB
    db.query(readRoleSQL, function (err, roles) {
        if (err) throw err;
        var rolesTitlesArray = Array.from(roles, role => role.title);

        //Read the Employees from the DB
        db.query(readEmployeeSQL, function (err, employees) {
            if (err) throw err;
            var employeeNamesArray = Array.from(employees, employee => employee.first_name+' '+employee.last_name);

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employeeName',
                    message: 'Which employee\'s role do you want to update?',
                    choices: employeeNamesArray
                },
                {
                    type: 'list',
                    name: 'roleTitle',
                    message: 'What role do you want to give the employee?',
                    choices: rolesTitlesArray
                }
            ]).then((answers) => {
                db.connect(function(err) {
                    if (err) throw err;
                    console.log("Connected!");

                    var selectedRole = roles.find(role => role.title === answers.roleTitle);
                    var roleId = selectedRole.id;

                    var firstName = answers.employeeName.split(" ")[0];
                    var lastName = answers.employeeName.split(" ")[1];

                    const updateEmployeeSQL = `
                        UPDATE employee set role_id='`+roleId+`' where first_name='`+firstName+`' and last_name='`+lastName+'\'';
                    db.query(updateEmployeeSQL, function (err, result) {
                        if (err) throw err;
                        console.log("1 record updated");
                        init();
                    });
                });
            })
        });
    });
}

function init() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'commands',
            message: 'What would you like to do?',
            choices: [
                'View All Departments', 
                'View All Roles', 
                'View All Employees', 
                'Add Departments', 
                'Add Role', 
                'Add Employees', 
                'Update Employee Role', 
                'Quit']
        }
    ]).then((answers) => {
        switch (answers.commands){
            case 'View All Departments':
                db.query(readDepartmentSQL, function (err, result) {
                    if (err) throw err;
                    console.table(result);
                    init();
                    });
                break       
            case 'View All Roles': 
                db.query(readRoleSQL, function (err, result) {
                    if (err) throw err;
                    console.table(result);
                    init();
                });
                break
            case 'View All Employees':
                db.query(readEmployeeSQL, function (err, result) {
                    if (err) throw err;
                    console.table(result);
                    init();
                });
                break
            case 'Add Departments': 
                addDepartment();
                break
            case 'Add Role':
                addRole();
                break
            case 'Add Employees':
                addEmployee();
                break
            case 'Update Employee Role':
                updateEmployeeRole();
                break
            case 'Quit':
                console.log('kthnx bye...');
                break     
        }
    })
}

init()