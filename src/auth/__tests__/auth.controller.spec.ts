import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { JwtAuthGuard } from '../jwt.guard';
import { LoginDto } from '../dto/login.dto';
import { User } from '../../database/schemas/user.schema';
import { RegisterDto } from '../dto/register.dto';
import { getModelToken } from '@nestjs/mongoose';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
            register: jest.fn(),
            logout: jest.fn()
          }
        },
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn() // Mock create method here
          }
        }
      ]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should successfully log in a user and return access token', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password123' };
      const mockUser = { email: loginDto.email };
      const accessToken = 'access_token_example';

      jest.spyOn(authService, 'validateUser').mockResolvedValue({ ...mockUser } as User);
      jest.spyOn(authService, 'login').mockResolvedValue({ token: accessToken });

      const result = await controller.login(loginDto);

      expect(result).toEqual({ token: accessToken });
      expect(authService.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'wrongpassword' };

      jest
        .spyOn(authService, 'validateUser')
        .mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(authService.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = { email: 'test@example.com', password: 'password123' };
      const mockRegisterResponse = { ...registerDto };

      jest.spyOn(authService, 'register').mockResolvedValue({ ...registerDto } as User);

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockRegisterResponse);
      expect(authService.register).toHaveBeenCalledWith(registerDto.email, registerDto.password);
    });

    it('should throw ConflictException if user with email already exists', async () => {
      const registerDto: RegisterDto = { email: 'test@example.com', password: 'password123' };

      jest
        .spyOn(authService, 'register')
        .mockRejectedValue(new ConflictException('User with this email already exists'));

      await expect(controller.register(registerDto)).rejects.toThrow(ConflictException);
      expect(authService.register).toHaveBeenCalledWith(registerDto.email, registerDto.password);
    });
  });

  describe('logout', () => {
    it('should successfully log out a user', async () => {
      const authHeader = 'Bearer some_valid_token';
      const requestMock: any = { headers: { authorization: authHeader } };
      const mockLogoutResponse = { message: 'Successfully logged out' };

      jest.spyOn(authService, 'logout').mockResolvedValue(mockLogoutResponse);

      const result = await controller.logout(requestMock);

      expect(result).toEqual(mockLogoutResponse);
      expect(authService.logout).toHaveBeenCalledWith('some_valid_token');
    });

    it('should throw UnauthorizedException if token is invalid or missing', async () => {
      const requestMock: any = { headers: { authorization: '' } };

      jest
        .spyOn(authService, 'logout')
        .mockRejectedValue(new UnauthorizedException('Token is missing or invalid'));

      await expect(controller.logout(requestMock)).rejects.toThrow(UnauthorizedException);
    });
  });
});
