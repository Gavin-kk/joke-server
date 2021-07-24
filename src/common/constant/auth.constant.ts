// token的过期时间
export const TOKEN_EXPIRED: number = 60 * 60 * 24;

// redis存储token的key后缀
export const TOKEN_REDIS_KEY_METHOD = (email: string): string => {
  return `${email}-tokenCheck`;
};
