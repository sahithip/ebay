var ejs= require('ejs');
var mysql = require('mysql');
var ConnectionPool = require("./ConnectionPool.js");
var pooling = new ConnectionPool(100);

function getConnection(){
	var connection = mysql.createConnection({
	    host     : 'localhost',
	    user     : 'root',
	    password : 'admin',
	    database : 'accounts'
	});
	connection.getConnection();
}


function fetchData(callback,sqlQuery){
	
	console.log("\nSQL Query::"+sqlQuery);
	
	var connection=pooling.get();
	
	connection.query(sqlQuery, function(err, rows, fields) {
		if(err){
			console.log("ERROR: " + err.message);
		}
		else 
		{	// return err or result
			callback(err, rows);
			pooling.release(connection); 
		}
	});
	/*console.log("\nConnection closed..");
	connection.end();*/
}	

exports.fetchData=fetchData;