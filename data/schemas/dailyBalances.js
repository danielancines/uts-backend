const mongoose = require('mongoose');
const Joi = require('joi');

const dailyBalancesSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date },
    firstRegistration: { type: Date },
    lastRegistration: { type: Date },
    gamesCount: { type: Number },
    balances: [
        {
            pokerRoomId: { type: mongoose.Schema.Types.ObjectId, ref: 'PokerRoom', required: true },
            value: { type: Number}
        }]
});

function validate(dailyBalance) {
    const joiSchema = Joi.object().keys({
        user: Joi.object().required(),
        date: Joi.date().required(),
        firstRegistration: Joi.date().required(),
        lastRegistration: Joi.date().required(),
        gamesCount: Joi.number().required(),
        balances: Joi.array().optional()
    });

    const { error } = Joi.validate(dailyBalance, joiSchema);
    return error;
}

module.exports = {
    DailyBalance: mongoose.model('dailyBalances', dailyBalancesSchema),
    dailyBalanceValidate: validate
}