const express = require('express');
const { Op } = require("sequelize");

const db = require('../../db/models');
const { privateRoute } = require('../middlewares');

const router = express.Router();

router.get('/profile', privateRoute, async (req, res) => {
    const { id } = req.user;
    const user = await db.User.findOne({ where: { id } });

    if (!user) {
        return res.status(403).send("Invalid token!");
    }

    const { username, full_name, email } = user;
    res.send({ username, full_name, email });
})

router.get('/list', privateRoute, async (req, res) => {
    const { id } = req.user;
    const users = await db.User.findAll({
        where: {
            [Op.not]: { id },
        },
        attributes: ['id', 'username', 'email', 'full_name'],
    });

    res.send(users);
})

module.exports = router;