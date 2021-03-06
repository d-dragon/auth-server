//require('strongloop-license')('gateway:gateway=StrongLoop API Gateway', 'EXIT');
var boot = require('loopback-boot');
var http = require('http');
var bodyParser = require('body-parser');
var https = require('https');
var loopback = require('loopback');
var path = require('path');
var site = require('./site');
var sslCert = require('./private/ssl_cert');

var app = module.exports = loopback();
var httpsOptions = {
  key: sslCert.privateKey,
  cert: sslCert.certificate
};
app.httpsOptions = httpsOptions;

boot(app, __dirname, function(err) {
  if (err) throw err;

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  //configure body parser
  app.use(bodyParser.urlencoded({extended: true}));
  
  //app.use(loopback.token({
  //    model: app.models.accessToken,
  //    cookies: ['access_token']
  //}));

  // Set up login/logout forms
  app.get('/login', site.loginForm);
  app.get('/signup', site.signupForm);
  app.get('/verified', site.verified);
  app.get('/resetPassword', site.resetPassword);

  app.oauth2 = app._oauth2Handlers; // For testing

  var isMain = require.main === module;
  app.start = function() {
    var port = app.get('port');
    var host = app.get('host');
    var httpServer = http.createServer(app).listen(port, host, function() {
      if (isMain)
        printServerListeningMsg('http', host, port);

      var httpsPort = app.get('https-port');
      var httpsServer = https.createServer(httpsOptions, app).listen(httpsPort,
          host, function() {
        if (isMain)
          printServerListeningMsg('https', host, httpsPort);

        app.emit('started');

        app.close = function(cb) {
          app.removeAllListeners('started');
          app.removeAllListeners('loaded');
          httpServer.close(function() {
            httpsServer.close(cb);
          });
        };
      });
    });
  };

  if (isMain)
    app.start();

  app.loaded = true;
  app.emit('loaded');
});

function printServerListeningMsg(protocol, host, port) {
  var url = protocol + '://' + host + ':' + port;
  console.log('Web server listening at', url);
}
