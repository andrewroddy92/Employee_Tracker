const inquirer = require('inquirer');
const mysql = require('mysql2');
const Query = require('mysql2/typings/mysql/lib/protocol/sequences/Query');

const PORT = process.env.PORT || 3001;

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'and432!',
        database: 'company_db'
    },
    console.log(`Connected to the company_db database.`)
  );

  const readDepartmentSQL = 'SELECT * FROM department';

  db.query(readDepartmentSQL, function (err, result) {
    if (err) throw err;
    console.log(result);
  })

  function init() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'commands',
            message: 'What would you like to do?',
            choices: ['View All Departments', 'View All Roles', 'View All Employees', 'Add Departments', 'Add Role', 'Add Employees', 'Update Employee Role', 'Quit']
        }
      ]).then((answers) => {
        switch (answers.commands){
            case 'View All Departments':
                addManager();
                break       
            case 'View All Roles': 
                addEngineer();
                break
            case 'View All Employees':
                addIntern();
                break
            case 'Add Departments': 
                writeHtmlFile();
                break
            case 'Add Role':
                addIntern();
                break
            case 'Add Employees':
                addIntern();
                break
            case 'Update Employee Role':
                addIntern();
                break
            case 'Quit':
                addIntern();
                break

                 
        }
    })
  }


init()