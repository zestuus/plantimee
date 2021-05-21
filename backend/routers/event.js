const express = require('express');
const jwt = require('jsonwebtoken');

const db = require('../../db/models');
const { privateRoute } = require('../middlewares');

const router = express.Router();

router.get('/list-own', privateRoute, async (req, res) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).send("Access denied!");
    }

    const { id } = jwt.decode(authorization.split(' ')[1]);
    const user = await db.User.findOne({
        where: { id },
        include: ["own_events"]
    });

    if (!user) {
        return res.status(403).send("Invalid token!");
    }

    const { own_events } = user;
    res.send(own_events);
})

module.exports = router;