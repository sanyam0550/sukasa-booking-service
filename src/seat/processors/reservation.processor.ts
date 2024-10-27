import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ReservationService } from '../services/reservation.service';
import { ReserveSeatCommand } from '../commands/reserve.command';

@Processor('reservationQueue')
export class ReservationProcessor extends WorkerHost {
  constructor(private readonly reservationService: ReservationService) {
    super();
  }

  async process(job: Job<ReserveSeatCommand>) {
    const command = job.data;
    return this.reservationService.reserveSeat(command);
  }
}
