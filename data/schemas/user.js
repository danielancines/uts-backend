const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const config = require('config');
const Joi = require('joi');
const crypto = require('crypto');
const { expiresIn } = require('./../../config/token');
const { UserMessageSchema } = require('./userMessage');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    name: { type: String, required: true },
    lastName: String,
    avatarHash: String,
    active: Boolean,
    dealPercentage: Number,
    rg: Number,
    cpf: Number,
    phone: String,
    phone1: String,
    canInformValueAtMoneyRequest: Boolean,
    watchedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    favoritedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
    messages: [UserMessageSchema],
    password: { type: String, required: true },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    addresses: [],
    pokerRooms: [],
    videosStatus: []
});

userSchema.methods.generateAuthToken = function () {
    return jwt.sign(_.pick(this, ['_id', 'email', 'name', 'lastName']), config.get('privateKey'), { expiresIn: expiresIn });
};

userSchema.methods.generateAvatarHash = function () {
    return crypto.createHash('MD5').update(this.email).digest('hex');
}

function validate(user) {
    const joiSchema = Joi.object().keys({
        name: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().required().email(),
        password: Joi.string().required(),
        active: Joi.optional(),
        canInformValueAtMoneyRequest: Joi.optional(),
        dealPercentage: Joi.number().required(),
        rg: Joi.number().required(),
        cpf: Joi.number().required(),
        phone: Joi.string().required(),
        phone1: Joi.string().optional().allow(''),
        addresses: Joi.array().required(),
        pokerRooms: Joi.array().optional(),
        messages: Joi.array().optional()
    });

    const { error } = Joi.validate(user, joiSchema);
    return error;
}

module.exports = {
    User: mongoose.model('User', userSchema),
    validate
};