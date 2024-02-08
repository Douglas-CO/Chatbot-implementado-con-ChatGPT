const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'tesis',
  port: 3307
});

function obtenerMenu(callback) {
  connection.query('SELECT * FROM menu', (err, results, fields) => {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, results);
  });
}

function obtenerHorario(callback) {
    connection.query('SELECT * FROM horario', (err, results, fields) => {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, results);
    });
  }

module.exports = { obtenerMenu, obtenerHorario };
