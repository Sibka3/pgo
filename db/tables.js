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
              'password':rows[0][dbconfig.tables.users.password],
              'type':rows[0][dbconfig.tables.users.user_type]
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
              'password':rows[0][dbconfig.tables.users.password],
              'type':rows[0][dbconfig.tables.users.user_type]
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
              return cb(null, 0); //Емейл пустой
          }
          if (!rows.length) {
              return cb(null,2); //Что-то пошло не так, id не существует
          } else {
            connection.query("SELECT * FROM "+dbconfig.tables.users.table_name+" WHERE "+dbconfig.tables.users.email+" = '"+username+"';", function(err, rows){
              if(rows.length)
                return cb(null,3);
              var insertQuery = "UPDATE "+dbconfig.tables.users.table_name+" SET "+dbconfig.tables.users.email+"='"+username+"' WHERE "+dbconfig.tables.users.id+"="+id+";";
              connection.query(insertQuery,function(err, rows) {
                if(err) console.log(err);
                return cb(null,4); //Успешно
              });
            });
          }
      });
  };

    exports.changeName = function(first_name, last_name, id, cb) {
      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      connection.query("SELECT * FROM "+dbconfig.tables.users.table_name+" WHERE "+dbconfig.tables.users.id+" = '"+id+"';", function(err, rows) {
          if (err){
            console.log(err);
            return cb(err, null);
          }
          let promise1 = new Promise((resolve, reject) => {
            var i=0;
            if(first_name){
              if (!rows.length) {
                  return cb(null,5); //Что-то пошло не так, id не существует
              } else {
                var insertQuery = "UPDATE "+dbconfig.tables.users.table_name+" SET "+dbconfig.tables.users.first_name+"='"+first_name+"' WHERE "+dbconfig.tables.users.id+"="+id+";";
                connection.query(insertQuery,function(err, rows) {
                  if(err) console.log(err);
                  i+=1;
                  resolve(i);
                });
              }
            }
            else
              resolve(i);
          });
          let promise2 = new Promise((resolve, reject) => {
            var i=0;
            if(last_name){
              if (!rows.length) {
                return cb(null,5); //Что-то пошло не так, id не существует
              } else {
                var insertQuery = "UPDATE "+dbconfig.tables.users.table_name+" SET "+dbconfig.tables.users.last_name+"='"+last_name+"' WHERE "+dbconfig.tables.users.id+"="+id+";";
                connection.query(insertQuery,function(err, rows) {
                  if(err) console.log(err);
                  i+=2;
                  resolve(i);
                });
              }
            }
            else
              resolve(i);
          });
          var i=6;
          promise1
            .then(
              result => {
                i+=result;
                promise2
                  .then(
                    result => {
                      i+=result;
                      return cb(null, i);
                    }
                  );
              }
            );
          
      });
  };

  exports.displayUser = function(user, cb) {
    exports.findById(user,function (err, user1) {
      if (err) { res.render('personal'); }
      var us = '';
      if(user1.first_name){
        us= user1.first_name;
        if(user1.last_name){
          us= us + ' ' +user1.last_name;
        }
      }else if(user1.last_name){
        us= user1.last_name;
      }else{
        us=user1.email;
      }
    return cb(null, us);
    });
  };