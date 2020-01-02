const express = require('express');
const compression = require('compression');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const apiV1 = require('./routes/v1/routes');
const corsConfig = require('./config/cors');
const cors = require('cors');
const mongoConnection = require('./data/dbConnection');
const config = require('config');
const logger = require('./log/logger');
const morgan = require('morgan');

if (!config.has('privateKey')) {
    logger.execution.error('FATAL ERROR: UTS_PRIVATE_KEY is not defined!');
    logger.execution.exit(1);
}

if (!config.has('connectionString')) {
    logger.execution.error('FATAL ERROR: CONNECTION_STRING is not defined!');
    logger.execution.exit(1);
}

if (!config.has('originUrl')) {
    logger.execution.error('FATAL ERROR: ORIGIN_URL is not defined!');
    logger.execution.exit(1);
}

if (!config.has('clientName')) {
    logger.execution.error('FATAL ERROR: CLIENT_NAME is not defined!');
    logger.execution.exit(1);
}

if (!config.has('emailAddress')) {
    logger.execution.error('FATAL ERROR: EMAIL_ADDRESS is not defined!');
    logger.execution.exit(1);
}

if (!config.has('emailPwd')) {
    logger.execution.error('FATAL ERROR: EMAIL_PWD is not defined!');
    logger.execution.exit(1);
}

app.use(morgan('tiny'));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors(corsConfig));
app.use(`/${config.get('clientName')}/v1`, apiV1);

app.get('*', (req, res) => {
    res.status(404)
        .json({
            status: 404,
            message: 'Operation not found'
        });
});

app.listen(port, () => {
    logger.execution.info(`Server running at port: ${port}`);
    mongoConnection();
});