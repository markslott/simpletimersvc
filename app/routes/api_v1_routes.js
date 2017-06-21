module.exports = function(app, conn, config) {

  app.post('/v1/timer',(req, res) => {
	  var seconds = parseInt(req.body.seconds);
	  var timerId = req.body.timerId;

	  console.log(req.body);
	  setTimeout(function() {
	  
	    conn.sobject("Timer__c").update({ 
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

};