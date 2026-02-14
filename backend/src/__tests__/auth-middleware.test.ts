/**
 * Unit tests for authentication and authorization middleware.
 */

import { generateToken, authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types/enums';
import { Request, Response, NextFunction } from 'express';

// Mock request/response helpers
function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    ...overrides,
  } as Request;
}

function mockRes(): Response & { _status: number; _json: any } {
  const res: any = {
    _status: 200,
    _json: null,
    status(code: number) { res._status = code; return res; },
    json(data: any) { res._json = data; return res; },
  };
  return res;
}

function mockNext(): NextFunction & { called: boolean } {
  const fn: any = () => { fn.called = true; };
  fn.called = false;
  return fn;
}

// ── generateToken ──

describe('generateToken', () => {
  it('should generate a valid JWT string', () => {
    const token = generateToken({
      userId: 'user123',
      email: 'test@example.com',
      roles: [UserRole.APPLICANT],
    });

    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // JWT has 3 parts
  });

  it('should generate different tokens for different users', () => {
    const token1 = generateToken({ userId: 'user1', email: 'a@b.com', roles: [UserRole.APPLICANT] });
    const token2 = generateToken({ userId: 'user2', email: 'c@d.com', roles: [UserRole.ADMIN] });
    expect(token1).not.toBe(token2);
  });
});

// ── authenticate middleware ──

describe('authenticate', () => {
  it('should reject request without Authorization header', () => {
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    authenticate(req, res, next);

    expect(res._status).toBe(401);
    expect(res._json.success).toBe(false);
    expect(next.called).toBe(false);
  });

  it('should reject request with invalid token', () => {
    const req = mockReq({ headers: { authorization: 'Bearer invalid.token.here' } as any });
    const res = mockRes();
    const next = mockNext();

    authenticate(req, res, next);

    expect(res._status).toBe(401);
    expect(next.called).toBe(false);
  });

  it('should accept request with valid token', () => {
    const token = generateToken({ userId: 'u1', email: 'test@x.com', roles: [UserRole.APPLICANT] });
    const req = mockReq({ headers: { authorization: `Bearer ${token}` } as any });
    const res = mockRes();
    const next = mockNext();

    authenticate(req, res, next);

    expect(next.called).toBe(true);
    expect(req.user).toBeDefined();
    expect(req.user!.userId).toBe('u1');
    expect(req.user!.email).toBe('test@x.com');
  });

  it('should reject non-Bearer auth scheme', () => {
    const req = mockReq({ headers: { authorization: 'Basic dGVzdDp0ZXN0' } as any });
    const res = mockRes();
    const next = mockNext();

    authenticate(req, res, next);

    expect(res._status).toBe(401);
    expect(next.called).toBe(false);
  });
});

// ── authorize middleware ──

describe('authorize', () => {
  it('should reject when user is not set', () => {
    const middleware = authorize(UserRole.ADMIN);
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    middleware(req, res, next);

    expect(res._status).toBe(401);
    expect(next.called).toBe(false);
  });

  it('should reject when user lacks required role', () => {
    const middleware = authorize(UserRole.ADMIN);
    const req = mockReq();
    (req as any).user = { userId: 'u1', email: 'x@y.com', roles: [UserRole.APPLICANT] };
    const res = mockRes();
    const next = mockNext();

    middleware(req, res, next);

    expect(res._status).toBe(403);
    expect(res._json.error).toContain('Insufficient');
    expect(next.called).toBe(false);
  });

  it('should allow when user has required role', () => {
    const middleware = authorize(UserRole.ADMIN, UserRole.DG);
    const req = mockReq();
    (req as any).user = { userId: 'u1', email: 'admin@x.com', roles: [UserRole.ADMIN] };
    const res = mockRes();
    const next = mockNext();

    middleware(req, res, next);

    expect(next.called).toBe(true);
  });

  it('should allow when user has one of multiple allowed roles', () => {
    const middleware = authorize(UserRole.SCREENING_MEMBER, UserRole.ADMIN);
    const req = mockReq();
    (req as any).user = { userId: 'u1', email: 's@x.com', roles: [UserRole.SCREENING_MEMBER] };
    const res = mockRes();
    const next = mockNext();

    middleware(req, res, next);

    expect(next.called).toBe(true);
  });
});
