import { LANGUAGE } from '../constants/enums';
import DICTIONARY from '../constants/i18n';

const i18n = Object
  .values(LANGUAGE)
  .reduce((accum, key) => ({
    ...accum,
    [key]: (value) => key === LANGUAGE.EN ? value : (DICTIONARY[value] ? DICTIONARY[value][key] : value),
  }), {})

export default i18n;