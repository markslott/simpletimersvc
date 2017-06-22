
var express    = require('express');        
var app        = express();                 
var bodyParser = require('body-parser');
var sf         = require('node-salesforce');
var config     = require('./app/config/config')();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'pug');
app.use(express.static(__dirname+'/public'));

var port = process.env.PORT || 8080;        // set our port


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

var conn = new sf.Connection({
  oauth2 : oauth2
});

require('./app/routes')(app, conn);

app.get('/', function (req, res) {
  res.render('index', { accessToken: conn.accessToken, config : config });
  console.log(conn.accessToken);
})

// 
// Get authz url and redirect to it. 
// 
app.get('/oauth2/auth', function(req, res) {
  res.redirect(oauth2.getAuthorizationUrl({ scope : 'api refresh_token' }));
});

app.get('/oauth2/logout', function(req, res) {
  conn.logout(function(err) {
    if (err) { return console.error(err); }
    // now the session has been expired. 
    res.render('index', { accessToken: conn.accessToken, config : config });
  });
})

// 
// Pass received authz code and get access token 
// 
app.get('/oauth2/callback', function(req, res) {
  //var conn = new sf.Connection({ oauth2 : oauth2 });
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
    res.render('index', { accessToken: conn.accessToken, config : config });
  });
});
