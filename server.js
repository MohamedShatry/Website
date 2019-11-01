//jshint esversion:6

//Load required modules
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
//const xoauth2 = require('xoauth2');

const app = express();
app.use(express.static(path.join(__dirname ,"public")));
app.use(bodyParser.urlencoded({
  extended: true
}));

const oauth2Client = new OAuth2(
     process.env.clientID,
     process.env.clientSecret, // Client Secret
     "https://developers.google.com/oauthplayground" // Redirect URL
);

oauth2Client.setCredentials({
     refresh_token: process.env.refreshToken
});

const accessToken = oauth2Client.getAccessToken()

/*
app.enable('trust proxy');
app.use (function (req, res, next) {
  if (req.secure) {
          // request was via https, so do no special handling
          next();
  } else {
          // request was via http, so redirect to https
          res.redirect('https://' + req.headers.host + req.url);
  }
});
*/
//Rendering the main file on initial request
app.get("/", function (req, res){
  res.sendFile(path.join( __dirname ,'/index.html'));
});

//POST request for Resume
app.post("/resume", function (req, res){
  const requestName = req.body.name;
  const requestEmail = req.body.email;

  const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
          type: "OAuth2",
          user: process.env.EMAIL,
          clientId: process.env.clientID,
          clientSecret: process.env.clientSecret,
          refreshToken: process.env.refreshToken,
          accessToken: accessToken
     }
  });

  let mailOptions = {
    from: process.env.EMAIL,
    to: requestEmail,
    subject: "Re: Request for Mohamed Shatry's resume",
    html: `<p>Hello ${requestName}</p></br>
            <p> Kindly find attached my resume. </p></br></br>
            Regards`,
    attachments : [
      {
        filename: "Resume.pdf",
        path: __dirname + "/public/Resume.pdf"
      }
    ]
  }

  transporter.sendMail(mailOptions, function (err, res){
    if (err){
      console.log(err);
    }else {
      console.log(`Sent Email to ${req.body.email}`);
    }
  })
  transporter.close();
  res.redirect("/");
});

//POST request for contact form
app.post("/contact", function (req, res){
  const requestFirstName = req.body.firstName;
  const requestLastName = req.body.lastName;
  const requestEmail = req.body.email;
  const subject = req.body.subject;

  const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
          type: "OAuth2",
          user: process.env.EMAIL,
          clientId: process.env.clientID,
          clientSecret: process.env.clientSecret,
          refreshToken: process.env.refreshToken,
          accessToken: accessToken
     }
  });

  let mailOptions = {
    from: process.env.EMAIL,
    to: process.env.EMAIL,
    subject: "RE: Someone sent you a message",
    html: `<p>Heads up Mohamed, you have a new message from ${requestFirstName} ${requestLastName} @ ${requestEmail} </p></br>
          <p>${subject}</p>`
  }

  transporter.sendMail(mailOptions, function (err, res){
    if (err){
      console.log(err);
    }else {
      console.log(`Sent Email to ${req.body.email}`);
    }
  })
  transporter.close();
  res.redirect("/");

});


//Listening to PORT
let port = process.env.PORT || 3000
app.listen(port, function() {
  console.log(`Server started on port ${port}`);
});
