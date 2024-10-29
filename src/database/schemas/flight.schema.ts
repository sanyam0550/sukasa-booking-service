import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Flight extends Document {
  @Prop({ required: true, unique: true })
  flightNumber: string;

  @Prop({ required: true })
  departure: string;

  @Prop({ required: true })
  arrival: string;

  @Prop({ required: true, type: Date })
  departureTime: Date;

  @Prop({ required: true, type: Date })
  arrivalTime: Date;

  @Prop({ required: true, default: 300 })
  totalSeats: number;
}

const FlightSchema = SchemaFactory.createForClass(Flight);
export { FlightSchema };
