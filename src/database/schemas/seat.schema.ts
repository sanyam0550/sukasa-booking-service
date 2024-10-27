import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Flight } from './flight.schema';

enum SeatType {
  ECONOMY = 'economy',
  BUSINESS = 'business'
}

@Schema()
export class Seat extends Document {
  @Prop({ required: true })
  seatNumber: string;

  @Prop({ required: true, enum: SeatType })
  seatType: SeatType;

  @Prop({ default: false })
  isBooked: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Flight', required: true })
  flightId: Types.ObjectId | Flight;

  @Prop({ type: String })
  userId: string; // Represents the user who made the booking

  // Passenger Information
  @Prop({ required: true })
  passengerName: string;

  @Prop({ required: true })
  passengerPhone: string;

  @Prop({ required: true })
  passengerAge: number;
}

export const SeatSchema = SchemaFactory.createForClass(Seat);
