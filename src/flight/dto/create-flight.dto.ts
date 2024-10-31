import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDate, IsNotEmpty, IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export class CreateFlightDto {
  @ApiProperty({ example: '6F019', description: 'Flight number' })
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

  @ApiProperty({ example: '2024-12-01T10:00:00Z', description: 'Departure time' })
  @IsDate()
  @Type(() => Date)
  departureTime: Date;

  @ApiProperty({ example: '2024-12-01T18:00:00Z', description: 'Arrival time' })
  @IsDate()
  @Type(() => Date)
  @IsDepartureBeforeArrival({
    message: 'Departure time must be before arrival time, and both must be in the future'
  })
  arrivalTime: Date;

  @ApiPropertyOptional({ example: 300, description: 'Total number of seats' })
  @IsOptional()
  @IsInt()
  @Min(1)
  totalSeats?: number = 300;
}

export function IsDepartureBeforeArrival(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isDepartureBeforeArrival',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const { departureTime, arrivalTime } = args.object as any;
          const now = new Date();

          // Check if both times are defined, departure is before arrival, and both are in the future
          return (
            departureTime &&
            arrivalTime &&
            new Date(departureTime) > now &&
            new Date(arrivalTime) > now &&
            new Date(departureTime) < new Date(arrivalTime)
          );
        },
        defaultMessage() {
          return 'Departure time must be before arrival time, and both must be in the future';
        }
      }
    });
  };
}
