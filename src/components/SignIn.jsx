import React, {useState} from 'react';
import styled from "styled-components";

import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

import { PRIMARY_COLOR } from "../utils/constants";
import { signInSchema } from "../utils/validators";
import { signIn } from "../api/auth";
import {useHistory} from "react-router-dom";


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
    height: 80px;
`

export const Title = styled.h1`
    margin-bottom: 0;
`;

export const FormError = styled.p`
    color: red;
    height: 20px;
    margin: 12px 0;
`;

export const Input = styled(TextField)`
    width: 100%;
`;

export const SubmitButton = styled(Button)`
    margin: 10px 0;  
    height: 50px;
`;

const SignIn = ({ onLogin }) => {
    const [formData, setFormData] = useState({});
    const [formErrors, setFormErrors] = useState({});
    const history = useHistory();

    const handleChange = async event => {
        const { name, value } = event.target;
        const newFormData = { ...formData, [name]: value || undefined };

        if(formErrors[name]) {

            try {
                await signInSchema.validate(newFormData, { abortEarly: false });
                setFormErrors({});
            } catch (e) {
                const error = e.inner.find(error => error.path === name)
                setFormErrors({ ...formErrors, [name]: error?.message });
            }
        }
        setFormData(newFormData);
    };

    const handleBlur = async event => {
        const { name } = event.target;

        try {
            await signInSchema.validate(formData, { abortEarly: false });
            setFormErrors({});
        } catch (e) {
            const error = e.inner.find(error => error.path === name);
            setFormErrors({ ...formErrors, [name]: error?.message });
        }
    };

    const handleSubmit = async () => {
        try {
            await signInSchema.validate(formData, { abortEarly: false });
        } catch (e) {
            const newFormErrors = e.inner
                .reduce((formErrors, error) => ({ ...formErrors, [error.path]: error.message }), {});
            setFormErrors(newFormErrors);
        }
        if(!Object.values(formErrors).find(error => error)){
            const token = await signIn(formData);
            if (token) {
                onLogin(token, history);
            } else {
                setFormErrors({ form: 'Invalid credentials!' });
            }
        }
    }

    return (
        <Container container justify="center" alignItems="center">
            <Form item container direction="column" justify="space-between">
                <Title>Sign In</Title>
                <FormError visible={!formErrors['form']}>{formErrors['form']}</FormError>
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
                <SubmitButton variant="contained" color="primary" onClick={handleSubmit}>Submit</SubmitButton>
            </Form>
        </Container>
    );
};

export default SignIn;