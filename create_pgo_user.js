/**
 * Created by barrett on 8/28/14.
 */

var mysql = require('mysql');
var dbconfig = {
    'connection': {
        'host': 'localhost',
        'user': 'root',
        'password': 'Dfkfljhy123'
    }
};
var connection = mysql.createConnection(dbconfig.connection);

connection.query("CREATE USER 'pgo_user'@'localhost' IDENTIFIED BY '1';");

connection.query('GRANT ALL PRIVILEGES ON * . * TO `pgo_user`@`localhost`;');

connection.query('FLUSH PRIVILEGES;');

console.log('Success: user created!');

connection.end();
