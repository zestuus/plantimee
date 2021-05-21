import axios from "axios";

import {APP_URL} from "../utils/constants";
import {getAuthHeader} from "../utils/helpers";

const prefix = `${APP_URL}/user`;

export const getProfile = async () => {
    try {
        const response = await axios.get(`${prefix}/profile`, getAuthHeader());
        return response.data;
    } catch (e) {
        return null;
    }
}