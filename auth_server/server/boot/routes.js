//var path = require('path');
//var request = require('request');
var async = require('async');

 /* TODO - seperate users module to isolate OAuth's User access */
module.exports = function(app) {
	//var router = app.loopback.Router;
	var users = app.loopback.getModelByType(app.models.User);

	//app.get('/', function(req, res) {
	//	res.render('login');
	//});

	app.post('/signup', function(req, res) {
		console.log("creating new user>>>>>>>>>");

/*******Async creating user*************
		user_info = [ 
		{
			username: "user1",
			password: "12345",
			email: "user1@gmail.com"
		} 
		];
		// NOTE - findOrCreate is an async operation
		function createUser(done) {
			async.each(user_info, function (user, done) {
				app.models.User.create(user,  
						function(err, user) {
							if (!err) {
								console.log('User registered: id=%s username=%s password=%s',
										user.id, user.username, user.password);
							}
						})

			}, done);
		};
		async.parallel([createUser]);
		//async.parallel([createUser], cb);
************************/

		/************test create user without async************/

		console.log("username: " + req.body.username);
		console.log("password: " + req.body.password);
		user_info = [
		{
			username: req.body.username,
			password: req.body.password,
			email:	req.body.email
		}
		];

		function createUser(done) {
			async.each(user_info, function (user, done) {
				app.models.User.create(user, function(err, user) {
					if (!err) {
						console.log('User registered: id=%s username=%s password=%s',
								user.id, user.username, user.password);

						res.send(user);
					}
				})
			}, done);
		};
		async.parallel([createUser]);
		/******************************************************/
	});

	app.get('/user', function(req, res) {
		console.log("find user by username");
		users.findOne({username: "dustin"}, function(err, user) {
			if(err) {
				console.log(err);
				res.send(err);
			} else if (!user) {
				console.log("user is not exist");
				res.send("user not found")
			} else {
				console.log(user.username);
				console.log(user.id);
				res.send("found!");
			}
		});
	})
	
	// This cause failed to access client pages
	//app.use(router);
};
