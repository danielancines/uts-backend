const mongoose = require('mongoose');
const Joi = require('joi');

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    color: String,
    hierarchy: Number
});

groupSchema.methods.idToString = function() {
    return mongoose.Types.ObjectId(this._id).valueOf().toString();
};

function validate(group) {
    const joiSchema = Joi.object().keys({
        _id: Joi.optional(),
        description: Joi.string().allow(''),
        name: Joi.string().required(),
        color: Joi.string().allow(''),
        hierarchy: Joi.number()
    });

    const { error } = Joi.validate(group, joiSchema);
    return error;
}

module.exports = {
    Group: mongoose.model('Group', groupSchema),
    groupValidate: validate
}