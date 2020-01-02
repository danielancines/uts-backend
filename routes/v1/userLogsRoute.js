const express = require('express');
const router = express.Router();
const tokenMW = require('./../../middleware/token');
const { User } = require('../../data/schemas/user');
const queryBuilder = require('../../data/util/queryBuilder');
const { userLogValidate, UserLog } = require('../../data/schemas/userLogs');

router.use(tokenMW);
router.post('/', async (req, res) => {
    try {
        const validation = userLogValidate(req.body);
        if (validation) {
            return res.status(400)
            .send({
                code:12,
                error: validation.details[0].message
            });
        }

        const newLog = new UserLog({
            dataId: req.body.dataId,
            userId: req.body.userId,
            action: req.body.action,
            date: req.body.date ? req.body.date : new Date()
        });

        const savedLog = await newLog.save();
        res.status(201).json({
            code: 1,
            data: savedLog
        });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error saving new userLog',
            error: error.message
        });
    }
});

module.exports = router;