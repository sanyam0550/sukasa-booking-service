import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { ReservationService } from '../services/reservation.service';
import { ReserveSeatCommand } from '../commands/reserve.command';
import { ReservationProcessor } from '../processors/reservation.processor';

describe('ReservationProcessor', () => {
  let processor: ReservationProcessor;
  let reservationService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationProcessor,
        {
          provide: ReservationService,
          useValue: {
            reserveSeat: jest.fn()
          }
        }
      ]
    }).compile();

    processor = module.get<ReservationProcessor>(ReservationProcessor);
    reservationService = module.get<ReservationService>(ReservationService);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    const reserveSeatCommand: ReserveSeatCommand = {
      seatNumber: '1',
      flightId: 'flight123',
      passengerPhone: '1234567890',
      passengerName: 'John Doe',
      passengerAge: 30,
      userId: 'user123'
    };

    const mockJob: Partial<Job<ReserveSeatCommand>> = {
      id: 'job123',
      data: reserveSeatCommand
    };

    it('should successfully process a reservation', async () => {
      jest.spyOn(reservationService, 'reserveSeat').mockResolvedValue({
        statusCode: 200,
        message: 'Seat 1 successfully reserved'
      });

      const result = await processor.process(mockJob as Job<ReserveSeatCommand>);

      expect(reservationService.reserveSeat).toHaveBeenCalledWith(reserveSeatCommand);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Seat 1 successfully reserved'
      });
    });

    it('should throw an error if reservation fails', async () => {
      const mockError = new Error('Reservation failed');
      jest.spyOn(reservationService, 'reserveSeat').mockRejectedValue(mockError);

      await expect(processor.process(mockJob as Job<ReserveSeatCommand>)).rejects.toThrow(
        'Reservation failed'
      );

      expect(reservationService.reserveSeat).toHaveBeenCalledWith(reserveSeatCommand);
    });
  });
});
