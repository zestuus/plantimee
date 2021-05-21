const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('../../db/models');
const { signUpSchema, signInSchema } = require('../validation');

const router = express.Router();

router.post('/sign-up', async (req, res) => {
    const { username, password, full_name, email } = req.body;
    const { error } = signUpSchema.validate(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const existingUser = await db.users.findOne({ where: { username } });

    if (existingUser) {
        return res.status(400).send("User already exists!");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = { username, password: hashedPassword, full_name, email };
    const user = db.users.build(userData);

    try {
        const existingUser = await user.save();
        const token = jwt.sign({ id: existingUser.id, username }, process.env.TOKEN_SECRET)

        res.send(token);
    } catch (err) {
        res.status(400).send(err);
    }
})

router.post('/sign-in', async (req, res) => {
    const { username, password } = req.body;
    const { error } = signInSchema.validate(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const existingUser = await db.users.findOne({ where: { username } });
    const validPassword = existingUser && await bcrypt.compare(password, existingUser.password);

    if (!existingUser || !validPassword) {
        return res.status(400).send("Bad credentials!");
    }

    const token = jwt.sign({ id: existingUser.id, username }, process.env.TOKEN_SECRET);

    res.send(token);
})

module.exports = router;