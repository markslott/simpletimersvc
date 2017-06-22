
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

var oauth2 = new sf.OAuth2({
  // you can change loginUrl to connect to sandbox or prerelease env. 
  // loginUrl : 'https://test.salesforce.com', 
    loginUrl : config.loginUrl,
    clientId : config.clientId,
    clientSecret : config.clientSecret,
    redirectUri : config.callbackUri
});

var conn, tokens;


//on startup, check for refresh/access tokens in redis.
//if present, use that to login
//otherwise, just set the oauth values for the connection and wait for 
//someone to start the oauth web flow
client.exists('tokens', function(err, reply) {
    if (reply === 1) {
      console.log('tokens exist');
      client.hgetall('tokens', function(err, object) {
        console.log(object);
        //this will reestablish the connection to Salesforce
        tokens = object;
        conn = new sf.Connection({
          oauth2 : oauth2,
          instanceUrl : object.instanceUrl,
          accessToken : object.accessToken,
          refreshToken : object.refreshToken
        }).on("refresh", function(accessToken, res) {
          client.hgetall('tokens', function(err, object) {
            client.hmset('tokens', {
              'refreshToken': object.refreshToken,
              'accessToken' : accessToken,
              'instanceUrl' : object.instanceUrl,
              'userId'      : object.id,
              'orgId'       : object.organizationId
            });
            tokens.accessToken = accessToken;
          }); 
        });
        //test connection
        
        conn.query("SELECT Id FROM "+config.sfObjectName+" LIMIT 5", function(err, result) {
          if (err) {
            console.error("Error testing connection:");
            console.error(err);
            console.error("Going to destroy tokens - need to reauthenticate to SF");
            //assume tokens are invalid - destroy them!!!
            tokens = null;
            conn = new sf.Connection({
                  oauth2 : oauth2
            });
            client.del('tokens', function(err, reply) {
              console.log("deleting tokens from redis");
              console.log(reply);
            });

          } else {
            console.log("Testing connection - no error");
          }
          
        });
      });
    } else {
      console.log('tokens don\'t exist. you will need to login to Salesforce org via web page');
      conn = new sf.Connection({
            oauth2 : oauth2
      });
    }
});

app.get('/', function (req, res) {
  res.render('index', { tokens: tokens, config : config });
})

// 
// Get authz url and redirect to it. 
// 
app.get('/oauth2/auth', function(req, res) {
  res.redirect(oauth2.getAuthorizationUrl({ scope : 'api refresh_token' }));
});


// destroy the tokens in redis, kill the connection.
app.get('/oauth2/logout', function(req, res) {
  conn.logout(function(err) {
    if (err) {
      console.error('logout error: message below');
      console.error(err);
      //return console.error(err);
    }
    
    client.del('tokens', function(err, reply) {
      console.log("deleting tokens from redis");
      console.log(reply);
    });
    tokens = null;
    res.render('index', { tokens: tokens, config : config });
  });
})

// 
// Pass received authz code and get access token 
// stash token and use to estabilsh connection to Salesforce
// 
app.get('/oauth2/callback', function(req, res) {
  //var conn = new sf.Connection({ oauth2 : oauth2 });
  var code = req.param('code');
  var sflogin = new sf.Connection({
      oauth2 : oauth2
  });
  sflogin.authorize(code, function(err, userInfo) {
    if (err) { return console.error(err); }
    // Now you can get the access token, refresh token, and instance URL information. 
    // Save them to establish connection next time. 
    console.log("Successful login to Salesforce:");
    console.log("accessToken: " + sflogin.accessToken);
    console.log("refreshToken: "+ sflogin.refreshToken);
    console.log("instanceUrl: " +sflogin.instanceUrl);
    console.log("User ID: " + userInfo.id);
    console.log("Org ID: " + userInfo.organizationId);
    tokens = {
      refreshToken : sflogin.refreshToken,
      accessToken : sflogin.accessToken,
      instanceUrl : sflogin.instanceUrl,
      userId      : userInfo.id,
      orgId       : userInfo.organizationId
    }
    client.hmset('tokens', tokens);
    //login using access and refresh token - we should now stay logged in for
    //a very long time - basically as long as the refresh token lives.
    conn = new sf.Connection({
      oauth2       : oauth2,
      instanceUrl  : tokens.instanceUrl,
      accessToken  : tokens.accessToken,
      refreshToken : tokens.refreshToken
    }).on("refresh", function(accessToken, res) {
      client.hgetall('tokens', function(err, object) {
        client.hmset('tokens', {
          'refreshToken': object.refreshToken,
          'accessToken' : accessToken,
          'instanceUrl' : object.instanceUrl,
          'userId'      : object.id,
          'orgId'       : object.organizationId
        });
        tokens.accessToken = accessToken;
      })
    }); 
    res.render('index', { tokens: tokens, config : config });
  });
});

app.post('/api/v1/timer',(req, res) => {
    var seconds = parseInt(req.body.seconds);
    var timerId = req.body.timerId;

    console.log(req.body);
    setTimeout(function() {
    
      conn.sobject(config.sfObjectName).update({ 
        Id : req.body.timerId,
        Timer_Expired__c : true
        }, function(err, ret) {
        if (err || !ret.success) { return console.error(err, ret); }
        console.log('Updated Successfully : ' + ret.id);
      });

       
    },seconds*1000);
    res.json({message : 'msg sent',
        seconds : seconds,
        timerId : timerId});
  });

// START THE SERVER
// =============================================================================
app.listen(port);
