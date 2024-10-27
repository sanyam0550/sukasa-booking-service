import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsNotEmpty, Min, Max, Matches, IsMongoId } from 'class-validator';

export class ReserveSeatDto {
  @ApiProperty({ example: '1A', description: 'Seat number to reserve' })
  @IsString()
  @IsNotEmpty()
  seatNumber: string;

  @ApiProperty({ example: '+919649067956', description: 'Passenger phone number' })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number' })
  passengerPhone: string;

  @ApiProperty({ example: 'John Doe', description: 'Name of the passenger' })
  @IsString()
  @IsNotEmpty()
  passengerName: string;

  @ApiProperty({ example: 25, description: 'Age of the passenger' })
  @IsInt()
  @Min(1)
  @Max(120)
  passengerAge: number;

  @ApiProperty({ example: '60c72b2f9b1d8a3c4c8f9d3d', description: 'Flight ID' })
  @IsMongoId()
  @IsNotEmpty()
  flightId: string; // MongoDB ObjectId of the Flight
}
