import { LANGUAGE } from './enums';

const translation = {
  'Andrii Kushka': {
    [LANGUAGE.UK]: 'Андрій Кушка',
  },
  'Welcome': {
    [LANGUAGE.UK]: 'Вітаємо',
  },
  "It's": {
    [LANGUAGE.UK]: 'Це',
  },
  'automatic event planner.': {
    [LANGUAGE.UK]: 'автоматизований планувальник подій',
  },
  'Automatic system can analyze your agenda and agendas of all participants ': {
    [LANGUAGE.UK]: 'Автоматизована система вміє аналізувати ваш розклад дня та розклад дня усіх учасників  ',
  },
  'to make predictions where and when your event can happen.': {
    [LANGUAGE.UK]: 'щоб зробити припущення де і коли ваша подія може відбутись',
  },
  'Settings': {
    [LANGUAGE.UK]: 'Налаштування',
  },
  'Sign Up': {
    [LANGUAGE.UK]: 'Зареєструватсь',
  },
  'Sign In': {
    [LANGUAGE.UK]: 'Увійти',
  },
  'Event Dashboard': {
    [LANGUAGE.UK]: 'Керування подіями',
  },
  'Profile': {
    [LANGUAGE.UK]: 'Профіль',
  },
  'Logout': {
    [LANGUAGE.UK]: 'Вийти',
  },
  'Language': {
    [LANGUAGE.UK]: 'Мова',
  },
  'Time format': {
    [LANGUAGE.UK]: 'Формат часу',
  },
  'hours': {
    [LANGUAGE.UK]: 'годин',
  },
  'Cannot get your profile info': {
    [LANGUAGE.UK]: 'Не вдається отримати дані вашого профілю',
  },
  'Username': {
    [LANGUAGE.UK]: "Ім'я користувача",
  },
  'Full name': {
    [LANGUAGE.UK]: "Повне ім'я",
  },
  'Password': {
    [LANGUAGE.UK]: "Пароль",
  },
  'Repeat password': {
    [LANGUAGE.UK]: "Повторіть пароль",
  },
  'Submit': {
    [LANGUAGE.UK]: "Підтвердити",
  },
  'Auto find properties': {
    [LANGUAGE.UK]: "Властивості автоматичного пошуку",
  },
  'From date': {
    [LANGUAGE.UK]: "Від дати",
  },
  'To date': {
    [LANGUAGE.UK]: "До дати",
  },
  'From time': {
    [LANGUAGE.UK]: "Від часу",
  },
  'To time': {
    [LANGUAGE.UK]: "До часу",
  },
  'organizer': {
    [LANGUAGE.UK]: "організатор",
  },
  'Events': {
    [LANGUAGE.UK]: "Події",
  },
  'Create new': {
    [LANGUAGE.UK]: "Створити нову",
  },
  "Events you're invited to": {
    [LANGUAGE.UK]: "Події на які вас запрошено",
  },
  'You have no invited events': {
    [LANGUAGE.UK]: "Вас не запрошено на жодну подію",
  },
  'Your own active events': {
    [LANGUAGE.UK]: "Ваші активні події",
  },
  'You have no own active events': {
    [LANGUAGE.UK]: "У вас немає активних подій",
  },
  'Completed events': {
    [LANGUAGE.UK]: "Ваші завершені події",
  },
  'You have no completed events': {
    [LANGUAGE.UK]: "У вас немає завершених подій",
  },
  'Timeline': {
    [LANGUAGE.UK]: "Часова шкала",
  },
  'Tasks': {
    [LANGUAGE.UK]: "Завдання",
  },
  'There are no participants in the event. Do you want to add some?': {
    [LANGUAGE.UK]: "В події немає жодного учаснка. Хочете додати когось?",
  },
  'Reject invite': {
    [LANGUAGE.UK]: "Відхилити запрошення",
  },
  'Remove': {
    [LANGUAGE.UK]: "Видалити",
  },
  'Title': {
    [LANGUAGE.UK]: "Заголовок",
  },
  'Description': {
    [LANGUAGE.UK]: "Опис",
  },
  'Online meet url': {
    [LANGUAGE.UK]: "Посилання на онлайн зустріч",
  },
  'Users': {
    [LANGUAGE.UK]: "Користувачі",
  },
  'Full day event': {
    [LANGUAGE.UK]: "Подія на весь день",
  },
  'Start date&time': {
    [LANGUAGE.UK]: "Дата і час початку",
  },
  'End date&time': {
    [LANGUAGE.UK]: "Дата і час завершення",
  },
  'Days': {
    [LANGUAGE.UK]: "Дні",
  },
  'Hours': {
    [LANGUAGE.UK]: "Години",
  },
  'Minutes': {
    [LANGUAGE.UK]: "Хвилини",
  },
  'Latitude': {
    [LANGUAGE.UK]: "Широта",
  },
  'Longitude': {
    [LANGUAGE.UK]: "Довгота",
  },
  'Participants': {
    [LANGUAGE.UK]: "Учасники",
  },
  'Add participant': {
    [LANGUAGE.UK]: "Додати учасника",
  },
  'End time should be after start time': {
    [LANGUAGE.UK]: "Час завершення повинен бути після часу початку",
  },
  'Duration': {
    [LANGUAGE.UK]: "Тривалість",
  },
  'Save': {
    [LANGUAGE.UK]: "Зберегти",
  },
  'Choose any event to continue': {
    [LANGUAGE.UK]: "Виберіть будь-яку подію щоб продовжити",
  },
  'Auto find free time': {
    [LANGUAGE.UK]: "Знайти вільний час автоматично",
  },
  'Cannot find free time in chosen range. Please update find conditions': {
    [LANGUAGE.UK]: "Не вдалося знайти вільний час у вибраних межах. Будь ласка, оновіть умови пошуку",
  },
};

const i18n = Object
  .keys(LANGUAGE)
  .reduce((accum, key) => ({
    ...accum,
    [key]: (value) => key === LANGUAGE.EN ? value : (translation[value] ? translation[value][key] : value),
  }), {})

export default i18n;