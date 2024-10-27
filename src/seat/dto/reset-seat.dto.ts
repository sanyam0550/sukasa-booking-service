import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class ResetSeatsDto {
  @ApiPropertyOptional({ description: 'Optional flight ID to reset seats for a specific flight' })
  @IsMongoId()
  flightId?: string;
}
