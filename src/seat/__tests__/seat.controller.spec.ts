import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { SeatController } from '../seat.controller';
import { ReservationQueueService } from '../services/reservation-queue.service';
import { SeatService } from '../seat.service';
import { RolesGuard } from '../../auth/roles.guard';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { ReserveSeatDto } from '../dto/reserve-seat.dto';

describe('SeatController', () => {
  let controller: SeatController;
  let reservationQueueService: ReservationQueueService;
  let seatService: SeatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeatController],
      providers: [
        {
          provide: ReservationQueueService,
          useValue: {
            enqueueReservation: jest.fn(),
            getReservationStatus: jest.fn()
          }
        },
        {
          provide: SeatService,
          useValue: {
            resetSeats: jest.fn()
          }
        }
      ]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(context => true) })
      .compile();

    controller = module.get<SeatController>(SeatController);
    reservationQueueService = module.get<ReservationQueueService>(ReservationQueueService);
    seatService = module.get<SeatService>(SeatService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('reserveSeat', () => {
    it('should queue a reservation request and return job ID', async () => {
      const reserveSeatDto: ReserveSeatDto = {
        seatNumber: '12A',
        flightId: 'flight123',
        passengerPhone: '1234567890',
        passengerName: 'John Doe',
        passengerAge: 30
      };
      const jobId = '12345';
      jest.spyOn(reservationQueueService, 'enqueueReservation').mockResolvedValue(jobId);

      const result = await controller.reserveSeat(reserveSeatDto, {
        user: { email: 'user@example.com' }
      });
      expect(result).toEqual({ success: true, message: 'Reservation request queued', jobId });
      expect(reservationQueueService.enqueueReservation).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('getReservationStatus', () => {
    it('should return reservation success message when job is completed', async () => {
      const jobId = '12345';
      jest.spyOn(reservationQueueService, 'getReservationStatus').mockResolvedValue({
        status: 'completed',
        data: { seatNumber: '12A', flightId: 'flight123' }
      });

      const result = await controller.getReservationStatus(jobId);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Reservation successful',
        result: { seatNumber: '12A', flightId: 'flight123' }
      });
    });

    it('should return reservation failure message when job failed', async () => {
      const jobId = '12345';
      jest.spyOn(reservationQueueService, 'getReservationStatus').mockResolvedValue({
        status: 'failed',
        error: 'Seat already reserved'
      });

      const result = await controller.getReservationStatus(jobId);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Reservation failed',
        error: 'Seat already reserved'
      });
    });

    it('should return processing message when job is still pending', async () => {
      const jobId = '12345';
      jest.spyOn(reservationQueueService, 'getReservationStatus').mockResolvedValue({
        status: 'pending'
      });

      const result = await controller.getReservationStatus(jobId);
      expect(result).toEqual({
        statusCode: HttpStatus.ACCEPTED,
        message: 'Reservation is being processed'
      });
    });

    it('should throw NotFoundException when job does not exist', async () => {
      const jobId = 'nonexistent';
      jest.spyOn(reservationQueueService, 'getReservationStatus').mockResolvedValue(null);

      await expect(controller.getReservationStatus(jobId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('resetSeats', () => {
    it('should reset all seats and return success message', async () => {
      jest.spyOn(seatService, 'resetSeats').mockResolvedValue();

      const result = await controller.resetSeats();
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'All seats have been successfully reset'
      });
      expect(seatService.resetSeats).toHaveBeenCalledWith(undefined);
    });

    it('should reset seats for a specific flight and return success message', async () => {
      jest.spyOn(seatService, 'resetSeats').mockResolvedValue();

      const result = await controller.resetSeats('flight123');
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'All seats for flight flight123 have been successfully reset'
      });
      expect(seatService.resetSeats).toHaveBeenCalledWith('flight123');
    });
  });
});
