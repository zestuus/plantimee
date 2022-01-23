import React from 'react';
import styled from "styled-components";

import Grid from "@material-ui/core/Grid";

import {
  Container, Form, FormError, FormItem, Input, SubmitButton, Title
} from "./SignIn";
import withSettings from './HOCs/withSettings';

import { useFormHandler } from '../utils/hooks';
import { FORM_TYPE } from '../constants/enums';

const SignUpForm = styled(Form)`
  height: 600px;
`;

export const SignUpTitle = styled(Title)`
  margin-top: 0;
`;

const SignUp = ({ onLogin, translate: __ }) => {
  const [
    formErrors, handleChange, handleBlur, handleSubmit
  ] = useFormHandler(FORM_TYPE.SIGN_UP, onLogin, __);

  return (
    <Container container justifyContent="center" alignItems="center">
      <SignUpForm item container direction="column" justifyContent="space-between">
        <Grid container direction="column">
          <SignUpTitle>{__('Sign Up')}</SignUpTitle>
          <FormError visible={!formErrors['form']}>
            {formErrors['form']}
          </FormError>
        </Grid>
        <FormItem>
          <Input
            required
            label={__('Username')}
            variant="outlined"
            name="username"
            error={!!formErrors['username']}
            helperText={formErrors['username']}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </FormItem>
        <FormItem>
          <Input
            required
            label={__('Password')}
            variant="outlined"
            name="password"
            type="password"
            error={!!formErrors['password']}
            helperText={formErrors['password']}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </FormItem>
        <FormItem>
          <Input
            required
            label={__('Repeat password')}
            variant="outlined"
            name="password_repeat"
            type="password"
            error={!!formErrors['password_repeat']}
            helperText={formErrors['password_repeat']}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </FormItem>
        <FormItem>
          <Input
            label="Email"
            variant="outlined"
            name="email"
            error={!!formErrors['email']}
            helperText={formErrors['email']}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </FormItem>
        <FormItem>
          <Input
            label={__('Full name')}
            variant="outlined"
            name="full_name"
            error={!!formErrors['full_name']}
            helperText={formErrors['full_name']}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </FormItem>
        <SubmitButton
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          {__('Submit')}
        </SubmitButton>
      </SignUpForm>
    </Container>
  );
};

export default withSettings(SignUp);