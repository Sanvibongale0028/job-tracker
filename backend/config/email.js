const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:  {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((err, success) =>  {
    if(err)  {
        console.error('Email setup failed: ', err.message);
    } else  {
        console.log('Email server ready!');
    }
});

module.exports = transporter;