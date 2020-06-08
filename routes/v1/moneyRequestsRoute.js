const express = require('express');
const router = express.Router();
const tokenMW = require('./../../middleware/token');
const queryBuilder = require('../../data/util/queryBuilder');
const { MoneyRequest, moneyRequestValidate } = require('./../../data/schemas/moneyRequest');
const { User } = require('./../../data/schemas/user');
const moneyRequestRoles = require('../../data/roles/moneyRequest.roles');
const rolesValidation = require('./../../middleware/roles.validation');
const _ = require('lodash');
const { addUserMessage } = require('../../data/util/messageService');

router.use(tokenMW);
router.get('/', async (req, res) => {
    try {
        const response = await queryBuilder(req.query, MoneyRequest);
        const moneyRequests = await response.query;

        res.status(200).send({
            code: 1,
            count: response.countDocuments || moneyRequests.length,
            data: moneyRequests
        });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error getting Money Requests',
            error: error.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const moneyRequest = await MoneyRequest.findById(req.params.id).populate('user').populate('pokerRoom');
        res.status(200).send({
            code: 1,
            data: moneyRequest
        });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error getting MoneyRequest',
            error: error.message
        });
    }
});

router.post('/', async (req, res) => {
    const error = moneyRequestValidate(req.body);
    if (error) {
        return res.status(400).send({
            code: 12,
            error: error
        });
    }

    try {
        delete req.body._id;
        let newMoneyRequest = new MoneyRequest(req.body);
        newMoneyRequest.status = 0;
        await newMoneyRequest.save();
        res.status(201).json({
            code: 1,
            data: newMoneyRequest
        });
    } catch (error) {
        res.status(500).json({
            code: 2,
            message: 'Error at creation',
            error: error.message
        });
    }
});

router.put('/:id', [rolesValidation(moneyRequestRoles.update)], async (req, res) => {
    const moneyRequest = req.body;
    const moneyRequestId = req.params.id;
    if (!moneyRequestId) {
        return res.status(404).send({
            id: 2,
            message: 'MoneyRequestId not provided'
        });
    }

    try {
        const result = await MoneyRequest.findByIdAndUpdate(moneyRequestId, {
            $set: {
                status: moneyRequest.status,
                value: moneyRequest.value,
                details: moneyRequest.details
            }
        }).populate('pokerRoom');

        let message;
        switch (parseInt(moneyRequest.status)) {
            case 1:
                message = `Pedido de aporte solicitado no dia: ${result.date.getDate()}/${result.date.getMonth()+1}/${result.date.getFullYear()}, para a sala ${result.pokerRoom.name} foi recusado.`;
                break;
            case 2:
                message = `Pedido de aporte solicitado no dia: ${result.date.getDate()}/${result.date.getMonth()+1}/${result.date.getFullYear()}, para a sala ${result.pokerRoom.name} foi aprovado.`;
                break;
        }

        if (message)
            await addUserMessage(result.user, message);

        res.status(200).send({
            code: 1,
            message: 'Updated finished',
            savedMoneyRequest: result
        });
    } catch (error) {
        res.status(500).send({
            code: 2,
            message: error.message
        });
    }
});

router.delete('/:id', [rolesValidation(moneyRequestRoles.delete)], async (req, res) => {
    try {
        const moneyRequest = await MoneyRequest.findOneAndDelete(req.params.id);
        if (moneyRequest)
            res.status(200).send({
                code: 1,
                data: moneyRequest
            });
        else
            res.status(404).send({
                code: 2,
                data: null,
                message: 'MoneyRequest not found'
            });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error deleting MoneyRequest',
            error: error.message
        });
    }
});

module.exports = router;