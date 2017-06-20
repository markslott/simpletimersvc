// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var sf         = require('node-salesforce');

var username = "mlott@msl.23.demo";
var password = "big4fish";
var sectoken = "VTnigsDWGljTO9U7lL1ZK75W7";

var conn = new sf.Connection({
  // you can change loginUrl to connect to sandbox or prerelease env. 
   loginUrl : 'https://msl-23-demo.my.salesforce.com' 
});
conn.login(username, password+sectoken, function(err, userInfo) {
  if (err) { return console.error(err); }
  // Now you can get the access token and instance URL information. 
  // Save them to establish connection next time. 
  console.log(conn.accessToken);
  console.log(conn.instanceUrl);
  // logged in user property 
  console.log("User ID: " + userInfo.id);
  console.log("Org ID: " + userInfo.organizationId);
  // ... 
});

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

router.route('/echo').post(function(req, res) {
  var seconds = parseInt(req.body.seconds);
  var timerId = req.body.timerId;
  console.log(req.body);
  setTimeout(function() {
     console.log('time to send response');

    conn.sobject("Timer__c").update({ 
      Id : req.body.timerId,
      Timer_Expired__c : true
      }, function(err, ret) {
      if (err || !ret.success) { return console.error(err, ret); }
      console.log('Updated Successfully : ' + ret.id);
      // ... 
    });

     
  },seconds*1000);
  res.json({message : 'msg sent',
 	    seconds : seconds,
            payload : payload});
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
