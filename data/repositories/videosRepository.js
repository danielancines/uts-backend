const { Video } = require('../schemas/video');
const { User } = require('../schemas/user');
const { ObjectId } = require('mongoose').Types;

async function getById(id) {
    try {
        const video = await Video.findById(id)
            .populate('category')
            .populate('group')
            .populate('instructor');
        return video;
    } catch (error) {
        throw error;
    }
}

async function getIn(ids) {
    try {
        const videos = await Video.find({ _id: { $in: ids } })
            .populate('category')
            .populate('group')
            .populate('instructor');    
        return videos;
    } catch (error) {
        throw error;
    }
}

async function getNotIn(ids) {
    try {
        const videos = await Video.find({ _id: { $nin: ids } })
            .populate('category')
            .populate('group')
            .populate('instructor');
        return videos;
    } catch (error) {
        throw error;
    }
}

async function get() {
    try {
        const videos = await Video.find()
            .populate('category')
            .populate('group')
            .populate('instructor');
        return videos;
    } catch (error) {
        throw error;
    }
}

async function getByCategoryId(id) {
    try {
        const videos = await Video.find({ 'category': ObjectId(id) })
            .populate('category')
            .populate('group')
            .populate('instructor');
        return videos;
    } catch (error) {
        throw error;
    }
}

async function getByGroupId(id) {
    try {
        const videos = await Video.find({ 'group': ObjectId(id) })
            .populate('category')
            .populate('group')
            .populate('instructor');
        return videos;
    } catch (error) {
        throw error;
    }
}

async function searchByTerm(term) {
    try {
        const users = await User.find({ $or: [{ 'name': { $regex: term, $options: 'i' } }, { 'lastName': { $regex: term, $options: 'i' } }] }, { _id: 1 });
        const videos = await Video.find({
            $or:
                [
                    { 'instructor': { $in: users } },
                    { 'name': { $regex: term, $options: 'i' } },
                    { 'description': { $regex: term, $options: 'i' } }
                ]
        }).populate('category')
            .populate('group')
            .populate('instructor');

        return videos;
    } catch (error) {
        throw error;
    }
}

async function add(video) {
    try {
        const newVideo = new Video({
            name: video.name,
            description: video.description,
            url: video.url,
            date: Date.now(),
            duration: video.duration,
            details: video.details,
            category: video.category._id,
            group: video.group._id,
            instructor: video.instructor._id
        });

        const result = await newVideo.save();
        return result;
    } catch (error) {
        throw error;
    }
}

async function update(id, video) {
    try {
        let savedVideo = await Video.findById(id);
        if (!savedVideo) throw new Error('Video not Found');

        savedVideo.set({
            name: video.name,
            description: video.description,
            thumbnail: video.thumbnail ? video.thumbnail : savedVideo.thumbnail,
            url: video.url ? video.url : savedVideo.url,
            duration: video.duration ? video.duration : savedVideo.duration,
            details: video.details,
            category: video.category ? video.category._id : savedVideo.category._id,
            group: video.group ? video.group._id : savedVideo.group._id,
            instructor: video.instructor ? video.instructor._id : savedVideo.instructor._id
        });

        return await savedVideo.save();
    } catch (error) {
        throw error;
    }
}

async function deleteById(id) {
    try {
        return await Video.findByIdAndRemove(id);
    } catch (error) {
        throw error;
    }
}

module.exports = {
    get,
    getById,
    getByCategoryId,
    getByGroupId,
    searchByTerm,
    add,
    update,
    deleteById,
    getIn,
    getNotIn
};
