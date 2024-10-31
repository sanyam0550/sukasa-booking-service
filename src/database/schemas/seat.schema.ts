import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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

  @Prop({ type: String, required: true })
  flightId: string;

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
SeatSchema.index({ seatNumber: 1, flightId: 1 }, { unique: true });
export { SeatSchema };
