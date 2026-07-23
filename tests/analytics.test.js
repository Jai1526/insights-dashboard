import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';

describe('Analytics API', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/insights_test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await mongoose.connection.db?.collection('users')?.deleteMany({});
    await mongoose.connection.db?.collection('trafficEvents')?.deleteMany({});
    await mongoose.connection.db?.collection('activitylogs')?.deleteMany({});
    await mongoose.connection.db?.collection('campaigns')?.deleteMany({});

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });
    authToken = registerRes.body.token;
    userId = registerRes.body.user._id;
  });

  const authHeaders = () => ({ Authorization: `Bearer ${authToken}` });

  it('should get overview with valid range', async () => {
    const res = await request(app)
      .get('/api/analytics/overview?range=month')
      .set(authHeaders());

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalRevenue');
    expect(res.body).toHaveProperty('activeUsers');
    expect(res.body).toHaveProperty('conversionRate');
    expect(res.body).toHaveProperty('avgSessionDuration');
  });

  it('should get traffic chart data', async () => {
    const res = await request(app)
      .get('/api/analytics/traffic-chart?range=week')
      .set(authHeaders());

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('range', 'week');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should get sources breakdown', async () => {
    const res = await request(app)
      .get('/api/analytics/sources?range=month')
      .set(authHeaders());

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should create a new traffic event', async () => {
    const res = await request(app)
      .post('/api/analytics/event')
      .set(authHeaders())
      .send({ source: 'Organic', duration: 120, revenue: 25.5 });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Event created successfully.');
    expect(res.body.event.source).toBe('Organic');
  });

  it('should reject event with invalid source', async () => {
    const res = await request(app)
      .post('/api/analytics/event')
      .set(authHeaders())
      .send({ source: 'InvalidSource', duration: 120 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('should get activity feed', async () => {
    const res = await request(app)
      .get('/api/analytics/activity?limit=10')
      .set(authHeaders());

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create and retrieve campaigns', async () => {
    const createRes = await request(app)
      .post('/api/analytics/campaigns')
      .set(authHeaders())
      .send({ name: 'Test Campaign', status: 'Active', budget: 5000 });

    expect(createRes.status).toBe(201);
    const campaignId = createRes.body._id;

    const getRes = await request(app)
      .get(`/api/analytics/campaigns/${campaignId}`)
      .set(authHeaders());

    expect(getRes.status).toBe(200);
    expect(getRes.body.name).toBe('Test Campaign');
  });

  it('should update a campaign', async () => {
    const createRes = await request(app)
      .post('/api/analytics/campaigns')
      .set(authHeaders())
      .send({ name: 'Test Campaign', status: 'Active', budget: 5000 });

    const campaignId = createRes.body._id;

    const updateRes = await request(app)
      .put(`/api/analytics/campaigns/${campaignId}`)
      .set(authHeaders())
      .send({ status: 'Paused' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.status).toBe('Paused');
  });

  it('should delete a campaign', async () => {
    const createRes = await request(app)
      .post('/api/analytics/campaigns')
      .set(authHeaders())
      .send({ name: 'Delete Me', status: 'Draft' });

    const campaignId = createRes.body._id;

    const deleteRes = await request(app)
      .delete(`/api/analytics/campaigns/${campaignId}`)
      .set(authHeaders());

    expect(deleteRes.status).toBe(200);
  });

  it('should require authentication', async () => {
    const res = await request(app)
      .get('/api/analytics/overview');

    expect(res.status).toBe(401);
  });

  it('should get panel analytics data', async () => {
    const res = await request(app)
      .get('/api/analytics/panel/analytics?range=week')
      .set(authHeaders());

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('pageViews');
    expect(res.body).toHaveProperty('bounceRate');
    expect(res.body).toHaveProperty('avgTimeOnPage');
  });
});