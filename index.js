'use strict';

var validator = require("email-validator");
var fs = require('fs');
var credentialsPath = './credentials.json';
var credentials = JSON.parse(fs.readFileSync(credentialsPath));

var api_key = credentials.apiKey;
var domain = credentials.domain;
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

exports.handler = function(event, context, callback) {
  var user = event["name"];

  if (!validator.validate(user)) {
    callback("Error.InputError.InvalidEmail");
  }

  var data = {
    from: 'Excited User <'+ user +'>',
    to: credentials.to,
    subject: 'Luath API key request for ' + user,
    text: 'Hi, I\'d like to have an API key for Luath. My email is: ' + user
  };

  mailgun.messages().send(data, function (error, body) {
    if (error) {
      callback("Error.ServerError.MailError");
      return;
    }
      callback(null, {success: true});
  });
};
