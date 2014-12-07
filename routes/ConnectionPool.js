function ConnectionPool(num_conns)
{
    this.ConnectionPool = [];
    for(var i=0; i < num_conns; ++i)
        this.ConnectionPool.push(createConn());
    this.last = 0;
}

function createConn() {
	var mysql      = require('mysql');
  var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database: 'cmpe273project'
});
connection.connect(function(err) {
	  if ( !err ) {
	   // console.log("Connected to MySQL");
	  } else if ( err ) {
	    console.log(err);
	  }
	});
	return connection;
}



ConnectionPool.prototype.get = function()
{
	var threshold = 5;
    var connection = this.ConnectionPool[this.last];
    this.last++;
    /*if (this.last == this.ConnectionPool.length){ // cyclic increment
       this.last = 0;
    }*/
    if(this.last == threshold){
   
   	        this.ConnectionPool.push(createConn());
 
  
    }
    return connection;
};

ConnectionPool.prototype.release = function(mysqlConnection)
{
	 this.last--;
	 this.ConnectionPool.push(mysqlConnection);
};

module.exports = ConnectionPool;