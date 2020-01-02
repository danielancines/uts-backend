const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
    const token = req.header('x-access-token');
    if (!token) return res.status(401).send({
        code: 401,
        message: 'Access denied. No token provided.'
    });

    try {
        const decoded = jwt.verify(token, config.get('privateKey'));
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).send({
            code: 401,
            message: 'Access denied. Invalid token.',
            error: error.message
        });
    }
};