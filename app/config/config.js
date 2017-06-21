module.exports = () => {

	const sfObjectName = "Timer__c";

	var loginUrl = process.env.SF_LOGIN_URL;
	var clientId = process.env.SF_CLIENT_ID;
	var clientSecret = process.env.SF_CLIENT_SECRET;
	var callbackUri = 'https://salty-forest-79248.herokuapp.com/oauth2/callback';

	var configInvalid = false;

	if (loginUrl === undefined) {
	  loginUrl = 'https://login.salesforce.com';
	  console.warn('Warning: SF_LOGIN_URL not defined. defaulting to https://login.salesforce.com')
	}

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