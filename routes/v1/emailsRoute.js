const express = require('express');
const router = express.Router();
const nodeMailer = require('nodemailer');
const config = require('config');
const tokenMW = require('./../../middleware/token');
const _ = require('lodash');
const userRepository = require('../../data/repositories/usersRepository');

router.post('/send', (req, res) => {
    let transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: config.get('emailAddress'),
            pass: config.get('emailPwd')
        }
    });

    let mailOptions = {
        from: `${req.body.name} <${req.body.email}>`,
        replyTo: req.body.email,
        to: 'daniel.ancines@gmail.com',
        subject: 'Ultimate Team Suite  - New Contact',
        html: `<p>Message: ${req.body.message}</p><p>Email: ${req.body.email}</p><p>Phone: ${req.body.phone}</p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.status(500).send(error);
        } else {
            res.sendStatus(200);
        }
    });
});

router.post('/', (req, res) => {
    let transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: config.get('emailAddress'),
            pass: config.get('emailPwd')
        }
    });

    let mailOptions = {
        from: req.body.replyTo,
        replyTo: req.body.replyTo,
        to: req.body.emailTo,
        subject: req.body.subject,
        html: `<p>${req.body.message}</p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.status(500).send(error);
        } else {
            res.sendStatus(200);
        }
    });
});

router.post('/allusers', tokenMW, async (req, res) => {
    let transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: config.get('emailAddress'),
            pass: config.get('emailPwd')
        }
    });

    const users = await userRepository.getActiveUsersEmail();

    const emailsTo = _.map(users, 'email');
    let mailOptions = {
        from: req.body.replyTo ? req.body.replyTo : 'nao-responda@ultimateteamsuite.com',
        replyTo: req.body.replyTo?  req.body.replyTo : 'nao-responda@ultimateteamsuite.com',
        bcc: emailsTo,
        subject: req.body.subject,
        html: `<p>${req.body.message}</p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.status(500).send(error);
        } else {
            res.sendStatus(200);
        }
    });
});

module.exports = router;