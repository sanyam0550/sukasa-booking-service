import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../../database/schemas/user.schema';
import { RedisService } from '../../database/services/redis.service';

describe('AuthService', () => {
  let service: AuthService;
  let userModel: Model<User>;
  let jwtService: JwtService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            toObject: jest.fn()
          }
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            decode: jest.fn()
          }
        },
        {
          provide: RedisService,
          useValue: {
            getClient: jest.fn().mockReturnValue({
              set: jest.fn(),
              get: jest.fn()
            })
          }
        }
      ]
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);
    redisService = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const mockUser = { email: 'test@example.com', password: 'hashed_password' };
      jest.spyOn(userModel, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toEqual(mockUser);
      expect(userModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);

      await expect(service.validateUser('test@example.com', 'password')).rejects.toThrow(
        UnauthorizedException
      );
      expect(userModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const mockUser = { email: 'test@example.com', role: 'USER' } as unknown as Partial<User>;
      const accessToken = 'mock_access_token';
      jest.spyOn(jwtService, 'sign').mockReturnValue(accessToken);

      const result = await service.login(mockUser as any);
      expect(result).toEqual({ token: accessToken });
      expect(jwtService.sign).toHaveBeenCalledWith({ email: mockUser.email, role: mockUser.role });
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashed_password';
      const mockUser = {
        email,
        password: hashedPassword,
        role: 'user',
        toObject: jest.fn().mockReturnValue({ email, role: 'user' })
      };

      jest.spyOn(userModel, 'findOne').mockResolvedValue(null); // No existing user
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      jest.spyOn(userModel, 'create').mockResolvedValue(mockUser as any);

      const result = await service.register(email, password);
      expect(result).toEqual({ email, role: 'user' });
      expect(userModel.findOne).toHaveBeenCalledWith({ email });
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(userModel.create).toHaveBeenCalledWith({
        email,
        password: hashedPassword,
        role: 'user'
      });
    });

    it('should throw ConflictException if user with email already exists', async () => {
      const email = 'test@example.com';
      jest.spyOn(userModel, 'findOne').mockResolvedValue({ email } as User);

      await expect(service.register(email, 'password')).rejects.toThrow(ConflictException);
      expect(userModel.findOne).toHaveBeenCalledWith({ email });
    });
  });

  describe('logout', () => {
    it('should blacklist token in Redis', async () => {
      const token = 'some_valid_token';
      const decodedToken = { exp: Math.floor(Date.now() / 1000) + 3600 }; // 1 hour expiry
      jest.spyOn(jwtService, 'decode').mockReturnValue(decodedToken);
      const redisClient = redisService.getClient();
      jest.spyOn(redisClient, 'set').mockResolvedValue('OK');

      const result = await service.logout(token);
      expect(result).toEqual({ message: 'Successfully logged out' });
      expect(redisClient.set).toHaveBeenCalledWith(token, 'blacklisted', 'EX', 3600);
    });

    it('should not blacklist token if decode fails', async () => {
      const token = 'invalid_token';
      jest.spyOn(jwtService, 'decode').mockReturnValue(null);

      const result = await service.logout(token);
      expect(result).toEqual({ message: 'Successfully logged out' });
      expect(redisService.getClient().set).not.toHaveBeenCalled();
    });
  });

  describe('isTokenBlacklisted', () => {
    it('should return true if token is blacklisted', async () => {
      const token = 'blacklisted_token';
      const redisClient = redisService.getClient();
      jest.spyOn(redisClient, 'get').mockResolvedValue('blacklisted');

      const result = await service.isTokenBlacklisted(token);
      expect(result).toBe(true);
      expect(redisClient.get).toHaveBeenCalledWith(token);
    });

    it('should return false if token is not blacklisted', async () => {
      const token = 'not_blacklisted_token';
      const redisClient = redisService.getClient();
      jest.spyOn(redisClient, 'get').mockResolvedValue(null);

      const result = await service.isTokenBlacklisted(token);
      expect(result).toBe(false);
      expect(redisClient.get).toHaveBeenCalledWith(token);
    });
  });
});
