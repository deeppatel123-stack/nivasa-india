import crypto from 'node:crypto';
import { rmSync } from 'node:fs';
import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { testDataDir } from './helpers/testApp.js';

const { createApp } = await import('../src/app.js');
const { verifyToken } = await import('../src/services/authService.js');
const app = createApp();
const email = () => `account-${crypto.randomUUID()}@example.com`;

afterAll(() => rmSync(testDataDir, { recursive: true, force: true }));

describe('account API', () => {
  it('registers a user with a signed token and no password leak', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Asha Rao',
      email: email(),
      password: 'correct-horse-battery',
    });

    expect(response.status).toBe(201);
    expect(response.body.user).toMatchObject({ name: 'Asha Rao', role: 'user' });
    expect(response.body.user.id).toBeTruthy();
    expect(response.body.user.email).toMatch(/^account-/);
    expect(response.body.user).not.toHaveProperty('passwordHash');
    expect(response.body.storage).toBe('local-development-file');
    expect(response.body.token.split('.')).toHaveLength(3);
    expect(verifyToken(response.body.token).sub).toBe(response.body.user.id);
    if (response.body.tokenMode === 'ephemeral-dev') expect(response.body.warning).toMatch(/restart/);
  });

  it('rejects duplicate emails and weak or URL-based input', async () => {
    const address = email();
    const body = { name: 'Ravi Kumar', email: address, password: 'long-enough-password' };
    expect((await request(app).post('/api/auth/register').send(body)).status).toBe(201);
    expect((await request(app).post('/api/auth/register').send(body)).status).toBe(409);

    expect((await request(app).post('/api/auth/register').send({ ...body, email: 'bad-email' })).status).toBe(400);
    expect((await request(app).post('/api/auth/register').send({ ...body, email: email(), password: 'short' })).status).toBe(400);
    expect((await request(app).post('/api/auth/register').send({ ...body, email: email(), name: 'https://example.com' })).status).toBe(400);
  });

  it('logs in only with the correct password', async () => {
    const address = email();
    await request(app).post('/api/auth/register').send({ name: 'Meera Iyer', email: address, password: 'first-password-1' });

    const good = await request(app).post('/api/auth/login').send({ email: address.toUpperCase(), password: 'first-password-1' });
    expect(good.status).toBe(200);
    expect(good.body.user.email).toBe(address);
    expect(good.body.token).toBeTruthy();

    const bad = await request(app).post('/api/auth/login').send({ email: address, password: 'wrong-password-1' });
    expect(bad.status).toBe(401);
    expect(bad.body.token).toBeUndefined();
    expect((await request(app).post('/api/auth/login').send({ email: email(), password: 'wrong-password-1' })).status).toBe(401);
  });

  it('returns the current account only for a valid Bearer token', async () => {
    const registered = await request(app).post('/api/auth/register').send({
      name: 'Noah Shah',
      email: email(),
      password: 'another-password',
    });
    const token = registered.body.token;

    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.user).toEqual(registered.body.user);
    expect(me.body.storage).toBe('local-development-file');

    expect((await request(app).get('/api/auth/me')).status).toBe(401);
    expect((await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}x`)).status).toBe(401);
  });

  it('reports password reset delivery honestly without issuing a token', async () => {
    const response = await request(app).post('/api/auth/forgot-password').send({ email: email() });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      delivery: 'not-configured',
      message: 'Password reset email delivery is not configured; no email was sent.',
    });
    expect(response.body.token).toBeUndefined();
    expect((await request(app).post('/api/auth/forgot-password').send({ email: 'nope' })).status).toBe(400);
  });
});
