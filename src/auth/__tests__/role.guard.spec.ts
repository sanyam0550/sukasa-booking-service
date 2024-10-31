import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  function createMockExecutionContext(role: string | undefined): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role }
        })
      }),
      getHandler: jest.fn(),
      getClass: jest.fn()
    } as unknown as ExecutionContext;
  }

  it('should allow access if no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockExecutionContext('user');

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has the required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    const context = createMockExecutionContext('admin');

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access if user does not have the required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    const context = createMockExecutionContext('user');

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow(
      'You do not have the necessary permissions to access this resource'
    );
  });

  it('should deny access if user has no role and roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    const context = createMockExecutionContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException with custom message if user role is invalid', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    const context = createMockExecutionContext('user');

    try {
      guard.canActivate(context);
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
      expect(error.message).toBe(
        'You do not have the necessary permissions to access this resource'
      );
    }
  });
});
