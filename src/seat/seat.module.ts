import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SeatController } from './seat.controller';
import { ReservationQueueService } from './services/reservation-queue.service';
import { ReservationProcessor } from './processors/reservation.processor';
import { ReservationService } from './services/reservation.service';
import { QueueModule } from '../queue/queue.module';
import { FlightService } from '../flight/flight.service';
import { SeatService } from './seat.service';

@Module({
  imports: [
    QueueModule, // Import QueueModule to get access to the global queue connection
    BullModule.registerQueue({
      name: 'reservationQueue' // Register reservationQueue under the global connection
    })
  ],
  controllers: [SeatController],
  providers: [
    ReservationQueueService,
    ReservationProcessor,
    ReservationService,
    FlightService,
    SeatService
  ],
  exports: [ReservationQueueService]
})
export class SeatModule {}
