import axios from "axios";

import {APP_URL} from "../utils/constants";
import {getAuthHeader} from "../utils/helpers";

const url = `${APP_URL}/event`;

export const getOwnEvents = async () => {
    try {
        const response = await axios.get(`${url}/list-own`, getAuthHeader());
        return response.data;
    } catch (e) {
        return null;
    }
}

export const getInvitedEvents = async () => {
    try {
        const response = await axios.get(`${url}/list-invited`, getAuthHeader());
        return response.data;
    } catch (e) {
        return null;
    }
}

export const updateEvent = async (eventData) => {
    try {
        const response = await axios.put(url, eventData, getAuthHeader());
        return response.data;
    } catch (e) {
        return null;
    }
}

export const deleteEvent = async (id) => {
    try {
        const response = await axios.delete(url, {...getAuthHeader(), data: { id }});
        return response.data;
    } catch (e) {
        return null;
    }
}

export const rejectInvitation = async (id) => {
    try {
        const response = await axios.delete(`${url}/invited`, {...getAuthHeader(), data: { id }});
        return response.data;
    } catch (e) {
        return null;
    }
}

export const createEvent = async () => {
    try {
        const response = await axios.post(url, {}, getAuthHeader());
        return response.data;
    } catch (e) {
        return null;
    }
}