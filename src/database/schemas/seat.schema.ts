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
  @Prop({ required: false })
  passengerName: string;

  @Prop({ required: false })
  passengerPhone: string;

  @Prop({ required: false })
  passengerAge: number;
}

const SeatSchema = SchemaFactory.createForClass(Seat);
// Exporting the SeatType enum for use in other files
export { SeatSchema };
