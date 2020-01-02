const express = require('express');
const router = express.Router();
const tokenMW = require('./../../middleware/token');
const rolesValidation = require('./../../middleware/roles.validation');
const usersRepository = require('../../data/repositories/usersRepository');
const userRoles = require('../../data/roles/user.roles');
const { User } = require('../../data/schemas/user');
const { Video } = require('../../data/schemas/video');
const { userMessageValidate, UserMessage } = require('../../data/schemas/userMessage');
const { MoneyRequest } = require('../../data/schemas/moneyRequest');
const queryBuilder = require('../../data/util/queryBuilder');
const Joi = require('joi');
const _ = require('lodash');
const { ObjectId } = require('mongoose').Types;

router.use(tokenMW);
router.get('/', async (req, res) => {
    try {
        const response = await queryBuilder(req.query, User);
        const users = await response.query;

        res.status(200).send({
            code: 1,
            count: response.countDocuments || users.length,
            data: users
        });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error getting Users',
            error: error.message
        });
    }
});

router.get('/update', async (req, res) => {
    const users = await User.find({}, { watchedVideos: 1 });

    await User.update({}, { $unset: { favoriteVideos: 1, favoritedVideos: 1, videosStatus: 1 } }, { multi: true })
    _.forEach(users, async u => {
        _.forEach(u.watchedVideos, async w => {
            await User.updateOne({ _id: u._id }, {
                $push: {
                    videosStatus: {
                        _id: w._id,
                        percent: 1,
                        seconds: 0,
                        duration: 0,
                        date: Date.now()
                    },
                    favoritedVideos: {
                        _id: w._id
                    }
                }
            });
        });
    });

    res.status(200).send({
        code: 100,
        message: 'Update finished'
    });
});

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('roles')
            .populate('groups');

        res.status(200).send({
            code: 1,
            data: user
        });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error getting User',
            error: error.message
        });
    }
});

router.get('/:id/roles', async (req, res) => {
    try {
        const roles = await User
            .findById(req.params.id, { roles: 1, _id: 0 })
            .populate('roles');

        res.status(200).send({
            code: 1,
            count: roles.length,
            data: roles
        });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error getting Roles',
            error: error.message
        });
    }
});

router.get('/:id/favoritedVideos', async (req, res) => {
    try {
        const favoritedVideos = await User
            .findById(req.params.id, { favoritedVideos: 1, _id: 0 });

        res.status(200).send({
            code: 1,
            count: favoritedVideos.length,
            data: favoritedVideos
        });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error getting Favorite Videos',
            error: error.message
        });
    }
});

router.get('/:id/moneyrequests', async (req, res) => {
    try {
        let moneyRequests;
        if (req.query.limit && req.query.skip) {
            moneyRequests = await MoneyRequest.find({ user: req.params.id }).limit(parseInt(req.query.limit)).skip(parseInt(req.query.skip)).populate('pokerRoom').sort('-date');
        } else {
            moneyRequests = await MoneyRequest.find({ user: req.params.id }).populate('pokerRoom').sort('-date');
        }

        const documentsCount = await MoneyRequest.find({ user: req.params.id }).count();
        res.status(200).send({
            code: 1,
            count: documentsCount,
            data: moneyRequests
        });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error getting Money Requests for this User',
            error: error.message
        });
    }
});

router.get('/:id/pokerrooms', async (req, res) => {
    try {
        const user = await User
            .findById(req.params.id, { pokerRooms: 1, _id: 0 });

        res.status(200).send({
            code: 1,
            count: user.pokerRooms.length,
            data: user.pokerRooms
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

router.post('/:id/videostatus/:videoId', async (req, res) => {
    try {
        await User.updateOne({ _id: req.params.id }, { $pull: { videosStatus: { _id: ObjectId(req.params.videoId) } } });
        const result = await User.updateOne({ _id: req.params.id }, {
            $push: {
                videosStatus: {
                    _id: ObjectId(req.params.videoId),
                    percent: req.body.percent,
                    seconds: req.body.seconds,
                    duration: req.body.duration,
                    date: Date.now()
                }
            }
        });

        res.status(200).send({
            code: 100,
            message: result.nModified > 0 ? 'Status saved' : 'Status not saved'
        });
    } catch (error) {
        res.status(500).send({
            code: 200,
            message: 'Error saving video status',
            error: error.message
        });
    }
});

router.get('/:id/videos', async (req, res) => {
    try {
        let videos = [];

        if (req.query.category && req.query.category.id)
            videos = await usersRepository.getVideosByCategoryId(req.params.id, req.query.category.id);
        else if (req.query.group && req.query.group.id)
            videos = await usersRepository.getVideosByGroupId(req.params.id, req.query.group.id);
        else if (req.query.term)
            videos = await usersRepository.getVideosByTerm(req.params.id, req.query.term);
        else if (req.query.watched)
            videos = await usersRepository.getVideosByWatchedStatus(req.params.id, req.query.watched);
        else if (req.query.favorites)
            videos = await usersRepository.getFavoritedVideos(req.params.id, req.query.favorites);
        else
            videos = await usersRepository.getVideos(req.params.id);

        if (req.query.userCanWatch) {
            videos = _.filter(videos, v => v.canWatch);
        }

        if (req.query.orderBy) {
            if (!(req.query.orderBy instanceof Array)) {
                videos = _.orderBy(videos, `video.${req.query.orderBy}`, _.isEqual(req.query.orderBy, 'name') ? 'asc' : 'desc');
            }
        }

        const user = await User.findById(req.params.id, { watchedVideos: 1, videosStatus: 1, _id: 0 });
        _.forEach(videos, v => {
            const watchedVideo = _.find(user.watchedVideos, function (i) {
                return i.equals(v.video._id);
            });

            v.videoStatus = _.find(user.videosStatus, { '_id': v.video._id });
        });

        res.status(200).send({
            code: 1,
            count: videos.length,
            totalWatchedVideos: user.videosStatus.length,
            data: videos
        });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error getting Users',
            error: error.message
        });
    }
});

router.get('/:id/groups', async (req, res) => {
    try {
        const user = await User
            .findById(req.params.id, { groups: 1, _id: 0 })
            .populate('groups');

        res.status(200).send({
            code: 1,
            count: user.groups.length,
            data: user.groups
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

router.get('/:id/lastWatchedVideos', async (req, res) => {
    try {
        const lastWatchedVideos = await User.aggregate([
            { $match: { _id: ObjectId(req.params.id) } },
            { $unwind: '$videosStatus' },
            { $project: { videosStatus: 1, _id: 0 } },
            { $sort: { 'videosStatus.date': -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'videos',
                    localField: 'videosStatus._id',
                    foreignField: '_id',
                    as: 'videoInfo'
                }
            },
            { $unwind: '$videoInfo' },
            {
                $project: {
                    videoInfo: {
                        _id: '$videoInfo._id',
                        name: '$videoInfo.name',
                        currentTime: '$videosStatus.seconds'
                    }
                }
            }
        ]);

        res.status(200).send({
            code: 1,
            count: lastWatchedVideos.length,
            data: lastWatchedVideos
        });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error getting Messages',
            error: error.message
        });
    }
});

router.get('/:id/messages', async (req, res) => {
    try {
        const user = await User
            .findById(req.params.id, { messages: 1, _id: 0 });

        res.status(200).send({
            code: 1,
            count: user.messages.length,
            data: _.orderBy(user.messages, ['date'], ['desc'])
        });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error getting Messages',
            error: error.message
        });
    }
});

router.delete('/:id/messages/:messageId', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id });
        const message = user.messages.id(req.params.messageId);
        if (!message) {
            res.status(404).json({
                code: 2,
                message: 'Message not found'
            });
        }

        message.remove();
        await user.save();

        res.status(201).json({
            code: 1,
            data: user.messages
        });
    } catch (error) {
        res.status(500).json({
            code: 2,
            message: 'Error at delete',
            error: error.message
        });
    }
});

router.post('/:id/messages', async (req, res) => {
    const error = userMessageValidate(req.body);
    if (error) {
        return res.status(400).send({
            code: 12,
            error: error
        });
    }

    try {
        const result = await User.findByIdAndUpdate(req.params.id, {
            $push: {
                messages: new UserMessage({
                    message: req.body.message,
                    status: 0,
                    date: Date.now()
                })
            }
        });

        res.status(201).json({
            code: 1,
            data: result._id
        });
    } catch (error) {
        res.status(500).json({
            code: 2,
            message: 'Error at creation',
            error: error.message
        });
    }
});

router.post('/', [rolesValidation(userRoles.insert)], async (req, res) => {
    const error = validate(req.body);
    if (error) {
        return res.status(400).send({
            code: 12,
            error: error
        });
    }

    try {
        const newUser = await usersRepository.add(req.body);

        res.status(201).json({
            code: 1,
            data: newUser
        });
    } catch (error) {
        if (error.message === '15') {
            return res.status(409).json({
                code: 15,
                message: 'User already exists'
            });
        }

        res.status(500).json({
            code: 2,
            message: 'Error at creation',
            error: error.message
        });
    }
});

router.put('/:id', [rolesValidation(userRoles.update)], async (req, res) => {
    const user = req.body;
    if (!user) {
        return res.status(404).send({
            id: 2,
            message: 'User not provided'
        });
    }

    const userId = req.params.id;
    if (!userId) {
        return res.status(404).send({
            id: 2,
            message: 'Userid not provided'
        });
    }

    try {
        const result = await usersRepository.update(userId, user);

        res.status(200).send({
            code: 1,
            message: 'Updated finished',
            savedUser: result
        });
    } catch (error) {
        if (error.message === '15') {
            return res.status(409).json({
                code: 15,
                message: 'User already exists'
            });
        }

        res.status(500).send({
            code: 2,
            message: error.message
        });
    }
});

router.delete('/:id', [rolesValidation(userRoles.delete)], async (req, res) => {
    try {
        if (await userHasRelationships(req.params.id)) {
            return res.status(400).send({
                code: 202,
                message: 'User cannot be deleted. Reason: Relationships'
            });
        }

        const user = await usersRepository.deleteById(req.params.id);
        if (user)
            res.status(200).send({
                code: 100,
                data: user
            });
        else
            res.status(404).send({
                code: 201,
                data: null,
                message: 'User not found'
            });
    }
    catch (error) {
        res.status(500).send({
            code: 200,
            message: 'Error deleting User',
            error: error.message
        });
    }
});

router.post('/activate/:id', async (req, res) => {
    try {
        const modifiedItems = await usersRepository.activate(req.params.id);
        if (modifiedItems) {
            res.status(200).json({
                code: 1,
                modifiedItems: modifiedItems
            });
        } else {
            res.status(404).json({
                code: 1,
                error: 'User not found',
                modifiedItems: modifiedItems
            });
        }
    } catch (error) {
        res.status(500).json({
            code: 2,
            message: 'Error at activate user',
            error: error.message
        });
    }
});

router.post('/deactivate/:id', async (req, res) => {
    try {
        const modifiedItems = await usersRepository.deactivate(req.params.id);
        if (modifiedItems) {
            res.status(200).json({
                code: 1,
                modifiedItems: modifiedItems
            });
        } else {
            res.status(404).json({
                code: 1,
                error: 'User not found',
                modifiedItems: modifiedItems
            });
        }
    } catch (error) {
        res.status(500).json({
            code: 2,
            message: 'Error at deactivate user',
            error: error.message
        });
    }
});

router.post('/:userid/videoaction/:action/:videoid', async (req, res) => {
    try {
        let selectedFunction;
        switch (req.params.action) {
            case 'favorite':
                selectedFunction = usersRepository.addFavoriteVideo(req.params.userid, req.params.videoid);
                break;
            case 'unfavorite':
                selectedFunction = usersRepository.removeFavoriteVideo(req.params.userid, req.params.videoid);
                break;
            default:
                return res.status(400)
                    .send({
                        code: 12,
                        error: 'Wrong action'
                    });
                break;
        }

        const modifiedItems = await selectedFunction;
        if (modifiedItems) {
            res.status(200).json({
                code: 1,
                modifiedItems: modifiedItems
            });
        } else {
            res.status(404).json({
                code: 1,
                error: 'Video not exist on users watched videos or already exists',
                modifiedItems: modifiedItems
            });
        }
    } catch (error) {
        res.status(500).json({
            code: 2,
            message: 'Error at update watched videos for this user',
            error: error.message
        });
    }
});

async function userHasRelationships(id) {
    const moneyRequest = await MoneyRequest.find({ user: ObjectId(id) });
    if (moneyRequest.length > 0) return true;

    const instructor = await Video.find({ instructor: ObjectId(id) });
    if (instructor.length > 0) return true;

    return false;
}

function validate(user) {
    const joiSchema = Joi.object().keys({
        _id: Joi.optional(),
        name: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().required().email(),
        password: Joi.string().required(),
        groups: Joi.array(),
        roles: Joi.array(),
        active: Joi.optional(),
        active: Joi.optional(),
        canInformValueAtMoneyRequest: Joi.optional(),
        dealPercentage: Joi.number().required(),
        rg: Joi.number().required(),
        cpf: Joi.number().required(),
        phone: Joi.string().required(),
        phone1: Joi.string().optional().allow(''),
        addresses: Joi.array().required(),
        pokerRooms: Joi.array().optional()
    });

    const { error } = Joi.validate(user, joiSchema);
    return error;
}

module.exports = router;