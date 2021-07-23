import { ApiProperty } from '@nestjs/swagger';

export class UploadImagesDto {
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  files: string;
}
