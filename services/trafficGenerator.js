import TrafficEvent from '../models/TrafficEvent.js';
import ActivityLog from '../models/ActivityLog.js';
import { emitTrafficEvent } from './socketService.js';

const SOURCES = ['Organic', 'Social', 'Referral', 'Direct', 'Email', 'Paid'];
const DEVICES = ['desktop', 'mobile', 'tablet'];
const BROWSERS = ['Chrome', 'Firefox', 'Safari', 'Edge'];
const OS_LIST = ['Windows', 'macOS', 'iOS', 'Android', 'Linux'];
const COUNTRIES = ['United States', 'United Kingdom', 'Germany', 'India', 'Canada', 'Australia', 'France', 'Japan'];
const CAMPAIGNS = ['Q2_Growth', 'Retention_Push', 'Brand_Awareness', 'Holiday_Sale', 'Product_Launch'];

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomId = () => `usr_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
const randomSession = () => `sess_${Math.random().toString(36).slice(2, 15)}`;

let generatorInterval = null;
let isRunning = false;

// Probability weights for more realistic traffic patterns
function getWeightedSource() {
  const r = Math.random();
  if (r < 0.35) return 'Organic';
  if (r < 0.55) return 'Direct';
  if (r < 0.72) return 'Social';
  if (r < 0.85) return 'Referral';
  if (r < 0.94) return 'Email';
  return 'Paid';
}

function generateEvent() {
  const converted = Math.random() < 0.18;
  const source = getWeightedSource();
  const pagesViewed = random(1, 8);
  const goalCompleted = converted || Math.random() < 0.05;

  return {
    source,
    duration: random(10, 1200),
    revenue: converted ? Number((Math.random() * 450 + 20).toFixed(2)) : 0,
    userId: randomId(),
    sessionId: randomSession(),
    country: COUNTRIES[random(0, COUNTRIES.length - 1)],
    deviceType: DEVICES[random(0, DEVICES.length - 1)],
    browser: BROWSERS[random(0, BROWSERS.length - 1)],
    os: OS_LIST[random(0, OS_LIST.length - 1)],
    campaign: Math.random() > 0.7 ? CAMPAIGNS[random(0, CAMPAIGNS.length - 1)] : '',
    pageUrl: ['/', '/pricing', '/features', '/docs', '/blog', '/contact'][random(0, 5)],
    pagesViewed,
    interactions: random(0, 15),
    goalCompleted,
    goalType: converted ? 'purchase' : Math.random() > 0.5 ? 'signup' : 'download',
  };
}

// Generate and persist a batch of events asynchronously
async function generateAndEmitBatch(batchSize = 1) {
  if (!isRunning) return;

  try {
    const events = [];
    for (let i = 0; i < batchSize; i++) {
      events.push({
        ...generateEvent(),
        timestamp: new Date(),
      });
    }

    // Insert into MongoDB
    const savedEvents = await TrafficEvent.insertMany(events, { ordered: false });

    // Create activity logs and emit via Socket.IO
    for (const event of savedEvents) {
      // Create activity log
      const activityLog = await ActivityLog.create({
        type: event.revenue > 0 ? 'success' : event.goalCompleted ? 'success' : 'info',
        category: event.revenue > 0 ? 'revenue' : event.goalCompleted ? 'campaign' : 'system',
        message: event.revenue > 0
          ? `New conversion $${event.revenue.toFixed(2)} from ${event.source}`
          : event.goalCompleted
            ? `Goal completed: ${event.goalType} via ${event.source}`
            : `New session from ${event.source} (${event.country})`,
        amount: event.revenue > 0 ? `+$${event.revenue.toFixed(2)}` : undefined,
        userId: event.userId,
        relatedEntityId: event._id.toString(),
        relatedEntityType: 'TrafficEvent',
        timestamp: new Date(),
      });

      // Emit the event via WebSocket in real-time
      emitTrafficEvent({
        type: 'traffic_event',
        data: {
          _id: event._id,
          source: event.source,
          revenue: event.revenue,
          duration: event.duration,
          country: event.country,
          deviceType: event.deviceType,
          pageUrl: event.pageUrl,
          goalCompleted: event.goalCompleted,
          goalType: event.goalType,
          timestamp: event.timestamp,
        },
        activity: {
          _id: activityLog._id,
          type: activityLog.type,
          message: activityLog.message,
          amount: activityLog.amount,
          timestamp: activityLog.timestamp,
        },
      });
    }

    if (batchSize > 1) {
      console.log(`[Generator] Generated ${savedEvents.length} real-time events`);
    }
  } catch (error) {
    // Silently handle duplicate key errors during concurrent generation
    if (error.code !== 11000) {
      console.error('[Generator] Error generating event:', error.message);
    }
  }
}

export function startTrafficGenerator() {
  if (isRunning) return;

  isRunning = true;
  console.log('[Generator] Real-time traffic generator started');

  // Generate events on a realistic schedule:
  // - Base rate: 1 event every 3-7 seconds
  // - Occasional bursts: 3-5 events at once (simulating traffic spikes)

  const scheduleNext = () => {
    if (!isRunning) return;

    // Determine if this is a burst (20% chance)
    const isBurst = Math.random() < 0.2;
    const batchSize = isBurst ? random(3, 6) : 1;

    generateAndEmitBatch(batchSize);

    // Schedule next event: 2-8 seconds for normal, or after burst
    const delay = isBurst ? random(5000, 10000) : random(2000, 8000);
    generatorInterval = setTimeout(scheduleNext, delay);
  };

  // Generate initial batch immediately
  generateAndEmitBatch(2);
  scheduleNext();

  return generatorInterval;
}

export function stopTrafficGenerator() {
  isRunning = false;
  if (generatorInterval) {
    clearTimeout(generatorInterval);
    generatorInterval = null;
  }
  console.log('[Generator] Real-time traffic generator stopped');
}

export function isGeneratorRunning() {
  return isRunning;
}