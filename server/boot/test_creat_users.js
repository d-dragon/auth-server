module.exports = function(app, cb) {
	var async = require('async');

	console.log("----------------------------");
	var users = [
					{
						username: "dustin",
						password: "12345",
						email: "aaa@bbb.com"
					},
					{
						username: "abcd",
						password: "12345",
						email: "bbb@bbb.com"
					}
	];
	function createUsers(done) {
		async.each(users, function createUser(user, done) {
			app.models.User.findOrCreate({username: user.username}, user, 
					function(err, user) {
						if (!err) {
							console.log('User registered: id=%s username=%s password=%s',
									user.id, user.username, user.password);
						}
						done(err);
					});
		}, done);
	}
  async.parallel([createUsers], cb);
};
