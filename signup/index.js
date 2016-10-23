'use strict';

var validator = require("email-validator");
var fs = require('fs');
var request = require('request');
var credentialsPath = './credentials.json';
var credentials = JSON.parse(fs.readFileSync(credentialsPath));

var api_key = credentials.apiKey;
var domain = credentials.domain;
var requestUrl = "https://api.mailgun.net/v3/"+domain+"/messages"

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

  var auth = {
    'user': 'api',
    'pass': api_key,
    'sendImmediately': false
  };

  var requestData = {
    'url': requestUrl,
    'form': data,
    'auth': auth
  };

  request.post(requestData, function(err, httpResponse, body) {
    if (err) {
      callback("Error.ServerError.MailError");
      return;
    }
      callback(null, {success: true});
  });
};
