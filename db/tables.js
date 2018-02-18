var mysql = require('mysql');
var bcrypt = require('bcrypt');
var crypyo = require('crypto');
var dbconfig = require('./database.js');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);
//./\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..
///..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\.
//....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\
exports.findById = function(id, cb) {
  process.nextTick(function() {
    connection.query("SELECT * FROM \
      "+dbconfig.tables.users.table_name+" \
      WHERE "+dbconfig.tables.users.id+" = \
      '"+id+"'", function(err, rows){
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
//./\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..
///..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\.
//....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\
exports.findByUsername = function(username, cb) {
  process.nextTick(function() {
    connection.query("SELECT * FROM \
      "+dbconfig.tables.users.table_name+" \
      WHERE "+dbconfig.tables.users.email+" \
      = ?",username, function(err, rows){
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
//./\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..
///..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\.
//....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\
exports.addUser = function(key, cb) {
  var query = "select * from \
    "+dbconfig.tables.key_email_pass.table_name+" \
    where "+dbconfig.tables.key_email_pass.user_key+"= \
    '"+key+"' ;";
  connection.query(query, function(err, rows){
    if(err) console.log(err);
    if(!rows.length)
      return cb(null, 1); //ключ невалидный
    var email = rows[0][dbconfig.tables.key_email_pass.user_email];
    var password = rows[0][dbconfig.tables.key_email_pass.user_pass_hash];
    var insertQuery = "INSERT INTO \
    "+dbconfig.tables.users.table_name+" \
    ( "+dbconfig.tables.users.email+", \
    "+dbconfig.tables.users.password+" \
    ) values (?,?);";
    connection.query(insertQuery,[email, password],
      function(err, rows1) {
      if(err) console.log(err);
      var removeQuery = "delete from \
      "+dbconfig.tables.key_email_pass.table_name+" \
      where "+dbconfig.tables.key_email_pass.user_key+"=\
      '"+key+"';";
      connection.query(removeQuery, function(err, rows2){
        if(err) console.log(err);
        return cb(null, 2);
      });
    });
  });
};
//./\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..
///..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\.
//....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\
exports.changeEmail = function(username, id, cb) {
  if(!username)
    return cb(null, 0); //Емейл пустой

  connection.query("SELECT * FROM \
    "+dbconfig.tables.users.table_name+" \
    WHERE "+dbconfig.tables.users.email+" = \
    '"+username+"';", function(err, rows){
    if(rows.length)
      return cb(null,3);
    var insertQuery = "UPDATE \
    "+dbconfig.tables.users.table_name+" \
    SET "+dbconfig.tables.users.email+"=\
    '"+username+"' WHERE \
    "+dbconfig.tables.users.id+"="+id+";";
    connection.query(insertQuery,function(err, rows) {
      if(err) console.log(err);
      return cb(null,4); //Успешно
    });
  });
};
//./\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..
///..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\.
//....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\
exports.addBtcWallet = function(wallet, id, cb) {
  if(!wallet){
    return cb(null, 15); //Пустой кошелек
  }
  connection.query("SELECT * FROM \
    "+dbconfig.tables.btcwallets.table_name+" WHERE \
    "+dbconfig.tables.btcwallets.btcwallet_address+" \
    = '"+wallet+"';", function(err, rows) {
    if(rows.length){
      connection.query("SELECT * FROM \
        "+dbconfig.tables.users_to_btcwallets.table_name+" WHERE \
        "+dbconfig.tables.users_to_btcwallets.btcwallet_id+" \
        = '"+rows[0][dbconfig.tables.btcwallets.btcwallet_id]+"\
        ';", function(err, rows1){
        if(rows1.length){
          return cb(null, 16);//Кошелек существует в системе
        }
        var insertQuery = "INSERT INTO \
        "+dbconfig.tables.users_to_btcwallets.table_name+" \
        ( "+dbconfig.tables.users_to_btcwallets.btcwallet_id+", \
        "+dbconfig.tables.users_to_btcwallets.user_id+" \
        ) values ( "+rows[0][dbconfig.tables.btcwallets.btcwallet_id]+", "+id+" );";
        connection.query(insertQuery, function(err, rows) {
          if(err) {
            console.log(err);
            return cb(err, null);
          }
          return cb(null, 17); //Успешно
        });
      });
    }
    else{
      var insertQuery = "INSERT INTO \
      "+dbconfig.tables.btcwallets.table_name+" \
      ( "+dbconfig.tables.btcwallets.btcwallet_address+" \
      ) values ( '"+wallet+"' );";
      connection.query(insertQuery, function(err, rows) {
        if(err) {
          console.log(err);
          return cb(err, null);
        }
        var insertQuery = "INSERT INTO \
        "+dbconfig.tables.users_to_btcwallets.table_name+" \
        ( "+dbconfig.tables.users_to_btcwallets.btcwallet_id+", \
        "+dbconfig.tables.users_to_btcwallets.user_id+" \
        ) values ( "+rows.insertId+", "+id+" );";
        connection.query(insertQuery, function(err, rows) {
          if(err) {
            console.log(err);
            return cb(err, null);
          }
          return cb(null, 17); //Успешно
        });
      }); 
    }
  });
};
//./\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..
///..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\.
//....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\
exports.deleteBtcWallet = function(wallet, cb) {
  //if(!wallet){
  //  return cb(null, 15); //Пустой кошелек
  //}
  var insertQuery = "\
    delete usrs.* from \
    "+dbconfig.tables.users_to_btcwallets.table_name+" \
    as usrs inner join "+dbconfig.tables.btcwallets.table_name+" \
    as btc on btc."+dbconfig.tables.btcwallets.btcwallet_id+"=\
    usrs."+dbconfig.tables.users_to_btcwallets.btcwallet_id+" \
    where btc."+dbconfig.tables.btcwallets.btcwallet_address+"=\
    '"+wallet[dbconfig.tables.btcwallets.btcwallet_address]+"';";
    connection.query(insertQuery, function(err, rows){
      if(err){
        cb(err, null);
      }
      return cb(null, 18);
    });
};
//./\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..
///..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\.
//....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\
exports.changePassword = function(old_pswd, new_pswd, id, cb) {
  connection.query("SELECT * FROM \
    "+dbconfig.tables.users.table_name+" \
    WHERE "+dbconfig.tables.users.id+" = \
    '"+id+"';", function(err, rows) {
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
      var insertQuery = "UPDATE \
      "+dbconfig.tables.users.table_name+" \
      SET "+dbconfig.tables.users.password+"=\
      '"+hash+"' WHERE "+dbconfig.tables.users.id+"="+id+";";
      connection.query(insertQuery,function(err, rows) {
        if(err) console.log(err);
        return cb(null,13); //Успешно
      });
    });
  });
};
//./\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..
///..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\.
//....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\
exports.changeName = function(first_name, last_name, id, cb) {
  let promise1 = new Promise((resolve, reject) => {
    var i=0;
    if(first_name){
      var insertQuery = "UPDATE \
      "+dbconfig.tables.users.table_name+" \
      SET "+dbconfig.tables.users.first_name+"\
      ='"+first_name+"' WHERE \
      "+dbconfig.tables.users.id+"="+id+";";
      connection.query(insertQuery,function(err, rows) {
        if(err) console.log(err);
        i+=1;
        resolve(i);
      });
    }
    else
      resolve(i);
  });
  let promise2 = new Promise((resolve, reject) => {
    var i=0;
    if(last_name){
      var insertQuery = "UPDATE \
      "+dbconfig.tables.users.table_name+" \
      SET "+dbconfig.tables.users.last_name+"\
      ='"+last_name+"' WHERE \
      "+dbconfig.tables.users.id+"="+id+";";
      connection.query(insertQuery,function(err, rows) {
        if(err) console.log(err);
        i+=2;
        resolve(i);
      });
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
};
//./\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..
///..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\.
//....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\
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
//./\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..
///..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\.
//....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\
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
//./\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..
///..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\.
//....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\
exports.addConfirmKey = function(username, password, cb) {
  if(!username || !password)
    return cb(null, 2);
  var query = "SELECT * from \
    "+dbconfig.tables.users.table_name+" \
    where "+dbconfig.tables.users.email+" = \
    '"+username+"';";
    connection.query(query, function(err, rows) {
      if(err) console.log(err);
      if(rows.length)
        return cb(null, 0); //емейл уже есть в базе
      bcrypt.hash(password, 10, function(err, hash) {
        require('crypto').randomBytes(48, function(ex, buf) {
          token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
          var insertQuery = " insert into \
          "+dbconfig.tables.key_email_pass.table_name+" \
          ("+dbconfig.tables.key_email_pass.user_email+", \
          "+dbconfig.tables.key_email_pass.user_pass_hash+", \
          "+dbconfig.tables.key_email_pass.user_key+") \
          values ('"+username+"', '"+hash+"', '"+token+"') \
          on duplicate key update \
          "+dbconfig.tables.key_email_pass.user_email+"='"+username+"', \
          "+dbconfig.tables.key_email_pass.user_key+"='"+token+"';";
          connection.query(insertQuery,function(err, rows){
            if(err) console.log(err);
            return cb(null, token);
          });
        });
      });
    });
};
//./\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..
///..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\.
//....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\
exports.addRecoveryKey = function(username, cb) {
  if(!username)
    return cb(null, 0); //пустой емейл
  var query = "SELECT * from \
    "+dbconfig.tables.users.table_name+" \
    where "+dbconfig.tables.users.email+" = \
    '"+username+"';";
    connection.query(query, function(err, rows) {
      if(err) console.log(err);
      if(!rows.length)
        return cb(null, 1); //емейла нет в базе
      require('crypto').randomBytes(48, function(ex, buf) {
        token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
        var insertQuery = " insert into \
        "+dbconfig.tables.key_email.table_name+" \
        ("+dbconfig.tables.key_email.user_email+", \
        "+dbconfig.tables.key_email.user_key+") \
        values ('"+username+"', '"+token+"') \
        on duplicate key update \
        "+dbconfig.tables.key_email.user_email+"='"+username+"', \
        "+dbconfig.tables.key_email.user_key+"='"+token+"';";
        connection.query(insertQuery,function(err, rows){
          if(err) console.log(err);
          return cb(null, token);
        });
      });
    });
};
//./\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..../\..
///..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\../..\.
//....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\/....\
exports.generateNewPass = function(key, cb) {
  var query = "select * from \
    "+dbconfig.tables.key_email.table_name+" \
    where "+dbconfig.tables.key_email.user_key+"= \
    '"+key+"' ;";
  connection.query(query, function(err, rows){
    if(err) console.log(err);
    if(!rows.length)
      return cb(null, 1); //ключ невалидный
    require('crypto').randomBytes(48, function(ex, buf) {
      token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
      var email = rows[0][dbconfig.tables.key_email.user_email];
      var password = token;
      bcrypt.hash(password, 10, function(err, hash) {
        var insertQuery = "INSERT INTO \
        "+dbconfig.tables.users.table_name+" \
        ( "+dbconfig.tables.users.email+", \
        "+dbconfig.tables.users.password+" \
        ) values (?,?) on duplicate key update \
        "+dbconfig.tables.users.email+"='"+email+"', \
        "+dbconfig.tables.users.password+"='"+hash+"';";
        connection.query(insertQuery,[email, hash],
          function(err, rows1) {
          if(err) console.log(err);
          var removeQuery = "delete from \
          "+dbconfig.tables.key_email.table_name+" \
          where "+dbconfig.tables.key_email.user_key+"=\
          '"+key+"';";
          connection.query(removeQuery, function(err, rows2){
            if(err) console.log(err);
            return cb(email, password);
          });
        });
      });
    });
  });
};