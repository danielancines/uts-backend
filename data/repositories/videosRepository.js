const { Video } = require('../schemas/video');
const { User } = require('../schemas/user');
const _ = require('lodash');
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

async function getIn(ids, skip = 0, limit = 20, orderByField = 'date', orderBySortMode = 'asc') {
    try {
        const options = [];
        addSortToOptions(options, orderBySortMode, orderByField);
        options.push({ $match: { _id: { $in: ids } } });
        options.push({ $skip: skip });
        options.push({ $limit: limit });

        return {
            videos: await getVideos(options),
            totalDocuments: await Video.find({ _id: { $in: ids } }).countDocuments()
        };
    } catch (error) {
        throw error;
    }
}

async function getNotIn(ids, skip = 0, limit = 20, orderByField = 'date', orderBySortMode = 'asc') {
    try {
        const options = [];
        addSortToOptions(options, orderBySortMode, orderByField);
        options.push({ $match: { _id: { $nin: ids } } });
        options.push({ $skip: skip });
        options.push({ $limit: limit });

        return {
            videos: await getVideos(options),
            totalDocuments: await Video.find({ _id: { $nin: ids } }).countDocuments()
        };
        
    } catch (error) {
        throw error;
    }
}

async function get(skip = 0, limit = 20, orderByField = 'date', orderBySortMode = 'asc') {
    try {
        const options = [];

        addSortToOptions(options, orderBySortMode, orderByField);
        options.push({ $skip: skip });
        options.push({ $limit: limit });

        return {
            videos: await getVideos(options),
            totalDocuments: await Video.countDocuments()
        };

    } catch (error) {
        throw error;
    }
}

async function getVideos(options) {
    try {
        options.push(
            {
                $project: {
                    _id: 1,
                    name: 1,
                    group: 1,
                    category: 1,
                    instructor: 1,
                    duration: 1,
                    date: 1
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'instructor',
                    foreignField: '_id',
                    as: 'instructor'
                }
            },
            {
                $lookup: {
                    from: 'groups',
                    localField: 'group',
                    foreignField: '_id',
                    as: 'group'
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: { path: "$instructor", preserveNullAndEmptyArrays: true } },
            { $unwind: "$group" },
            { $unwind: "$category" },
            {
                $project: {
                    name: '$name',
                    group: '$group',
                    category: '$category',
                    date: '$date',
                    duration: '$duration',
                    instructor: {
                        _id: '$instructor._id',
                        name: '$instructor.name',
                        roles: '$instructor.roles',
                        groups: '$instructor.groups',
                        pokerRooms: '$instructor.pokerRooms'
                    }
                }
            });
        return await Video.aggregate(options);
    } catch (error) {
        throw error;
    }
}

async function getByCategoryId(categoryId, skip = 0, limit = 20, orderByField = 'date', orderBySortMode = 'asc') {
    try {
        const options = [];
        addSortToOptions(options, orderBySortMode, orderByField);
        options.push({ $match: { category: ObjectId(categoryId) } });
        options.push({ $skip: skip });
        options.push({ $limit: limit });

        return {
            videos: await getVideos(options),
            totalDocuments: await Video.find({ category: ObjectId(categoryId) }).countDocuments()
        };
    } catch (error) {
        throw error;
    }
}

async function getByGroupId(groupId, skip = 0, limit = 20, orderByField = 'date', orderBySortMode = 'asc') {
    try {
        const options = [];
        addSortToOptions(options, orderBySortMode, orderByField);
        options.push({ $match: { group: ObjectId(groupId) } });
        options.push({ $skip: skip });
        options.push({ $limit: limit });

        return {
            videos: await getVideos(options),
            totalDocuments: await Video.find({ group: ObjectId(groupId) }).countDocuments()
        };
    } catch (error) {
        throw error;
    }
}

async function searchByTerm(term, skip = 0, limit = 20, orderByField = 'date', orderBySortMode = 'asc') {
    try {
        const users = await User.find({ $or: [{ 'name': { $regex: term, $options: 'i' } }, { 'lastName': { $regex: term, $options: 'i' } }] }, { _id: 1 });
        let usersIds = [];
        users.forEach(user => {
            usersIds.push(ObjectId(user._id));
        });

        const options = [];
        options.push({
            $match: {
                $or:
                    [
                        { 'instructor': { $in: usersIds } },
                        { 'name': { $regex: term, $options: 'i' } },
                        { 'description': { $regex: term, $options: 'i' } }
                    ]
            }
        });
        addSortToOptions(options, orderBySortMode, orderByField);
        options.push({ $skip: skip });
        options.push({ $limit: limit });

        return {
            videos: await getVideos(options),
            totalDocuments: await Video.find({
                $or: [
                    { 'instructor': { $in: users } },
                    { 'name': { $regex: term, $options: 'i' } },
                    { 'description': { $regex: term, $options: 'i' } }
                ]
            }).countDocuments()
        };
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

function addSortToOptions(options, orderBy, orderByField) {
    if (!orderBy || !orderByField) return;

    let orderByIndex = 1;
    switch (orderBy) {
        case 'asc':
            orderByIndex = 1;
            break;
        case 'desc':
            orderByIndex = -1;
            break;
        default:
            break;
    }

    switch (orderByField) {
        case 'name':
            options.push({ $sort: { name: orderByIndex } });
            break;
        case 'date':
            options.push({ $sort: { date: orderByIndex } });
            break;
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
