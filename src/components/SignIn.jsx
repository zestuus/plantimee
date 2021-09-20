import React from 'react';
import styled from "styled-components";

import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

import { PRIMARY_COLOR } from "../constants/config";
import { useFormHandler } from '../utils/hooks';
import { FORM_TYPE } from '../constants/enums';
import withSettings from './HOCs/withSettings';

export const Container = styled(Grid)`
  height: calc(100vh - 115px);
`;

export const Form = styled(Grid)`
  margin: 15px;
  padding: 20px;
  height: 450px;
  max-width: 400px;
  border: 2px solid ${PRIMARY_COLOR};
  border-radius: 5px;
`;
export const FormItem = styled(Grid)`
  height: 60px;
`

export const Title = styled.h1`
  margin-bottom: 0;
`;

export const FormError = styled.p`
  color: red;
  height: 20px;
  margin: 12px 0 5px 0;
`;

export const Input = styled(TextField)`
  width: 100%;
  height: 50px;
  .MuiOutlinedInput-input {
    padding: 16px 15px;
  }
`;

export const SubmitButton = styled(Button)`
  margin: 10px 0;  
  height: 50px;
`;

const SignIn = ({ onLogin, translate: __ }) => {
  const [
    formErrors, handleChange, handleBlur, handleSubmit
  ] = useFormHandler(FORM_TYPE.SIGN_IN, onLogin);

  return (
    <Container container justify="center" alignItems="center">
      <Form item container direction="column" justify="space-between">
        <Title>{__('Sign In')}</Title>
        <FormError visible={!formErrors['form']}>
          {formErrors['form']}
        </FormError>
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
        <SubmitButton
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          {__('Submit')}
        </SubmitButton>
      </Form>
    </Container>
  );
};

export default withSettings(SignIn);