import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { FlightService } from '../../flight/flight.service';
import { SeatService } from '../seat.service';
import { ReserveSeatCommand } from '../commands/reserve.command';
import { ReservationQueueService } from '../services/reservation-queue.service';

describe('ReservationQueueService', () => {
  let service: ReservationQueueService;
  let queue: any;
  let flightService: any;
  let seatService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationQueueService,
        {
          provide: getQueueToken('reservationQueue'),
          useValue: {
            add: jest.fn(),
            getJob: jest.fn()
          }
        },
        {
          provide: FlightService,
          useValue: {
            checkFlightExists: jest.fn()
          }
        },
        {
          provide: SeatService,
          useValue: {
            getSeatByFlightAndNumber: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<ReservationQueueService>(ReservationQueueService);
    queue = module.get<Queue>(getQueueToken('reservationQueue'));
    flightService = module.get<FlightService>(FlightService);
    seatService = module.get<SeatService>(SeatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('enqueueReservation', () => {
    const reserveSeatCommand: ReserveSeatCommand = {
      flightId: 'flight123',
      seatNumber: '1',
      passengerPhone: '1234567890',
      passengerName: 'John Doe',
      passengerAge: 30,
      userId: 'user123'
    };

    it('should successfully enqueue a reservation', async () => {
      jest.spyOn(flightService, 'checkFlightExists').mockResolvedValue(true);
      jest.spyOn(seatService, 'getSeatByFlightAndNumber').mockResolvedValue({
        seatNumber: '1',
        isBooked: false
      });
      jest.spyOn(queue, 'add').mockResolvedValue({ id: 'job123' });

      const result = await service.enqueueReservation(reserveSeatCommand);

      expect(flightService.checkFlightExists).toHaveBeenCalledWith('flight123');
      expect(seatService.getSeatByFlightAndNumber).toHaveBeenCalledWith('flight123', '1');
      expect(queue.add).toHaveBeenCalledWith('reserveSeat', reserveSeatCommand);
      expect(result).toBe('job123');
    });

    it('should throw NotFoundException if flight does not exist', async () => {
      jest.spyOn(flightService, 'checkFlightExists').mockResolvedValue(false);

      await expect(service.enqueueReservation(reserveSeatCommand)).rejects.toThrow(
        NotFoundException
      );
      expect(flightService.checkFlightExists).toHaveBeenCalledWith('flight123');
      expect(seatService.getSeatByFlightAndNumber).not.toHaveBeenCalled();
      expect(queue.add).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if seat does not exist', async () => {
      jest.spyOn(flightService, 'checkFlightExists').mockResolvedValue(true);
      jest.spyOn(seatService, 'getSeatByFlightAndNumber').mockResolvedValue(null);

      await expect(service.enqueueReservation(reserveSeatCommand)).rejects.toThrow(
        NotFoundException
      );
      expect(seatService.getSeatByFlightAndNumber).toHaveBeenCalledWith('flight123', '1');
      expect(queue.add).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if seat is already reserved', async () => {
      jest.spyOn(flightService, 'checkFlightExists').mockResolvedValue(true);
      jest.spyOn(seatService, 'getSeatByFlightAndNumber').mockResolvedValue({
        seatNumber: '1',
        isBooked: true
      });

      await expect(service.enqueueReservation(reserveSeatCommand)).rejects.toThrow(
        ConflictException
      );
      expect(seatService.getSeatByFlightAndNumber).toHaveBeenCalledWith('flight123', '1');
      expect(queue.add).not.toHaveBeenCalled();
    });
  });

  describe('getReservationStatus', () => {
    it('should return "completed" status if the job is completed', async () => {
      const job = {
        isCompleted: jest.fn().mockResolvedValue(true),
        returnvalue: { success: true },
        isFailed: jest.fn()
      };

      jest.spyOn(queue, 'getJob').mockResolvedValue(job);

      const result = await service.getReservationStatus('job123');

      expect(queue.getJob).toHaveBeenCalledWith('job123');
      expect(job.isCompleted).toHaveBeenCalled();
      expect(result).toEqual({ status: 'completed', data: { success: true } });
    });

    it('should return "failed" status if the job has failed', async () => {
      const job = {
        isCompleted: jest.fn().mockResolvedValue(false),
        isFailed: jest.fn().mockResolvedValue(true),
        failedReason: 'Some failure reason'
      };

      jest.spyOn(queue, 'getJob').mockResolvedValue(job);

      const result = await service.getReservationStatus('job123');

      expect(queue.getJob).toHaveBeenCalledWith('job123');
      expect(job.isCompleted).toHaveBeenCalled();
      expect(job.isFailed).toHaveBeenCalled();
      expect(result).toEqual({ status: 'failed', error: 'Some failure reason' });
    });

    it('should return "pending" status if the job is still in progress', async () => {
      const job = {
        isCompleted: jest.fn().mockResolvedValue(false),
        isFailed: jest.fn().mockResolvedValue(false)
      };

      jest.spyOn(queue, 'getJob').mockResolvedValue(job);

      const result = await service.getReservationStatus('job123');

      expect(queue.getJob).toHaveBeenCalledWith('job123');
      expect(job.isCompleted).toHaveBeenCalled();
      expect(job.isFailed).toHaveBeenCalled();
      expect(result).toEqual({ status: 'pending' });
    });

    it('should throw NotFoundException if the job is not found', async () => {
      jest.spyOn(queue, 'getJob').mockResolvedValue(null);

      await expect(service.getReservationStatus('job123')).rejects.toThrow(NotFoundException);
      expect(queue.getJob).toHaveBeenCalledWith('job123');
    });
  });
});
