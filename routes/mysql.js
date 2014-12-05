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

exports.fetchData=fetchData;