import dotenv from 'dotenv';
import mongoose from 'mongoose';
import TrafficEvent from './models/TrafficEvent.js';
import ActivityLog from './models/ActivityLog.js';
import Campaign from './models/Campaign.js';

dotenv.config();
const SOURCES = ['Organic', 'Social', 'Referral', 'Direct', 'Email', 'Paid'];
const DEVICES = ['desktop', 'mobile', 'tablet'];
const BROWSERS = ['Chrome', 'Firefox', 'Safari', 'Edge'];
const OS_LIST = ['Windows', 'macOS', 'iOS', 'Android', 'Linux'];
const COUNTRIES = ['United States', 'United Kingdom', 'Germany', 'India', 'Canada', 'Australia', 'France', 'Japan'];
const CAMPAIGNS = ['Q2_Growth', 'Retention_Push', 'Brand_Awareness', 'Holiday_Sale', 'Product_Launch'];
const ACTIVITY = [
  { type: 'success', message: 'Payment received from Nova Studio', amount: '+$1,240', category: 'revenue' },
  { type: 'info', message: 'New enterprise account created', amount: '+$0', category: 'user' },
  { type: 'warning', message: 'Subscription renewal requires review', amount: '-$89', category: 'system' },
  { type: 'success', message: 'Payment received from Meridian Labs', amount: '+$860', category: 'revenue' },
  { type: 'info', message: 'Monthly analytics report is ready', category: 'system' },
  { type: 'success', message: 'Bulk import completed: 1,250 events', category: 'import' },
  { type: 'info', message: 'Campaign "Q2 Growth" reached 100k impressions', category: 'campaign' },
  { type: 'warning', message: 'API rate limit approaching for user_8f3a2', category: 'system', severity: 'high' },
];

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomId = () => `usr_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
const randomSession = () => `sess_${Math.random().toString(36).slice(2, 15)}`;

export async function ensureSeedData() {
  const [eventCount, activityCount, campaignCount] = await Promise.all([
    TrafficEvent.estimatedDocumentCount(),
    ActivityLog.estimatedDocumentCount(),
    Campaign.estimatedDocumentCount(),
  ]);

  if (eventCount === 0) {
    const now = new Date();
    const events = [];
    for (let dayOffset = 0; dayOffset < 365; dayOffset += 1) {
      const eventsThatDay = random(3, 8);
      for (let index = 0; index < eventsThatDay; index += 1) {
        const timestamp = new Date(now);
        timestamp.setUTCDate(now.getUTCDate() - dayOffset);
        timestamp.setUTCHours(random(0, 23), random(0, 59), random(0, 59), 0);
        const converted = Math.random() < 0.18;
        const source = SOURCES[random(0, SOURCES.length - 1)];

        events.push({
          timestamp,
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
          pagesViewed: random(1, 8),
          interactions: random(0, 15),
          goalCompleted: converted || Math.random() < 0.05,
          goalType: converted ? 'purchase' : Math.random() > 0.5 ? 'signup' : 'download',
        });
      }
    }
    await TrafficEvent.insertMany(events, { ordered: false });
    console.log(`Seeded ${events.length} traffic events with enhanced data.`);
  }

  if (activityCount === 0) {
    const logs = ACTIVITY.map((log, index) => ({
      ...log,
      severity: log.severity || 'low',
      timestamp: new Date(Date.now() - index * 1000 * 60 * 60 * 7),
    }));
    await ActivityLog.insertMany(logs);
    console.log(`Seeded ${logs.length} activity logs.`);
  }

  if (campaignCount === 0) {
    const campaigns = [
      {
        name: 'Q2 Growth',
        status: 'Active',
        description: 'Aggressive growth campaign targeting enterprise accounts',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        budget: 50000,
        spent: 32400,
        targetAudience: 'Enterprise decision makers',
        channels: ['LinkedIn', 'Google Ads', 'Email'],
        goals: ['Increase signups by 25%', 'Generate 500 qualified leads'],
        metrics: { impressions: 125000, clicks: 4200, conversions: 380, revenue: 28400 },
        tags: ['growth', 'enterprise'],
      },
      {
        name: 'Retention Push',
        status: 'Draft',
        description: 'Customer retention program with targeted re-engagement',
        startDate: null,
        endDate: null,
        budget: 25000,
        spent: 0,
        targetAudience: 'Existing customers with declining usage',
        channels: ['Email', 'In-app'],
        goals: ['Reduce churn by 15%', 'Increase daily active users'],
        metrics: { impressions: 0, clicks: 0, conversions: 0, revenue: 0 },
        tags: ['retention', 'churn'],
      },
      {
        name: 'Brand Awareness',
        status: 'Scheduled',
        description: 'Q3 brand awareness push across social channels',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        budget: 75000,
        spent: 0,
        targetAudience: 'Tech industry professionals',
        channels: ['Twitter', 'YouTube', 'Blog', 'PR'],
        goals: ['Reach 1M impressions', 'Grow follower base by 20%'],
        metrics: { impressions: 0, clicks: 0, conversions: 0, revenue: 0 },
        tags: ['branding', 'awareness'],
      },
    ];
    await Campaign.insertMany(campaigns);
    console.log(`Seeded ${campaigns.length} campaigns.`);
  }
}

// Run directly: node seed.js
const isMainModule = process.argv[1]?.includes('seed');
if (isMainModule) {
  mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/insights_dashboard')
    .then(async () => {
      await ensureSeedData();
      console.log('Seeding complete.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}