import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'myjwtsecretkey'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION', '1h') }
      })
    })
  ],
  providers: [JwtStrategy, AuthService, JwtAuthGuard],
  exports: [JwtModule, AuthService, JwtAuthGuard],
  controllers: [AuthController]
})
export class AuthModule {}
