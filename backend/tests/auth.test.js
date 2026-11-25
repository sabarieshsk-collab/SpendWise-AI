import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken } from '../src/utils/token.js';

test('Auth Unit Tests', async (t) => {
  await t.test('JWT token generation and verification', () => {
    const payload = { userId: 'user-12345', email: 'test@spendwise.ai' };
    const token = generateToken(payload);
    assert.ok(typeof token === 'string' && token.length > 20, 'Token should be a valid string');

    const decoded = verifyToken(token);
    assert.equal(decoded.userId, payload.userId);
    assert.equal(decoded.email, payload.email);
  });

  await t.test('Bcrypt password hashing and verification', async () => {
    const rawPassword = 'SecurePassword2026!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);

    assert.notEqual(rawPassword, hash, 'Hash must not equal raw password');
    assert.ok(hash.startsWith('$2'), 'Hash should be valid bcrypt format');

    const isMatch = await bcrypt.compare(rawPassword, hash);
    assert.equal(isMatch, true, 'Matching password must resolve true');

    const isMismatch = await bcrypt.compare('WrongPassword', hash);
    assert.equal(isMismatch, false, 'Non-matching password must resolve false');
  });

  await t.test('Email regex validation', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    assert.equal(emailRegex.test('valid.user@spendwise.ai'), true);
    assert.equal(emailRegex.test('invalid-email'), false);
    assert.equal(emailRegex.test('user@domain'), false);
    assert.equal(emailRegex.test('@missinguser.com'), false);
  });
});
