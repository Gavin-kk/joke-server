import { ApiProperty } from '@nestjs/swagger';

export class UploadVideoDto {
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  video: string;
}
