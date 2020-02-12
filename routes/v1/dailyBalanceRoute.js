const express = require('express');
const router = express.Router();
const dailyBalanceRoles = require('../../data/roles/dailyBalance.roles');
const { DailyBalance, dailyBalanceValidate } = require('./../../data/schemas/dailyBalances');
const rolesValidation = require('./../../middleware/roles.validation');
const config = require('config');
const queryBuilder = require('../../data/util/queryBuilder');
const tokenMW = require('./../../middleware/token');
const _ = require('lodash');

router.use(tokenMW);
router.get('/', async (req, res) => {
    try {
        const response = await queryBuilder(req.query, DailyBalance);
        const dailyBalances = await response.query;

        res.status(200).send({
            code: 1,
            count: response.countDocuments || dailyBalances.length,
            data: dailyBalances
        });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error getting Daily Balances',
            error: error.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const dailyBalance = await DailyBalance.findById(req.params.id).populate('user');
        res.status(200).send({
            code: 1,
            data: dailyBalance
        });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error getting DailyBalance',
            error: error.message
        });
    }
});

router.post('/', [rolesValidation(dailyBalanceRoles.insert)], async (req, res) => {
    const error = dailyBalanceValidate(req.body);
    if (error) {
        return res.status(400).send({
            code: 12,
            error: error
        });
    }

    try {
        delete req.body._id;
        const newDailyBalance = new DailyBalance(req.body);
        await newDailyBalance.save();
        res.status(201).json({
            code: 1,
            data: newDailyBalance
        });
    } catch (error) {
        res.status(500).json({
            code: 2,
            message: 'Error at creation',
            error: error.message
        });
    }
});

router.delete('/:id', [rolesValidation(dailyBalanceRoles.delete)], async (req, res) => {
    try {
        const dailyBalance = await DailyBalance.findByIdAndRemove(req.params.id);
        if (dailyBalance)
            res.status(200).send({
                code: 1,
                data: dailyBalance
            });
        else
            res.status(404).send({
                code: 2,
                data: null,
                message: 'DailyBalance not found'
            });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error deleting DailyBalance',
            error: error.message
        });
    }
});

module.exports = router;