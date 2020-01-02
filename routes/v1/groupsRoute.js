const express = require('express');
const router = express.Router();
const tokenMW = require('./../../middleware/token');
const { Group, groupValidate } = require('./../../data/schemas/group');
const queryBuilder = require('../../data/util/queryBuilder');
const groupRoles = require('../../data/roles/group.roles');
const { Video } = require('../../data/schemas/video');
const rolesValidation = require('./../../middleware/roles.validation');
const _ = require('lodash');

router.use(tokenMW);
router.get('/', async (req, res) => {
    try {
        const response = await queryBuilder(req.query, Group);
        const groups = await response.query;

        res.status(200).send({
            code: 1,
            count: response.countDocuments || groups.length,
            data: groups
        });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error getting Groups',
            error: error.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        res.status(200).send({
            code: 1,
            data: group
        });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error getting Group',
            error: error.message
        });
    }
});

router.put('/:id', [rolesValidation(groupRoles.update)], async (req, res) => {
    const group = req.body;
    if (!group || !group._id) {
        return res.status(404).send({
            id: 2,
            message: 'Group not provided'
        });
    }

    const groupId = req.params.id;
    if (!groupId) {
        return res.status(404).send({
            id: 2,
            message: 'GroupId not provided'
        });
    }

    try {
        const result = await Group.findByIdAndUpdate(groupId, {
            $set: {
                name: group.name,
                description: group.description,
                hierarchy: group.hierarchy,
                color: group.color
            }
        });

        res.status(200).send({
            code: 1,
            message: 'Updated finished',
            savedGroup: result
        });
    } catch (error) {
        res.status(500).send({
            code: 2,
            message: error.message
        });
    }
});

router.post('/', [rolesValidation(groupRoles.insert)], async (req, res) => {
    const error = groupValidate(req.body);
    if (error) {
        return res.status(400).send({
            code: 12,
            error: error
        });
    }

    try {
        delete req.body._id;
        const newGroup = new Group(req.body);
        await newGroup.save();
        res.status(201).json({
            code: 1,
            data: newGroup
        });
    } catch (error) {
        res.status(500).json({
            code: 2,
            message: 'Error at creation',
            error: error.message
        });
    }
});

router.delete('/:id', [rolesValidation(groupRoles.delete)], async (req, res) => {
    try {
        const video = await Video.findOne({group: req.params.id});
        if (!_.isNull(video)) {
            return res.status(400).send({
                code: 400,
                message: 'Cannot delete - Relationship',
                table: 'Videos'
            });
        }

        const group = await Group.findByIdAndRemove(req.params.id);
        if (group)
            res.status(200).send({
                code: 1,
                data: group
            });
        else
            res.status(404).send({
                code: 2,
                data: null,
                message: 'Group not found'
            });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error deleting Group',
            error: error.message
        });
    }
});

module.exports = router;