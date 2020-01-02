const express = require('express');
const router = express.Router();
const tokenMW = require('../../middleware/token');
const rolesValidation = require('./../../middleware/roles.validation');
const videosRepository = require('../../data/repositories/videosRepository');
const usersRepository = require('../../data/repositories/usersRepository');
const videoRoles = require('../../data/roles/video.roles');
const { Video, videoValidate } = require('../../data/schemas/video');
const { User } = require('../../data/schemas/user');
const queryBuilder = require('../../data/util/queryBuilder');
const _ = require('lodash');

router.use(tokenMW);
router.get('/', [rolesValidation(videoRoles.access)], async (req, res) => {
    try {
        const response = await queryBuilder(req.query, Video);
        const videos = await response.query;

        res.status(200).send({
            code: 1,
            count: response.countDocuments || videos.length,
            data: videos
        });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error getting Videos',
            error: error.message
        });
    }
});

router.get('/watch/:id', async (req, res) => {
    try {
        const video = await videosRepository.getById(req.params.id);
        const user = await usersRepository.getGroups(req.user._id);

        let findGroup = false;
        _.forEach(user.groups, id => {
            if (id.equals(video.group._id)) return findGroup = true;
        })

        if (!findGroup) {
            return res.status(403)
                .send({
                    code: 403,
                    message: 'User dont have permission to watch this video'
                });
        }

        await setCurrentTimeByUser(video, user._id);
        res.status(200).send({
            code: 1,
            data: video
        });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error getting Video',
            error: error.message
        });
    }
});

async function setCurrentTimeByUser(video, userId) {
    const user = await User.findOne({
        _id: userId,
        'videosStatus._id': video._id
    }, { 'videosStatus.$': 1 });

    if (_.isUndefined(user) || _.isNull(user) || user.videosStatus.length <= 0) return;

    const videoStatus = user.videosStatus[0];
    if (_.isNull(video.url) || _.isUndefined(video.url)) return video.url;

    const currentTime = videoStatus.seconds;
    const regex = /<iframe.*?src="(.*?)"/;
    const srcValue = regex.exec(video.url);
    if (!srcValue || srcValue <= 0) return video.url;

    const urlValue = srcValue[1];
    video.url = video.url.replace(urlValue, `${urlValue}#t=${currentTime}`);    
}

router.get('/:id', async (req, res) => {
    try {
        const video = await videosRepository.getById(req.params.id);
        res.status(200).send({
            code: 1,
            data: video
        });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error getting Video',
            error: error.message
        });
    }
});

router.post('/', [rolesValidation(videoRoles.insert)], async (req, res) => {
    const error = videoValidate(req.body);
    if (error) {
        return res.status(400).send({
            code: 12,
            error: error
        });
    }

    try {
        const newVideo = await videosRepository.add(req.body);

        res.status(201).json({
            code: 1,
            data: newVideo
        });
    } catch (error) {
        res.status(500).json({
            code: 2,
            message: 'Error at creation',
            error: error.message
        });
    }
});

router.put('/:id', [rolesValidation(videoRoles.update)], async (req, res) => {
    const video = req.body;
    if (!video || !video._id) {
        return res.status(404).send({
            id: 2,
            message: 'Video not provided'
        });
    }

    const videoId = req.params.id;
    if (!videoId) {
        return res.status(404).send({
            id: 2,
            message: 'VideoId not provided'
        });
    }

    try {
        const result = await videosRepository.update(videoId, video);

        res.status(200).send({
            code: 1,
            message: 'Updated finished',
            savedVideo: result
        });
    } catch (error) {
        res.status(500).send({
            code: 2,
            message: error.message
        });
    }
});

router.delete('/:id', [rolesValidation(videoRoles.delete)], async (req, res) => {
    try {
        const video = await videosRepository.deleteById(req.params.id);
        if (video)
            res.status(200).send({
                code: 1,
                data: video
            });
        else
            res.status(404).send({
                code: 2,
                data: null,
                message: 'Video not found'
            });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error deleting Video',
            error: error.message
        });
    }
});

module.exports = router;