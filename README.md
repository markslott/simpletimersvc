# simpletimersvc

A simple timer service using [Express 4](http://expressjs.com/). Useful for triggering actions in Salesforce asynchrnously
after a few seconds. Workflows are measured in minutes, but when you need to trigger something in seconds to a few minutes,
this service will help get it done.

Just create a Timer__c object in your Salesforce org with two fields:
Seconds__c (Number)
Timer_Expired__c (Checkbox)

You can change the oauth callback uri and the object name in the config.js file.
You will also need to create a connected app in your salesforce org. this app uses the oauth2 web login flow to authorize the app to use the API, so you will need to set some Heroku environment variables with the client id and client secret from the connected app in Salesforce. 

Add the TimerController apex class to your org and configure a process builder flow to fire the startTimer() method when a
new timer record is created.  Don't forget to change the endpoint in the apex class and add a remote site setting to allow 
Salesforce to call it.

## Deploying to Heroku

```
heroku create
heroku addons:create heroku-redis:hobby-dev
heroku config:set SF_CLIENT_ID=<your connected app client id>
heroku config:set SF_CLIENT_SECRET=<your connected app client secret>
heroku config:set SF_LOGIN_URL=[https://login.salesforce.com | <your custom domain>]
git push heroku master
```

Alternatively, you can deploy your own copy of the app using the web-based flow:

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

