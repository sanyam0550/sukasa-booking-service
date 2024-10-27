import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDate, IsNotEmpty, IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFlightDto {
  @ApiProperty({ example: 'FL123', description: 'Flight number' })
  @IsString()
  @IsNotEmpty()
  flightNumber: string;

  @ApiProperty({ example: 'New Delhi', description: 'Departure location' })
  @IsString()
  @IsNotEmpty()
  departure: string;

  @ApiProperty({ example: 'London', description: 'Arrival location' })
  @IsString()
  @IsNotEmpty()
  arrival: string;

  @ApiProperty({ example: '2023-12-01T10:00:00Z', description: 'Departure time' })
  @IsDate()
  @Type(() => Date) // Convert to Date object
  departureTime: Date;

  @ApiProperty({ example: '2023-12-01T18:00:00Z', description: 'Arrival time' })
  @IsDate()
  @Type(() => Date) // Convert to Date object
  arrivalTime: Date;

  @ApiPropertyOptional({ example: 300, description: 'Total number of seats' })
  @IsOptional()
  @IsInt()
  @Min(1)
  totalSeats?: number = 300;
}
