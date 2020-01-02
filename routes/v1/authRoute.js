const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const userRepository = require('../../data/repositories/usersRepository');
const Joi = require('joi');
const tokenMW = require('../../middleware/token');

router.post('/register', async (req, res) => {
    if (!req.body.email || !req.body.password)
        return res.status(400).send({
            code: 2,
            message: 'Email or Password not found'
        });

    try {
        const result = await userRepository.add({
            email: req.body.email,
            name: req.body.name,
            lastName: req.body.lastName,
            password: req.body.password
        });

        res.send(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.post('/resetPassword', async (req, res) => {
    const error = validateResetPassword(req.body);
    if (error) {
        return res.status(400).send({
            changed: false,
            message: error.details[0].message
        });
    }

    const email = req.body.email.toString();
    const newPassword = req.body.newPassword.toString();

    try {
        const user = await userRepository.getByEmail(email);
        const result = await userRepository.changePassword(email, newPassword);
        if (result > 0) {
            res.status(200)
            .send({
                updated: true
            });
        } else{
            return res.status(404).send({
                updated: false
            });
        }


    } catch (error) {
        return res.status(404).send({
            code: 1,
            updated: false,
            error: error ? error.message : 'Error at updating passwords'
        });
    }
});

router.post('/changePassword', tokenMW, async (req, res) => {
    const error = validateChangePassword(req.body);
    if (error) {
        return res.status(400).send({
            changed: false,
            message: error.details[0].message
        });
    }

    const email = req.body.email.toString();
    const currentPassword = req.body.currentPassword.toString();
    const newPassword = req.body.newPassword.toString();

    try {
        const user = await userRepository.getByEmail(email);
        const passwordIsValid = await bcrypt.compare(currentPassword, user.password);

        if (!passwordIsValid) {
            return res.status(404).send({
                code: 14,
                update: false,
                message: 'Invalid Credentials'
            });
        }

        const result = await userRepository.changePassword(email, newPassword);
        if (result > 0) {
            res.status(200)
            .send({
                updated: true
            });
        } else{
            return res.status(404).send({
                updated: false
            });
        }


    } catch (error) {
        return res.status(404).send({
            code: 1,
            updated: false,
            error: error ? error.message : 'Error at updating passwords'
        });
    }
});

router.post('/password', tokenMW, async (req, res) => {
    const error = validate(req.body);
    if (error) {
        return res.status(400).send({
            authentication: false,
            message: error.details[0].message
        });
    }

    const email = req.body.email.toString();
    const password = req.body.password.toString();

    try {
        const user = await userRepository.getByEmail(email);
        const passwordIsValid = await bcrypt.compare(password, user.password);

        if (!passwordIsValid) {
            return res.status(404).send({
                code: 14,
                authentication: false,
                message: 'Invalid Credentials'
            });
        }

        res.status(200)
            .send({
                authentication: true
            });

    } catch (error) {
        return res.status(404).send({
            code: 1,
            authentication: false,
            message: 'Invalid Credentials',
            error: error ? error.message : 'Invalid Credentials'
        });
    }
});

router.post('/login', async (req, res) => {
    const error = validate(req.body);
    if (error) {
        return res.status(400).send({
            message: error.details[0].message
        });
    }

    const email = req.body.email.toString();
    const password = req.body.password.toString();

    if (!email || !password)
        return res.status(400).send({
            code: 2,
            message: 'Email or Password not found'
        });

    try {
        const user = await userRepository.getByEmail(email);
        const passwordIsValid = await bcrypt.compare(password, user.password);

        if (!user.active) {
            return res.status(401).send({
                code: 20,
                message: 'User desactivated'
            });
        }

        if (!passwordIsValid) {
            return res.status(401).send({
                code: 14,
                message: 'Invalid Credentials'
            });
        }

        const token = user.generateAuthToken();

        res.header({ 'x-access-token': token }).status(200).send({
            authentication: true,
            _id: user._id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            avatarHash: user.avatarHash,
            token: token
        });

    } catch (error) {
        return res.status(404).send({
            code: 1,
            message: 'Invalid Credentials',
            error: error ? error.message : 'Invalid Credentials'
        });
    }
});

function validate(user) {
    const joiSchema = Joi.object().keys({
        email: Joi.string().required().email(),
        password: Joi.string().required()
    });

    const { error } = Joi.validate(user, joiSchema);
    return error;
}

function validateChangePassword(user) {
    const joiSchema = Joi.object().keys({
        email: Joi.string().required().email(),
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().required()
    });

    const { error } = Joi.validate(user, joiSchema);
    return error;
}

function validateResetPassword(user) {
    const joiSchema = Joi.object().keys({
        email: Joi.string().required().email(),
        newPassword: Joi.string().required()
    });

    const { error } = Joi.validate(user, joiSchema);
    return error;
}

module.exports = router;