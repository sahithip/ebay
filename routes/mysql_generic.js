var mysql = require( 'mysql' );
var poolModule = require('generic-pool');

var connectParams = {
		'hostname': 'localhost',
		'user': 'root',
		'password': 'admin',
		'database': 'accounts'
}

var pool = poolModule.Pool({
	name : 'mysql',
	create : function(callback) {
		var db = new mysql.createConnection(connectParams);
		db.connect(function(error) {
			callback(error, db);
		});
	},
	destroy : function(db) { db.end(); },
	max     : 100,
	idleTimeoutMillis : 3000,
	log : true
});

function fetchData(callback,sqlQuery){

	pool.acquire(function(error, db) {
		if ( error ) return console.log("Failed to connect");
		
		db.query(sqlQuery,function(error, rows, columns){
			if ( error ) {
				console.log("Error on query");
			} else {
				console.log(rows);
				callback(error, rows);
			}
			pool.release(db);
		});
	});
}


exports.fetchData=fetchData;