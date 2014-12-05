var mysql = require('./mysql.js');

var assert = require("assert");

 

describe('home', function(){

describe('doSignIn()', function(){

it('should validate User without error', function(done){

 

//Replace credentials

var query = "select * from person where EmailId='sru@ebayapp.com' and password='sruthi123'";

mysql.fetchData(function(err, results) {

if (err) {

throw err;

} else {

     console.log(" no error");

     var fName = results[0].FirstName;

     console.log(fName);

        assert.equal("Sru",fName);

  done();

}

}, query);

});

});

});

 

describe('home', function(){

describe('displayProducts()', function(){

it('should display Products without error', function(done){

var query = "select * from product";

mysql.fetchData(function(err, results) {

if (err) {

throw err;

} else {

     console.log(" no error");

     console.log(results);

  done();

}

}, query);

});

});

});