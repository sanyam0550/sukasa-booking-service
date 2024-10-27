import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserSchema } from './schemas/user.schema';
import mongoose from 'mongoose';
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
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
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
