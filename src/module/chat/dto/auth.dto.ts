import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  // 用户的token
  token: string;
}
