import { CHANGE_LANGUAGE, GOOGLE_OAUTH_LOGIN, GOOGLE_OAUTH_LOGOUT, SWITCH_TIME_FORMAT } from '../constants/actionTypes';
import { LANGUAGE } from "../constants/enums";
import {deleteStorageItem, loadStorageItem, saveItemInStorage} from '../utils/localStorage'

const initialState = {
  language: loadStorageItem('language') || LANGUAGE.EN,
  militaryTime: loadStorageItem('militaryTime') === 'false' ? 0 === 1 : true,
  googleOAuthToken: loadStorageItem('googleOAuthToken'),
  googleOAuthTokenExpireDate: new Date(loadStorageItem('googleOAuthTokenExpireDate')),
};

const settingsReducer = (state= initialState, action) => {
  switch (action.type) {
    case CHANGE_LANGUAGE:
      saveItemInStorage('language', action.data);
      return {
        ...state,
        language: action.data,
      }
    case SWITCH_TIME_FORMAT:
      saveItemInStorage('militaryTime', !state.militaryTime);
      return {
        ...state,
        militaryTime: !state.militaryTime,
      }
    case GOOGLE_OAUTH_LOGIN:
      saveItemInStorage('googleOAuthToken', action.accessToken);
      saveItemInStorage('googleOAuthTokenExpireDate', action.expireDate);
      return {
        ...state,
        googleOAuthToken: action.accessToken,
        googleOAuthTokenExpireDate: action.expireDate,
      }
    case GOOGLE_OAUTH_LOGOUT:
      deleteStorageItem('googleOAuthToken');
      deleteStorageItem('googleOAuthTokenExpireDate');
      return {
        ...state,
        googleOAuthToken: null,
        googleOAuthTokenExpireDate: null,
      }
    default: return { ...state }
  }
};

export default settingsReducer;