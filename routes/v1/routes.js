const router = require('express').Router();
const cors = require('cors');
const config = require('config');
const authRoute = require('./authRoute');
const usersRoute = require('./usersRoute');
const sitesRoute = require('./sitesRoute');
const teamsRoute = require('./teamsRoute');
const videosRoute = require('./videosRoute');
const rolesRoute = require('./rolesRoute');
const categoriesRoute = require('./categoriesRoute');
const groupsRoute = require('./groupsRoute');
const emailsRoute = require('./emailsRoute');
const systemRoute = require('./systemRoute');
const userLogsRoute = require('./userLogsRoute');
const pokerRoomRoute = require('./pokerRoomsRoute');
const moneyRequestsRoute = require('./moneyRequestsRoute');
const dailyBalanceRoute = require('./dailyBalanceRoute');

//Enable pre-flight 
router.options('*', cors());
router.use('/auth', authRoute);
router.use('/users', usersRoute);
router.use('/sites', sitesRoute);
router.use('/teams', teamsRoute);
router.use('/videos', videosRoute);
router.use('/categories', categoriesRoute);
router.use('/groups', groupsRoute);
router.use('/roles', rolesRoute);
router.use('/emails', emailsRoute);
router.use('/system', systemRoute);
router.use('/userLogs', userLogsRoute);
router.use('/pokerRooms', pokerRoomRoute);
router.use('/moneyrequests', moneyRequestsRoute);
router.use('/dailyBalances', dailyBalanceRoute);

router.get('/', (req, res) => {
    res.status(200).json({
        status: 'online',
        message: 'Ultimate Team Suite Api V.1',
        customer: `${config.get('clientName')}`,
        version: require('../../package.json').version.toString(),
        returnCodes: [
            { code: 100, type: 'Success', description: 'Transaction OK' },
            { code: 200, type: 'Error', description: 'Error has occurred' },
            { code: 201, type: 'Error', description: 'Not Found' },
            { code: 202, type: 'Error', description: 'Relationships' },
            { code: 207, type: 'Error', description: 'Bad Number Format' }
        ]
    });
});

module.exports = router; 