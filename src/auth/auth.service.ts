import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../database/schemas/user.schema';
import { UserRole } from './enums/user-role.enum';
import { RedisService } from '../database/services/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject() private readonly redisService: RedisService
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userModel.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: User): Promise<{ token: string }> {
    const payload = { email: user.email, role: user.role };
    return {
      token: this.jwtService.sign(payload)
    };
  }

  async register(email: string, password: string) {
    // Check if the user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the password and create a new user
    const hashedPassword = await bcrypt.hash(password, 10);
    // Directly call `create` without `new`
    const newUser = await this.userModel.create({
      email,
      password: hashedPassword,
      role: UserRole.USER
    });

    // Use toObject to remove password before returning
    const userObj = newUser.toObject();
    delete userObj.password;
    return userObj;
  }

  async logout(token: string) {
    const decodedToken = this.jwtService.decode(token) as { exp: number };

    if (decodedToken && decodedToken.exp) {
      const ttl = decodedToken.exp - Math.floor(Date.now() / 1000);
      await this.redisService.getClient().set(token, 'blacklisted', 'EX', ttl);
    }

    return { message: 'Successfully logged out' };
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    return !!(await this.redisService.getClient().get(token));
  }
}
