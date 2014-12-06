var mysql = require('./sqlDao.js');
var assert = require("assert");

describe('home', function(){

	describe('displayProducts()', function(){

		it('should display Products without error', function(done){

			mysql.displayProduct(function(err,rows){

				if (err) {

					throw err;

				} else {

					console.log(" no error");

					console.log(rows);

					done();

				}

			});

		});

	});

});


describe('home', function(){

	describe('insertCategories()', function(){

		it('should Insert Categories without error', function(done){

			mysql.insertCat(function(err, results) {

				if (err) {

					throw err;

				} else {

					console.log(" no error");

					console.log(results);

					done();

				}

			}, "Bathing");

		});

	});

});

describe('home', function(){

	describe('deleteCategories()', function(){

		it('should delete Categories without error', function(done){

			mysql.deleteCat(function(err, results) {

				if (err) {

					throw err;

				} else {

					console.log(" no error");

					console.log(results);

					done();

				}

			}, "Bathing");

		});

	});

});

describe('home', function(){

	describe('doSignIn()', function(){

		it('should validate User without error', function(done){

			mysql.validateUser(function(err,rows){
				if (err) throw err;
				console.log(" no error");
				console.log(rows);
				done();
			}, 'sru@ebayapp.com', 'sruthi123');

		});

	});

});


describe('home', function(){

	describe('updateLastLogin()', function(){

		it('should update User without error', function(done){

			mysql.updateLastLogin(function(err,rows){
				if (err) throw err;
				console.log(" no error");
				console.log(rows);
				done();
			}, 'apu@ebayapp.com');

		});

	});

});
