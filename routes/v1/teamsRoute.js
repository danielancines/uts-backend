const express = require('express');
const router = express.Router();
const tokenMW = require('./../../middleware/token');

router.use(tokenMW);
router.get('/', (req, res) => {
    res.send('teams');
});

module.exports = router;