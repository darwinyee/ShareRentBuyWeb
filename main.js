const express = require('express');
const mysql = require('./modules/dbcon.js');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const helpers = require('./Utilities/helpers');
const handlebars = require('express-handlebars').create({ defaultLayout: 'main', helpers: helpers });
const initializePassport = require('./passport-config');
const mngUsers = require('./modules/users.js');

//add dotenv functionality
require('dotenv').config();
// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.engine('handlebars', handlebars.engine);
app.use('/static', express.static('public')); //Allow use of static files
app.set('view engine', 'handlebars'); //Use Handlebars templates
app.set('port', process.env.PORT || 3344); //Accept port from the commandline
app.set('mysql', mysql); //Use MySql DB engine
const pool = require('./modules/dbcon.js').pool;
app.use(express.static(path.join(__dirname, '/public'))); //Specify static files routes
app.use(express.static(path.join(__dirname, '/uploads')));
app.use(flash());
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false
	})
);


// Load users from the data base for authenticaion and store them in the users array
var users = [];
let getUser = () => {
	function initUsers(result) {
		users = JSON.parse(result);
	}
	mngUsers.data.getUsers(initUsers);
};
getUser();


// Used in authentication

initializePassport(
	passport, 
	email => users.find(user => user.email === email),  //function for finding the user based on email
	id => users.find(user => user.id === id)
);

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method')); // Allows use of action="/logout?_method=DELETE" method="POST" in logout form

// Renders register user page
app.get('/register', mngUsers.data.checkNotAuthenticated, (req, res) => {
	res.render('register');
});

// Registers and saves user in DB. This function has to stay here because of the global users array. 
app.post('/register', mngUsers.data.checkNotAuthenticated, async (req, res) => {
	function complete(input) {
		if(!input.error){
			users.push(input);
			//res.render('login');
		}
		res.send(input);	
	}
	mngUsers.data.registerUser(req, res, mysql, complete);
});

/*
// Check email
app.post('/checkEmail', mngUsers.data.checkNotAuthenticated, (req,res) =>{
	function complete(input){
		res.send(input);
	}
	mngUsers.data.checkEmailExists(req, res, complete);
});
*/

app.post('/updateUsr', mngUsers.data.checkAuthenticated, async(req, res) => {
	mngUsers.data.updateUser(req, res, getUser);
});

// Logs out the user
app.delete('/logout', mngUsers.data.checkAuthenticated, (req, res) => {
	req.logOut();
	res.redirect('/login');
});

// Specify remaining routes
app.use('/', require('./routes/index.js'));

//Go here when 404
app.use(function(req, res) {
	res.status(404);
	res.render('404');
});

//Go here when 500 error
app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

//Server
app.listen(app.get('port'), function() {
	console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
