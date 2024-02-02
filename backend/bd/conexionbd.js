const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'capstone_bd',
});

db.connect((err) => {
    if (err) {
        console.error('Error en la conexión a la base de datos: ', err);
        throw err;
    }
    console.log('Conexión exitosa a la base de datos MySQL');
});

module.exports = db;
