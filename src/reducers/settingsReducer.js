import { CHANGE_LANGUAGE, SWITCH_TIME_FORMAT } from '../constants/actionTypes';
import { LANGUAGE } from "../constants/enums";
import { loadStorageItem, saveItemInStorage } from '../utils/localStorage'

const initialState = {
  language: loadStorageItem('language') || LANGUAGE.EN,
  militaryTime: loadStorageItem('militaryTime') === 'false' ? 0 === 1 : true,
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
    default: return { ...state }
  }
};

export default settingsReducer;