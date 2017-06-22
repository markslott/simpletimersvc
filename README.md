# simpletimersvc

A simple timer service using [Express 4](http://expressjs.com/). Useful for triggering actions in Salesforce asynchronously after a few seconds. Workflows are measured in minutes, but when you need to trigger something in seconds to a few minutes, this service will help get it done.

The app is simple. On the salesforce side, configure the following, or just install the unmanaged package linked below.

## Configuring Salesforce manually

Create a Timer__c object in your Salesforce org with two fields:
Seconds__c (Number)
Timer_Expired__c (Checkbox)

Add the TimerController.apxc apex class to your org

Configure a process builder flow to fire the startTimer() method when a new Timer__c record is created.

Also, create a connected app in your salesforce org and grant the app the following rights: 
- api
- refresh_token

Copy the client id and client secret values - the Heroku app will need those values to authenticate to Salesforce


## Deploying to Salesforce using the unmanaged package

You can install the package linked below to install the timer object, apex classes, and process builder flow
<https://login.salesforce.com/packaging/installPackage.apexp?p0=04t6A000001CPTR>
You will need to modify the TimerController class to point to your Heroku app url.

Also, create a connected app in your salesforce org and grant the app the following rights: 
- api
- refresh_token

Copy the client id and client secret values - the Heroku app will need those values to authenticate to Salesforce

## Deploying to Heroku

```
git clone https://github.com/markslott/simpletimersvc
heroku create
```
Modify the app/config/config.js file and change the callbackUri value to reflect your heroku app's hostname
```
heroku addons:create heroku-redis:hobby-dev
heroku config:set SF_CLIENT_ID=<your connected app client id>
heroku config:set SF_CLIENT_SECRET=<your connected app client secret>
heroku config:set SF_LOGIN_URL=[https://login.salesforce.com | <your custom domain>]
git push heroku master
heroku open
```

Alternatively, you can deploy your own copy of the app using the web-based flow:

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Final Salesforce Configuration Steps

Once you know the URL of your heroku application, you will need to make some changes on the Salesforce side:
- Create a Remote Site Setting and add the Heroku app url as a remote site.  This will allow your Salesforce org to post messages to the Heroku app.
- Update the TimerController apex class to point to your Heroku app by changing the url variable.
- Assign a user the TimerDemoService permission set - this will be the user you use to connect the Heroku app to Salesforce


## Using the tool

Hopefully at this point, it is all configured. Now it is time to authorize the heroku app to use the Salesforce API
```
heroku open
```
and press the button to log into your Salesforce org. Log in with a user that has the TimerDemoService permission set.  If successful, you will see that you're authenticated and the web page will display your user id and org id

In Salesforce, go to the Timers tab and create a new record. Specify the number of seconds you want to wait. After that amount of time, the Timer Expired checkbox should be checked. At this point, assuming everything is working, you can tie triggers, workflows, or process builder flows off that state change and do anything you want.

You can verify what is happening on the Heroku side by running the following command
```
heroku logs -t
```
If your record has a checkbox

