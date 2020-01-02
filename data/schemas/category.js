const mongoose = require('mongoose');
const Joi = require('joi');
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String
});

function validate(category) {
    const joiSchema = Joi.object().keys({
        _id: Joi.optional(),
        description: Joi.string().required(),
        name: Joi.string().required()
    });

    const { error } = Joi.validate(category, joiSchema);
    return error;
}

module.exports = {
    Category: mongoose.model('Category', categorySchema),
    categoryValidate: validate
}