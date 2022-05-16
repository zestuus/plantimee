import axios from "axios";
import {APP_URL, } from "../constants/config";
import {getAuthHeader} from "../utils/helpers";

const url = `${APP_URL}/maps`;

export const getGoogleMapsApiKey = async () => {
  try {
    const response = await axios.get(`${url}/api-key`, getAuthHeader());
    return response.data;
  } catch (e) {
    return null;
  }
};

export const findNearbyLocation = async (params) => {
  try {
    const response = await axios.get(`${url}/nearbysearch`, { ...getAuthHeader(), params });
    return response.data;
  } catch (e) {
    return null;
  }
};