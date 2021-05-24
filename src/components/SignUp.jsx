import React, {useState} from 'react';
import styled from "styled-components";

import {signUpSchema} from "../utils/validators";
import {signUp} from "../api/auth";
import {Container, Form, FormError, FormItem, Input, SubmitButton, Title} from "./SignIn";
import {useHistory} from "react-router-dom";
import Grid from "@material-ui/core/Grid";

const SignUpForm = styled(Form)`
    height: 600px;
`;

export const SignUpTitle = styled(Title)`
    margin-top: 0;
`;

const SignUp = ({ onLogin }) => {
    const [formData, setFormData] = useState({});
    const [formErrors, setFormErrors] = useState({});
    const history = useHistory();

    const handleChange = async event => {
        const { name, value } = event.target;
        const newFormData = { ...formData, [name]: value || undefined };

        if(formErrors[name]) {

            try {
                await signUpSchema.validate(newFormData, { abortEarly: false });
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
            await signUpSchema.validate(formData, { abortEarly: false });
            setFormErrors({});
        } catch (e) {
            const error = e.inner.find(error => error.path === name);
            setFormErrors({ ...formErrors, [name]: error?.message });
        }
    };

    const handleSubmit = async () => {
        try {
            await signUpSchema.validate(formData, { abortEarly: false });
        } catch (e) {
            const newFormErrors = e.inner
                .reduce((formErrors, error) => ({ ...formErrors, [error.path]: error.message }), {});
            setFormErrors(newFormErrors);
        }
        if(!Object.values(formErrors).find(error => error)){
            const token = await signUp({...formData, password_repeat: undefined });
            if (token) {
                onLogin(token, history);
            } else {
                setFormErrors({ form: 'Username is taken!' });
            }
        }
    }

    return (
        <Container container justify="center" alignItems="center">
            <SignUpForm item container direction="column" justify="space-between">
                <Grid container direction="column">
                    <SignUpTitle>Sign Up</SignUpTitle>
                    <FormError visible={!formErrors['form']}>{formErrors['form']}</FormError>
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
                <SubmitButton variant="contained" color="primary" onClick={handleSubmit}>Submit</SubmitButton>
            </SignUpForm>
        </Container>
    );
};

export default SignUp;