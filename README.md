# simpletimersvc

A simple timer service using [Express 4](http://expressjs.com/). Useful for triggering actions in Salesforce asynchrnously
after a few seconds. Workflows are measured in minutes, but when you need to trigger something in seconds to a few minutes,
this service will help get it done.

Just create a Timer__c object in your Salesforce org with two fields:
Seconds__c (Number)
Timer_Expired__c (Checkbox)

Add the TimerController apex class to your org and configure a process builder flow to fire the startTimer() method when a
new timer record is created.  Don't forget to change the endpoint in the apex class and add a remote site setting to allow 
Salesforce to call it.

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku Toolbelt](https://toolbelt.heroku.com/) installed.

```sh
git clone https://github.com/markslott/simpletimersvc.git # or clone your own fork
cd simpletimersvc
npm install
npm start
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

## Deploying to Heroku

```
heroku create
git push heroku master
heroku open
```

Alternatively, you can deploy your own copy of the app using the web-based flow:

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Documentation

To authenticate to Salesforce, you will need to set three environment variables:
SF_TIMER_USER_NAME  -  Set to the Salesforce API username you want to use
SF_TIMER_PASSWORD - Password for the Salesforce user
SF_TIMER_SECURITY_TOKEN - Salesforce security token for the Salesforce user
```
heroku config:set SF_TIMER_USER_NAME=myapiuser@my.org
heroku config:set SF_TIMER_PASSWORD=<password>
heroku config:set SF_TIMER_PASSWORD=<security token>
```
