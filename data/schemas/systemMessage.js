const mongoose = require('mongoose');

const systemMessageSchema = new mongoose.Schema({
    title: { type: String },
    message: { type: String },
    message1: { type: String },
}, { collection: 'systemMessages' });

module.exports = {
    SystemMessage: mongoose.model('SystemMessage', systemMessageSchema)
}