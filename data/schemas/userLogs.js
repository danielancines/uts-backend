const mongoose = require('mongoose');
const Joi = require('joi');
const allowedActions = ['watchedvideo', 'setwatchedvideo', 'setunwatchedvideo', 'login', 'logout'];

const userLogSchema = new mongoose.Schema({
    action: { type: String, required: true },
    dataId: mongoose.Schema.Types.ObjectId,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: Date
}, { collection: 'userLogs' });

function validate(userLog) {
    const joiSchema = Joi.object().keys({
        _id: Joi.optional(),
        action: Joi.string().valid(allowedActions),
        dataId: Joi.optional(),
        userId: Joi.optional(),
        date: Joi.optional()
    });

    const { error } = Joi.validate(userLog, joiSchema);
    return error;
}

module.exports = {
    UserLog: mongoose.model('UserLog', userLogSchema),
    userLogValidate: validate
}