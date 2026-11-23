import crypto from 'node:crypto';
import { rmSync } from 'node:fs';
import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { testDataDir } from './helpers/testApp.js';

const { createApp } = await import('../src/app.js');
const app = createApp();
const email = () => `person-${crypto.randomUUID()}@example.com`;

const contactBody = (overrides = {}) => ({
  name: 'Anika Verma',
  email: email(),
  subject: 'search',
  context: 'search results near a campus',
  message: 'I could not understand how the radius filter affects the results.',
  ...overrides,
});

const enquiryBody = (overrides = {}) => ({
  listingId: `osm:way:${crypto.randomUUID()}`,
  listingTitle: 'Genuine hostel near the metro',
  name: 'Kabir Sethi',
  email: email(),
  phone: '9876543210',
  message: 'Is this accommodation still available for students next month?',
  ...overrides,
});

const submissionBody = () => ({
  title: 'Owner House',
  category: 'pg',
  address: { label: 'Test Street, Pune', city: 'Pune', state: 'Maharashtra' },
  coordinates: { lat: 18.52, lng: 73.86 },
  prices: { rent: 9000 },
  contact: { phone: '9876543210' },
  consent: true,
});

async function register(name) {
  const address = email();
  const response = await request(app).post('/api/auth/register').send({ name, email: address, password: 'password-1234' });
  expect(response.status).toBe(201);
  return { token: response.body.token, user: response.body.user, email: address };
}

afterAll(() => rmSync(testDataDir, { recursive: true, force: true }));

describe('contact API', () => {
  it('records a contact message without claiming an email was sent', async () => {
    const response = await request(app).post('/api/contact').send(contactBody());
    expect(response.status).toBe(201);
    expect(response.body.record).toMatchObject({
      name: 'Anika Verma',
      subject: 'search',
      context: 'search results near a campus',
    });
    expect(response.body.record.id).toBeTruthy();
    expect(response.body.record.receivedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(response.body.storage).toBe('local-development-file');
    expect(response.body.message).toMatch(/no email was sent/i);
  });

  it('rejects invalid contact input', async () => {
    expect((await request(app).post('/api/contact').send(contactBody({ email: 'not-an-email' }))).status).toBe(400);
    expect((await request(app).post('/api/contact').send(contactBody({ subject: 'marketing' }))).status).toBe(400);
    expect((await request(app).post('/api/contact').send(contactBody({ message: 'too short' }))).status).toBe(400);
    expect((await request(app).post('/api/contact').send(contactBody({ message: 'Visit https://example.com for details about this.' }))).status).toBe(400);
  });
});

describe('enquiry API', () => {
  it('records anonymous enquiries but requires a token to list them', async () => {
    const body = enquiryBody();
    const created = await request(app).post('/api/enquiries').send(body);
    expect(created.status).toBe(201);
    expect(created.body.record).toMatchObject({
      listingId: body.listingId,
      listingTitle: body.listingTitle,
      name: body.name,
      email: body.email,
      phone: body.phone,
      message: body.message,
    });
    expect(created.body.storage).toBe('local-development-file');
    expect((await request(app).get('/api/enquiries')).status).toBe(401);

    const requester = await register('Requester One');
    const linked = await request(app).post('/api/enquiries').send(enquiryBody({ email: requester.email }));
    expect(linked.status).toBe(201);
    expect(linked.body.record.requesterId).toBe(requester.user.id);

    const mine = await request(app).get('/api/enquiries').set('Authorization', `Bearer ${requester.token}`);
    expect(mine.status).toBe(200);
    expect(mine.body.items.some((item) => item.id === linked.body.record.id)).toBe(true);

    const stranger = await register('Stranger One');
    const theirs = await request(app).get('/api/enquiries').set('Authorization', `Bearer ${stranger.token}`);
    expect(theirs.body.items.some((item) => item.id === linked.body.record.id)).toBe(false);
  });

  it('lets an owner see enquiries for their submitted listing', async () => {
    const owner = await register('Listing Owner');
    const submission = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${owner.token}`)
      .send(submissionBody());
    expect(submission.status).toBe(201);

    const enquiry = await request(app)
      .post('/api/enquiries')
      .send(enquiryBody({ listingId: submission.body.record.id, email: email() }));
    expect(enquiry.status).toBe(201);
    expect(enquiry.body.record.ownerId).toBe(owner.user.id);

    const ownerView = await request(app).get('/api/enquiries').set('Authorization', `Bearer ${owner.token}`);
    expect(ownerView.body.items.some((item) => item.id === enquiry.body.record.id)).toBe(true);
  });

  it('validates enquiry fields', async () => {
    expect((await request(app).post('/api/enquiries').send(enquiryBody({ message: 'short' }))).status).toBe(400);
    expect((await request(app).post('/api/enquiries').send(enquiryBody({ listingTitle: 'See https://example.com' }))).status).toBe(400);
    expect((await request(app).post('/api/enquiries').send(enquiryBody({ email: 'bad' }))).status).toBe(400);
  });
});
