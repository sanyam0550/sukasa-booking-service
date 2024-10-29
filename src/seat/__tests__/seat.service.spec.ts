import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SeatService } from '../seat.service';
import { Seat } from '../../database/schemas/seat.schema';

describe('SeatService', () => {
  let service: SeatService;
  let seatModel: Model<Seat>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeatService,
        {
          provide: getModelToken(Seat.name),
          useValue: {
            findOne: jest.fn(),
            updateMany: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<SeatService>(SeatService);
    seatModel = module.get<Model<Seat>>(getModelToken(Seat.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSeatByFlightAndNumber', () => {
    it('should return the seat for the given flightId and seatNumber', async () => {
      const flightId = new Types.ObjectId().toString();
      const seatNumber = '1';
      const mockSeat = {
        flightId: new Types.ObjectId(flightId),
        seatNumber,
        isBooked: false
      } as Seat;

      jest.spyOn(seatModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockSeat)
      } as any);

      const result = await service.getSeatByFlightAndNumber(flightId, seatNumber);

      expect(result).toEqual(mockSeat);
      expect(seatModel.findOne).toHaveBeenCalledWith({
        flightId: new Types.ObjectId(flightId),
        seatNumber
      });
    });

    it('should return null if no seat is found', async () => {
      const flightId = new Types.ObjectId().toString();
      const seatNumber = '1';

      jest.spyOn(seatModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null)
      } as any);

      const result = await service.getSeatByFlightAndNumber(flightId, seatNumber);

      expect(result).toBeNull();
      expect(seatModel.findOne).toHaveBeenCalledWith({
        flightId: new Types.ObjectId(flightId),
        seatNumber
      });
    });
  });

  describe('resetSeats', () => {
    it('should reset all seats if flightId is not provided', async () => {
      const updateQuery = {
        $set: { isBooked: false },
        $unset: { userId: 1, passengerName: 1, passengerPhone: 1, passengerAge: 1 }
      };

      jest.spyOn(seatModel, 'updateMany').mockResolvedValue({ nModified: 10 } as any);

      await service.resetSeats();

      expect(seatModel.updateMany).toHaveBeenCalledWith({}, updateQuery);
    });

    it('should reset seats for a specific flight when flightId is provided', async () => {
      const flightId = new Types.ObjectId().toString();
      const updateQuery = {
        $set: { isBooked: false },
        $unset: { userId: 1, passengerName: 1, passengerPhone: 1, passengerAge: 1 }
      };

      jest.spyOn(seatModel, 'updateMany').mockResolvedValue({ nModified: 5 } as any);

      await service.resetSeats(flightId);

      expect(seatModel.updateMany).toHaveBeenCalledWith(
        { flightId: new Types.ObjectId(flightId) },
        updateQuery
      );
    });
  });
});
