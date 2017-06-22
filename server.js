
var express    = require('express');        
var app        = express();                 
var bodyParser = require('body-parser');
var sf         = require('node-salesforce');
var config     = require('./app/config/config')();
var client     = require('redis').createClient(process.env.REDIS_URL);


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

var conn;

client.exists('tokens', function(err, reply) {
    if (reply === 1) {
      console.log('tokens exist');
      client.hgetall('tokens', function(err, object) {
        console.log(object);
        conn = new sf.Connection({
          oauth2 : oauth2,
          instanceUrl : object.instanceUrl,
          accessToken : object.accessToken,
          refreshToken : object.refreshToken
        }).on("refresh", function(accessToken, res) {
          // Refresh event will be fired when renewed access token 
          // to store it in your storage for next request 
        }); 
      });
    } else {
      console.log('tokens don\'t exist');
      conn = new sf.Connection({
            oauth2 : oauth2
      });
    }
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
    client.del('tokens', function(err, reply) {
      console.log("deleting tokens from redis");
      console.log(reply);
    });
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
    client.hmset('tokens', {
      'refreshToken': conn.refreshToken,
      'accessToken' : conn.accessToken,
      'instanceUrl' : conn.instanceUrl,
      'userId'      : userInfo.id,
      'orgId'       : userInfo.organizationId
    });
    res.render('index', { accessToken: conn.accessToken, config : config });

  });
});
