// src/flight/flight.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { FlightController } from '../flight.controller';
import { FlightService } from '../flight.service';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { CreateFlightDto } from '../dto/create-flight.dto';
import { Flight } from '../../database/schemas/flight.schema';

describe('FlightController', () => {
  let controller: FlightController;
  let service: FlightService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlightController],
      providers: [
        {
          provide: FlightService,
          useValue: {
            addFlight: jest.fn() // Mock addFlight method
          }
        }
      ]
    })
      .overrideGuard(JwtAuthGuard) // Override JwtAuthGuard for testing
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<FlightController>(FlightController);
    service = module.get<FlightService>(FlightService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addFlight', () => {
    it('should add a new flight and return success message', async () => {
      // Arrange
      const createFlightDto: CreateFlightDto = {
        flightNumber: 'FL123',
        departure: 'New York',
        arrival: 'London',
        departureTime: new Date('2023-12-01T10:00:00Z'),
        arrivalTime: new Date('2023-12-01T18:00:00Z'),
        totalSeats: 200
      };

      const result: Flight = { ...createFlightDto } as Flight;
      jest.spyOn(service, 'addFlight').mockResolvedValue(result);

      // Act
      const response = await controller.addFlight(createFlightDto);

      // Assert
      expect(response).toEqual(result);
      expect(service.addFlight).toHaveBeenCalledWith(createFlightDto);
    });

    it('should throw an error if flight details are invalid', async () => {
      // Arrange
      const createFlightDto: CreateFlightDto = {
        flightNumber: '', // Invalid flight number
        departure: 'New York',
        arrival: 'London',
        departureTime: new Date('2023-12-01T10:00:00Z'),
        arrivalTime: new Date('2023-12-01T18:00:00Z'),
        totalSeats: 200
      };

      jest.spyOn(service, 'addFlight').mockRejectedValue(new Error('Invalid flight details'));

      // Act & Assert
      await expect(controller.addFlight(createFlightDto)).rejects.toThrowError(
        'Invalid flight details'
      );
      expect(service.addFlight).toHaveBeenCalledWith(createFlightDto);
    });
  });
});
