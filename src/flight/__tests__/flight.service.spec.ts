import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FlightService } from '../flight.service';
import { Flight } from '../../database/schemas/flight.schema';
import { Seat } from '../../database/schemas/seat.schema';
import { CreateFlightDto } from '../dto/create-flight.dto';

describe('FlightService', () => {
  let service: FlightService;
  let flightModel: Model<Flight>;
  let seatModel: Model<Seat>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlightService,
        {
          provide: getModelToken(Flight.name),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findById: jest.fn(),
            findOne: jest.fn()
          }
        },
        {
          provide: getModelToken(Seat.name),
          useValue: {
            insertMany: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<FlightService>(FlightService);
    flightModel = module.get<Model<Flight>>(getModelToken(Flight.name));
    seatModel = module.get<Model<Seat>>(getModelToken(Seat.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addFlight', () => {
    it('should add a new flight and generate seats', async () => {
      const createFlightDto: CreateFlightDto = {
        flightNumber: 'FL123',
        departure: 'New York',
        arrival: 'London',
        departureTime: new Date(),
        arrivalTime: new Date(),
        totalSeats: 10
      };

      const mockFlight = {
        _id: new Types.ObjectId(),
        ...createFlightDto,
        save: jest.fn().mockResolvedValue(createFlightDto)
      };

      const generatedSeats = service['generateSeats'](
        mockFlight.flightNumber,
        createFlightDto.totalSeats
      );

      jest.spyOn(flightModel, 'create').mockReturnValue(mockFlight as any);
      jest.spyOn(seatModel, 'insertMany').mockResolvedValue(generatedSeats as any);
      jest
        .spyOn(flightModel, 'findOne')
        .mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(null) } as any);

      const result = await service.addFlight(createFlightDto);

      expect(flightModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createFlightDto
        })
      );
      expect(seatModel.insertMany).toHaveBeenCalledWith(generatedSeats);
    });
  });

  describe('generateSeats', () => {
    it('should generate seats based on total seats', () => {
      const flightId = 'FL123';
      const totalSeats = 10;
      const seats = service['generateSeats'](flightId, totalSeats);

      expect(seats.length).toBe(totalSeats);
      expect(seats[0]).toMatchObject({
        seatNumber: '1',
        seatType: 'economy',
        flightId,
        isBooked: false
      });
      expect(seats[totalSeats - 1].seatType).toBe('business'); // Assuming 25% are business seats
    });
  });

  describe('checkFlightExists', () => {
    it('should return true if the flight exists', async () => {
      const flightId = 'FL123';
      jest.spyOn(flightModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce({ _id: flightId })
      } as any);

      const result = await service.checkFlightExists(flightId);
      expect(result).toBe(true);
      expect(flightModel.findOne).toHaveBeenCalledWith({ flightNumber: flightId });
    });

    it('should return false if the flight does not exist', async () => {
      const flightId = 'FL123';
      jest
        .spyOn(flightModel, 'findOne')
        .mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(null) } as any);

      const result = await service.checkFlightExists(flightId);
      expect(result).toBe(false);
      expect(flightModel.findOne).toHaveBeenCalledWith({ flightNumber: flightId });
    });
  });
});
