import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ReserveSeatCommand } from '../commands/reserve.command';
import { FlightService } from '../../flight/flight.service';
import { SeatService } from '../seat.service';

@Injectable()
export class ReservationQueueService {
  constructor(
    @InjectQueue('reservationQueue') private readonly queue: Queue, // Inject the registered queue,
    private readonly flightService: FlightService,
    private readonly seatService: SeatService
  ) {}

  async enqueueReservation(command: ReserveSeatCommand): Promise<string> {
    const { flightId, seatNumber } = command;

    // Pre-check 1: Verify that the flight exists
    const flightExists = await this.flightService.checkFlightExists(flightId);
    if (!flightExists) {
      throw new NotFoundException(`Flight with ID ${flightId} does not exist`);
    }

    // Pre-check 2: Verify that the seat exists and is available
    const seat = await this.seatService.getSeatByFlightAndNumber(flightId, seatNumber);
    if (!seat) {
      throw new NotFoundException(`Seat ${seatNumber} on flight ${flightId} does not exist`);
    }
    if (seat.isBooked) {
      throw new ConflictException(`Seat ${seatNumber} on flight ${flightId} is already reserved`);
    }

    // If both checks pass, enqueue the reservation
    const job = await this.queue.add('reserveSeat', command);
    return job.id;
  }

  async getReservationStatus(jobId: string) {
    const job = await this.queue.getJob(jobId);

    if (!job) {
      throw new NotFoundException('Reservation job not found');
    }

    if (await job.isCompleted()) {
      return { status: 'completed', data: await job.returnvalue };
    } else if (await job.isFailed()) {
      return { status: 'failed', error: job.failedReason };
    } else {
      return { status: 'pending' };
    }
  }
}
