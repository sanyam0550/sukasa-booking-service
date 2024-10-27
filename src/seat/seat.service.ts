import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Seat } from '../database/schemas/seat.schema';

@Injectable()
export class SeatService {
  constructor(@InjectModel(Seat.name) private seatModel: Model<Seat>) {}

  async getSeatByFlightAndNumber(flightId: string, seatNumber: string): Promise<Seat | null> {
    return this.seatModel.findOne({ flightId: new Types.ObjectId(flightId), seatNumber }).exec();
  }
}
