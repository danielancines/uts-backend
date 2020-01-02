const mongoose = require('mongoose');
const Joi = require('joi');
const moneyRequestsSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, required: true },
    pokerRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'PokerRoom' },
    value: { type: Number },
    status: { type: Number },
    details: String
});

function validate(moneyRequest) {
    const joiSchema = Joi.object().keys({
        user: Joi.string().required(),
        date: Joi.date().required(),
        pokerRoom: Joi.string().required(),
        value: Joi.number().optional(),
        status: Joi.number().optional(),
        details: Joi.string().optional()
    });

    const { error } = Joi.validate(moneyRequest, joiSchema);
    return error;
}

module.exports = {
    MoneyRequest: mongoose.model('moneyRequest', moneyRequestsSchema),
    moneyRequestValidate: validate
}