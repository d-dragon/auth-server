//var path = require('path');
//var request = require('request');
var async = require('async');

 /* TODO - seperate users module to isolate OAuth's User access */
module.exports = function(app) {
	//var router = app.loopback.Router;
	var users = app.loopback.getModelByType(app.models.User);

	app.get('/', function(req, res) {
		res.render('login');
	});

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

  //send an email with instructions to reset an existing user's password
  app.post('/request-password-reset', function(req, res, next) {
	  console.log(">>>>>email: " + req.body.email);
    users.resetPassword({
      email: req.body.email
    }, function(err) {
      if (err) return res.status(401).send(err);

      res.render('response', {
        title: 'Password reset requested',
        content: 'Check your email for further instructions',
        redirectTo: '/ropc-flow.html',
        redirectToLinkText: 'Log in'
      });
    });
  });

  //show password reset form
  app.get('/reset-password', function(req, res, next) {
    if (!req.query && !req.query.access_token) {
		console.log("invalid access token");
		return res.sendStatus(401);
	}
	token = req.query.access_token;
    res.render('password-reset', {
      //redirectUrl: '/api/users/reset-password?access_token='+
      // token
		accessToken: req.query.access_token
    });
  });

  app.post('/reset-password', function(req, res) {
	  if (!req.query.access_token) {
		  console.log("invalid token");
		  return res.sendStatus(401);
	  }
	  tokenId = req.query.access_token;
	  console.log("token: " + tokenId);
	  user = app.models.User;
	  user.relations.accessTokens.modelTo.findById(tokenId, function(err, accessToken) {
		  if (err) return res.sendStatus(501);
		  if (!accessToken) {
			  console.log("could not find accessToken");
			  return res.sendStatus(501);
		  }
		  user.findById(accessToken.userId, function(err, user) {
			  if (!user) {
				  console.log("could not find a valid user");
			  }
			  console.log(user.email);
			  console.log("accessToken.id: " + accessToken.id);
			  console.log("password: " + req.body.newPassword);

			  async.series([
			    	  function (cb) {
			    		  user.updateAttribute('password',
			    				  req.body.newPassword, function (err, _user) {
			    					  if (err) return cb(err)
			    						  cb()
			    				  })
			    	  },
			    	  function (cb) {
			    		  accessToken.destroy()
			    			  cb()
			    	  }
			  ], function (err) {
			      if (err) {
			    	  return res.render('password-reset', {
			    		  accessToken: accessToken.id,
			    		  email: user.email,
			    		  errorMessage: 'Something went wrong!'
			    	  })
			      }
			      res.render('password-reset', {
			    	  accessToken: accessToken.id,
			    	  email: user.email,
			    	  done: true
			      })
			  })
		  })
	  })
  }) 
};
