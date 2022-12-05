const express = require('express');
const { Op } = require('sequelize');
const Cryptr = require('cryptr');
const { generateSecret } = require('2fa-util');

const db = require('../../db/models');
const { TOKEN_SECRET } = require('../constants/config');
const { privateRoute } = require('../utils/middlewares');

const router = express.Router();

router.get('/profile', privateRoute, async (req, res) => {
  const { id } = req.user;
  const user = await db.User.findOne({ where: { id } });

  if (!user) {
    return res.status(403).send("Invalid token!");
  }

  const { username, full_name, email, latitude, longitude, address, mfa } = user;
  res.send({ username, full_name, email, latitude, longitude, address, mfaEnabled: !!mfa });
})

router.put('/profile', privateRoute, async (req, res) => {
  const { id } = req.user;
  const user = await db.User.findOne({ where: { id } });

  if (!user) {
    return res.status(403).send("Invalid token!");
  }

  const { full_name, email, latitude, longitude, address } = req.body;

  user.full_name = full_name;
  user.email = email;
  user.latitude = latitude;
  user.longitude = longitude;
  user.address = address;
  try {
    await user.save();
    res.send(user);
  } catch (err) {
    res.status(400).send(err);
  }
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

router.post('/mfa', privateRoute, async (req, res) => {
  const { id } = req.user;

  try {
    const user = await db.User.findOne({ where: { id } });

    if (!user) {
      return res.status(403).send("Invalid token!");
    }

    const { mfa, full_name } = user;

    if (mfa) {
      return res.status(403).send("MFA is already enabled!");
    }

    const { qrcode, secret } = await generateSecret(full_name, 'plantimee');
    const cryptr = new Cryptr(TOKEN_SECRET);

    user.mfa = cryptr.encrypt(secret);
    await user.save();

    res.send({ qrcode });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.delete('/mfa', privateRoute, async (req, res) => {
  const { id } = req.user;

  try {
    const user = await db.User.findOne({ where: { id } });

    if (!user) {
      return res.status(403).send("Invalid token!");
    }

    const { mfa } = user;

    if (!mfa) {
      return res.status(403).send("MFA is already disabled!");
    }

    user.mfa = null;

    await user.save();

    res.send();
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;