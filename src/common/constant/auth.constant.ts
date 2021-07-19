// token的过期时间
export const tokenExpired: number = 60 * 60 * 24;

// redis的键后缀
export const tokenRedisKey = (key: string) => {
  return `${key}-tokenCheck`;
};
