import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SeatService } from '../seat.service';
import { Seat } from '../../database/schemas/seat.schema';
import { Queue } from 'bullmq';

describe('SeatService', () => {
  let service: SeatService;
  let seatModel: Model<Seat>;
  let mockQueue: Queue;

  beforeEach(async () => {
    mockQueue = {
      getJobs: jest.fn() // Mock function for getJobs
    } as unknown as Queue;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeatService,
        {
          provide: getModelToken(Seat.name),
          useValue: {
            findOne: jest.fn(),
            updateMany: jest.fn()
          }
        },
        {
          provide: 'BullQueue_reservationQueue', // Correct provider name for Bull queue
          useValue: mockQueue // Mocked queue instance
        }
      ]
    }).compile();

    service = module.get<SeatService>(SeatService);
    seatModel = module.get<Model<Seat>>(getModelToken(Seat.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('cleanUpJobs', () => {
    it('should discard and remove all relevant jobs if flightId is not provided', async () => {
      const mockJobs = [
        { data: { flightId: '123' }, discard: jest.fn(), remove: jest.fn() },
        { data: { flightId: '456' }, discard: jest.fn(), remove: jest.fn() }
      ];

      // Mock getJobs to return an array of jobs
      mockQueue.getJobs = jest.fn().mockResolvedValue(mockJobs);

      await service['cleanUpJobs']();

      expect(mockQueue.getJobs).toHaveBeenCalledWith([
        'waiting',
        'active',
        'delayed',
        'completed',
        'failed'
      ]);
      for (const job of mockJobs) {
        expect(job.discard).toHaveBeenCalled();
        expect(job.remove).toHaveBeenCalled();
      }
    });

    it('should only discard and remove jobs with matching flightId', async () => {
      const flightId = '123';
      const mockJobs = [
        { data: { flightId }, discard: jest.fn(), remove: jest.fn() },
        { data: { flightId: '456' }, discard: jest.fn(), remove: jest.fn() }
      ];

      // Mock getJobs to return an array of jobs
      mockQueue.getJobs = jest.fn().mockResolvedValue(mockJobs);

      await service['cleanUpJobs'](flightId);

      expect(mockQueue.getJobs).toHaveBeenCalledWith([
        'waiting',
        'active',
        'delayed',
        'completed',
        'failed'
      ]);
      expect(mockJobs[0].discard).toHaveBeenCalled();
      expect(mockJobs[0].remove).toHaveBeenCalled();
      expect(mockJobs[1].discard).not.toHaveBeenCalled();
      expect(mockJobs[1].remove).not.toHaveBeenCalled();
    });
  });
});
