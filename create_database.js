/**
 * Created by barrett on 8/28/14.
 */

var mysql = require('mysql');
var dbconfig = require('./db/database')
var connection = mysql.createConnection(dbconfig.connection);

connection.query('DROP DATABASE ' + dbconfig.database);

connection.query("CREATE DATABASE " + dbconfig.database + " DEFAULT CHARACTER SET utf8 DEFAULT COLLATE utf8_general_ci;");

connection.query('USE ' + dbconfig.database);

connection.query('\
CREATE TABLE `users` (\
	`user_id` INT NOT NULL AUTO_INCREMENT,\
	`user_first_name` varchar(255),\
	`user_last_name` varchar(255),\
	`user_email` varchar(255) NOT NULL UNIQUE,\
	`user_pass_hash` varchar(255) NOT NULL,\
	`user_type` INT DEFAULT 0,\
	PRIMARY KEY (`user_id`)\
)');

connection.query('\
CREATE TABLE `users_to_btcwallets` (\
	`user_id` INT NOT NULL,\
	`btcwallet_id` INT NOT NULL,\
	PRIMARY KEY (`user_id`,`btcwallet_id`)\
)');

connection.query('\
CREATE TABLE `key_email_pass` (\
	`user_email` varchar(255) NOT NULL UNIQUE,\
	`user_pass_hash` varchar(255) NOT NULL,\
	`user_key` varchar(255) NOT NULL\
)');

connection.query('\
CREATE TABLE `key_email` (\
	`user_email` varchar(255) NOT NULL UNIQUE,\
	`user_key` varchar(255) NOT NULL\
)');

connection.query('\
CREATE TABLE `btcwallets` (\
	`btcwallet_id` INT NOT NULL AUTO_INCREMENT,\
	`btcwallet_address` varchar(255) NOT NULL UNIQUE,\
	`btcwallet_name` varchar(255),\
	PRIMARY KEY (`btcwallet_id`)\
)');

connection.query('\
CREATE TABLE `capitalization_factors` (\
	`factor_id` INT NOT NULL AUTO_INCREMENT,\
	`factor_date` DATETIME NOT NULL,\
	PRIMARY KEY (`factor_id`)\
)');

connection.query('\
CREATE TABLE `btctransactions` (\
	`trans_id` INT NOT NULL AUTO_INCREMENT,\
	`trans_count` FLOAT NOT NULL,\
	`trans_datetime` DATETIME NOT NULL,\
	PRIMARY KEY (`trans_id`)\
)');

connection.query('\
CREATE TABLE `users_to_btctrans` (\
	`user_id` INT NOT NULL,\
	`trans_id` INT NOT NULL,\
	PRIMARY KEY (`user_id`,`trans_id`)\
)');



console.log('Success: Database Created!')

connection.end();
