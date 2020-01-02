const mongoose = require('mongoose');
const Joi = require('joi');

const videoSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    url: String,
    date: Date,
    duration: Number,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    details: String
});

function validate(video) {
    const joiSchema = Joi.object().keys({
        _id: Joi.optional(),
        description: Joi.string().allow(''),
        duration: Joi.number().optional(),
        name: Joi.string().required(),
        category: Joi.object().required(),
        group: Joi.object().required(),
        instructor: Joi.object().required(),
        url: Joi.string().allow(''),
        details: Joi.string().allow('')
    });

    const { error } = Joi.validate(video, joiSchema);
    return error;
}

module.exports = {
    Video: mongoose.model('Video', videoSchema),
    videoValidate: validate
}