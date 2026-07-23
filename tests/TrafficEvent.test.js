import mongoose from 'mongoose';
import TrafficEvent from '../models/TrafficEvent.js';

describe('TrafficEvent Model', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/insights_test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await TrafficEvent.deleteMany({});
  });

  it('should create a traffic event with required fields', async () => {
    const event = await TrafficEvent.create({
      source: 'Organic',
      duration: 120,
      userId: 'user123',
      timestamp: new Date(),
    });

    expect(event).toBeDefined();
    expect(event.source).toBe('Organic');
    expect(event.duration).toBe(120);
    expect(event.userId).toBe('user123');
    expect(event._id).toBeDefined();
  });

  it('should require source field', async () => {
    const event = new TrafficEvent({ duration: 120 });
    let err;
    try {
      await event.validate();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.source).toBeDefined();
  });

  it('should validate source enum', async () => {
    const event = new TrafficEvent({ source: 'Invalid', duration: 120 });
    let err;
    try {
      await event.validate();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.source).toBeDefined();
  });

  it('should default revenue to 0', async () => {
    const event = await TrafficEvent.create({
      source: 'Organic',
      duration: 120,
      userId: 'user123',
    });

    expect(event.revenue).toBe(0);
  });

  it('should allow optional fields', async () => {
    const event = await TrafficEvent.create({
      source: 'Social',
      duration: 90,
      userId: 'usr_abc123',
      country: 'US',
      deviceType: 'desktop',
      browser: 'Chrome',
      os: 'Windows',
      campaign: 'Summer2024',
      pageUrl: '/home',
      pagesViewed: 5,
      interactions: 12,
      revenue: 25.5,
    });

    expect(event.country).toBe('US');
    expect(event.deviceType).toBe('desktop');
    expect(event.revenue).toBe(25.5);
    expect(event.pagesViewed).toBe(5);
  });

  it('should have timestamps', async () => {
    const event = await TrafficEvent.create({
      source: 'Organic',
      duration: 120,
      userId: 'user123',
    });

    expect(event.createdAt).toBeDefined();
    expect(event.updatedAt).toBeDefined();
  });

  it('should support querying by userId', async () => {
    await TrafficEvent.createMany([
      { source: 'Organic', duration: 120, userId: 'user1', timestamp: new Date() },
      { source: 'Social', duration: 90, userId: 'user2', timestamp: new Date() },
      { source: 'Referral', duration: 60, userId: 'user1', timestamp: new Date() },
    ]);

    const user1Events = await TrafficEvent.find({ userId: 'user1' });
    expect(user1Events).toHaveLength(2);
  });

  it('should support querying by source', async () => {
    await TrafficEvent.createMany([
      { source: 'Organic', duration: 120, userId: 'user1', timestamp: new Date() },
      { source: 'Organic', duration: 90, userId: 'user2', timestamp: new Date() },
      { source: 'Social', duration: 60, userId: 'user3', timestamp: new Date() },
    ]);

    const organicEvents = await TrafficEvent.find({ source: 'Organic' });
    expect(organicEvents).toHaveLength(2);
  });
});