const mongoose = require('mongoose');
const logger = require('../log/logger');
const config = require('config');

function connect() {
    mongoose.connect(config.get('connectionString'), { useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => logger.database.info('Connected'))
        .catch(err => logger.database.error(`Could not connect: ${err.message}`));
}

module.exports = connect;