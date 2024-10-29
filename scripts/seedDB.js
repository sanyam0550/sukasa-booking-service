const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { UserSchema } = require('../dist/database/schemas/user.schema');
const { FlightSchema } = require('../dist/database/schemas/flight.schema');
const { SeatSchema } = require('../dist/database/schemas/seat.schema');
require('dotenv').config();

const MONGODB_URI = 'mongodb://localhost:27018/sukasa_air';
const User = mongoose.model('user', UserSchema);
const Flight = mongoose.model('flight', FlightSchema);
const Seat = mongoose.model('seat', SeatSchema);

async function connectDB() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');
}

async function seedAdminUsers() {
  const admins = [
    { email: 'admin@sukasaair.com', password: 'password123', role: 'admin' },
    { email: 'admin1@sukasaair.com', password: 'password123', role: 'admin' },
    { email: 'admin2@sukasaair.com', password: 'password123', role: 'admin' }
  ];

  for (const admin of admins) {
    const existingAdmin = await User.findOne({ email: admin.email });
    if (!existingAdmin) {
      admin.password = await bcrypt.hash(admin.password, 10);
      await User.create(admin);
      console.log(`Admin user created: ${admin.email}`);
    } else {
      console.log(`Admin user already exists: ${admin.email}`);
    }
  }
}

async function seedFlights() {
  const flights = [
    {
      flightNumber: 'FL123',
      departure: 'New York',
      arrival: 'London',
      departureTime: new Date('2023-12-01T10:00:00Z'),
      arrivalTime: new Date('2023-12-01T18:00:00Z'),
      totalSeats: 300
    },
    {
      flightNumber: 'FL456',
      departure: 'Los Angeles',
      arrival: 'Tokyo',
      departureTime: new Date('2023-12-05T08:00:00Z'),
      arrivalTime: new Date('2023-12-05T18:00:00Z'),
      totalSeats: 300
    }
  ];

  for (const flightData of flights) {
    const existingFlight = await Flight.findOne({ flightNumber: flightData.flightNumber });
    if (!existingFlight) {
      const flight = await Flight.create(flightData);
      console.log(`Flight created: ${flight.flightNumber}`);
      await seedSeats(flight);
    } else {
      console.log(`Flight already exists: ${existingFlight.flightNumber}`);
    }
  }
}

async function seedSeats(flight) {
  const totalSeats = flight.totalSeats;
  const seats = [];

  for (let i = 1; i <= totalSeats; i++) {
    seats.push({
      seatNumber: i.toString(),
      seatType: i <= Math.floor(totalSeats * 0.75) ? 'economy' : 'business',
      flightId: flight._id,
      isBooked: false
    });
  }

  await Seat.insertMany(seats);
  console.log(`Seats generated for flight ${flight.flightNumber}`);
}

async function seedDB() {
  try {
    await connectDB();
    await seedAdminUsers();
    await seedFlights();
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

seedDB().then(() => console.log({ message: 'Data populated' }));
