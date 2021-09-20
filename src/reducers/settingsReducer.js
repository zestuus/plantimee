import { CHANGE_LANGUAGE, SWITCH_TIME_FORMAT } from '../constants/actionTypes';
import { LANGUAGE } from "../constants/enums";
import { loadStorageItem, saveItemInStorage, deleteStorageItem } from '../utils/localStorage'

const initialState = {
  language: loadStorageItem('language') || LANGUAGE.EN,
  militaryTime: !!loadStorageItem('militaryTime')
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
      state.militaryTime
        ? deleteStorageItem('militaryTime')
        : saveItemInStorage('militaryTime', true);
      return {
        ...state,
        militaryTime: !state.militaryTime,
      }
    default: return { ...state }
  }
};

export default settingsReducer;