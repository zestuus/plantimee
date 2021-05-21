import axios from "axios";

import {APP_URL} from "../utils/constants";

const prefix = `${APP_URL}/auth`;

export const signIn = async formData => {
    try {
        const response = await axios.post(`${prefix}/sign-in`, formData);
        return response.data;
    } catch (e) {
        return null;
    }
}

export const signUp = async formData => {
    try {
        const response = await axios.post(`${prefix}/sign-up`, formData);
        return response.data;
    } catch (e) {
        return null;
    }
}