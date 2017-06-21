module.exports = () => {

	const sfObjectName = "Timer__c";
	var username = process.env.SF_USER_NAME;
	var password = process.env.SF_PASSWORD;
	var sectoken = process.env.SF_SECURITY_TOKEN;
	var loginUrl = process.env.SF_LOGIN_URL;
	var clientId = process.env.SF_CLIENT_ID;
	var clientSecret = process.env.SF_CLIENT_SECRET;
	var callbackUri = 'https://salty-forest-79248.herokuapp.com/oauth2/callback';

	var configInvalid = false;

	if (loginUrl === undefined) {
	  loginUrl = 'https://login.salesforce.com';
	  console.warn('Warning: SF_LOGIN_URL not defined. defaulting to https://login.salesforce.com')
	}

	if (sectoken === undefined) {
	  sectoken = '';
	  console.warn('Warning: SF_TIMER_SECURITY_TOKEN. Your Salesforce Security Token: You might need it, you might not');
	}

	if (username === undefined) {
		console.error('Error: SF_TIMER_USER_NAME undefined. Got to have your SF creds for this to work.');
		configInvalid = true;
	}

	if (password === undefined) {
		console.error('Error: SF_TIMER_PASSWORD undefined. Got to have your SF creds for this to work. ');
		configInvalid = true;
	}

	if (configInvalid) {
		process.exit(1);
	}

	return {
		username : username,
		password : password + sectoken,
		loginUrl : loginUrl,
		sfObjectName : sfObjectName,
		clientId : clientId,
		clientSecret : clientSecret,
		callbackUri : callbackUri
	}
};