import { Injectable, ConflictException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import { Seat } from '../../database/schemas/seat.schema';
import { ReserveSeatCommand } from '../commands/reserve.command';

@Injectable()
export class ReservationService {
  constructor(@InjectModel(Seat.name) private readonly seatModel: Model<Seat>) {}

  async reserveSeat(command: ReserveSeatCommand) {
    const { seatNumber, flightId, passengerPhone, passengerName, passengerAge, userId } = command;

    const seat = await this.seatModel.findOne({
      seatNumber,
      flightId,
      isBooked: false
    });

    if (!seat) {
      throw new ConflictException(
        `Seat ${seatNumber} on flight ${flightId} is already reserved or not found`
      );
    }

    // Reserve seat
    seat.isBooked = true;
    seat.userId = userId;
    seat.passengerName = passengerName;
    seat.passengerPhone = passengerPhone;
    seat.passengerAge = passengerAge;
    await seat.save();

    return {
      statusCode: 200,
      message: `Seat ${seatNumber} on flight ${flightId} successfully reserved for ${passengerName}`
    };
  }
}
