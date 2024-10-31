import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateFlightDto } from './dto/create-flight.dto';
import { Flight } from '../database/schemas/flight.schema';
import { Seat } from '../database/schemas/seat.schema';

@Injectable()
export class FlightService {
  constructor(
    @InjectModel(Flight.name) private flightModel: Model<Flight>,
    @InjectModel(Seat.name) private seatModel: Model<Seat> // Inject Seat model
  ) {}

  async addFlight(flightDetails: CreateFlightDto): Promise<Flight> {
    const { flightNumber, totalSeats = 300 } = flightDetails;

    // Check if a flight with the same flightNumber already exists
    const existingFlight = await this.flightModel.findOne({ flightNumber }).exec();
    if (existingFlight) {
      throw new ConflictException(`Flight with number ${flightNumber} already exists.`);
    }

    // Create the new flight if it doesn't exist
    const savedFlight = await this.flightModel.create(flightDetails);

    // Generate seats for the flight based on the totalSeats
    const seats = this.generateSeats(savedFlight.flightNumber, totalSeats);
    await this.seatModel.insertMany(seats);

    return savedFlight;
  }

  // Helper function to generate seats for the flight
  private generateSeats(flightId: string, totalSeats: number) {
    const seats = [];

    for (let i = 1; i <= totalSeats; i++) {
      seats.push({
        seatNumber: i.toString(),
        seatType: i <= Math.floor(totalSeats * 0.75) ? 'economy' : 'business', // Example 75% economy, 25% business
        flightId,
        isBooked: false
      });
    }

    return seats;
  }

  async checkFlightExists(flightId: string): Promise<boolean> {
    return !!(await this.flightModel.findOne({ flightNumber: flightId }).exec());
  }
}
