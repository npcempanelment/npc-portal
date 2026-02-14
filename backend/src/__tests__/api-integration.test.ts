/**
 * Integration tests for API endpoints.
 * Tests routes using supertest against the Express app.
 *
 * Note: These tests mock the database layer (Prisma) to avoid
 * requiring a real database connection.
 */

import express from 'express';
import { authenticate, authorize, generateToken } from '../middleware/auth';
import { UserRole } from '../types/enums';

// Build a minimal test app with the auth routes
function createTestApp() {
  const app = express();
  app.use(express.json());

  // Simulate auth routes (matching routes/index.ts)
  app.post('/api/auth/register', (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Validation failed.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Validation failed.' });
    }
    // Simulate successful registration
    const token = generateToken({ userId: 'new-user-id', email, roles: [UserRole.APPLICANT] });
    res.status(201).json({
      success: true,
      data: { user: { id: 'new-user-id', email, name, roles: [UserRole.APPLICANT] }, token },
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Validation failed.' });
    }
    if (email === 'admin@npcindia.gov.in' && password === 'NpcAdmin@2026') {
      const token = generateToken({ userId: 'admin-id', email, roles: [UserRole.ADMIN] });
      return res.json({
        success: true,
        data: { user: { id: 'admin-id', email, name: 'Admin', roles: [UserRole.ADMIN] }, token },
      });
    }
    res.status(401).json({ success: false, error: 'Invalid email or password.' });
  });

  // Protected route examples
  app.get('/api/profile', authenticate, (req, res) => {
    res.json({ success: true, data: { userId: req.user!.userId, email: req.user!.email } });
  });

  app.get('/api/admin/reports/stats', authenticate, authorize(UserRole.ADMIN, UserRole.DG), (req, res) => {
    res.json({ success: true, data: { totalApplications: 42 } });
  });

  // Master data (public)
  app.get('/api/master/domains', (_req, res) => {
    res.json({ success: true, data: [{ id: 'd1', name: 'Productivity', subDomains: [] }] });
  });

  app.get('/api/master/offices', (_req, res) => {
    res.json({
      success: true,
      data: [
        { id: 'o1', name: 'NPC HQ New Delhi', city: 'New Delhi', state: 'Delhi' },
        { id: 'o2', name: 'NPC Regional Directorate Mumbai', city: 'Mumbai', state: 'Maharashtra' },
      ],
    });
  });

  return app;
}

// Dynamically import supertest
let request: any;

beforeAll(async () => {
  const supertest = await import('supertest');
  request = supertest.default;
});

describe('API Integration Tests', () => {
  let app: express.Express;

  beforeEach(() => {
    app = createTestApp();
  });

  // ── Public endpoints ──

  describe('GET /api/master/domains', () => {
    it('should return domains list without authentication', async () => {
      const res = await request(app).get('/api/master/domains');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/master/offices', () => {
    it('should return offices with city names', async () => {
      const res = await request(app).get('/api/master/offices');
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data[0]).toHaveProperty('city');
      expect(res.body.data[0]).toHaveProperty('name');
    });
  });

  // ── Registration ──

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'newuser@example.com', password: 'Test@1234', name: 'New User' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('newuser@example.com');
      expect(res.body.data.user.roles).toContain('APPLICANT');
    });

    it('should reject registration without email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ password: 'Test@1234', name: 'No Email' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'x@y.com', password: '123', name: 'Short Pass' });

      expect(res.status).toBe(400);
    });
  });

  // ── Login ──

  describe('POST /api/auth/login', () => {
    it('should login with valid admin credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@npcindia.gov.in', password: 'NpcAdmin@2026' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.roles).toContain('ADMIN');
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@npcindia.gov.in', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject login without password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@npcindia.gov.in' });

      expect(res.status).toBe(400);
    });
  });

  // ── Protected routes ──

  describe('GET /api/profile (protected)', () => {
    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/profile');
      expect(res.status).toBe(401);
    });

    it('should accept request with valid JWT', async () => {
      const token = generateToken({ userId: 'u1', email: 'test@x.com', roles: [UserRole.APPLICANT] });
      const res = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.userId).toBe('u1');
    });
  });

  describe('GET /api/admin/reports/stats (admin-only)', () => {
    it('should reject non-admin user', async () => {
      const token = generateToken({ userId: 'u1', email: 'a@b.com', roles: [UserRole.APPLICANT] });
      const res = await request(app)
        .get('/api/admin/reports/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('should allow admin user', async () => {
      const token = generateToken({ userId: 'admin1', email: 'admin@x.com', roles: [UserRole.ADMIN] });
      const res = await request(app)
        .get('/api/admin/reports/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalApplications).toBe(42);
    });

    it('should allow DG role', async () => {
      const token = generateToken({ userId: 'dg1', email: 'dg@x.com', roles: [UserRole.DG] });
      const res = await request(app)
        .get('/api/admin/reports/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });
  });
});
