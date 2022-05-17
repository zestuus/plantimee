import enLocale from "date-fns/locale/en-US";
import ukLocale from "date-fns/locale/uk";

export const LANGUAGE = Object.freeze({
  EN: 'en',
  UK: 'uk',
});

export const LOCALE = Object.freeze({
  [LANGUAGE.EN]: enLocale,
  [LANGUAGE.UK]: ukLocale,
});

export const FORM_TYPE = Object.freeze({
  SIGN_IN: 'signIn',
  SIGN_UP: 'signUp',
})

export const AVAILABILITY_STATUS = Object.freeze({
  CAN_ATTEND: 'CAN_ATTEND',
  BE_LATE: 'BE_LATE',
  LEAVE_EARLY: 'LEAVE_EARLY',
  CANNOT_ATTEND: 'CANNOT_ATTEND',
});

export const AVAILABILITY_LABEL = Object.freeze({
  [AVAILABILITY_STATUS.CAN_ATTEND]: 'You are free',
  [AVAILABILITY_STATUS.BE_LATE]: 'You may be late!',
  [AVAILABILITY_STATUS.LEAVE_EARLY]: 'You may need to leave early!',
  [AVAILABILITY_STATUS.CANNOT_ATTEND]: 'You are busy!',
});

export const AVAILABILITY_COLOR = Object.freeze({
  [AVAILABILITY_STATUS.CAN_ATTEND]: '#0f0',
  [AVAILABILITY_STATUS.BE_LATE]: '#ff0',
  [AVAILABILITY_STATUS.LEAVE_EARLY]: '#ff0',
  [AVAILABILITY_STATUS.CANNOT_ATTEND]: '#f00',
});