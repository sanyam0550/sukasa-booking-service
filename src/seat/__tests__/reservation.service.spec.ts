import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ConflictException } from '@nestjs/common';
import { Seat } from '../../database/schemas/seat.schema';
import { ReserveSeatCommand } from '../commands/reserve.command';
import { ReservationService } from '../services/reservation.service';

describe('ReservationService', () => {
  let service: ReservationService;
  let seatModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: getModelToken(Seat.name),
          useValue: {
            findOne: jest.fn(),
            updateMany: jest.fn() // Just in case you need it for other tests
          }
        }
      ]
    }).compile();

    service = module.get<ReservationService>(ReservationService);
    seatModel = module.get(getModelToken(Seat.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('reserveSeat', () => {
    const reserveSeatCommand: ReserveSeatCommand = {
      seatNumber: '1',
      flightId: new Types.ObjectId().toString(),
      passengerPhone: '1234567890',
      passengerName: 'John Doe',
      passengerAge: 30,
      userId: new Types.ObjectId().toString()
    };

    it('should successfully reserve a seat', async () => {
      const mockSeat = {
        seatNumber: '1',
        flightId: new Types.ObjectId(reserveSeatCommand.flightId),
        isBooked: false,
        save: jest.fn().mockResolvedValueOnce(true) // Explicitly mock the save function
      };

      jest.spyOn(seatModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockSeat),
        save: jest.fn().mockResolvedValueOnce(true) // Explicitly mock the save function
      } as any);

      const result = await service.reserveSeat(reserveSeatCommand);

      expect(seatModel.findOne).toHaveBeenCalledWith({
        seatNumber: reserveSeatCommand.seatNumber,
        flightId: new Types.ObjectId(reserveSeatCommand.flightId),
        isBooked: false
      });

      expect(result).toEqual({
        statusCode: 200,
        message: `Seat ${reserveSeatCommand.seatNumber} on flight ${reserveSeatCommand.flightId} successfully reserved for ${reserveSeatCommand.passengerName}`
      });
    });

    it('should throw ConflictException if the seat is already reserved', async () => {
      jest.spyOn(seatModel, 'findOne').mockReturnValue(null);

      await expect(service.reserveSeat(reserveSeatCommand)).rejects.toThrow(ConflictException);
      expect(seatModel.findOne).toHaveBeenCalledWith({
        seatNumber: reserveSeatCommand.seatNumber,
        flightId: new Types.ObjectId(reserveSeatCommand.flightId),
        isBooked: false
      });
    });
  });
});
