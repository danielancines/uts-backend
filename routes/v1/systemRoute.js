
const express = require('express');
const router = express.Router();
const { SystemMessage } = require('../../data/schemas/systemMessage');
const { User } = require('../../data/schemas/user');

router.get('/alertMessages', async (req, res) => {
    try {
        const systemMessage = await SystemMessage
        .find({active: true});

        res.status(200).send({
            code: 1,
            count: systemMessage.length,
            data: systemMessage
        });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error getting System Messages',
            error: error.message
        });
    }
});

module.exports = router;