'use strict';

// Require the AWS SDK and get the instance of our DynamoDB
var aws = require('aws-sdk');
var db = new aws.DynamoDB();


// Set up the model for our the email
var model = {
    email: {"S" : ""},
    firstname: {"S" : ""},
    lastname: {"S" : ""}
};

exports.handler = (event, context, callback) => {

    console.log('Received event:', JSON.stringify(event, null, 2));

    // We'll use the same response we used in our Webtask module
    const RESPONSE = {
        OK : {
            statusCode : 200,
            message: "You have successfully subscribed to the newsletter!",
        },
        DUPLICATE : {
            status : 400,
            message : "You are already subscribed."
        },
        ERROR_NO_EMAIL : {
            status : 400,
            message: "Please provide an email!"
        },
        ERROR_NO_FIRSTNAME : {
            status : 400,
            message: "Please provide your first name!"
        },
        ERROR_NO_LASTNAME : {
            status : 400,
            message: "Please provide your last name!"
        }
    };

    // Capture the email from our POST request
    var email = event.email;
    var firstname = event.firstname;
    var lastname = event.lastname;

    if(!email){
        // If we don't get an email, we'll end our execution and send an error
        return callback(null, RESPONSE.ERROR_NO_EMAIL);
    }
    if(!firstname){
        // If we don't get a first name, we'll end our execution and send an error
        return callback(null, RESPONSE.ERROR_NO_FIRSTNAME);
    }
    if(!lastname){
        // If we don't get an last name, we'll end our execution and send an error
        return callback(null, RESPONSE.ERROR_NO_LASTNAME);
    }

    // If we do have an email, we'll set it to our model
    model.email.S = email;
    model.firstname.S = firstname;
    model.lastname.S = lastname;

    // Insert the email into the database, but only if the email does not already exist.
    db.putItem({
        TableName: 'augophilia-participants-2017',
        Item: model,
        Expected: {
            email: { Exists: false }
        }
    }, function (err, data) {
        if (err) {
            // If we get an err, we'll assume it's a duplicate email and send an
            // appropriate message
            return callback(null, RESPONSE.DUPLICATE);
        }
        // If the data was stored succesfully, we'll respond accordingly
        callback(null, RESPONSE.OK);
    });
};