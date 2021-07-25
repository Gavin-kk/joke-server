import { CheckLoginWeakenedMiddleware } from './check-login-weakened.middleware';

describe('CheckLoginWeakenedMiddleware', () => {
  it('should be defined', () => {
    expect(new CheckLoginWeakenedMiddleware()).toBeDefined();
  });
});
