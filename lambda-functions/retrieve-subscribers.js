'use strict';

// We'll again use the AWS SDK to get an instance of our database
var aws = require('aws-sdk');
var db = new aws.DynamoDB();

exports.handler = (event, context, callback) => {
  // We'll modify our response code a little bit so that when the response
  // is ok, we'll return the list of emails in the message
  const RESPONSE = {
    OK : {
      statusCode : 200,
      message: [],
    },
    ERROR_NO_EMAIL : {
      status : 400,
      message: "Something went wrong. Please try again."
    }
  };

  // We'll use the scan method to get all the data from our database
  db.scan({
    TableName: "augophilia-participants-2017"
    }, function(err, data) {
      if (err) {
        callback(null, RESPONSE.ERROR_NO_EMAIL);
      }
      else {
         // If we get data back, we'll do some modifications to make it easier to read
         for(var i = 0; i < data.Items.length; i++){
           RESPONSE.OK.message.push(
               {
                 'email': data.Items[i].email.S,
                 'firstname': data.Items[i].firstname.S,
                 'lastname': data.Items[i].lastname.S}
           );
         }
           callback(null, RESPONSE.OK);
      }
  });
};