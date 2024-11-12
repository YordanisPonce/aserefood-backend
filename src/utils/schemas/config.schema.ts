import * as Joi from 'joi';

export const configSchema = Joi.object({
  APP_PORT: Joi.number().default(4001).required(),
  SECRET_KEY: Joi.string().required(),
  SEED_ADMIN_EMAIL: Joi.string().required(),
  SEED_ADMIN_PASSWORD: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_DATABASE: Joi.string().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  MAIL_HOST: Joi.string().required(),
  MAIL_PORT: Joi.number().required(),
  MAIL_USER: Joi.string().email().required(),
  MAIL_PASSWORD: Joi.string().required(),
  MAIL_SECURE: Joi.boolean().required(),
  SENDER_EMAIL: Joi.string().email().required(),
  SENDER_NAME: Joi.string().required(),
  UI_URL: Joi.string().uri().required(),
  EMAIL_CONFIRMATION_URL: Joi.string().uri().required(),
  EMAIL_RESET_PASSWORD_URL: Joi.string().uri().required(),
}).unknown();