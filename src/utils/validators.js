import * as yup from 'yup';

export const signUpSchema = yup.object({
    username: yup
        .string()
        .min(6)
        .required(),
    password: yup.string().min(6).required(),
    password_repeat: yup
        .string()
        .oneOf([yup.ref('password'), null], "Passwords aren't equal!")
        .required(),
    email: yup.string().notRequired().min(6).email(),
    full_name: yup.string().notRequired().min(6),
});

export const signInSchema = yup.object({
    username: yup
        .string()
        .min(6)
        .required(),
    password: yup.string().min(6).required(),
});