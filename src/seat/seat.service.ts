import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery } from 'mongoose';
import { Seat } from '../database/schemas/seat.schema';

@Injectable()
export class SeatService {
  constructor(@InjectModel(Seat.name) private seatModel: Model<Seat>) {}

  async getSeatByFlightAndNumber(flightId: string, seatNumber: string): Promise<Seat | null> {
    return this.seatModel.findOne({ flightId: new Types.ObjectId(flightId), seatNumber }).exec();
  }

  async resetSeats(flightId?: string): Promise<void> {
    const updateQuery: UpdateQuery<Seat> = {
      $set: { isBooked: false },
      $unset: { userId: 1, passengerName: 1, passengerPhone: 1, passengerAge: 1 }
    };
    if (flightId) {
      await this.seatModel.updateMany({ flightId: new Types.ObjectId(flightId) }, updateQuery);
    } else {
      await this.seatModel.updateMany({}, updateQuery);
    }
  }
}
