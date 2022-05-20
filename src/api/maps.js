import axios from "axios";
import {APP_URL, } from "../constants/config";
import {getAuthHeader} from "../utils/helpers";

const url = `${APP_URL}/maps`;

export const findNearbyLocation = async (params) => {
  try {
    const response = await axios.get(`${url}/nearbysearch`, { ...getAuthHeader(), params });
    return response.data;
  } catch (e) {
    return null;
  }
};

export const findLocationByAddress = async (params) => {
  try {
    const response = await axios.get(`${url}/geocode`, { ...getAuthHeader(), params });
    return response.data;
  } catch (e) {
    return null;
  }
};