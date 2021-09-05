// 单位为秒
export const VCODE_EXPIRED = 300;
// redis 邮箱验证码的key后缀
export const REDIS_EMAIL_KEY_METHOD = (name: string): string =>
  `${name}-emailCode`;

export const REDIS_EDIT_EMAIL_KEY_METHOD = (name: string): string =>
  `${name}-editEmail`;

export const REDIS_EDIT_PASSWORD_KEY_METHOD = (name: string): string =>
  `${name}-editPassword`;

export const REDIS_LOGIN_KEY_METHOD = (name: string): string =>
  `${name}-loginCode`;
