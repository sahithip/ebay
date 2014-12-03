var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var home = require('./routes/home');

var app = express();

// all environments
app.set('port', process.env.PORT || 5000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser());

var title = 'EJS template with Node.JS';
var data = 'Data from node';

// Setup template engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
var ejs = require('ejs');

//sessions related stuff
var session = require('express-session');
var SessionStore = require('express-mysql-session');
app.use(session({
    key: 'abcd',
    secret: 'asdf',
    store: new SessionStore({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'cmpe273project'
    })
}));

app.use(express.cookieParser());
//app.use(express.session({secret: '1234567890QWERTY'}));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

function authenticate(req, res, next) {
    if (req.session.user) {
        res.locals.user = req.session.user;

        next();
    } else {
        res.redirect('/signIn');
    }
}

app.get('/', home.signIn);


//get
app.get('/signIn', home.signIn);
app.get('/displayProduct', authenticate, home.displayProduct);
app.get('/searchItem', authenticate, home.searchItem);
app.get('/listAllAuctions', authenticate, home.listAllAuctions);
app.get('/displayPersonDetails', authenticate, home.displayPersonDetails);
app.get('/displayProductDetails', authenticate, home.displayProductDetails);

//post
app.post('/signUp', home.signUp);
app.post('/doSignIn', home.doSignIn);
app.post('/afterSignUp', home.afterSignUp);
app.post('/sellProduct', home.sellProduct);
app.post('/Customer/DeleteAccount', home.deleteExistingCustomer);


/////
//app.get('/', routes.index);
app.get('/Product', authenticate, function (req, res) {
    home.getProducts(function (Err, Results) {

        if (Err) {
            console.log(Err);
            throw Err;
        }
        else {
            var params = {products: Results, message: ''};
            if(Results.length > 0){
                params.selected = Results[0].productName;
            }
            ejs.renderFile('./views/product.ejs',
                params,
                function (err, result) {
                    if (!err) {
                        res.end(result);
                    }
                    else {
                        console.log(err);
                    }
                });
        }
    });
});
app.post('/updateProduct', authenticate, function (req, res) {
    home.updateProduct(req.param('updateProduct'), req.param('updateAttribute'), req.param('updateValue'));
    res.render('index', {title: 'Updated!', message: 'Update Successful.'});
});
app.post('/createProduct', authenticate, function (req, res) {
    if (!req.param('ProductName') || !req.param('ProductCost') || !req.param('ProductId')) {
        res.statusCode = 400;
        console.log('Fields marked witn star are mandatory');
        res.send('Fields marked witn star are mandatory');
        //return res.render('product',{
        //message:'Error 400: Product name and product cost is compulsory'});
    }
    else {
        if (req.param('IsAuction') == "Yes") {
            //home.createProduct(req.param('ProductName'),req.param('ProductCondition'),req.param('ProductDetails'),req.param('ProductCost'),req.param('Category'),req.param('AvailableQuantity'),req.param('SellerMembershipNo'),req.param('BidStartTime'),req.param('BidEndTime'),req.param('AuctionFlag'));
            home.createProduct(req.param('ProductId'), req.param('ProductName'), req.param('ProductCondition'), req.param('ProductDetails'), req.param('ProductCost'), req.param('Category'), req.param('AvailableQuantity'), req.param('SellerMembershipNo'), req.param('BidStartTime'), req.param('BidEndTime'), req.param('IsAuction'));
            res.render('index', {title: 'Updated!', message: 'Update Successful.'});
        }
        else {
            home.createProduct(req.param('ProductId'), req.param('ProductName'), req.param('ProductCondition'), req.param('ProductDetails'), req.param('ProductCost'), req.param('Category'), req.param('AvailableQuantity'), req.param('SellerMembershipNo'), "NA", "NA", req.param('IsAuction'));
            res.render('index', {title: 'Updated!', message: 'Update Successful.'});
        }
    }
});

app.get('/displaySellers', authenticate, function (req, res) {
    home.displaySellers(function (Err, Results) {

        if (Err) {
            console.log(Err);
            throw Err;
        }
        else {
            ejs.renderFile('./views/Sellers.ejs',
                {sellers: Results, message: ""},
                function (err, result) {
                    if (!err) {
                        res.end(result);
                    }
                    else {
                        console.log(err);
                    }
                });
        }
    });
});
app.get('/displayCustomers', authenticate, function (req, res) {
    home.displayCustomers(function (Err, Results) {

        if (Err) {
            console.log(Err);
            throw Err;
        }
        else {
            ejs.renderFile('./views/customers.ejs',
                {customers: Results, message: ""},
                function (err, result) {
                    if (!err) {
                        res.end(result);
                    }
                    else {
                        console.log(err);
                    }
                });
        }
    });
});
////

app.post('/afterSignIn', home.afterSignIn);
app.get('/showProfile', authenticate, home.showProfile);

app.get('/bids/current', authenticate, home.inProgressBids);
app.get('/bids/won', authenticate, home.wonBids);
app.get('/bids/missed', authenticate, home.lostBids);

app.get('/products/waiting', authenticate, home.waitingProducts);
app.get('/products/sold', authenticate, home.soldProducts);
app.get('/products/bought', authenticate, home.boughtProducts);
app.get('/products/add', authenticate, home.createProductForm);
app.post('/products/add', authenticate, function (req, res) {
    var mclass, message;
    if (!req.param('ProductName') || !req.param('ProductCost')) {
        mclass = 'danger';
        message = 'Fields marked with a star are compulsory';
    }
    else {
        if (req.param('IsAuction') == "Y") {
            home.createProduct(req.session.user.EmailId, req.param('ProductName'), req.param('ProductCondition'), req.param('ProductDetails'), req.param('ProductCost'), req.param('Category'), req.param('AvailableQuantity'), req.param('BidStartTime'), req.param('BidEndTime'), req.param('IsAuction'));
        }
        else {
            home.createProduct(req.session.user.EmailId, req.param('ProductName'), req.param('ProductCondition'), req.param('ProductDetails'), req.param('ProductCost'), req.param('Category'), req.param('AvailableQuantity'), "NA", "NA", req.param('IsAuction'));
        }
        mclass = 'info';
        message = 'Successfully added!';
    }
    res.render('activity/products_add.ejs', {allCategories:req.session.allCategories,mclass: mclass, message: message});
});
app.get('/products/update', authenticate, home.editProduct);
app.post('/products/update', authenticate, home.modifyProduct);

app.get('/list/sellers', authenticate, home.allSellers);

app.get('/browse', authenticate, home.categoryGroupedListing);
app.post('/browse', authenticate, home.bidForProduct);
app.get('/search', authenticate, home.categoryGroupedListing);
app.get('/advancedSearch',authenticate, home.advancedSearch);
app.post('/personAdvancedSearch',authenticate,home.personAdvancedSearch);
app.post('/productAdvancedSearch',authenticate,home.productAdvancedSearch);
app.get('/account', authenticate, home.updateUserForm);
app.post('/account', authenticate, home.updateUser);

app.get('/logout', home.signOut);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
