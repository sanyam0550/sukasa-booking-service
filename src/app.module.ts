import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { FlightModule } from './flight/flight.module';
import { SeatModule } from './seat/seat.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // This enables global access to env variables
    DatabaseModule,
    AuthModule,
    FlightModule,
    SeatModule
  ]
})
export class AppModule {}
