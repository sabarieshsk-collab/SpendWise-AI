import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from '../src/routes/authRoutes.js';
import { generateToken } from '../src/utils/token.js';

test('Auth Integration Tests (Endpoint Behavior)', async (t) => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/auth', authRoutes);

  // Helper to make local in-process requests using node's http server
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api/auth`;

  t.after(() => {
    server.close();
  });

  await t.test('POST /api/auth/register returns 503 when DB is offline', async () => {
    const res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test User',
        email: 'test.user@spendwise.ai',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      })
    });

    const data = await res.json();
    assert.equal(res.status, 503);
    assert.equal(data.success, false);
    assert.ok(data.message.includes('Database service is currently unavailable'));
  });

  await t.test('POST /api/auth/login returns 503 when DB is offline', async () => {
    const res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test.user@spendwise.ai',
        password: 'Password123!'
      })
    });

    const data = await res.json();
    assert.equal(res.status, 503);
    assert.equal(data.success, false);
    assert.ok(data.message.includes('Database service is currently unavailable'));
  });

  await t.test('GET /api/auth/me returns 401 when no token is provided', async () => {
    const res = await fetch(`${baseUrl}/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();
    assert.equal(res.status, 401);
    assert.equal(data.success, false);
    assert.ok(data.message.includes('Authentication required'));
  });

  await t.test('GET /api/auth/me returns 401 for forged / invalid JWT token', async () => {
    const res = await fetch(`${baseUrl}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer forged-invalid-token-123'
      }
    });

    const data = await res.json();
    assert.equal(res.status, 401);
    assert.equal(data.success, false);
    assert.ok(data.message.includes('Invalid or expired authentication session'));
  });

  await t.test('POST /api/auth/logout clears cookie and returns 200', async () => {
    const res = await fetch(`${baseUrl}/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.message, 'Logged out successfully.');

    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie && setCookie.includes('token='), 'Should instruct browser to clear token cookie');
  });
});
