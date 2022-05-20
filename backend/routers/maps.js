const express = require('express');
const { privateRoute } = require('../utils/middlewares');
const axios = require("axios");
const {GOOGLE_MAPS_API_URL, GOOGLE_MAPS_API_KEY} = require("../constants/config");

const router = express.Router();

const nearbySearch = async (params) => await axios.get(`${GOOGLE_MAPS_API_URL}/place/nearbysearch/json`, {
  params: {
    radius: 4,
    ...params,
    key: GOOGLE_MAPS_API_KEY,
  },
});

router.get('/nearbysearch', privateRoute,  async (req, res) => {
  try {
    const response = await nearbySearch(req.query);

    return res.send(response.data);
  } catch (e) {
    return res.status(400).send(e);
  }
});

router.get('/geocode', privateRoute,  async (req, res) => {
  try {
    const response = await axios.get(`${GOOGLE_MAPS_API_URL}/geocode/json`, {
      params: {
        ...req.query,
        key: GOOGLE_MAPS_API_KEY,
      },
    });
    const { data: { results } } = response;
    const resultsWithPlaceNames = await Promise.all(results.map(async (element) => {
      const { geometry: { location: { lat, lng } } } = element;
      const { language } = req.query;

      const { data } = await nearbySearch({ location: `${lat},${lng}`, language });

      let placeName = '';
      if (data) {
        const { results } = data;
        const possiblePlace = results.find(place => place.business_status);

        if (possiblePlace) {
          placeName = possiblePlace.name;
        }
      }

      return { ...element, placeName };
    }));

    return res.send({ results: resultsWithPlaceNames });
  } catch (e) {
    return res.status(400).send(e);
  }
});

module.exports = router;