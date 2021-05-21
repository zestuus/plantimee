const express = require('express');
const jwt = require('jsonwebtoken');

const db = require('../../db/models');
const { privateRoute } = require('../middlewares');

const router = express.Router();

router.get('/profile', privateRoute, async (req, res) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).send("Access denied!");
    }

    const { id } = jwt.decode(authorization.split(' ')[1]);
    const user = await db.users.findOne({ where: { id } });

    if (!user) {
        return res.status(403).send("Invalid token!");
    }

    const { username, full_name, email } = user;
    res.send({ username, full_name, email });
})

module.exports = router;