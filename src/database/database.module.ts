import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserSchema } from './schemas/user.schema';
import mongoose from 'mongoose';
import { Flight, FlightSchema } from './schemas/flight.schema';
import { Seat, SeatSchema } from './schemas/seat.schema';
@Global()
@Module({
  imports: [
    ConfigModule, // Ensure ConfigModule is available
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI')
      })
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Flight.name, schema: FlightSchema },
      { name: Seat.name, schema: SeatSchema }
    ])
  ],
  exports: [MongooseModule]
})
export class DatabaseModule {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const isLocalEnv = !this.configService.get<string>('NODE_ENV');
    mongoose.set('debug', isLocalEnv); // Enable debug mode if environment is 'local'
  }
}
