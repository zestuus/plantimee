import { CHANGE_LANGUAGE, SWITCH_TIME_FORMAT } from '../constants/actionTypes';

export const changeLanguage = (language) => ({
  type: CHANGE_LANGUAGE,
  data: language,
});

export const switchTimeFormat = () => ({
  type: SWITCH_TIME_FORMAT,
});