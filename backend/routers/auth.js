const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Cryptr = require('cryptr');
const { verify } = require('2fa-util');

const { TOKEN_SECRET } = require('../constants/config');
const { signUpSchema, signInSchema } = require('../utils/validation');
const db = require('../../db/models');

const router = express.Router();

router.post('/sign-up', async (req, res) => {
  const { username, password, full_name, email } = req.body;
  const { error } = signUpSchema.validate(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  try {
    const existingUser = await db.User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).send("User already exists!");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = { password: hashedPassword, username, full_name, email };
    const user = db.User.build(userData);

    const newUser = await user.save();
    const token = jwt.sign({ id: newUser.id, username }, TOKEN_SECRET)

    res.send(token);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post('/sign-in', async (req, res) => {
  const { username, password, mfa } = req.body;
  const { error } = signInSchema.validate(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  try {
    const existingUser = await db.User.findOne({where: {username}});
    const validPassword = existingUser && await bcrypt.compare(password, existingUser.password);

    if (!existingUser || !validPassword) {
      return res.status(400).send("Bad credentials!");
    }

    let token = 'mfa';
    let mfaValid = true;
    if (existingUser.mfa) {
      const cryptr = new Cryptr(TOKEN_SECRET);
      const encodedSecret = cryptr.decrypt(existingUser.mfa);
      mfaValid = verify(mfa, encodedSecret);
    }

    if (mfaValid) {
      token = jwt.sign({id: existingUser.id, username}, TOKEN_SECRET);
    }

    res.send(token);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;