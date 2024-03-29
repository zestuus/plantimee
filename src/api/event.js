import axios from "axios";

import {APP_URL} from "../constants/config";
import {getAuthHeader} from "../utils/helpers";

const url = `${APP_URL}/event`;

export const getOwnEvents = async (date) => {
  try {
    const response = await axios.get(`${url}/list-own`, { ...getAuthHeader(), params: { date } });
    return response.data;
  } catch (e) {
    return null;
  }
}

export const getInvitedEvents = async (date) => {
  try {
    const response = await axios.get(`${url}/list-invited`, { ...getAuthHeader(), params: { date } });
    return response.data;
  } catch (e) {
    return null;
  }
}

export const getRecurringInstances = async (currentDate, dateFrom, dateTo) => {
  try {
    const response = await axios.get(`${url}/list-instances`, { ...getAuthHeader(), params: { dateFrom, dateTo, currentDate } });
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

export const deleteInvitation = async data => {
  try {
    const { userId, eventId } = data;

    const response = await axios.delete(`${url}/invite`, {...getAuthHeader(), data: {
        userId,
        eventId
      }});
    return response.data;
  } catch (e) {
    return null;
  }
}

export const deleteCompletedEvent = async () => {
  try {
    const response = await axios.delete(`${url}/completed`, getAuthHeader());
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

export const importEvents = async (events) => {
  try {
    const response = await axios.post(`${url}/import`, { events }, getAuthHeader());
    return response.data;
  } catch (e) {
    return null;
  }
};

export const extractEventOccurence = async (recurrentEventId, originalStartTime) => {
  try {
    const response = await axios.post(`${url}/extract`, { recurrentEventId, originalStartTime }, getAuthHeader());
    return response.data;
  } catch (e) {
    return null;
  }
};

export const inviteParticipant = async data => {
  try {
    const { keywordToLookFor, eventId } = data;

    const response = await axios.post(`${url}/invite`, {
      keywordToLookFor,
      eventId
    }, getAuthHeader());
    return response.data;
  } catch (e) {
    return null;
  }
}

export const findVenueAutomatically = async (eventId, algorithm) => {
  try {
    const response = await axios.get(`${url}/venue`, {
      ...getAuthHeader(),
      params: {
        eventId,
        algorithm
      }
    });
    return response.data;
  } catch (e) {
    return null;
  }
}

export const findHoursAutomatically = async data => {
  try {
    const {
      event,
      duration,
      fromDate,
      toDate,
      fromTime,
      toTime
    } = data;

    const response = await axios.get(`${url}/hours`, {
      ...getAuthHeader(),
      params: {
        event,
        duration,
        fromDate,
        toDate,
        fromTime,
        toTime
      }
    });
    return response.data;
  } catch (e) {
    return null;
  }
}
