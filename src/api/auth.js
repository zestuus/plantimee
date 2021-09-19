import axios from "axios";

import {APP_URL} from "../constants/config";

const url = `${APP_URL}/auth`;

export const signIn = async formData => {
  try {
    const response = await axios.post(`${url}/sign-in`, formData);
    return response.data;
  } catch (e) {
    return null;
  }
}

export const signUp = async formData => {
  try {
    const response = await axios.post(`${url}/sign-up`, formData);
    return response.data;
  } catch (e) {
    return null;
  }
}