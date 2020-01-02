const jwt = require('jsonwebtoken');
const config = require('config');
const _ = require('lodash');
const adminRoles = require('../data/roles/admin.roles');
const usersRepository = require('../data/repositories/usersRepository');

module.exports = function (role) {
    return async function (req, res, next) {
        const token = req.header('x-access-token');
        if (!token) return res.status(401).send({
            message: 'Access denied. No token provided.'
        });
    
        try {
            const decoded = jwt.verify(token, config.get('privateKey'));
            req.user = decoded;
            if (_.isUndefined(role)){
                next();
            } else {
                const result = await usersRepository.getRoles(req.user._id);
                if (!result) {
                    throw new Error('User not found!');
                }
                const roles = _.map(result.roles, 'role');
                if (_.includes(roles, adminRoles.sysAdmin) || _.includes(roles, role)){
                    next();
                } else {
                    res.status(403).send({
                        message: 'Access denied. You don´t have permissions to access this resource'
                    });
                }
            }
            
        } catch (error) {
            res.status(400).send({
                message: 'Access denied',
                error: error.message
            });
        }
    };
};