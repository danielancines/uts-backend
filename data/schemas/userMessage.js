const mongoose = require('mongoose');
const Joi = require('joi');

const userMessageSchema = new mongoose.Schema({
    message: { type: String, required: true },
    date: Date,
    status: Number
}, { collection: 'userMessages' });

function validate(userMessage) {
    const joiSchema = Joi.object().keys({
        message: Joi.string().required(),
        status: Joi.number().optional()
    });

    const { error } = Joi.validate(userMessage, joiSchema);
    return error;
}

module.exports = {
    UserMessageSchema: userMessageSchema,
    UserMessage: mongoose.model('UserMessage', userMessageSchema),
    userMessageValidate: validate
}