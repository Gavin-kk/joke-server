import * as joi from 'joi';

export const checkId: joi.NumberSchema = joi.number().integer().required();
