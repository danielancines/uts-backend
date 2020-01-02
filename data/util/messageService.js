const { User } = require('../schemas/user');
const { UserMessage } = require('../../data/schemas/userMessage');

async function addUserMessage(id, message) {
    try {
        const result = await User.findByIdAndUpdate(id, {
            $push: { messages: new UserMessage({
                message: message,
                status: 0,
                date: Date.now()
            })}
        });

        return result;
    }
    catch (error) {
        return {
            code: 2,
            message: 'Error saving user message',
            error: error.message
        };
    }
}

module.exports = {
    addUserMessage
}