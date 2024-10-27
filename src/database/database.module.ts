import { Global, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserSchema } from './schemas/user.schema';
import mongoose from 'mongoose';
import { Flight, FlightSchema } from './schemas/flight.schema';
import { Seat, SeatSchema } from './schemas/seat.schema';
import { RedisService } from './services/redis.service';
@Global()
@Module({
  imports: [
    ConfigModule, // Ensure ConfigModule is available
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/sukasa_air')
      })
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Flight.name, schema: FlightSchema },
      { name: Seat.name, schema: SeatSchema }
    ])
  ],
  exports: [MongooseModule, RedisService],
  providers: [RedisService]
})
export class DatabaseModule implements OnModuleInit, OnModuleDestroy {
  constructor(
    private configService: ConfigService,
    private redisService: RedisService
  ) {}

  onModuleInit() {
    const isLocalEnv = !this.configService.get<string>('NODE_ENV');
    mongoose.set('debug', isLocalEnv); // Enable debug mode for MongoDB in local env

    this.redisService.onModuleInit(); // Initialize Redis connection
  }

  onModuleDestroy() {
    this.redisService.onModuleDestroy(); // Clean up Redis connection
  }
}
