import { GOOGLE_API_URL } from "../constants/config";
import axios from "axios";
import { getGoogleAuthHeader } from "../utils/helpers";

const url = `${GOOGLE_API_URL}/calendar/v3`;

export const getUserInfo = async () => {
  try {
    const response = await axios.get(`${GOOGLE_API_URL}/oauth2/v1/userinfo`, {
      ...getGoogleAuthHeader(),
      params: { alt: 'json' },
    });
    return response.data;
  } catch (e) {
    return null;
  }
};

export const listUserCalendars = async () => {
  try {
    const response = await axios.get(`${url}/users/me/calendarList`, getGoogleAuthHeader());
    return response.data;
  } catch (e) {
    return null;
  }
};

export const importEventsFromGoogleCalendar = async (calendarId, timeMin) => {
  try {
    const response = await axios.get(`${url}/calendars/${encodeURIComponent(calendarId)}/events`, {
      ...getGoogleAuthHeader(),
      params: { timeMin },
    });
    return response.data;
  } catch (e) {
    return null;
  }
};

// export const exportEventsToGoogleCalendar = async () => {
//   try {
//     const response = await axios.post(`${url}/nearbysearch`, getGoogleAuthHeader());
//     return response.data;
//   } catch (e) {
//     return null;
//   }
// };