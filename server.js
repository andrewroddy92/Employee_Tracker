const inquirer = require('inquirer');
const mysql = require('mysql2');

const PORT = process.env.PORT || 3001;

const readDepartmentSQL = 'SELECT * FROM department';
const readRoleSQL = 'SELECT * FROM role';
const readEmployeeSQL = 'SELECT * FROM employee';

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
    var departments = ['Hydroponics', 'Aquaponics', 'Animal Husbandry'] //Populate this dynamically later, with a SELECT query
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
            name: 'departments',
            message: 'Which department does the role belong to?',
            choices: departments
        }
    ]).then((answers) => {
        db.connect(function(err) { 
            if (err) throw err;
            console.log("Connected!");
            const addRoleSQL = `
                INSERT INTO role (title, salary,department_id) 
                VALUES ('`+answers.roleName+`','`+answers.roleSalary+`,'1')`;
            db.query(addRoleSQL, function (err, result) {
                if (err) throw err;
                console.log("1 record inserted");
                init();
            });
        });
    })
}

function addEmployee() {
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
    // {
    //     type: 'list',
    //     name: 'roles',
    //     message: 'Which role does the employee belong to?',
    //     choices: ['']
    // },
    // {
    //     type: 'list',
    //     name: 'managers',
    //     message: 'Which manager does the employee report to?',
    //     choices: [''],
    //     when: (answers) => answers.roles != "Manager"
    // }
    //
    ]).then((answers) => {
        db.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");
            const addEmployeeSQL = `
                INSERT INTO employee (first_name, last_name, role_id, manager_id) 
                VALUES ('`+answers.firstName+`', '`+answers.lastName+`', 2, 3)`;
            db.query(addEmployeeSQL, function (err, result) {
                if (err) throw err;
                console.log("1 record inserted");
                init();
            });
        });
    })
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
                    console.log(result);
                    init();
                  });
                break       
            case 'View All Roles': 
                db.query(readRoleSQL, function (err, result) {
                    if (err) throw err;
                    console.log(result);
                    init();
                });
                break
            case 'View All Employees':
                db.query(readEmployeeSQL, function (err, result) {
                    if (err) throw err;
                    console.log(result);
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
                console.log('Didnt do this one yet, choose another!');
                init();
                break
            case 'Quit':
                console.log('kthnx bye...');
                break     
        }
    })
  }

init()