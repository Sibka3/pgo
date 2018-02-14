var mysql = require('mysql');
var bcrypt = require('bcrypt');
var dbconfig = require('./database.js');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

exports.findById = function(id, cb) {
  process.nextTick(function() {
    connection.query("SELECT * FROM "+dbconfig.tables.users.table_name+" WHERE "+dbconfig.tables.users.id+" = '"+id+"'", function(err, rows){
        if (err)
          return cb(null, null);
        if (rows[0]) {
          var user = {
              'id':rows[0][dbconfig.tables.users.id],
              'first_name':rows[0][dbconfig.tables.users.first_name],
              'last_name':rows[0][dbconfig.tables.users.last_name],
              'email':rows[0][dbconfig.tables.users.email],
              'password':rows[0][dbconfig.tables.users.password]
            };
          cb(null, user);
        } else {
          cb(new Error('User ' + id + ' does not exist'));
        }
    })
  });
};

exports.findByUsername = function(username, cb) {
  process.nextTick(function() {
    connection.query("SELECT * FROM "+dbconfig.tables.users.table_name+" WHERE "+dbconfig.tables.users.email+" = ?",username, function(err, rows){
        if (err)
            return cb(null, null);
        if (rows[0]) {
            var user = {
              'id':rows[0][dbconfig.tables.users.id],
              'first_name':rows[0][dbconfig.tables.users.first_name],
              'last_name':rows[0][dbconfig.tables.users.last_name],
              'email':rows[0][dbconfig.tables.users.email],
              'password':rows[0][dbconfig.tables.users.password]
            };
            return cb(null, user);
        }
        return cb(null, null);
    })
  });
};

exports.addUser = function(username, password, cb) {
      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      connection.query("SELECT * FROM "+dbconfig.tables.users.table_name+" WHERE "+dbconfig.tables.users.email+" = '"+username+"';", function(err, rows) {
          if (err)
              return cb(err, null);
          if(!username || !password){
              return cb('2', null);
          }
          if (rows.length) {
              return cb('1', null);
          } else {
              // if there is no user with that email
              // create the user
              bcrypt.hash(password, 10, function(err, hash) {
              password=hash;
              var email = username;
              var newUserMysql = {email, password};
              var insertQuery = "INSERT INTO "+dbconfig.tables.users.table_name+" ( "+dbconfig.tables.users.email+", "+dbconfig.tables.users.password+" ) values (?,?);";
              connection.query(insertQuery,[newUserMysql.email, newUserMysql.password],function(err, rows) {
                if(err) console.log(err);
                  newUserMysql.id = rows.insertId;
                  return cb(null, newUserMysql);
              });
            });
          }
      });
  };

  exports.changeEmail = function(username, id, cb) {
      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      connection.query("SELECT * FROM "+dbconfig.tables.users.table_name+" WHERE "+dbconfig.tables.users.id+" = '"+id+"';", function(err, rows) {
          if (err){
            console.log(err);
              return cb(err, null);
            }
          if(!username){
              return cb(null, '1'); //Емейл пустой
          }
          if (!rows.length) {
              return cb(null,'2'); //Что-то пошло не так, id не существует
          } else {
            connection.query("SELECT * FROM "+dbconfig.tables.users.table_name+" WHERE "+dbconfig.tables.users.email+" = '"+username+"';", function(err, rows){
              if(rows.length)
                return cb(null,'3');
            });
            var insertQuery = "UPDATE "+dbconfig.tables.users.table_name+" SET "+dbconfig.tables.users.email+"='"+username+"' WHERE "+dbconfig.tables.users.id+"="+id+";";
            connection.query(insertQuery,function(err, rows) {
              if(err) console.log(err);
              return cb(null,'4'); //Успешно
            });
          }
      });
  };