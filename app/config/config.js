module.exports = () => {

	const sfObjectName = "Timer__c";

	var loginUrl = process.env.SF_LOGIN_URL;
	var clientId = process.env.SF_CLIENT_ID;
	var clientSecret = process.env.SF_CLIENT_SECRET;
	var callbackUri = 'https://salty-forest-79248.herokuapp.com/oauth2/callback';

	var configInvalid = false;

	if (clientId === undefined) {
		console.error('SF_CLIENT_ID environment variable not set. Got to set that first, then start app.');
		configInvalid = true;
	}

	if (clientSecret === undefined) {
		console.error('SF_CLIENT_SECRET environment variable not set. Got to set that first, then start app.');
		configInvalid = true;
	}

	if (loginUrl === undefined) {
	  loginUrl = 'https://login.salesforce.com';
	  console.warn('Warning: SF_LOGIN_URL not defined. defaulting to https://login.salesforce.com')
	}

	console.warn('Callback URL set to: ' + callbackUri);
	console.warn('Make sure hostname is set properly in config.js, or oauth will not work');
	console.warn('Salesforce object name set to : ' + sfObjectName);
	console.warn('Verify that object name matches your salesforce org if you have not.');

	if (configInvalid) {
		process.exit(1);
	}

	return {
		loginUrl : loginUrl,
		sfObjectName : sfObjectName,
		clientId : clientId,
		clientSecret : clientSecret,
		callbackUri : callbackUri
	}
};