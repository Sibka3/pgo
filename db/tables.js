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
  connection.query("SELECT * FROM "+dbconfig.tables.users.table_name+" WHERE "+dbconfig.tables.users.email+" = '"+username+"';", function(err, rows) {
    if (err)
     return cb(err, null);
    if(!username || !password){
      return cb('2', null);
    }
    if (rows.length) {
      return cb('1', null);
    } else {
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

exports.addBtcWallet = function(wallet, id, cb) {
  if(!wallet){
    return cb(null, 15); //Пустой кошелек
  }
  connection.query("SELECT * FROM "+dbconfig.tables.btcwallets.table_name+" WHERE "+dbconfig.tables.btcwallets.btcwallet_address+" = '"+wallet+"';", function(err, rows) {
    if(rows.length){
      return cb(null, 16);//Кошелек существует в системе
    }
    var insertQuery = "INSERT INTO "+dbconfig.tables.btcwallets.table_name+" ( "+dbconfig.tables.btcwallets.btcwallet_address+" ) values ( "+wallet+" );";
    connection.query(insertQuery, function(err, rows) {
      if(err) {
        console.log(err);
        return cb(err, null);
      }
      var insertQuery = "INSERT INTO "+dbconfig.tables.users_to_btcwallets.table_name+" ( "+dbconfig.tables.users_to_btcwallets.btcwallet_id+", "+dbconfig.tables.users_to_btcwallets.user_id+" ) values ( "+rows.insertId+", "+id+" );";
      connection.query(insertQuery, function(err, rows) {
        if(err) {
          console.log(err);
          return cb(err, null);
        }
        return cb(null, 17); //Успешно
      });
    });
  });
};

exports.changePassword = function(old_pswd, new_pswd, id, cb) {
  connection.query("SELECT * FROM "+dbconfig.tables.users.table_name+" WHERE "+dbconfig.tables.users.id+" = '"+id+"';", function(err, rows) {
    if (err){
      console.log(err);
      return cb(err, null);
    }
    if(!old_pswd){
      if(!new_pswd){
        return cb(null, 14);
      }
      return cb(null, 10);//Нет старого пароля
    }
    if(!new_pswd)
      return cb(null, 11);//Нет нового пароля
    if(!bcrypt.compareSync(old_pswd, rows[0][dbconfig.tables.users.password]))
      return cb(null, 12); //Пароли не совпадают
    bcrypt.hash(new_pswd, 10, function(err, hash){
      var insertQuery = "UPDATE "+dbconfig.tables.users.table_name+" SET "+dbconfig.tables.users.password+"='"+hash+"' WHERE "+dbconfig.tables.users.id+"="+id+";";
      connection.query(insertQuery,function(err, rows) {
        if(err) console.log(err);
        return cb(null,13); //Успешно
      });
    });
  });
};

exports.changeName = function(first_name, last_name, id, cb) {
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
    if (err) { return cb(err, null); }
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

exports.displayBtcWallets = function(id, cb) {
  var insertQuery = "\
    select btc."+dbconfig.tables.btcwallets.btcwallet_address+"\
    from "+dbconfig.tables.btcwallets.table_name+" as btc inner join\
    "+dbconfig.tables.users_to_btcwallets.table_name+" as usrs on \
    btc."+dbconfig.tables.btcwallets.btcwallet_id+" = \
    usrs."+dbconfig.tables.users_to_btcwallets.btcwallet_id+" where \
    usrs."+dbconfig.tables.users_to_btcwallets.user_id+" = "+id+";"
  connection.query(insertQuery, function(err, rows){
    if (err){
      console.log(err);
      return cb(null, null);
    }
    if(!rows.length)
      return cb(null, 18);
    return cb(null, rows);
  });
};