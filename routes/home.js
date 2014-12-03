var ejs = require("ejs");
var mysql = require('./mysql.js');
var mysqlDhanu = require('mysql');
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

function signUp(req, res) {

	console.log(req.query.type);
	ejs.renderFile('./views/Register.html', function(err, result) {
		if (!err) {
			res.end(result);
		}
		else {
			res.end('An error occurred');
			console.log(err);
		}
	});
}


function signIn(req, res) {

	if(req.session.user){
		return res.redirect('/bids/current');
	}

	ejs.renderFile('./views/signIn.html',{message:req.param('m') || ''}, function(err, result) {
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

function doSignIn(req, res){
	var email = req.param("inputEmail");
	var password = req.param("inputPassword");
	var query = "select * from person where EmailId='"+email+"' and password='" + password + "'";
	var queryCat = "select * from category";
	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
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
			console.log(req.session.allCategories);
			res.redirect('/bids/current');
				}
			},queryCat);
		}
	}, query);
}

function signOut(req, res){
	req.session.destroy();
	res.redirect('/');
}

function showProfile(req, res){
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

function afterSignIn(req,res)
{
	/// Checking username and password
	var email = req.param("inputEmail");
	var password = req.param("inputPassword");
	var query = "select * from person where EmailId='"+email+"'";
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
			}
			else
				{
				
				ejs.renderFile('./views/signIn.html',{message:"Invalid Login"}, function(err, result) {
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

	var getUser = 'insert into person(EmailId,Password,FirstName,LastName,Address,City,State,ZipCode,LastLogin,UserType) values ("' + req.param("inputEmail") + '", "' + req.param("inputPassword") + '","' + req.param("inputFirstName") + '", "' + req.param("inputLastName") + '", "' + req.param("inputAddress") + '","' +req.param("inputCity")
	+ '", "' + req.param("inputState") + '", "' + req.param("inputZipcode") + '", "' + current_Date_Time + '", "' + 'C' + '")';

	console.log("Query is:" + getUser);

	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			res.redirect('/signIn');
		}
	}, getUser);
	
}


function sellProduct(req, res) {

	var getUser = 'update product set AvailableQuantity="' + req.param('inputQuantity')
	+ '" where ProductId="' + req.param("inputProductId") + '"';
	console.log("Query is:" + getUser);

	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			var getUser1 =  'insert into productbid values ("' + req.param("inputEmail") + '", "' + req.param("inputProductId") + '","' + req.param("BidPrice") + '", "' + req.param("BoughtFlag") + '", "' + req.param("Rating")+ '")';
			console.log("Query is:" + getUser1);
			mysql.fetchData(function(err, results) {
				if (err) {
					throw err;
				} 
			},getUser1);
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
	

	var getUser = "select * from ProductBid a inner join Product b on a.ProductId = b.ProductId where b.ProductName = '"+req.params.ProductName+"'";
	console.log("Query is:" + getUser);

	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			console.log(" seller id :"+results[0]['SellerEmailId']);
			
			var getSeller = "select * from person where Emailid='"+results[0]['SellerEmailId']+"'";

			mysql.fetchData(function(err, results2) {
				if (err) {
					throw err;
				} else {

					res.render('activity/view_product.ejs', {result: results, seller : results2});

				}
			}, getSeller);
			
		}
	}, getUser);
}
function listAllAuctions(req,res)
{
	//Current or all auctions
	var query = "select * from product where IsAuction = 'y' or IsAuction='Y'";
	mysql.fetchData(function(err, results) {
		if (err) {
			console.log(err);
			throw err;
		}
		ejs.renderFile('./views/Auctions',{allCategories:req.session.allCategories},function(err, result) {
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
	//????????????????
	
}

function displayPersonDetails(req, res)
{
	var usertype;
	var queryTwo;
	var query = "select * from person where EmailId='"+req.session.emailid+"'";
	mysql.fetchData(function(err, results) {
		if (err) {
			console.log(err);
			throw err;
		}
		usertype = results[0].UserType;
		if(usertype == 'C')
			{
				queryTwo = "select * from productbid where EmailId='"+req.session.emailid+"' and BoughtFlag='Y'";
			}
		else if(usertype == 'S')
			{
				queryTwo = "select * from product where EmailId='"+req.session.emailid+"'";
			}
		
		mysql.fetchData(function(err1, results1) {
			if (err1) {
				console.log(err1);
				throw err1;
			}
			//?????????????????
			ejs.renderFile('./views/Auctions',function(err, result) {
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
			
		},queryTwo);
	}, query);
	
}

function connect()
{
	var connection = mysqlDhanu.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : 'root',
		//password : '',
		database: 'cmpe273project' //'eBay'
	});

	connection.connect();

	return connection;
}

function getProducts(callback)
{
	//var connection = poolObject.get();
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

function updateProduct(updateProduct,updateAttribute,updateValue)
{
	var connection=connect();

	var eQuery = "UPDATE Product SET "+updateAttribute+"='"+updateValue+"' WHERE ProductName='"+updateProduct+"'";

	connection.query(eQuery,function(eerr,eRows,eFields){
		if(eerr)
		{
			console.log("ERROR: " + eerr.message);
		}
		else
		{
			console.log("Products:" + JSON.stringify(eRows));
			
		}

	});
	connection.end();
}

function createProduct(SellerEmail,ProductName,ProductCondition,ProductDetails,ProductCost,Category,AvailableQuantity,BidStartTime,BidEndTime,AuctionFlag)
{
	var connection=connect();
	var eQuery = "INSERT INTO Product (ProductName,ProductCondition,ProductDetails,ProductCost,Category,AvailableQuantity,SellerEmailId,BidStartTime,BidEndTime,IsAuction) VALUES ('"+ProductName+"', '"+ProductCondition+"', '"+ProductDetails+"', '"+ProductCost+"', '"+Category+"', '"+AvailableQuantity+"', '"+SellerEmail+"', '"+BidStartTime+"', '"+BidEndTime+"', '"+AuctionFlag+"')";
	console.log(eQuery);
	connection.query(eQuery,function(eerr,eRows,eFields){
		if(eerr)
		{
			console.log("ERROR: " + eerr.message);
		}
		else
		{
			console.log("Products:" + JSON.stringify(eRows));
			
		}

	});
	connection.end();
}

function displaySellers(callback)
{
	//var connection = poolObject.get();
	var connection=connect();

	var eQuery = "SELECT * from Seller";
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

function displayCustomers(callback)
{
	//var connection = poolObject.get();
	var connection=connect();

	var eQuery = "SELECT * from Customer";
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

//Sahithi
function sellerSignUp(req,res){
	console.log(req.query.type);
	ejs.renderFile('./views/signUp.ejs', function(err, result) {
		if (!err) {
			res.end(result);
		}
		else {
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
	var getUser = 'insert into person values ("' + req.param("inputEmail") + '", "' + req.param("inputPassword") + '","' + req.param("inputFirstName") + '", "' + req.param("inputSecondName") + '", "' + req.param("inputAddress") + '","' +req.param("inputCity")
	+ '", "' + req.param("inputState") + '", "' + req.param("inputZipcode") + '", "' + current_Date_Time + '", "' + 'S' + '")';
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

	var getUser = 'select * from productbid where ProductName ="' + req.param("inputProductName")  + '"';
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

function deleteExistingCustomer (req , res)
{
	var deletePerson;
	var deleteCustomer;
	//var deleteProductBid;
	
	if(req.session.emailid != null)
		{
			deletePerson = "delete from person where EmailId = '"+req.session.emailid+"'";
			deleteCustomer = "delete from customer where EmailId = '"+req.session.emialid+"'";
			// Delete all entries from productbid table?
			//deleteProductBid = "delete from productbid where EmailId = '"+req.session.emailid+"'";
		}
	mysql.fetchData(function(err1, results1) {
		if (err1) {
			console.log(err1);
			throw err1;
		}

	}, deletePerson );
	mysql.fetchData(function(err2, results2) {
		if (err2) {
			console.log(err2);
			throw err2;
		}
		ejs.renderFile('./views/login.ejs',function(err, result) {
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

	/*	mysql.fetchData(function(err3, results3) {
		if (err3) {
			console.log(err3);
			throw err3;
		}

	}, deleteProductBid); */
	
	//	After deleting Customer redirect to Login Page
	
}

function displayProductDetails(req, res)
{
	var productId = req.param('productId');
	var query = "select * from product where ProductId = '"+productId+"'";
	mysql.fetchData(function(err1, results1) {
		if (err1) {
			console.log(err1);
			throw err1;
		}
		// render here....
	}, query);

}

function inProgressBids(req, res){
	var email = req.session.user.EmailId;
	var query = "select * from ProductBid a inner join Product b on a.ProductId = b.ProductId where a.EmailId = '" + email + "' and b.BidEndTime > '" + getDateTime() + "'";
	mysql.fetchData(function(err, results){
		res.render('activity/bids_in_progress.ejs',{allCategories:req.session.allCategories,bids: results});
	}, query);
}

function wonBids(req, res){
	var email = req.session.user.EmailId;
	var query = "select * from ProductBid a inner join Product b on a.ProductId = b.ProductId where a.EmailId = '" + email + "' and lower(b.IsAuction) = 'y' and lower(a.BoughtFlag) = 'y'";
	mysql.fetchData(function(err, results){
		console.log(results);
		res.render('activity/bids_won.ejs',{allCategories:req.session.allCategories,bids: results});
	}, query);
}

function lostBids(req, res){
	var email = req.session.user.EmailId;
	var query = "select * from ProductBid a inner join Product b on a.ProductId = b.ProductId where a.EmailId = '" + email + "' and lower(b.IsAuction) = 'y' and lower(a.BoughtFlag) != 'y' and b.BidEndTime < '" + getDateTime() + "'";
	mysql.fetchData(function(err, results){
		console.log(results);
		res.render('activity/bids_missed.ejs',{allCategories:req.session.allCategories,bids: results});
	}, query);
}

function waitingProducts(req, res){
	var email = req.session.user.EmailId;
	var query = "select * from product where SellerEmailId = '"+email+"' and ProductId not in (select ProductId from productbid where ProductId in (select ProductId from product where EmailId = '" + email + "') and lower(BoughtFlag) = 'y')";
	mysql.fetchData(function(err, results){
		console.log(results);
		res.render('activity/products_waiting.ejs',{allCategories:req.session.allCategories,products: results});
	}, query);
}

function soldProducts(req, res){
	var email = req.session.user.EmailId;
	var query = "select * from productbid a inner join product b on a.ProductId = b.ProductId where b.SellerEmailId = '" + email + "' and lower(BoughtFlag) = 'y'";
	mysql.fetchData(function(err, results){
		console.log(results);
		res.render('activity/products_sold.ejs',{allCategories:req.session.allCategories,products: results});
	}, query);
}

function boughtProducts(req, res){
	var email = req.session.user.EmailId;
	var query = "select * from productbid a inner join product b on a.ProductId = b.ProductId where a.EmailId = '" + email + "' and lower(BoughtFlag) = 'y'";
	mysql.fetchData(function(err, results){
		console.log(results);
		res.render('activity/products_bought.ejs',{allCategories:req.session.allCategories,products: results});
	}, query);
}

function allSellers(req, res){
	var query = "select * from person a inner join (select c.EmailId, avg(rating) as rating from productbid c group by c.EmailId) b on a.EmailId = b.EmailId where a.EmailId in (select distinct SellerEmailId from product)";
	mysql.fetchData(function(err, results){
		console.log(results);
		res.render('activity/list_sellers.ejs',{allCategories:req.session.allCategories,sellers: results});
	}, query);
}

function createProductForm(req, res){
	res.render('activity/products_add.ejs',{allCategories:req.session.allCategories,mclass: 'info', message: null});
}

function updateUserForm(req, res){
	res.render('activity/account.ejs',{allCategories:req.session.allCategories,mclass: 'info', message: null});
}

function updateUser(req, res){
	var query = "update person set FirstName='" + req.param('FirstName') + "', LastName='" + req.param('LastName') + "', ";
	query += "Address='" + req.param('Address') + "', City='" + req.param('City') + "', State='" + req.param('State') + "', ZipCode=" + req.param('ZipCode');
	query += " where EmailId='" + req.session.user.EmailId + "'";
	mysql.fetchData(function(err, results){
		var mclass, message;
		if(err){
			mclass = 'danger';
			message = 'Invalid form data';
		} else {
			mclass = 'info';
			message = 'Successfully updated!';
		}
		res.render('activity/account.ejs',{allCategories:req.session.allCategories,mclass: mclass, message: message});
	}, query);
}
function advancedSearch(req,res)
{
	var message="";
	var query = "select * from category";
	mysql.fetchData(function(err, results){
		if(err){
			console.log(err);
		}else{
		console.log(results);
		res.render('activity/advancedSearch.ejs',{allCategories:req.session.allCategories,categories: results ,message:message});
		}
	}, query);
	
}

function personAdvancedSearch(req,res)
{
	var message="person";
	var EmailId = req.param('EmailId');
	var query;
	if(EmailId=="")
		{
	 query = "select * from person where FirstName like'%"+req.param('FirstName') +"%' and LastName like'%"+req.param('LastName') +"%' and " +
			"Address like'%"+req.param('Address') +"%' and City like'%"+req.param('City') +"%' and State like'%"+req.param('State') +"%' and ZipCode like'%"+req.param('ZipCode') +"%'" ;
		}
	else
		{
		query = "select * from person where FirstName like'%"+req.param('FirstName') +"%' and LastName like'%"+req.param('LastName') +"%' and " +
		"EmailId='"+ req.param('EmailId') +"' and Address like'%"+req.param('Address') +"%' and City like'%"+req.param('City') +"%' and State like'%"+req.param('State') +"%' and ZipCode like'%"+req.param('ZipCode') +"%'" ;
		}
	mysql.fetchData(function(err, results){
		if(err){
			console.log(err);
		}else{
		console.log(results);
		res.render('activity/displayAdvancedSearch.ejs',{allCategories:req.session.allCategories,details: results ,message:message});
		}
	}, query);
	
}

function productAdvancedSearch(req,res)
{
	var message = "product";
var bidsOnly = req.param("IsBid");
var query = "select * from product where ProductName like'%"+req.param('ProductName')+"%' and ProductCondition like '%"+req.param('ProductCondition')+"%' and Category like '%"+req.param('Category')+"%'";

if(bidsOnly=="Yes")
	{
		query = query + "and IsAuction = 'Y' ";
	}
if(req.param("OnlyAvailable") == 'Y')
	{
		query = query + "and AvailableQuantity > 0";
	}
/*if(!(req.param("ProductCost") == 0))
	{
	 query = query + "and ProductCost <= "+req.param("ProductCost")+"";
	} */
if(req.param("ProductCost1")<req.param("ProductCost2"))
{
 query = query + "and ProductCost >= "+req.param("ProductCost1")+" and ProductCost <="+req.param("ProductCost2")+"";
}

mysql.fetchData(function(err, results){
	if(err){
		console.log(err);
	}else{
	console.log(results);
	res.render('activity/displayAdvancedSearch.ejs',{allCategories:req.session.allCategories,details: results ,message:message});
	}
}, query);
}


function categoryGroupedListing(req, res){
	var search_query = req.param('q');
	var category = req.param('category');
	if(category == "all") category = 0;
	var query = "select * from product a inner join (select ProductId, avg(rating) as rating from productbid group by ProductId) b on a.ProductId = b.ProductId";
	if(search_query || category){
		query += " where ";
	}
	if(search_query){
		search_query = search_query.toLowerCase();
		var where = "lower(ProductName) like '%" + search_query + "%' or lower(ProductDetails) like '%" + search_query + "%'";
		if(category){
			where = "(" + where + ") and ";
		}
		query += where;
	}
	if(category){
		query += "category = '" + category + "'";
	}

	mysql.fetchData(function(err, results){
		console.log(results);
		var products = {'All': []};
		for(var i=0; i<results.length; i++){
			if(!products.hasOwnProperty(results[i].category)){
				products[results[i]['Category']] = [];
			}
			products[results[i]['Category']].push(results[i]);
			products['All'].push(results[i]);
		}
		res.render('activity/browse.ejs',{allCategories:req.session.allCategories,products: products, categories: Object.keys(products).sort()});
	}, query);
}

function bidForProduct(req, res){
	var product_id = req.param('p');
	var bid = req.param('bid');
	var rating = req.param('rating');
	
	var query = "select * from product where ProductId=" + product_id;
	mysql.fetchData(function(err, results){
		var product = results[0];
		var bought = 'N';
		var quantity = product['AvailableQuantity'];
		if(product['IsAuction'].toLowerCase() == 'y'){
			bid = bid || 0;
		} else {
			bid = product['ProductCost'];
			bought = 'Y';
			quantity = quantity - req.param('quantity') ;	
		}
		var query1 = "update product set Availablequantity = "+quantity+" where productid = "+product_id+";";
		query = "insert into productbid (EmailId, ProductId, BidPrice, BoughtFlag, Quantity , Rating) values (";
		query += "'" + req.session.user.EmailId + "', " + product_id + ", " + bid + ", '" + bought + "', "+req.param('quantity')+" , " + rating + ")";
		mysql.fetchData(function(err, results){
			res.redirect('/browse',{allCategories:req.session.allCategories});
		}, query);
		mysql.fetchData(function(err,result){	
		},query1);
	}, query);
}

function getCategories(callback){

}

function editProduct(req, res){
	var product_id = req.param('p');
	var query = "select * from product where productid=" + product_id;
	mysql.fetchData(function(err, results){
		if(err){
			console.log(err);
		} else {
			var product = results[0];
			res.render('activity/edit_product.ejs',{allCategories:req.session.allCategories,product: product, mclass: req.param('mc') || 'info', message: req.param('m') || null});
		}
	}, query);
}

function modifyProduct(req, res){
	var product_id = req.param('p');
	var query = "update product set ProductName='" + req.param('ProductName') + "', ProductCondition='" + req.param('ProductCondition') + "', ";
	query += "ProductDetails='" + req.param('ProductDetails') + "', ProductCost=" + req.param('ProductCost') + ", Category='" + req.param('Category') + "', ";
	query += "AvailableQuantity=" + req.param('AvailableQuantity') + ", IsAuction='" + req.param('IsAuction') + "', BidStartTime='" + req.param('BidStartTime') + "', BidEndTime='" + req.param('BidEndTime') + "' ";
	query += "where ProductId=" + product_id;
	mysql.fetchData(function(err, results){
		if(err){
			console.log(err);
		} else {
			res.redirect('/products/update?mc=info&m=Successfully%20Updated!&p=' + product_id,{allCategories:req.session.allCategories});
		}
	}, query);
}

function shoppingCart(req,res)
{
	var query = "select * from product p where p.ProductId IN (select ProductId from shoppingcart where  EmailId = '"+req.session.user.EmailId+"')";
	mysql.fetchData(function(err, results){
		if(err){
			console.log(err);
		} else {
			res.redirect('./shoppingCart.ejs',{allCategories:req.session.allCategories,items:results});
		}
	}, query);
}

function fromShoppingCart(req,res)
{
	
}


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

//Sahithi
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

exports.sellerSignUp = sellerSignUp;
exports.sellerSignIn = sellerSignIn;
exports.getProducts=getProducts;
exports.updateProduct=updateProduct;
exports.createProduct=createProduct;
exports.displayCustomers=displayCustomers;
exports.displaySellers=displaySellers;
exports.advancedSearch = advancedSearch;
exports.personAdvancedSearch= personAdvancedSearch;
exports.productAdvancedSearch = productAdvancedSearch;
exports.viewProduct=viewProduct;
//exports.sellerAfterSignUp = sellerAfterSignUp;
//exports.placeBid = placeBid;




