const { User } = require('../schemas/user');
const videosRepository = require('./videosRepository');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const logger = require('./../../log/logger');

async function add(user) {
    const savedUser = await User.findOne({ email: user.email });
    if (savedUser) throw new Error('15');

    const hashPassword = await bcrypt.hash(user.password, 10);
    const newUser = new User({
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        password: hashPassword,
        active: true,
        dealPercentage: user.dealPercentage,
        rg: user.rg,
        cpf: user.cpf,
        phone: user.phone,
        phone1: user.phone1,
        canInformValueAtMoneyRequest: user.canInformValueAtMoneyRequest
    });

    _.forEach(user.groups, group => {
        newUser.groups.push(group._id);
    });

    _.forEach(user.roles, role => {
        newUser.roles.push(role._id);
    });

    newUser.addresses = [];
    _.forEach(user.addresses, address => {
        newUser.addresses.push(address);
    })

    newUser.pokerRooms = [];
    _.forEach(user.pokerRooms, pokerRoom => {
        newUser.pokerRooms.push(pokerRoom);
    })

    newUser.avatarHash = newUser.generateAvatarHash();

    try {
        return await newUser.save();
    } catch (error) {
        throw error;
    }
}

async function update(id, user) {
    try {
        let savedUser = await User.findById(id);
        if (!savedUser) throw new Error('User not Found');

        savedUser.set({
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            active: user.active,
            dealPercentage: user.dealPercentage,
            rg: user.rg,
            cpf: user.cpf,
            phone: user.phone,
            phone1: user.phone1,
            avatarHash: savedUser.generateAvatarHash(),
            canInformValueAtMoneyRequest: user.canInformValueAtMoneyRequest
        });

        savedUser.groups = [];
        _.forEach(user.groups, id => {
            savedUser.groups.push(id);
        });

        savedUser.roles = [];
        _.forEach(user.roles, id => {
            savedUser.roles.push(id);
        });

        savedUser.addresses = [];
        _.forEach(user.addresses, address => {
            savedUser.addresses.push(address);
        })

        savedUser.pokerRooms = [];
        _.forEach(user.pokerRooms, pokerRoom => {
            savedUser.pokerRooms.push(pokerRoom);
        })

        savedUser.messages = [];
        _.forEach(user.messages, message => {
            savedUser.messages.push(message);
        })

        return await savedUser.save();
    } catch (error) {
        throw error;
    }
}

async function deleteById(id) {
    try {
        return await User.findByIdAndRemove(id);
    } catch (error) {
        throw error;
    }
}

async function changePassword(email, newPassword) {
    try {
        const hashPassword = await bcrypt.hash(newPassword, 10);
        const result = await User.update({ email: email }, { $set: { password: hashPassword } })
        return result.nModified;
    } catch (error) {
        throw error;
    }
}

async function get() {
    try {
        const users = await User.find({}, { password: 0 })
            .populate('groups', ['_id', 'name', 'hierarchy'])
            .populate('roles');
        return users;
    } catch (error) {
        throw error;
    }
}

async function getActiveUsersEmail() {
    try {
        const usersEmails = await User.find({ active: 1 }, { _id: 0, email: 1 });
        return usersEmails;
    } catch (error) {
        throw error;
    }
}

async function getRoles(id) {
    try {
        const roles = await User.findById(id, { roles: 1 }).populate('roles');
        return roles;
    } catch (error) {
        throw error;
    }
}

async function getGroups(id) {
    try {
        return await User.findById(id, { groups: 1 });
    } catch (error) {
        throw error;
    }
}

async function getVideos(id) {
    try {
        const user = await User.findById(id, { groups: 1 });
        const videos = await videosRepository.get();

        return getVideosPerGroup(videos, user.groups);
    } catch (error) {
        throw error;
    }
}

async function getVideosByCategoryId(id, categoryId) {
    try {
        const user = await User.findById(id, { groups: 1 });
        const videos = await videosRepository.getByCategoryId(categoryId);

        return getVideosPerGroup(videos, user.groups);
    } catch (error) {
        throw error;
    }
}

async function getVideosByGroupId(id, groupId) {
    try {
        const user = await User.findById(id, { groups: 1 });
        const videos = await videosRepository.getByGroupId(groupId);

        return getVideosPerGroup(videos, user.groups);
    } catch (error) {
        throw error;
    }
}

async function getVideosByTerm(id, term) {
    try {
        const user = await User.findById(id, { groups: 1 });
        const videos = await videosRepository.searchByTerm(term);

        return getVideosPerGroup(videos, user.groups);
    } catch (error) {
        throw error;
    }
}

async function getVideosByWatchedStatus(id, watched) {
    try {
        const user = await User.findById(id, { groups: 1, videosStatus: 1 });
        let videos;

        if (_.isEqual(watched, 'true')) {
            videos = await videosRepository.getIn(_.map(user.videosStatus, '_id'));
        } else {
            videos = await videosRepository.getNotIn(_.map(user.videosStatus, '_id'));
        }

        return getVideosPerGroup(videos, user.groups);
    } catch (error) {
        throw error;
    }
}

async function getFavoritedVideos(id, favorites) {
try {
    const user = await User.findById(id, { groups: 1, favoritedVideos: 1 });
    let videos;
    
        if (_.isEqual(favorites, 'true')) {
            videos = await videosRepository.getIn(user.favoritedVideos);
        } else {
            videos = await videosRepository.getNotIn(user.favoritedVideos);
        }

        return getVideosPerGroup(videos, user.groups);
    } catch (error) {
        throw error;
    }
}

async function getByEmail(email) {
    const user = await User.findOne({ email: email }).populate('groups', '_id');
    if (!user) throw new Error('User not found');

    return user;
}

async function activate(userId) {
    const result = await User.updateOne({ _id: userId }, { $set: { active: true } });
    return result.nModified > 0;
}

async function deactivate(userId) {
    const result = await User.updateOne({ _id: userId }, { $set: { active: false } });
    return result.nModified > 0;
}

async function addFavoriteVideo(userId, videoId) {
    const result = await User.updateOne({ _id: userId }, { $push: { favoritedVideos: videoId } });
    return result.nModified > 0;
}

async function removeFavoriteVideo(userId, videoId) {
    const result = await User.updateOne({ _id: userId }, { $pull: { favoritedVideos: videoId } });
    return result.nModified > 0;
}

function updateUsersPokerRoomsData(pokerRoomId, name, currency) {
    try {
        User.update({ 'pokerRooms.id': pokerRoomId }, { $set: { 'pokerRooms.$.name': name, 'pokerRooms.$.currency': currency } }, { multi: true }, (err, numAffected) => {
            if (err)
                logger.execution.error(`Error at updatePokerRooms callback info for users ${err.message}`);
        });
    } catch (error) {
        logger.execution.error(`Error at updatePokerRooms info for users ${error.message}`);
    }
}

function getVideosPerGroup(videos, userGroups) {
    let result = [];
    _.forEach(videos, (video) => {
        let canWatch = false;
        for (let index = 0; index < userGroups.length; index++) {
            const group = userGroups[index];
            canWatch = group._id.equals(video.group._id);
            if (canWatch) break;
        }
        result.push({
            video,
            canWatch
        });
    });

    return result;
}

module.exports = {
    add,
    getByEmail,
    getRoles,
    getGroups,
    getVideos,
    getVideosByCategoryId,
    getVideosByGroupId,
    getVideosByTerm,
    get,
    changePassword,
    deleteById,
    update,
    activate,
    deactivate,
    addFavoriteVideo,
    removeFavoriteVideo,
    getActiveUsersEmail,
    getVideosByWatchedStatus,
    updateUsersPokerRoomsData,
    getFavoritedVideos
};