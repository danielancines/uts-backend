const mongoose = require('mongoose');
const Joi = require('joi');

const pokerRoomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    currency: String
});

pokerRoomSchema.methods.idToString = function() {
    return mongoose.Types.ObjectId(this._id).valueOf().toString();
};

function validate(pokerRoom) {
    const joiSchema = Joi.object().keys({
        _id: Joi.optional(),
        name: Joi.string().required(),
        currency: Joi.string().optional()
    });

    const { error } = Joi.validate(pokerRoom, joiSchema);
    return error;
}

module.exports = {
    PokerRoom: mongoose.model('PokerRoom', pokerRoomSchema),
    pokerRoomValidate: validate
}