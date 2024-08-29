const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.USER_GMAIL_ENV,
    pass: process.env.PASS_GMAIL_ENV,
  }
});

module.exports = { transporter };