import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Flight } from './flight.schema';

enum SeatType {
  ECONOMY = 'economy',
  BUSINESS = 'business',
  FIRST_CLASS = 'firstClass'
}

@Schema()
export class Seat extends Document {
  @Prop({ required: true })
  seatNumber: string;

  @Prop({ required: true, enum: SeatType })
  seatType: SeatType;

  @Prop({ default: false })
  isBooked: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Flight', required: true }) // Reference to Flight
  flight: Types.ObjectId | Flight;
}

export const SeatSchema = SchemaFactory.createForClass(Seat);
