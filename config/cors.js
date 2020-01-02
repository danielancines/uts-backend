const config = require('config');
const _ = require('lodash');

function origins(origin, callback){
    callback(null, _.includes(config.get('originUrl'), origin));
}

module.exports = {
    'origin': origins,
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'allowedHeaders': ['Content-Type','x-access-token'], 
    'preflightContinue': false,
    'optionsSuccessStatus': 204
};