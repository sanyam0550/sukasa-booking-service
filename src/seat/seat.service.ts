import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import { Seat } from '../database/schemas/seat.schema';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class SeatService {
  constructor(
    @InjectModel(Seat.name) private seatModel: Model<Seat>,
    @InjectQueue('reservationQueue') private readonly queue: Queue // Inject the queue
  ) {}

  async getSeatByFlightAndNumber(flightId: string, seatNumber: string): Promise<Seat | null> {
    return this.seatModel.findOne({ flightId, seatNumber }).exec();
  }

  async resetSeats(flightId?: string): Promise<void> {
    const updateQuery: UpdateQuery<Seat> = {
      $set: { isBooked: false },
      $unset: { userId: 1, passengerName: 1, passengerPhone: 1, passengerAge: 1 }
    };
    if (flightId) {
      await this.seatModel.updateMany({ flightId }, updateQuery);
    } else {
      await this.seatModel.updateMany({}, updateQuery);
    }
    await this.cleanUpJobs(flightId);
  }

  // Helper function to discard and remove jobs related to seat reservations
  private async cleanUpJobs(flightId?: string): Promise<void> {
    const jobs = await this.queue.getJobs(['waiting', 'active', 'delayed', 'completed', 'failed']);
    for (const job of jobs) {
      if (!flightId || job.data.flightId === flightId) {
        job.discard();
        await job.remove();
      }
    }
  }
}
