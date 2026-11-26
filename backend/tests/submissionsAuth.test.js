import crypto from 'node:crypto';
import { rmSync } from 'node:fs';
import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { testDataDir } from './helpers/testApp.js';

const { createApp } = await import('../src/app.js');
const { readCollection } = await import('../src/utils/fileStore.js');
const app = createApp();

const body = () => ({
  title: 'Verified Location House',
  category: 'pg',
  address: { label: 'Test Street, Pune', city: 'Pune', state: 'Maharashtra' },
  coordinates: { lat: 18.52, lng: 73.86 },
  prices: { rent: 9000 },
  contact: { phone: '9876543210' },
  consent: true,
});

async function register() {
  const response = await request(app).post('/api/auth/register').send({
    name: `Owner ${crypto.randomUUID().slice(0, 8)}`,
    email: `owner-${crypto.randomUUID()}@example.com`,
    password: 'password-1234',
    role: 'owner',
  });
  expect(response.status).toBe(201);
  return response.body;
}

afterAll(() => rmSync(testDataDir, { recursive: true, force: true }));

describe('owner submissions', () => {
  it('requires a Bearer token for both reading and writing', async () => {
    expect((await request(app).get('/api/submissions')).status).toBe(401);
    expect((await request(app).post('/api/submissions').send(body())).status).toBe(401);
  });

  it('stores pending, unpublished submissions against the owner only', async () => {
    const owner = await register();
    const created = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${owner.token}`)
      .send(body());

    expect(created.status).toBe(201);
    expect(created.body.record).toMatchObject({
      status: 'pending',
      published: false,
      ownerId: owner.user.id,
      verification: 'unverified',
      title: 'Verified Location House',
    });
    expect(created.body.record.id).toBeTruthy();
    expect(created.body.storage).toBe('local-development-file');
    expect(created.body.message).toMatch(/not published/i);

    // A pending submission must never be written to the public listing collection.
    expect(readCollection('listings')).toHaveLength(0);

    const mine = await request(app).get('/api/submissions').set('Authorization', `Bearer ${owner.token}`);
    expect(mine.status).toBe(200);
    expect(mine.body.items.map((item) => item.id)).toContain(created.body.record.id);

    const other = await register();
    const others = await request(app).get('/api/submissions').set('Authorization', `Bearer ${other.token}`);
    expect(others.status).toBe(200);
    expect(others.body.items.map((item) => item.id)).not.toContain(created.body.record.id);
  });
});
