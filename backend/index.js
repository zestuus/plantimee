const express = require('express');

const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// routes
router.use('/auth', require('./routers/auth'))
router.use('/user', require('./routers/user'))

router.get('/', async (req, res) => {
    res.send("Welcome to plantimee backend!");
});

module.exports = router;