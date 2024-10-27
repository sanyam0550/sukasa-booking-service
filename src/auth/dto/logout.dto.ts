// src/auth/dto/logout.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({ description: 'JWT access token to invalidate' })
  token: string;
}
