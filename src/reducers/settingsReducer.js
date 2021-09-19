import { CHANGE_LANGUAGE, SWITCH_TIME_FORMAT } from '../constants/actionTypes';
import { LANGUAGE } from "../constants/enums";

const initialState = {
  language: LANGUAGE.EN,
  militaryTime: false
};

const settingsReducer = (state= initialState, action) => {
  switch (action.type) {
    case CHANGE_LANGUAGE:
      return {
        ...state,
        language: action.data,
      }
    case SWITCH_TIME_FORMAT:
      return {
        ...state,
        militaryTime: !state.militaryTime,
      }
    default: return { ...state }
  }
};

export default settingsReducer;