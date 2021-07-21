import { parentPort } from 'worker_threads';
import * as crypto from 'crypto';

const salt = crypto.randomBytes(128).toString('base64');
const hash = crypto
  .pbkdf2Sync('crypto', salt, 10000, 64, 'sha512')
  .toString('hex');

parentPort.postMessage({ salt, hash });
// autocannon -c 100 -d 10 -p 2 http://localhost:5000/user/userinfo
