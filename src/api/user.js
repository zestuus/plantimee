import axios from "axios";

import {APP_URL} from "../constants/config";
import {getAuthHeader} from "../utils/helpers";

const url = `${APP_URL}/user`;

export const getProfile = async () => {
  try {
    const response = await axios.get(`${url}/profile`, getAuthHeader());
    return response.data;
  } catch (e) {
    return null;
  }
}

export const enableMfa = async () => {
  try {
    const response = await axios.post(`${url}/mfa`, null, getAuthHeader());
    return response.data;
  } catch (e) {
    return null;
  }
}

export const disableMfa = async () => {
  try {
    const response = await axios.delete(`${url}/mfa`, getAuthHeader());
    return response.status === 200;
  } catch (e) {
    return false;
  }
}

export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${url}/list`, getAuthHeader());
    return response.data;
  } catch (e) {
    return null;
  }
}