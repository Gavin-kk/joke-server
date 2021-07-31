import * as joi from 'joi';

export const checkFormat: joi.StringSchema = joi.string().required();
