import axios from "axios";

import {APP_URL} from "../utils/constants";
import {getAuthHeader} from "../utils/helpers";

const prefix = `${APP_URL}/event`;

export const getOwnEvents = async () => {
    try {
        const response = await axios.get(`${prefix}/list-own`, getAuthHeader());
        return response.data;
    } catch (e) {
        return null;
    }
}