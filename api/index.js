const express = require('express');
const bodyParser = require('body-parser');
const db = require('../db/models');

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.urlencoded());

router.get('/', async (req, res) => {
    const users = await db.users.findAll();
    res.send(`It's a home page for api routes. Users: ${JSON.stringify(users)}`);
});

module.exports = router;