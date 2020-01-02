const express = require('express');
const router = express.Router();
const tokenMW = require('./../../middleware/token');
const queryBuilder = require('../../data/util/queryBuilder');
const { PokerRoom, pokerRoomValidate } = require('./../../data/schemas/pokerRoom');
const { User } = require('./../../data/schemas/user');
const pokerRoomRoles = require('../../data/roles/pokerRoom.roles');
const rolesValidation = require('./../../middleware/roles.validation');
const usersRepository = require('../../data/repositories/usersRepository');
const _ = require('lodash');

router.use(tokenMW);
router.get('/', async (req, res) => {
    try {
        const response = await queryBuilder(req.query, PokerRoom);
        const pokerRooms = await response.query;

        res.status(200).send({
            code: 1,
            count: response.countDocuments || pokerRooms.length,
            data: pokerRooms
        });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error getting Poker Rooms',
            error: error.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const pokerRoom = await PokerRoom.findById(req.params.id);
        res.status(200).send({
            code: 1,
            data: pokerRoom
        });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error getting PokerRoom',
            error: error.message
        });
    }
});

router.post('/', [rolesValidation(pokerRoomRoles.insert)], async (req, res) => {
    const error = pokerRoomValidate(req.body);
    if (error) {
        return res.status(400).send({
            code: 12,
            error: error
        });
    }

    try {
        delete req.body._id;
        const newPokerRoom = new PokerRoom(req.body);
        await newPokerRoom.save();
        res.status(201).json({
            code: 1,
            data: newPokerRoom
        });
    } catch (error) {
        res.status(500).json({
            code: 2,
            message: 'Error at creation',
            error: error.message
        });
    }
});

router.put('/:id', [rolesValidation(pokerRoomRoles.update)], async (req, res) => {
    const pokerRoom = req.body;

    const pokerRoomId = req.params.id;
    if (!pokerRoomId) {
        return res.status(404).send({
            id: 2,
            message: 'PokerRoomId not provided'
        });
    }

    try {
        const result = await PokerRoom.findByIdAndUpdate(pokerRoomId, {
            $set: {
                name: pokerRoom.name,
                currency: pokerRoom.currency
            }
        });

        usersRepository.updateUsersPokerRoomsData(pokerRoomId, pokerRoom.name, pokerRoom.currency);

        res.status(200).send({
            code: 1,
            message: 'Updated finished',
            savedPokerRoom: result
        });
    } catch (error) {
        res.status(500).send({
            code: 2,
            message: error.message
        });
    }
});

router.delete('/:id', [rolesValidation(pokerRoomRoles.delete)], async (req, res) => {
    try {
        const pokerRoom = await PokerRoom.findByIdAndRemove(req.params.id);
        if (pokerRoom)
            res.status(200).send({
                code: 1,
                data: pokerRoom
            });
        else
            res.status(404).send({
                code: 2,
                data: null,
                message: 'PokerRoom not found'
            });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error deleting PokerRoom',
            error: error.message
        });
    }
});

module.exports = router;