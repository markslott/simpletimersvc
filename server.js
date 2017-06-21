
var express    = require('express');        
var app        = express();                 
var bodyParser = require('body-parser');
var sf         = require('node-salesforce');

var config = require('./app/config/config')();


var conn = new sf.Connection({
  oauth2 : {
    loginUrl : config.loginUrl,
    clientId : config.clientId,
    clientSecret : config.clientSecret,
    redirectUri : config.callbackUri
  }
   
});

/*

conn.login(config.username, config.password, function(err, userInfo) {
  if (err) { 
    console.error(err);
    process.exit(1);
  }
  // Now you can get the access token and instance URL information. 
  // Save them to establish connection next time. 
  
  console.log("Successful connection to Salesforce");
  console.log("access token : " + conn.accessToken);
  console.log("instance url : " + conn.instanceUrl);
  console.log("refresh token: " + conn.refreshToken);
  console.log("User ID      : " + userInfo.id);
  console.log("Org ID       : " + userInfo.organizationId);
});*/

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'pug');

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================

require('./app/routes')(app, conn);


// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

var oauth2 = new sf.OAuth2({
  // you can change loginUrl to connect to sandbox or prerelease env. 
  // loginUrl : 'https://test.salesforce.com', 
    loginUrl : config.loginUrl,
    clientId : config.clientId,
    clientSecret : config.clientSecret,
    redirectUri : config.callbackUri
});

app.get('/', function (req, res) {
  res.render('index', { title: 'Hey', message: 'Hello there!', accessToken: conn.accessToken });
  console.log(conn.accessToken);
})

// 
// Get authz url and redirect to it. 
// 
app.get('/oauth2/auth', function(req, res) {
  res.redirect(oauth2.getAuthorizationUrl({ scope : 'api refresh_token' }));
});

// 
// Pass received authz code and get access token 
// 
app.get('/oauth2/callback', function(req, res) {
  var conn = new sf.Connection({ oauth2 : oauth2 });
  var code = req.param('code');
  conn.authorize(code, function(err, userInfo) {
    if (err) { return console.error(err); }
    // Now you can get the access token, refresh token, and instance URL information. 
    // Save them to establish connection next time. 
    console.log("Access Token: " + conn.accessToken);
    console.log("Refresh Token: " + conn.refreshToken);
    console.log("Instance URL: " + conn.instanceUrl);
    console.log("User ID: " + userInfo.id);
    console.log("Org ID: " + userInfo.organizationId);
    // ... 
  });
});
