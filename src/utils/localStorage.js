
export const loadStorageItem = (key) => {
  try {
    return localStorage.getItem(key) || undefined;
  } catch (err) {
    return undefined;
  }
};

export const saveItemInStorage = (key, item) => {
  try {
    localStorage.setItem(key, item);
    return true
  } catch (err) {
    return false;
  }
};

export const deleteStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true
  } catch (err) {
    return false;
  }
};