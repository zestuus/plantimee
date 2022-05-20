import {CHANGE_LANGUAGE, GOOGLE_OAUTH_LOGIN, GOOGLE_OAUTH_LOGOUT, SWITCH_TIME_FORMAT} from '../constants/actionTypes';

export const changeLanguage = (language) => ({
  type: CHANGE_LANGUAGE,
  data: language,
});

export const switchTimeFormat = () => ({
  type: SWITCH_TIME_FORMAT,
});

export const googleOAuthLogin = (accessToken, expireDate) => ({
  type: GOOGLE_OAUTH_LOGIN,
  accessToken,
  expireDate,
});

export const googleOAuthLogout = () => ({
  type: GOOGLE_OAUTH_LOGOUT,
});
