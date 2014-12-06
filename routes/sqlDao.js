var ejs= require('ejs');
var mysql = require('mysql');

function getConnection(){
	return mysql.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : 'root',
		database : 'cmpe273project'
	});
}

function getDateTime() {

	var date = new Date();

	var hour = date.getHours();
	hour = (hour < 10 ? "0" : "") + hour;

	var min = date.getMinutes();
	min = (min < 10 ? "0" : "") + min;

	var sec = date.getSeconds();
	sec = (sec < 10 ? "0" : "") + sec;

	var year = date.getFullYear();

	var month = date.getMonth() + 1;
	month = (month < 10 ? "0" : "") + month;

	var day = date.getDate();
	day = (day < 10 ? "0" : "") + day;

	return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

}

function fetchData(callback,sqlQuery){

	console.log("\nSQL Query::"+sqlQuery);

	var connection=getConnection();

	connection.query(sqlQuery, function(err, rows, fields) {
		if(err){
			console.log("ERROR: " + err.message);
		}
		else 
		{	// return err or result
			callback(err, rows);
		}
	});
	console.log("\nConnection closed..");
	connection.end();
}	


 function validateUser (callback, emailId, password) {
	
	var sql = 'SELECT * FROM person WHERE EmailId = \"' + emailId
	+ '\" AND PASSWORD = \"' + password + '\"';
	console.log(sql);
	fetchData(function(err, rows) {
		if (rows.length !== 0) {
			console.log("DATA : " + JSON.stringify(rows));
			callback(err, rows);
		} else {
			console.log("error is:" + err);
			callback(err, null);
		}
	},sql);
}

 function displayProduct (callback) {
		
		var sql = 'SELECT * FROM product';
		console.log(sql);
		fetchData(function(err, rows) {
			if (rows.length !== 0) {
				console.log("DATA : " + JSON.stringify(rows));
				callback(err, rows);
			} else {
				console.log("error is:" + err);
				callback(err, null);
			}
		},sql);
	}

 function insertCat(callback, categoryName) {
		
		var sql = "insert into category values('" +categoryName +"')";
		console.log(sql);
		fetchData(function(err, rows) {
			if (rows.length !== 0) {
				console.log("DATA : " + JSON.stringify(rows));
				callback(err, rows);
			} else {
				console.log("error is:" + err);
				callback(err, null);
			}
		},sql);
	}
 
 function deleteCat(callback, categoryName) {
		
		var sql = "delete from  category where category = '" +categoryName + "'";
		console.log(sql);
		fetchData(function(err, rows) {
			if (rows.length !== 0) {
				console.log("DATA : " + JSON.stringify(rows));
				callback(err, rows);
			} else {
				console.log("error is:" + err);
				callback(err, null);
			}
		},sql);
	}
 
 function updateLastLogin (callback, emailId) {
		
		var sql = "update person set LastLogin = '" + getDateTime() + "' where EmailId = '" + emailId + "'";
		console.log(sql);
		fetchData(function(err, rows) {
			if (rows.length !== 0) {
				console.log("DATA : " + JSON.stringify(rows));
				callback(err, rows);
			} else {
				console.log("error is:" + err);
				callback(err, null);
			}
		},sql);
	}

exports.fetchData=fetchData;
exports.validateUser = validateUser;
exports.displayProduct=displayProduct;
exports.insertCat = insertCat;
exports.deleteCat = deleteCat;
exports.updateLastLogin = updateLastLogin;

