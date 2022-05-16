const express = require('express');
const { privateRoute } = require('../utils/middlewares');
const axios = require("axios");
const {GOOGLE_MAPS_API_URL, GOOGLE_MAPS_API_KEY} = require("../constants/config");

const router = express.Router();

router.get('/nearbysearch', privateRoute,  async (req, res) => {
  console.log(req.query);
  try {
    const response = await axios.get(`${GOOGLE_MAPS_API_URL}/place/nearbysearch/json`, {
      params: {
        ...req.query,
        radius: 4,
        key: GOOGLE_MAPS_API_KEY,
      },
    });
    return res.send(response.data);
  } catch (e) {
    return res.status(400).send(e);
  }
});

module.exports = router;