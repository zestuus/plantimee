import { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { signInSchema, signUpSchema } from './validators';

import { signIn, signUp } from '../api/auth';
import { FORM_TYPE } from '../constants/enums';

export const useFormHandler = (type, onLogin, __) => {
  const schema = type === FORM_TYPE.SIGN_UP ? signUpSchema : signInSchema;

  const history = useHistory();
  const [formData, setFormData] = useState(FORM_TYPE.SIGN_UP ? {} : { mfa: '' });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = async event => {
    const { name, value } = event.target;
    const newFormData = { ...formData, [name]: value || undefined };

    if(formErrors[name]) {
      try {
        await schema.validate(newFormData, { abortEarly: false });
        setFormErrors(formErrors.form === 'mfa' ? { form: 'mfa' } : {});
      } catch (e) {
        const error = e.inner.find(error => error.path === name)
        setFormErrors({ ...formErrors, [name]: error && __(error.message) });
      }
    }
    setFormData(newFormData);
  };

  const handleBlur = async event => {
    const { name } = event.target;

    try {
      await schema.validate(formData, { abortEarly: false });
      setFormErrors(formErrors.form === 'mfa' ? { form: 'mfa' } : {});
    } catch (e) {
      const error = e.inner.find(error => error.path === name);
      setFormErrors({ ...formErrors, [name]: error && __(error.message) });
    }
  };

  const handleSubmit = async () => {
    try {
      await schema.validate(formData, { abortEarly: false });
    } catch (e) {
      const newFormErrors = e.inner
        .reduce((formErrors, error) => ({
          ...formErrors, [error.path]: __(error.message)
        }), {});
      setFormErrors(newFormErrors);
    }
    if(!Object.values({ ...formErrors, form: null }).find(error => error)){
      const token = type === FORM_TYPE.SIGN_UP ? (
        await signUp({...formData, password_repeat: undefined })
      ) : (
        await signIn(formData)
      );
      if (token) {
        if (token === 'mfa') {
          if (formErrors.form === 'mfa') {
            setFormErrors({ form: 'mfa', mfa: __('Verification code is invalid') });
          } else {
            setFormErrors({
              form: 'mfa'
            });
          }
        } else {
          onLogin(token, history);
        }
      } else {
        setFormErrors({
          form: type === FORM_TYPE.SIGN_UP
            ? __('Username is taken!') : __('Invalid credentials!'),
        });
      }
    }
  }

  return [
    formErrors, handleChange, handleBlur, handleSubmit,
  ];
}