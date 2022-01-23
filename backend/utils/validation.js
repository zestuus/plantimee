const joi = require('joi');

const signUpSchema = joi.object({
  username: joi
    .string()
    .min(6)
    .required(),
  password: joi.string().min(6).required(),
  email: joi.string().min(6).email().optional(),
  full_name: joi.string().min(6).optional(),
});

const signInSchema = joi.object({
  username: joi.string().min(6).required(),
  password: joi.string().min(6).required(),
  mfa: joi.string(),
});

module.exports = { signUpSchema, signInSchema };