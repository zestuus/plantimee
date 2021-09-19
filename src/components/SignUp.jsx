import React from 'react';
import styled from "styled-components";

import {Container, Form, FormError, FormItem, Input, SubmitButton, Title} from "./SignIn";
import Grid from "@material-ui/core/Grid";
import { useFormHandler } from '../utils/hooks';

const SignUpForm = styled(Form)`
  height: 600px;
`;

export const SignUpTitle = styled(Title)`
  margin-top: 0;
`;

const SignUp = ({ onLogin }) => {
  const [
    formErrors, handleChange, handleBlur, handleSubmit
  ] = useFormHandler('signUp', onLogin);

  return (
    <Container container justify="center" alignItems="center">
      <SignUpForm item container direction="column" justify="space-between">
        <Grid container direction="column">
          <SignUpTitle>Sign Up</SignUpTitle>
          <FormError visible={!formErrors['form']}>
            {formErrors['form']}
          </FormError>
        </Grid>
        <FormItem>
          <Input
            required
            label="Username"
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
            label="Password"
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
            label="Repeat password"
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
            label="Full name"
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
          Submit
        </SubmitButton>
      </SignUpForm>
    </Container>
  );
};

export default SignUp;