const mongoose = require('mongoose');
const Joi = require('joi');
const addressSchema = new mongoose.Schema({
    street: { type: String, required: true },
    zipcode: { type: Number, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true }
});

function validate(address) {
    const joiSchema = Joi.object().keys({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zipcode: Joi.number().required()
    });

    const { error } = Joi.validate(address, joiSchema);
    return error;
}

module.exports = {
    Address: mongoose.model('address', addressSchema),
    addressyValidate: validate
}