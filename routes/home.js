var ejs = require("ejs");
var mysqlconnection = require('mysql');
var mysql = require('./mysql_withpool.js');

//var redis = require("redis"), client = redis.createClient();

//client.on("error", function(err) { 

//console.log("Error " + err);

//});

//var CronJob = require('cron').CronJob;
function getDateTime() {
	return dateString(new Date());
}


function dateFromString(s){
	var parts = s.split(':');
	var date = new Date(parts[0], parts[1]-1, parts[2], parts[3], parts[4], parts[5]);
	return date;
}


function localAsUTCDate(d){
	var tz_offset = d.getTimezoneOffset();
	var time = d.getTime();
	var utc = time + tz_offset * 60000;
	var date = new Date(0);
	date.setUTCMilliseconds(utc);
	return date;
}


function utcAsLocalDate(d){
	var tz_offset = d.getTimezoneOffset();
	var time = d.getTime();
	var utc = time - tz_offset * 60000;
	var date = new Date(0);
	date.setUTCMilliseconds(utc);
	return date;
}


function dateString(date){
	
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


function clientDateStringToDateString(client_date_string){
	var date = localAsUTCDate(new Date(client_date_string));
	return dateString(date);
}


function signUp(req, res) {
	ejs.renderFile('./views/Register.html', 
			{message : req.param('m') || ''},
			function(err, result) {
		if (!err) {
			res.end(result);
		} else {
			res.end('An error occurred');
			console.log(err);
		}
	});
}

function signIn(req, res) {
	
	
	if (req.session.user) {
		if (req.session.user["UserType"] !="A"){	
			return res.redirect('/bids/current');
		}
		else{
			res.render("admin_landing.ejs",{user:req.session.user});
			}}
		
	console.log("Here----");
	ejs.renderFile('./views/signIn.html', {
		message : req.param('m') || ''
	}, function(err, result) {
		// render on success
		if (!err) {
			res.end(result);
		}
		// render or error
		else {
			res.end('An error occurred');
			console.log(err);
		}
	});
}

function doSignIn(req, res) {
	var email = req.param("inputEmail");
	var password = req.param("inputPassword");
	var query = "select * from person where EmailId='" + email
	+ "' and password='" + password + "'";
	var queryCat = "select * from category";
	validateSignIn(email,password, function(result) {
	if( password.indexOf("'")!=-1 || password.indexOf(" ")!=-1 || password.indexOf("\"")!=-1 || email.indexOf("'")!=-1 || email.indexOf(" ")!=-1 || email.indexOf("\"")!=-1)
		{
		console.log("sql injection error");
		return res.redirect('/signIn?m=' + 'SQL injection tried!!!!');
		}
	else{
		mysql.fetchData(function(err, results) {
			if (err) {
				throw err;
			} 
			else {
				mysql.fetchData(function(caterr, catresults) {
					if (caterr) {
						throw caterr;
					}
					else {
						if (!results.length) {
							return res.redirect('/signIn?m='
									+ 'Invalid Credentials');
						}
						var user = results[0];
						delete user['Password'];
						req.session.user = user;
						req.session.allCategories = catresults;
							if (req.session.user["UserType"] !="A"){	
								res.redirect('/bids/current');
							}
							else{
								res.render("admin_landing.ejs",{user:req.session.user});
							}
					}
				}, queryCat);
			}
		}, query);
	} 
});
}

// WITH CACHING:
/*function doSignIn(req, res){
	var email = req.param("inputEmail");
	var password = req.param("inputPassword");

	var query = "select * from person where EmailId='"+email+"' and password='" + password + "'";
	var queryCat = "select * from category";

	validateSignIn(email,password, function(result) {

	if( password.indexOf("'")!=-1 || password.indexOf(" ")!=-1 || password.indexOf("\"")!=-1 || email.indexOf("'")!=-1 || email.indexOf(" ")!=-1 || email.indexOf("\"")!=-1)
		{
		console.log("sql injection error");
		return res.redirect('/signIn?m=' + 'SQL injection tried!!!!');

		}
	else{
	
	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
		
				client.get("CategoryCache", function(err, reply) {
				if (reply === null) {
					// if not cached
					console.log("Data not available in cache!");
					// cache SQL result, set cache(key,value)
					
					mysql.fetchData(function(caterr, catresults) {
						if (caterr) {
							throw caterr;
						} else {
					
					if(!results.length){
						return res.redirect('/signIn?m=' + 'Invalid Credentials');
					}
					var user = results[0];
					delete user['Password'];
					req.session.user = user;
					req.session.allCategories = catresults;

					res.redirect('/bids/current');
					if (req.session.user["UserType"] !="A"){	
						res.redirect('/bids/current');
					}
					else{
						res.render("admin_landing.ejs",{user:req.session.user});
					}

					
					
					client.set("CategoryCache",  JSON.stringify(catresults));
					console.log("Fetching categories  from DB");
					console.log(JSON.stringify(catresults));
					
						}
					},queryCat);	
				}else {
					// if cached
					console.log("Found data from cache!");
					console.log(" reply " +JSON.parse(reply));
					var cacheResults=JSON.parse(reply);
					if(!cacheResults.length){
						return res.redirect('/signIn?m=' + 'Invalid Credentials');
					}
					
					var user = cacheResults[0];
					delete user['Password'];
					req.session.user = user;
					req.session.allCategories = JSON.parse(reply);
					console.log(req.session.allCategories);
						
						if (req.session.user["UserType"] !="A"){	
								res.redirect('/bids/current');
							}
							else{
								res.render("admin_landing.ejs",{user:req.session.user});
							}

		          }
				});
		} //else for mysql fetch data
	
	}, query);
	}
	});
}
*/

function signOut(req, res) {
	req.session.destroy();
	res.redirect('/');
}

function showProfile(req, res) {
	ejs.renderFile('./views/landing.html', function(err, result) {
		// render on success
		if (!err) {
			res.end(result);
		}
		// render or error
		else {
			res.end('An error occurred');
			console.log(err);
		}
	});
}

function afterSignIn(req, res) {
	// / Checking username and password
	var email = req.param("inputEmail");
	var password = req.param("inputPassword");
	var query = "select * from person where EmailId='" + email + "'";
	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			if (results.length > 0
					&& results[0].Password == req.param("inputPassword")) {
				console.log("valid Login");
				req.session.email = req.param("inputEmail");
				ejs.renderFile('./views/Profile.html', function(err, result) {
					// render on success
					if (!err) {
						res.end(result);
					}
					// render or error
					else {
						res.end('An error occurred');
						console.log(err);
					}
				});
			} else {

				ejs.renderFile('./views/signIn.html', {
					message : "Invalid Login"
				}, function(err, result) {
					// render on success
					if (!err) {
						res.end(result);
					}
					// render or error
					else {
						res.end('An error occurred');
						console.log(err);
					}
				});
			}
		}
	}, query);

}

function afterSignUp(req, res) {
	var current_Date_Time = getDateTime();

	validateSignUp(req.param("inputPassword") , req.param("inputFirstName") ,req.param("inputLastName"), req.param("inputEmail"), req.param("inputState"), req.param("inputZipcode"),req.param("SSNNumber").replace(/[^0-9]/g,''), function(result){

		if(result == "success"){
			var getUser = 'insert into person(EmailId,Password,FirstName,LastName,Address,City,State,ZipCode,LastLogin,UserType,MembershipNo) values ("'
				+ req.param("inputEmail")
				+ '", "'
				+ req.param("inputPassword")
				+ '","'
				+ req.param("inputFirstName")
				+ '", "'
				+ req.param("inputLastName")
				+ '", "'
				+ req.param("inputAddress")
				+ '","'
				+ req.param("inputCity")
				+ '", "'
				+ req.param("inputState")
				+ '", "'
				+ req.param("inputZipcode").replace(/[^0-9]/g,'')
				+ '", "'
				+ current_Date_Time
				+ '", "' 
				+ 'C'
				+ '","'
				+req.param("SSNNumber").replace(/[^0-9]/g,'')
				+ '")';

			console.log("Query is:" + getUser);
			var query1 = "select * from Person where Emailid = '"+req.param("inputEmail")+"';";
			mysql.fetchData(function(err, results) {
				if (err) {
					throw err;
				} else {
					if (!results){
						mysql.fetchData(function(err, results) {
							if (err) {
								throw err;
							}
						}, getUser);
				}
					else{
						res.redirect('/signUp?m='
								+ 'Already Registered');
					}
					}
			}, query1);
		}
		else {
			 res.redirect('/signUp?m='
					+ 'SignUp Error');
		}
	});

}
function sellProduct(req, res) {

	var getUser = 'update product set AvailableQuantity="'
			+ req.param('inputQuantity') + '" where ProductId="'
			+ req.param("inputProductId") + '"';
	console.log("Query is:" + getUser);

	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			var getUser1 = 'insert into productbid values ("'
					+ req.param("inputEmail") + '", "'
					+ req.param("inputProductId") + '","'
					+ req.param("BidPrice") + '", "' + req.param("BoughtFlag")
					+ '", "' + req.param("Rating") + '")';
			console.log("Query is:" + getUser1);
			mysql.fetchData(function(err, results) {
				if (err) {
					throw err;
				}
			}, getUser1);
		}
	}, getUser);
}

function displayProduct(req, res) {

	var getUser = "select * from product";
	console.log("Query is:" + getUser);

	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			ejs.renderFile('./views/displayElement.ejs', {
				results : results
			}, function(err, result) {
				// render on success
				if (!err) {
					res.end(result);
				}
				// render or error
				else {
					res.end('An error occurred');
					console.log(err);
				}
			});
		}
	}, getUser);
}

function viewProduct(req, res) {

	var getUser = "select * from ProductBid a right join Product b on a.ProductId = b.ProductId where b.ProductName = '"
			+ req.params.ProductName + "' and b.availablequantity>0 and a.quantity>0";
	console.log("Query is:" + getUser);

	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			console.log(" seller id :" + results[0]['SellerEmailId']);

			var getSeller = "select * from person where Emailid='"
					+ results[0]['SellerEmailId'] + "'";

			mysql.fetchData(function(err, results2) {
				if (err) {
					throw err;
				} else {

					res.render('activity/view_product.ejs', {
						result : results,
						seller : results2
					});

				}
			}, getSeller);

		}
	}, getUser);
}
function listAllAuctions(req, res) {
	// Current or all auctions
	var query = "select * from product where IsAuction = 'y' or IsAuction='Y'";
	mysql.fetchData(function(err, results) {
		if (err) {
			console.log(err);
			throw err;
		}
		ejs.renderFile('./views/Auctions', {
			allCategories : req.session.allCategories
		}, function(err, result) {
			// render on success
			if (!err) {
				res.end(result);
			}
			// render or error
			else {
				res.end('An error occurred');
				console.log(err);
			}
		});

	}, query);
	// ????????????????

}

function displayPersonDetails(req, res) {
	var usertype;
	var queryTwo;
	var query = "select * from person where EmailId='" + req.session.emailid
			+ "'";
	mysql.fetchData(function(err, results) {
		if (err) {
			console.log(err);
			throw err;
		}
		usertype = results[0].UserType;
		if (usertype == 'C') {
			queryTwo = "select * from productbid where EmailId='"
					+ req.session.emailid + "' and BoughtFlag='Y'";
		} else if (usertype == 'S') {
			queryTwo = "select * from product where EmailId='"
					+ req.session.emailid + "'";
		}

		mysql.fetchData(function(err1, results1) {
			if (err1) {
				console.log(err1);
				throw err1;
			}
			// ?????????????????
			ejs.renderFile('./views/Auctions', function(err, result) {
				// render on success
				if (!err) {
					res.end(result);
				}
				// render or error
				else {
					res.end('An error occurred');
					console.log(err);
				}
			});

		}, queryTwo);
	}, query);

}

function connect() {
	var connection = mysqlconnection.createConnection({
		host     : 'localhost',
		user     : 'root',
		//password : 'root',
		password : '',
		database: 'cmpe273project' //'eBay'
	});
		
	connection.connect();

	return connection;
}

function getProducts(callback) {
	// var connection = poolObject.get();
	var connection = connect();

	var eQuery = "SELECT * from Product";
	connection.query(eQuery, function(eerr, eRows, eFields) {
		if (eerr) {
			console.log("ERROR: " + eerr.message);
		} else {
			console.log("Products:" + JSON.stringify(eRows));
			callback(eerr, eRows);
		}

	});
	connection.end();
	// poolObject.release(connection);
}

function updateProduct(updateProduct, updateAttribute, updateValue) {
	var connection = connect();

	var eQuery = "UPDATE Product SET " + updateAttribute + "='" + updateValue
			+ "' WHERE ProductName='" + updateProduct + "'";

	connection.query(eQuery, function(eerr, eRows, eFields) {
		if (eerr) {
			console.log("ERROR: " + eerr.message);
		} else {
			console.log("Products:" + JSON.stringify(eRows));

		}

	});
	connection.end();
}

function createProduct(SellerEmail, ProductName, ProductCondition,
		ProductDetails, ProductCost, Category, AvailableQuantity, BidStartTime,
		BidEndTime, AuctionFlag) {
	var connection = connect();
	var eQuery = "INSERT INTO Product (ProductName,ProductCondition,ProductDetails,ProductCost,Category,AvailableQuantity,SellerEmailId,BidStartTime,BidEndTime,IsAuction) VALUES ('"
			+ ProductName
			+ "', '"
			+ ProductCondition
			+ "', '"
			+ ProductDetails
			+ "', '"
			+ ProductCost
			+ "', '"
			+ Category
			+ "', '"
			+ AvailableQuantity
			+ "', '"
			+ SellerEmail
			+ "', '"
			+ BidStartTime
			+ "', '" + BidEndTime + "', '" + AuctionFlag + "')";
	console.log(eQuery);
	connection.query(eQuery, function(eerr, eRows, eFields) {
		if (eerr) {
			console.log("ERROR: " + eerr.message);
		} else {
			console.log("Products:" + JSON.stringify(eRows));
			
			// Create the cron job if this product is a bid
//			if(AuctionFlag === 'Y'){
//				var end_dt = utcAsLocalDate(dateFromString(BidEndTime));
//				var now = new Date();
//				if(end_dt > now){
//					console.log('Creating a cron job for the biddable product');
//					var job = new CronJob(end_dt, function(){
//						var product_id = eRows.insertId;
//						console.log('Cronjob kicked off for product with id ' + product_id);
//						var bids_query = "select * from productbid where ProductId=" + product_id;
//						mysql.fetchData(function(err, results){
//							if(err){
//								console.log(err);
//								return;
//							}
//							var best_bid = null;
//							var max_bid_price = -1;
//							for(var i=0; i<results.length; i++){
//								if(results[i]['BidPrice'] > max_bid_price){
//									best_bid = results[i];
//									max_bid_price = best_bid['BidPrice'];
//								}
//							}
//							var update_query = "update productbid set BoughtFlag='Y' where ProductId=" + product_id + " and EmailId='" + best_bid['EmailId'] + "' and BidPrice=" + max_bid_price;
//							mysql.fetchData(function(err, results){
//								if(err){
//									console.log(err);
//									return;
//								}
//								console.log('Successfully completed bid');
//							}, udpate_query);
//						}, bids_query);
//					});
//				}
			//}
		}

	});
	connection.end();
}

function displayProducts(callback){
	var connection=connect();

	var eQuery = "SELECT * from Product";
	connection.query(eQuery,function(eerr,eRows,eFields){
		if(eerr)
		{
			console.log("ERROR: " + eerr.message);
		}
		else
		{
			console.log("Products:" + JSON.stringify(eRows));
			callback(eerr, eRows);
		}

	});
	connection.end();
	//poolObject.release(connection);
}

function displaySellers(callback) {
	// var connection = poolObject.get();
	var connection = connect();

	var eQuery = "SELECT * from Seller";
	connection.query(eQuery, function(eerr, eRows, eFields) {
		if (eerr) {
			console.log("ERROR: " + eerr.message);
		} else {
			console.log("Products:" + JSON.stringify(eRows));
			callback(eerr, eRows);
		}

	});
	connection.end();
	// poolObject.release(connection);
}

function displayCustomers(callback) {
	// var connection = poolObject.get();
	var connection = connect();

	var eQuery = "SELECT * from Customer";
	connection.query(eQuery, function(eerr, eRows, eFields) {
		if (eerr) {
			console.log("ERROR: " + eerr.message);
		} else {
			console.log("Products:" + JSON.stringify(eRows));
			callback(eerr, eRows);
		}

	});
	connection.end();
	// poolObject.release(connection);
}

// Sahithi
function sellerSignUp(req, res) {
	console.log(req.query.type);
	ejs.renderFile('./views/signUp.ejs', function(err, result) {
		if (!err) {
			res.end(result);
		} else {
			res.end('An error occurred');
			console.log(err);
		}
	});
}

function sellerSignIn(req, res) {

	ejs.renderFile('./views/signIn.ejs', function(err, result) {
		// render on success
		if (!err) {
			res.end(result);
		}
		// render or error
		else {
			res.end('An error occurred');
			console.log(err);
		}
	});
}

function sellerAfterSignUp(req, res) {
	var current_Date_Time = getDateTime();
	var getUser = 'insert into person values ("' + req.param("inputEmail")
			+ '", "' + req.param("inputPassword") + '","'
			+ req.param("inputFirstName") + '", "'
			+ req.param("inputSecondName") + '", "' + req.param("inputAddress")
			+ '","' + req.param("inputCity") + '", "' + req.param("inputState")
			+ '", "' + req.param("inputZipcode") + '", "' + current_Date_Time
			+ '", "' + 'S' + '")';
	console.log("Query is:" + getUser);

	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			ejs.renderFile('./views/displayElement.ejs', {
				results : results
			}, function(err, result) {
				// render on success
				if (!err) {
					res.end(result);
				}
				// render or error
				else {
					res.end('An error occurred');
					console.log(err);
				}
			});

		}
	}, getUser);
}

function searchItem(req, res) {

	var getUser = 'select * from productbid where ProductName ="'
			+ req.param("inputProductName") + '"';
	console.log("Query is:" + getUser);

	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			ejs.renderFile('./views/displayElement.ejs', {
				results : results
			}, function(err, result) {
				// render on success
				if (!err) {
					res.end(result);
				}
				// render or error
				else {
					res.end('An error occurred');
					console.log(err);
				}
			});
		}
	}, getUser);
}

function deleteExistingCustomer(req, res) {
	var deletePerson;
	var deleteCustomer;
	// var deleteProductBid;

	if (req.session.emailid != null) {
		deletePerson = "delete from person where EmailId = '"
				+ req.session.emailid + "'";
		deleteCustomer = "delete from customer where EmailId = '"
				+ req.session.emialid + "'";
		// Delete all entries from productbid table?
		// deleteProductBid = "delete from productbid where EmailId =
		// '"+req.session.emailid+"'";
	}
	mysql.fetchData(function(err1, results1) {
		if (err1) {
			console.log(err1);
			throw err1;
		}

	}, deletePerson);
	mysql.fetchData(function(err2, results2) {
		if (err2) {
			console.log(err2);
			throw err2;
		}
		ejs.renderFile('./views/login.ejs', function(err, result) {
			// render on success
			if (!err) {
				res.end(result);
			}
			// render or error
			else {
				res.end('An error occurred');
				console.log(err);
			}
		});

	}, deleteCustomer);

	/*
	 * mysql.fetchData(function(err3, results3) { if (err3) { console.log(err3);
	 * throw err3; }
	 *  }, deleteProductBid);
	 */

	// After deleting Customer redirect to Login Page
}

function displayProductDetails(req, res) {
	var productId = req.param('productId');
	var query = "select * from product where ProductId = '" + productId + "'";
	mysql.fetchData(function(err1, results1) {
		if (err1) {
			console.log(err1);
			throw err1;
		}
		// render here....
	}, query);

}

function inProgressBids(req, res) {
	var email = req.session.user.EmailId;
	var query = "select * from ProductBid a inner join Product b on a.ProductId = b.ProductId where a.EmailId = '"
			+ email + "' and b.BidEndTime > '" + getDateTime() + "'";
	mysql.fetchData(function(err, results) {
		res.render('activity/bids_in_progress.ejs', {
			allCategories : req.session.allCategories,
			bids : results
		});
	}, query);
}

function wonBids(req, res) {
	var email = req.session.user.EmailId;
	var query = "select * from ProductBid a inner join Product b on a.ProductId = b.ProductId where a.EmailId = '"
			+ email
			+ "' and lower(b.IsAuction) = 'y' and lower(a.BoughtFlag) = 'y'";
	mysql.fetchData(function(err, results) {
		console.log(results);
		/*res.render('activity/bids_won.ejs', {
			allCategories : req.session.allCategories,
			bids : results
		});*/
	}, query);
}

function lostBids(req, res) {
	var email = req.session.user.EmailId;
	var query = "select * from ProductBid a inner join Product b on a.ProductId = b.ProductId where a.EmailId = '"
			+ email
			+ "' and lower(b.IsAuction) = 'y' and lower(a.BoughtFlag) != 'y' and b.BidEndTime < '"
			+ getDateTime() + "'";
	mysql.fetchData(function(err, results) {
		console.log(results);
		res.render('activity/bids_missed.ejs', {
			allCategories : req.session.allCategories,
			bids : results
		});
	}, query);
}

function waitingProducts(req, res) {
	var email = req.session.user.EmailId;
	var query = "select * from product where SellerEmailId = '"
			+ email
			+ "' and ProductId not in (select ProductId from productbid where ProductId in (select ProductId from product where EmailId = '"
			+ email + "') and lower(BoughtFlag) = 'y')";
	
	mysql.fetchData(function(err, results) {
		console.log(results);
		res.render('activity/products_waiting.ejs', {
			allCategories : req.session.allCategories,
			products : results
		});
	}, query);
}

function soldProducts(req, res) {
	var email = req.session.user.EmailId;
	var query = "select * from productbid a inner join product b on a.ProductId = b.ProductId where b.SellerEmailId = '"
			+ email + "' and lower(BoughtFlag) = 'y'";
	mysql.fetchData(function(err, results) {
		console.log(results);
		res.render('activity/products_sold.ejs', {
			allCategories : req.session.allCategories,
			products : results
		});
	}, query);
}

function boughtProducts(req, res) {
	var email = req.session.user.EmailId;
	var query = "select * from productbid a inner join product b on a.ProductId = b.ProductId where a.EmailId = '"
			+ email + "' and lower(BoughtFlag) = 'y'";
	mysql.fetchData(function(err, results) {
		console.log(results);
		res.render('activity/products_bought.ejs', {
			allCategories : req.session.allCategories,
			products : results
		});
	}, query);
}

function allSellers(req, res) {
	var query = "select * from person a inner join (select c.EmailId, avg(rating) as rating from productbid c group by c.EmailId) b on a.EmailId = b.EmailId where a.EmailId in (select distinct SellerEmailId from product)";
	mysql.fetchData(function(err, results) {
		console.log(results);
		if(req.session.user["UserType"]!= "A"){
						res.render('activity/list_sellers.ejs',{allCategories:req.session.allCategories,sellers: results});
					}
					else{
						res.render('activity/admin_listsellers.ejs',{allCategories:req.session.allCategories,sellers: results});
					}
				}, query);
}

/*function allSellers(req, res) {
	var query = "select * from person a inner join (select c.EmailId, avg(rating) as rating from productbid c group by c.EmailId) b on a.EmailId = b.EmailId where a.EmailId in (select distinct SellerEmailId from product)";
	
	
	client.get("SellerCache", function(err, reply) {
		if (reply === null) {
			// if not cached
			console.log("no cache");
			// cache SQL result, set cache(key,value)
			
			
			mysql.fetchData(function(err, results) {
				console.log(results);
				client.set("SellerCache",  JSON.stringify(results));

				
				
				if(req.session.user["UserType"]!= "A"){
					res.render('activity/list_sellers.ejs',{allCategories:req.session.allCategories,sellers: results});
				}
				else{
					res.render('activity/admin_listsellers.ejs',{allCategories:req.session.allCategories,sellers: results});
				}
				
				console.log("get sellerInfo from DB");

			}, query);
				
		}else {
			// if cached
			console.log("get Seller info from cache");
			//console.log(" reply " +JSON.parse(reply));
			
			res.render('activity/list_sellers.ejs', {
				allCategories : req.session.allCategories,
				sellers : JSON.parse(reply)
			}); 
			
			if(req.session.user["UserType"]!= "A"){
				res.render('activity/list_sellers.ejs',{allCategories:req.session.allCategories,sellers: JSON.parse(reply)});
			}
			else{
				res.render('activity/admin_listsellers.ejs',{allCategories:req.session.allCategories,sellers: JSON.parse(reply)});
			}	
		}	
		});
}
*/

function allbids(req,res){
	var query = "select * from Product where IsAuction = 'Y';";
	mysql.fetchData(function(err, results){
		console.log(results);
		res.render('activity/admin_listbids.ejs',{allCategories:req.session.allCategories,bids: results});
	}, query);
}

function createProductForm(req, res) {
	res.render('activity/products_add.ejs', {
		allCategories : req.session.allCategories,
		mclass : 'info',
		message : null
	});
}

function updateUserForm(req, res) {
	res.render('activity/account.ejs', {
		allCategories : req.session.allCategories,
		mclass : 'info',
		message : null
	});
}

function allCustomers(req, res){
	var query = "select * from person  where UserType='C'";
	mysql.fetchData(function(err, results){
			res.render('activity/admin_listcustomers.ejs',{allCategories:req.session.allCategories,sellers: results});
	}, query);
}

function allProducts(req,res){
	var query = "select * from product";
	mysql.fetchData(function(err, results){
			res.render('activity/admin_listproducts.ejs',{allCategories:req.session.allCategories,products: results});
	}, query);
}

function addCategoryForm(req,res){
	var query1 = "select * from Category;";
	mysql.fetchData(function(err, results){
		req.session.allCategories = results;
		res.render('activity/addCategory.ejs',{user:req.session.user,allCategories:req.session.allCategories});
	}, query1);
}
function addCategory(req,res){
	
	var query = "insert into Category  values ('"+req.param("Category")+"');";
	console.log(query);
	mysql.fetchData(function(err, results){
		if(err){
			console.log(err);
		}else{
		res.render('admin_landing.ejs');
		}
	}, query);	
}

function delCategoryForm(req,res){
	var query1 = "select * from Category;";
	mysql.fetchData(function(err, results){
		req.session.allCategories = results;
		res.render('activity/deleteCategory.ejs',{user:req.session.user,allCategories:req.session.allCategories});
	}, query1);
	//res.render('',{user:req.session.user,allCategories:req.session.allCategories});
}
function delCategory(req,res){
	
	//insert into shoppingcart values('"+req.session.user.EmailId+"'
	var query = "delete from Category  where Category = '"+req.param("Category")+"';";
	console.log(query);
	mysql.fetchData(function(err, results){
		if(err){
			console.log(err);
		}else{
		console.log(results);
		res.render('admin_landing.ejs');
		}
	}, query);	
}

function updateUser(req, res) {
	var selection = req.param('updateordelete');

	if (selection == 'update') {
		//console.log(req.param("ZipCode").replace(/[^0-9]/g,''));
		validateUpdateUser(req.param("FirstName") ,req.param("LastName"), req.param("State"), req.param("ZipCode"), function(result){
			if(result == "success"){		
				var query = "update person set FirstName='" + req.param('FirstName')
				+ "', LastName='" + req.param('LastName') + "', ";
				query += "Address='" + req.param('Address') + "', City='"
				+ req.param('City') + "', State='" + req.param('State')
				+ "', ZipCode=" + req.param('ZipCode').replace(/[^0-9]/g,'');
				query += " where EmailId='" + req.session.user.EmailId + "'";
				var afterUpdateDetails = "select * from person where EmailId='"
					+ req.session.user.EmailId + "'";
				console.log(query);
				var mclass, message;
				mysql.fetchData(function(err, results) {

					if (err) {
						mclass = 'danger';
						message = 'Invalid form data';
					} else {
						mclass = 'info';
						message = 'Successfully updated!';
						mysql.fetchData(function(err1, results1) {
							if (err1) {
								console.log(err1);
								mclass = 'danger';
								message = 'Invalid form data';
							} else {
								mclass = 'info';
								message = 'Successfully updated!';
								var user = results1[0];
								console.log(user);
								delete user['Password'];

								req.session.user = user;
								res.render('activity/account.ejs', {
									user : req.session.user,
									allCategories : req.session.allCategories,
									mclass : mclass,
									message : message
								});
							}
						}, afterUpdateDetails);

					}

				}, query);
			}else {
				mclass = 'danger';
				message = 'Invalid form data';
				res.render('activity/account.ejs', {allCategories: req.session.allCategories, mclass: mclass, message: message});
			}
		});
	} else {
		var delPerson = "delete from person where EmailId='"
			+ req.session.user.EmailId + "'";
		var delProductBid = "delete from productbid where EmailId='"
			+ req.session.user.EmailId + "'";
		var flagProduct = "update product set DeletedBySeller='Y' where SellerEmailId='"
			+ req.session.user.EmailId + "'";
		mysql.fetchData(function(err1, results1) {

			if (err1) {

			} else {
				mysql.fetchData(function(err2, results2) {

					if (err2) {

					} else {
						mysql.fetchData(function(err3, results3) {

							if (err3) {

							} else {
								req.session.destroy();
								res.redirect('/');

							}
						}, flagProduct);
					}
				}, delProductBid);

			}
		}, delPerson);

	}

}
function validateSignIn (userName , password, callback){
	if(userName == ""){
		callback("fail");
	}else if(password == ""){
		callback("fail");
	}else
		callback("success");
}


function validateSignUp(password, fname, lname, email , state, zipCode,ssnnumber, callback){
	console.log(fname);
	
	var indexOfAt = email.indexOf('@');
	var indexOfLastDot = email.lastIndexOf('.');
	if((fname == "") || (lname == "")){
		console.log("FirstName and LastName should not be null");
		callback("fail");
	}
	if(ssnnumber =="" || ssnnumber.length <10 || ssnnumber.length>12){
		console.log("Invalid SSN Number");
		callback("fail");
	}
	
	else if(fname.length < 2 || fname.length > 30 || lname.length < 2 || lname.length > 30){
		console.log(fname.length);
		console.log("Name should between 2 to 30 characters only");
		callback("fail");

	}
	//else if(!zipCode.match("\d{5}([\-]\d{4})?")){
	else if(!zipCode.match("^\\d{5}(-\\d{4})?$")){
		console.log("Invalid ZipCode");
		callback("fail");

	}
	else if(email == ""){
		console.log("Email should not be null");
		callback("fail");
	}
	else if (indexOfAt < 0) { 
		console.log("Invalid emailid");
		callback("fail");
	}
	// second check :
	else if (indexOfAt < 2) {
		console.log("Invalid emailid");
		callback("fail");

	}
	// third check :
	else if (indexOfLastDot < indexOfAt || indexOfLastDot != (email.length - 4)) {
		console.log( "Invalid emailid");
		callback("fail");

	}
	else if(password.length < 8 || password.length > 30){
		console.log("Password must be min 8 characters and max 30 characters");
		callback("fail");
	}
	else {
		callback("success");
	}
}

function validateUpdateUser(fname, lname, state, zipCode, callback){

	if((fname == "") || (lname == "")){
		console.log("FirstName and LastName should not be null");
		callback("fail");
	}else if(!fname.match("^[A-Za-z]+$") || !lname.match("^[A-Za-z]+$") || !state.match("^[A-Za-z]+$")){
		console.log("FirstName and LastName should contain only Alphabets");
		callback("fail");
	}
	else if(fname.length < 2 || fname.length > 30 || lname.length < 2 || lname.length > 30){
		console.log("Name should between 2 to 30 characters only")
		callback("fail");
	}
	//else if(!zipCode.match("\d{5}([\-]\d{4})?") )){
	else if(!zipCode.match("^\\d{5}(-\\d{4})?$")){
		console.log("Invalid ZipCode");
		callback("fail");
	}
	else {
		callback("success");
	}
}

function advancedSearch(req, res) {
	var message = "";
	var query = "select * from category";
	mysql.fetchData(function(err, results) {
		if (err) {
			console.log(err);
		} else {
			console.log(results);
			res.render('activity/advancedSearch.ejs', {
				allCategories : req.session.allCategories,
				categories : results,
				message : message
			});
		}
	}, query);

}

function personAdvancedSearch(req, res) {
	var message = "person";
	var EmailId = req.param('EmailId');
	var query;
	if (EmailId == "") {
		query = "select * from person where FirstName like'%"
				+ req.param('FirstName') + "%' and LastName like'%"
				+ req.param('LastName') + "%' and " + "Address like'%"
				+ req.param('Address') + "%' and City like'%"
				+ req.param('City') + "%' and State like'%"
				+ req.param('State') + "%' and ZipCode like'%"
				+ req.param('ZipCode') + "%'";
	} else {
		query = "select * from person where FirstName like'%"
				+ req.param('FirstName') + "%' and LastName like'%"
				+ req.param('LastName') + "%' and " + "EmailId='"
				+ req.param('EmailId') + "' and Address like'%"
				+ req.param('Address') + "%' and City like'%"
				+ req.param('City') + "%' and State like'%"
				+ req.param('State') + "%' and ZipCode like'%"
				+ req.param('ZipCode') + "%'";
	}
	mysql.fetchData(function(err, results) {
		if (err) {
			console.log(err);
		} else {
			console.log(results);
			res.render('activity/displayAdvancedSearch.ejs', {
				allCategories : req.session.allCategories,
				details : results,
				message : message
			});
		}
	}, query);

}

function productAdvancedSearch(req, res) {
	var message = "product";
	var bidsOnly = req.param("IsBid");
	/*var query = "select * from product where ProductName like'%"
			+ req.param('ProductName') + "%' and ProductCondition like '%"
			+ req.param('ProductCondition') + "%' and Category like '%"
			+ req.param('Category') + "%'";*/
	
	
	var categoryType =req.param('Category');
	var productCondition = req.param('ProductCondition');
	
	if(req.param('Category') == 'Select a category'){	
		categoryType = '';
	}
	
	if(req.param('ProductCondition') == 'Any'){	
		productCondition = '';
	}
	
	var query = "select * from product where ProductName like'%"
		+ req.param('ProductName') + "%' and ProductCondition like '%"
		+ productCondition + "%' and Category like '%"
		+ categoryType + "%'";
	
	
	if (bidsOnly == "Yes") {
		query = query + "and IsAuction = 'Y' ";
	}
	if (req.param("OnlyAvailable") == 'Y') {
		query = query + "and AvailableQuantity > 0";
	}
	if (!(req.param("ProductCost") == (0 || null))) {
		query = query + "and ProductCost <= " + req.param("ProductCost") + "";
	}
	mysql.fetchData(function(err, results) {
		if (err) {
			console.log(err);
		} else {
			console.log(results);
			res.render('activity/displayAdvancedSearch.ejs', {
				allCategories : req.session.allCategories,
				details : results,
				message : message
			});
		}
	}, query);
}

function categoryGroupedListing(req, res) {
	console.log("Here--");
	var search_query = req.param('q');
	var category = req.param('category');
	if(category == "all") category = 0;
	var time = getDateTime();
	var query = "select a.ProductId,ProductName,ProductCondition,ProductDetails,ProductCost,Category,AvailableQuantity,BidStartTime,BidEndTime,IsAuction,SellerEmailId,DeletedBySeller,rating from (select * from cmpe273project.product where DeletedBySeller = 'N' and (BidEndTime > '" + time + "' or BidEndTime = 'NA')) a left join (select ProductId, avg(rating) as rating from cmpe273project.productbid group by ProductId) b on a.ProductId = b.ProductId";
	if(search_query || category){
		query += " where ";
	}
	if (search_query) {
		search_query = search_query.toLowerCase();
		var where = "lower(	ProductName) like '%" + search_query
				+ "%' or lower(ProductDetails) like '%" + search_query + "%'";
		if (category) {
			where = "(" + where + ") and ";
		}
		query += where;
	}
	if (category) {
		query += "category = '" + category + "'";
	}

	mysql.fetchData(function(err, results){
		var products = {'All': []};
		for(var i=0; i<results.length; i++){
			if(typeof(products[results[i]['Category']]) === 'undefined' || !products.hasOwnProperty(results[i]['Category'])){
				products[results[i]['Category']] = [];
			}
			products[results[i]['Category']].push(results[i]);
			products['All'].push(results[i]);

		}
		/*res.render('activity/browse.ejs',{
			allCategories: req.session.allCategories,
			products: products,
			categories: Object.keys(products).sort(),
			message: req.param('message')
		});*/
	}, query);
}

function bidForProduct(req, res) {
	var product_id = req.param('p');
	var product_name = req.param('pname');
	var bid = req.param('bid');
	var rating = req.param('rating');
	var buyorcart = req.param('buyorcart');
	var quantity = Number(req.param('quantity'));
	if (buyorcart == "cart") {
		var addToCart = "";
		var checkCart = "select * from shoppingcart where EmailId='"
				+ req.session.user.EmailId + "' and ProductId = " + product_id;
		var getCartItems = "select * from product p,shoppingcart s where p.ProductId=s.ProductId and s.EmailId='"
				+ req.session.user.EmailId + "' ";
		mysql
				.fetchData(
						function(err5, results5) {
							// res.redirect('activity/shoppingcart.ejs',{allCategories:req.session.allCategories});
							if (err5) {
								console.log(err5);
							} else {
								if (results5.length > 0) {
									var qty = results5[0].Quantity;
									var newQ = quantity + qty;
									addToCart = "update shoppingcart set Quantity="
											+ newQ
											+ " where ProductId="
											+ product_id
											+ " and EmailId='"
											+ req.session.user.EmailId + "' ";
								} else {
									addToCart = "insert into shoppingcart values('"
											+ req.session.user.EmailId
											+ "',"
											+ product_id
											+ ","
											+ req.param('quantity')
											+ ","
											+ req.param('rating') + ")";
								}
								var total = 0;
								mysql
										.fetchData(
												function(err, results) {
													// res.redirect('activity/shoppingcart.ejs',{allCategories:req.session.allCategories});
													if (err) {
														console.log(err);
													} else {

														mysql
																.fetchData(
																		function(
																				err2,
																				cartItems) {

																			console
																					.log(cartItems);
																			for (var i = 0; i < cartItems.length; i++) {
																				total += (cartItems[i].ProductCost * cartItems[i].Quantity);
																			}
																			res
																					.render(
																							'activity/shoppingcart.ejs',
																							{
																								total : total,
																								cartItems : cartItems,
																								allCategories : req.session.allCategories
																							});

																		},
																		getCartItems);
													}

												}, addToCart);
							}
						}, checkCart);

		// var getQuantity = "select Quantity from shoppingcart where EmailId =
		// '"+req.session.user.EmailId+"'";

	} else {
		var query = "select * from product where ProductId=" + product_id;
		mysql.fetchData( function(err, results) {
							var product = results[0];
							var bought = 'N';
							var quantity = product['AvailableQuantity'];
							if (product['IsAuction'].toLowerCase() == 'y') {
								bid = bid || 0;
								quantity =1;
							} else {
								bid = product['ProductCost'];
								bought = 'Y';
								quantity = quantity - req.param('quantity');
							}
							var query1 = "update product set AvailableQuantity = "
									+ quantity
									+ " where productid = "
									+ product_id + ";";
							query = "insert into productbid (EmailId, ProductId, BidPrice, BoughtFlag, Quantity , Rating) values (";
							query += "'" + req.session.user.EmailId + "', "
									+ product_id + ", " + bid + ", '" + bought
									+ "', " + quantity + " , "
									+ rating + ")";
							console.log("query---",query);
							console.log("query1---",query1);
							mysql.fetchData(function(err, results){
				                            mysql.fetchData(function(err,result){
					                        res.redirect('/browse?message=' + encodeURIComponent('You have placed a bid of ' + bid + ' on ' + product_name));
				                            }, query1);
						        }, query);
						}, query);
	}
}



function editProduct(req, res) {
	var product_id = req.param('p');
	var query = "select * from product where productid=" + product_id;
	mysql.fetchData(function(err, results) {
		if (err) {
			console.log(err);
		} else {
			var product = results[0];
			res.render('activity/edit_product.ejs', {
				allCategories : req.session.allCategories,
				product : product,
				mclass : req.param('mc') || 'info',
				message : req.param('m') || null
			});
		}
	}, query);
}

function modifyProduct(req, res) {
	var product_id = req.param('p');
	var selection = req.param('updateordelete');
	var query;
	if (selection == 'delete') {
		query = "update product set DeletedBySeller='Y' where ProductId="
				+ product_id;
	} else {
		query = "update product set ProductName='" + req.param('ProductName')
				+ "', ProductCondition='" + req.param('ProductCondition')
				+ "', ";
		query += "ProductDetails='" + req.param('ProductDetails')
				+ "', ProductCost=" + req.param('ProductCost') + ", Category='"
				+ req.param('Category') + "', ";
		query += "AvailableQuantity=" + req.param('AvailableQuantity')
				+ ", IsAuction='" + req.param('IsAuction')
				+ "', BidStartTime='" + req.param('BidStartTime')
				+ "', BidEndTime='" + req.param('BidEndTime') + "' ";
		query += "where ProductId=" + product_id;
	}

	mysql.fetchData(function(err, results) {
		if (err) {
			console.log(err);
		} else {
			res.redirect(
					'/products/update?mc=info&m=Successfully%20Updated!&p='
							+ product_id, {
						allCategories : req.session.allCategories
					});
		}
	}, query);
}

function shoppingCart(req, res) {
	var total = 0;
	var query = "select * from product p,shoppingcart s where p.ProductId=s.ProductId and s.EmailId='"
			+ req.session.user.EmailId + "' ";
	mysql.fetchData(function(err, cartItems) {
		if (err) {
			console.log(err);
		} else {
			for (var i = 0; i < cartItems.length; i++) {
				total += (cartItems[i].ProductCost * cartItems[i].Quantity);
			}
			res.render('activity/shoppingCart.ejs', {
				total : total,
				allCategories : req.session.allCategories,
				cartItems : cartItems
			});
		}
	}, query);
}

function fromShoppingCart(req, res) {
	var option = req.param('removeorbuy');

	if (option == 'buy') {
		res.render('activity/payment.ejs', {
			allCategories : req.session.allCategories
		});
	} else {
		var query1 = "delete from shoppingcart where EmailId='"
				+ req.session.user.EmailId + "' and ProductId=" + option + "";
		var total = 0;
		var query = "select * from product p,shoppingcart s where p.ProductId=s.ProductId and s.EmailId='"
				+ req.session.user.EmailId + "' ";
		mysql
				.fetchData(
						function(error, remove) {
							if (error) {
								console.log(error);
							} else {
								mysql
										.fetchData(
												function(err, cartItems) {
													if (err) {
														console.log(err);
													} else {
														for (var i = 0; i < cartItems.length; i++) {
															total += (cartItems[i].ProductCost * cartItems[i].Quantity);
														}
														res
																.render(
																		'activity/shoppingCart.ejs',
																		{
																			total : total,
																			allCategories : req.session.allCategories,
																			cartItems : cartItems
																		});
													}
												}, query);
							}
						}, query1);

	}
}

function thankYou(req, res) {
	var getCartItems = "select * from product p,shoppingcart s where p.ProductId=s.ProductId and s.EmailId='"
			+ req.session.user.EmailId + "' ";
	var query = "delete from shoppingcart where EmailId='"
			+ req.session.user.EmailId + "'";

	mysql.fetchData(function(err, results) {
		if (err) {
			console.log(err);
		} else {

			for (var i = 0; i < results.length; i++) {

				var updateQuantity = "update product set AvailableQuantity="
						+ (results[i].AvailableQuantity - results[i].Quantity)
						+ " where ProductId=" + results[i].ProductId + "";
				var productHistory = "insert into productbid values('"
						+ req.session.user.EmailId + "',"
						+ results[i].ProductId + "," + results[i].ProductCost
						+ ",'Y'," + results[i].Rating + ","
						+ results[i].Quantity + ")";
				mysql.fetchData(function(err1, results1) {
					if (err) {
						console.log(err1);
					}
					mysql.fetchData(function(err2, results2) {
						if (err) {
							console.log(err2);
						}

					}, productHistory);

				}, updateQuantity);

			}
		}
	}, getCartItems);
	mysql.fetchData(function(err3, results3) {
		if (err3) {
			console.log(err3);
		}
	}, query);
	res.render('activity/ThankYou.ejs', {
		allCategories : req.session.allCategories
	});
}


exports.thankYou = thankYou;
exports.fromShoppingCart = fromShoppingCart;
exports.shoppingCart = shoppingCart;
exports.afterSignUp = afterSignUp;
exports.sellProduct = sellProduct;
exports.displayProduct = displayProduct;
exports.searchItem = searchItem;
exports.signIn = signIn;
exports.signUp = signUp;
exports.afterSignIn = afterSignIn;
exports.deleteExistingCustomer = deleteExistingCustomer;
exports.listAllAuctions = listAllAuctions;
exports.displayPersonDetails = displayPersonDetails;
exports.displayProductDetails = displayProductDetails;

// Sahithi
exports.doSignIn = doSignIn;
exports.showProfile = showProfile;
exports.signOut = signOut;
exports.inProgressBids = inProgressBids;
exports.wonBids = wonBids;
exports.lostBids = lostBids;
exports.waitingProducts = waitingProducts;
exports.soldProducts = soldProducts;
exports.boughtProducts = boughtProducts;
exports.allSellers = allSellers;
exports.createProductForm = createProductForm;
exports.categoryGroupedListing = categoryGroupedListing;
exports.updateUserForm = updateUserForm;
exports.updateUser = updateUser;
exports.bidForProduct = bidForProduct;
exports.editProduct = editProduct;
exports.modifyProduct = modifyProduct;
exports.clientDateStringToDateString = clientDateStringToDateString;
exports.dateFromString = dateFromString;

exports.sellerSignUp = sellerSignUp;
exports.sellerSignIn = sellerSignIn;
exports.getProducts = getProducts;
exports.updateProduct = updateProduct;
exports.createProduct = createProduct;
exports.displayCustomers = displayCustomers;
exports.displaySellers = displaySellers;
exports.advancedSearch = advancedSearch;
exports.personAdvancedSearch = personAdvancedSearch;
exports.productAdvancedSearch = productAdvancedSearch;
exports.viewProduct = viewProduct;
exports.addCategory=addCategory;
exports.addCategoryForm = addCategoryForm;
exports.delCategoryForm = delCategoryForm;
exports.delCategory = delCategory;
exports.displayProducts = displayProducts;
exports.allCustomers= allCustomers;
exports.allProducts = allProducts;
exports.allbids = allbids;
//exports.sellerAfterSignUp = sellerAfterSignUp;
//exports.placeBid = placeBid;


function setLastRun(ts_string){
	var query = "insert into keyvaluestore (KeyString, ValueString) values ('LastBidCheck', '" + ts_string + "')";
	query += "on duplicate key update ValueString='" + ts_string + "'";
	mysql.fetchData(function(err, results){
		if(err){
			console.log(err);
			return;
		}
	}, query);
}


function getLastRun(callback){
	var query = "select * from keyvaluestore where KeyString='LastBidCheck'";
	mysql.fetchData(function(err, results){
		if(err){
			console.log(err);
			callback(null);
		} else if(results.length == 0){
			callback(null);
		} else {
			callback(results[0]['ValueString']);
		}
	}, query);
}


function evaluateBids(product_id){
	var bids_query = "select * from productbid where ProductId=" + product_id;
	mysql.fetchData(function(err, results){
		if(err){
			console.log(err);
			return;
		}
		if(results.length == 0){
			console.log('No bids for the product with id: ' + product_id);
			return;
		}
		var best_bid = null;
		var max_bid_price = -1;
		for(var i=0; i<results.length; i++){
			if(results[i]['BidPrice'] > max_bid_price){
				best_bid = results[i];
				max_bid_price = best_bid['BidPrice'];
			}
		}
		var update_query = "update productbid set BoughtFlag='Y' where ProductId=" + product_id + " and EmailId='" + best_bid['EmailId'] + "' and BidPrice=" + max_bid_price;
		mysql.fetchData(function(err, results){
			if(err){
				console.log(err);
				return;
			}
			console.log('Successfully completed bid for ProductId: ' + product_id);
		}, update_query);
	}, bids_query);
}


function kickOffBidWrapups(){
	getLastRun(function(last_run){
		if(last_run == null){
			last_run = dateString(new Date(0));
		}
		var time_str = getDateTime();
		var ready_products = "select * from cmpe273project.product where BidEndTime between '" + last_run + "' and '" + time_str + "' and IsAuction='Y'";
		mysql.fetchData(function(err, results){
			if(err){
				console.log(err);
				return;
			}
			for(var i=0; i<results.length; i++){
				evaluateBids(results[i]['ProductId']);
			}
			setLastRun(time_str);
		}, ready_products);
	});
}


setInterval(kickOffBidWrapups, 3000);
