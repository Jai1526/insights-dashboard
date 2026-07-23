import TrafficEvent from '../models/TrafficEvent.js';
import ActivityLog from '../models/ActivityLog.js';
import Campaign from '../models/Campaign.js';
import AppError from '../utils/appError.js';
import { emitTrafficEvent } from '../services/socketService.js';

const VALID_RANGES = new Set(['week', 'month', 'year']);
const VALID_SOURCES = ['Organic', 'Social', 'Referral', 'Direct', 'Email', 'Paid'];

export function getDateScope(rangeValue) {
  const range = rangeValue ?? 'month';
  if (!VALID_RANGES.has(range)) {
    throw new AppError("Invalid range. Use 'week', 'month', or 'year'.", 400);
  }

  const now = new Date();
  const end = new Date(now);
  let start;

  if (range === 'week') {
    start = new Date(now);
    const day = (start.getUTCDay() + 6) % 7;
    start.setUTCDate(start.getUTCDate() - day);
    start.setUTCHours(0, 0, 0, 0);
  } else if (range === 'month') {
    start = new Date(now);
    start.setUTCDate(start.getUTCDate() - 27);
    start.setUTCHours(0, 0, 0, 0);
  } else {
    start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
  }
  return { range, start, end };
}

const formatDuration = (seconds) => {
  const rounded = Math.max(0, Math.round(seconds || 0));
  return `${Math.floor(rounded / 60)}m ${rounded % 60}s`;
};

// ── Overview ──

export async function getOverview(req, res, next) {
  try {
    const { range, start, end } = getDateScope(req.query.range);
    const [summary] = await TrafficEvent.aggregate([
      { $match: { timestamp: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$revenue' },
          activeUsers: { $addToSet: '$userId' },
          avgSessionDuration: { $avg: '$duration' },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          activeUsers: { $size: '$activeUsers' },
          avgSessionDuration: 1,
        },
      },
    ]);

    res.status(200).json({
      range,
      totalRevenue: summary?.totalRevenue ?? 0,
      activeUsers: summary?.activeUsers ?? 0,
      conversionRate: 3.42,
      avgSessionDuration: formatDuration(summary?.avgSessionDuration),
    });
  } catch (error) { next(error); }
}

// ── Traffic Chart ──

export async function getTrafficChart(req, res, next) {
  try {
    const { range, start, end } = getDateScope(req.query.range);
    let groupExpression, numberOfBuckets;

    if (range === 'week') {
      groupExpression = { $subtract: [{ $isoDayOfWeek: '$timestamp' }, 1] };
      numberOfBuckets = 7;
    } else if (range === 'month') {
      groupExpression = {
        $min: [3, { $floor: { $divide: [{ $dateDiff: { startDate: start, endDate: '$timestamp', unit: 'day' } }, 7] } }],
      };
      numberOfBuckets = 4;
    } else {
      groupExpression = { $dateDiff: { startDate: start, endDate: '$timestamp', unit: 'month' } };
      numberOfBuckets = 12;
    }

    const totals = await TrafficEvent.aggregate([
      { $match: { timestamp: { $gte: start, $lte: end } } },
      { $group: { _id: groupExpression, total: { $sum: 1 } } },
    ]);

    const data = Array(numberOfBuckets).fill(0);
    totals.forEach(({ _id, total }) => {
      if (_id >= 0 && _id < data.length) data[_id] = total;
    });

    res.status(200).json({ range, data });
  } catch (error) { next(error); }
}

// ── Sources ──

export async function getSources(req, res, next) {
  try {
    const { range, start, end } = getDateScope(req.query.range);

    const totals = await TrafficEvent.aggregate([
      { $match: { timestamp: { $gte: start, $lte: end } } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]);

    const totalEvents = totals.reduce((sum, item) => sum + item.count, 0);
    const countBySource = new Map(totals.map((item) => [item._id, item.count]));

    const data = VALID_SOURCES.map((source) => {
      const count = countBySource.get(source) ?? 0;
      return {
        source,
        count,
        percentage: totalEvents ? Number(((count / totalEvents) * 100).toFixed(2)) : 0,
      };
    }).filter(s => s.count > 0 || VALID_SOURCES.indexOf(s.source) < 4);

    res.status(200).json({ range, total: totalEvents, data });
  } catch (error) { next(error); }
}

// ── Activity ──

export async function getActivity(req, res, next) {
  try {
    const { type, category, limit: limitParam } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;

    const limit = Math.min(parseInt(limitParam) || 10, 50);
    const activity = await ActivityLog.find(filter).sort({ timestamp: -1 }).limit(limit).lean();

    // Mark activities as read
    if (req.user && type !== 'read') {
      await ActivityLog.updateMany(
        { read: false, ...filter },
        { $set: { read: true } }
      );
    }

    res.status(200).json(activity);
  } catch (error) { next(error); }
}

// ── Panel endpoints ──

export async function getPanelAnalytics(req, res, next) {
  try {
    const { range, start, end } = getDateScope(req.query.range);
    const [pageViewsResult] = await TrafficEvent.aggregate([
      { $match: { timestamp: { $gte: start, $lte: end } } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);
    const pageViews = pageViewsResult?.count || 0;

    const bounceCandidates = await TrafficEvent.countDocuments({
      timestamp: { $gte: start, $lte: end },
      duration: { $lte: 30 },
    });
    const bounceRate = pageViews > 0 ? Number(((bounceCandidates / pageViews) * 100).toFixed(1)) : 0;

    const [avgDurationResult] = await TrafficEvent.aggregate([
      { $match: { timestamp: { $gte: start, $lte: end } } },
      { $group: { _id: null, avg: { $avg: '$duration' } } },
    ]);
    const avgSeconds = Math.round(avgDurationResult?.avg || 0);
    const avgTimeOnPage = `${Math.floor(avgSeconds / 60)}m ${avgSeconds % 60}s`;

    // Device breakdown
    const deviceBreakdown = await TrafficEvent.aggregate([
      { $match: { timestamp: { $gte: start, $lte: end } } },
      { $group: { _id: '$deviceType', count: { $sum: 1 } } },
    ]);

    res.status(200).json({ pageViews, bounceRate, avgTimeOnPage, deviceBreakdown });
  } catch (error) { next(error); }
}

export async function getPanelCampaigns(req, res, next) {
  try {
    // Try to fetch from Campaign collection, fallback to hardcoded
    const dbCampaigns = await Campaign.find().sort({ createdAt: -1 }).limit(10).lean();
    if (dbCampaigns.length > 0) {
      return res.status(200).json(dbCampaigns);
    }
    const campaigns = [
      { name: 'Q2 Growth', status: 'Active', budget: 50000, spent: 32400, metrics: { impressions: 125000, clicks: 4200, conversions: 380, revenue: 28400 } },
      { name: 'Retention Push', status: 'Draft', budget: 25000, spent: 0, metrics: { impressions: 0, clicks: 0, conversions: 0, revenue: 0 } },
      { name: 'Brand Awareness', status: 'Scheduled', budget: 75000, spent: 0, metrics: { impressions: 0, clicks: 0, conversions: 0, revenue: 0 } },
    ];
    res.status(200).json(campaigns);
  } catch (error) { next(error); }
}

export async function getPanelAudience(req, res, next) {
  try {
    const { range, start, end } = getDateScope(req.query.range);

    const totalAudience = await TrafficEvent.distinct('userId', {
      timestamp: { $gte: start, $lte: end },
    });
    const total = totalAudience.length;

    const allTimeBefore = await TrafficEvent.distinct('userId', {
      timestamp: { $lt: start },
    });
    const beforeSet = new Set(allTimeBefore.map((id) => id.toString()));
    const newUsers = totalAudience.filter((id) => !beforeSet.has(id.toString())).length;

    const engagedUsers = await TrafficEvent.aggregate([
      { $match: { timestamp: { $gte: start, $lte: end } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $count: 'engaged' },
    ]);
    const engaged = engagedUsers[0]?.engaged || 0;
    const engagementRate = total > 0 ? Number(((engaged / total) * 100).toFixed(1)) : 0;

    // Country breakdown
    const countryBreakdown = await TrafficEvent.aggregate([
      { $match: { timestamp: { $gte: start, $lte: end } } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({ totalAudience: total, newUsers, engagementRate, countryBreakdown });
  } catch (error) { next(error); }
}

export async function getPanelSegments(req, res, next) {
  try {
    const segments = [
      { name: 'Enterprise', count: '4,200 users', criteria: '> 500 employees' },
      { name: 'SMB', count: '9,800 users', criteria: '10-500 employees' },
      { name: 'Startup', count: '4,400 users', criteria: '< 10 employees' },
    ];
    res.status(200).json(segments);
  } catch (error) { next(error); }
}

export async function getPanelRevenue(req, res, next) {
  try {
    const { range, start, end } = getDateScope(req.query.range);

    const [revenueResult] = await TrafficEvent.aggregate([
      { $match: { timestamp: { $gte: start, $lte: end }, revenue: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$revenue' }, count: { $sum: 1 } } },
    ]);
    const totalRevenue = revenueResult?.total || 0;
    const monthlyRevenue = totalRevenue / (range === 'year' ? 12 : 1);
    const mrr = Number(monthlyRevenue.toFixed(1));
    const arr = Number((mrr * 12).toFixed(1));

    const usersInRange = await TrafficEvent.distinct('userId', {
      timestamp: { $gte: start, $lte: end },
    });
    const usersBefore = await TrafficEvent.distinct('userId', {
      timestamp: { $lt: start },
    });
    const usersInRangeSet = new Set(usersInRange.map((id) => id.toString()));
    const churned = usersBefore.filter((id) => !usersInRangeSet.has(id.toString()));
    const churnRate = usersBefore.length > 0
      ? Number(((churned.length / usersBefore.length) * 100).toFixed(1))
      : 0;

    res.status(200).json({ mrr, arr, churnRate });
  } catch (error) { next(error); }
}

export async function getPanelRevenueList(req, res, next) {
  try {
    const list = [
      { name: 'Subscription Plan A', amount: '$4,500', count: 120 },
      { name: 'Subscription Plan B', amount: '$8,200', count: 85 },
      { name: 'Add-ons & Services', amount: '$1,350', count: 210 },
    ];
    res.status(200).json(list);
  } catch (error) { next(error); }
}

// ── Event Creation ──

export async function createEvent(req, res, next) {
  try {
    const {
      source, duration, revenue, sessionId, pageUrl, referrer,
      userAgent, country, deviceType, browser, os, campaign,
      landingPage, exitPage, pagesViewed, interactions,
      goalCompleted, goalType, tags, customData,
    } = req.body;

    if (!source || !VALID_SOURCES.includes(source)) {
      return res.status(400).json({
        error: `Invalid or missing source. Must be one of: ${VALID_SOURCES.join(', ')}`,
      });
    }
    if (duration === undefined || typeof duration !== 'number' || duration < 0) {
      return res.status(400).json({ error: 'Duration must be a positive number.' });
    }
    if (revenue !== undefined && (typeof revenue !== 'number' || revenue < 0)) {
      return res.status(400).json({ error: 'Revenue must be a positive number.' });
    }

    const userId = req.body.userId || `usr_${Math.random().toString(36).slice(2, 11)}`;

    const newEvent = await TrafficEvent.create({
      source,
      duration,
      revenue: revenue || 0,
      userId,
      timestamp: new Date(),
      sessionId: sessionId || `sess_${Math.random().toString(36).slice(2, 15)}`,
      pageUrl: pageUrl || '/',
      referrer: referrer || '',
      userAgent: userAgent || '',
      country: country || 'Unknown',
      deviceType: deviceType || '',
      browser: browser || '',
      os: os || '',
      campaign: campaign || '',
      landingPage: landingPage || pageUrl || '/',
      exitPage: exitPage || '',
      pagesViewed: pagesViewed || 1,
      interactions: interactions || 0,
      goalCompleted: goalCompleted || false,
      goalType: goalType || '',
      tags: tags || [],
      customData: customData || {},
    });

    // Enhanced activity logging
    const activityLog = await ActivityLog.create({
      type: revenue > 0 ? 'success' : goalCompleted ? 'success' : 'info',
      category: revenue > 0 ? 'revenue' : goalCompleted ? 'campaign' : 'system',
      message: revenue > 0
        ? `New conversion event from ${source} traffic`
        : goalCompleted
          ? `Goal completed: ${goalType} from ${source}`
          : `New session recorded from ${source} traffic`,
      amount: revenue > 0 ? `+$${revenue.toFixed(2)}` : undefined,
      userId,
      relatedEntityId: newEvent._id.toString(),
      relatedEntityType: 'TrafficEvent',
      timestamp: new Date(),
    });

    // Emit the new event to all connected clients in real-time
    emitTrafficEvent({
      type: 'traffic_event',
      data: {
        _id: newEvent._id,
        source: newEvent.source,
        revenue: newEvent.revenue,
        duration: newEvent.duration,
        country: newEvent.country,
        deviceType: newEvent.deviceType,
        pageUrl: newEvent.pageUrl,
        goalCompleted: newEvent.goalCompleted,
        goalType: newEvent.goalType,
        timestamp: newEvent.timestamp,
      },
      activity: {
        _id: activityLog._id,
        type: activityLog.type,
        message: activityLog.message,
        amount: activityLog.amount,
        timestamp: activityLog.timestamp,
      },
    });

    res.status(201).json({
      message: 'Event created successfully.',
      event: newEvent,
    });
  } catch (error) {
    next(error);
  }
}

// ── Bulk Import (CSV) ──

export async function bulkImport(req, res, next) {
  try {
    const { data } = req.body;
    if (!data || typeof data !== 'string') {
      return res.status(400).json({ error: 'CSV data is required as a string in the "data" field.' });
    }

    const lines = data.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) {
      return res.status(400).json({ error: 'CSV must have headers and at least one data row.' });
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredFields = ['source', 'duration'];
    const missingFields = requiredFields.filter(f => !headers.includes(f));
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `CSV missing required fields: ${missingFields.join(', ')}. Required: source, duration. Optional: revenue, userId, country, deviceType, campaign, pageUrl, browser, os.`,
      });
    }

    const events = [];
    const errors = [];
    const now = new Date();

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const row = {};
        headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

        if (!VALID_SOURCES.includes(row.source)) {
          errors.push({ row: i + 1, error: `Invalid source: ${row.source}` });
          continue;
        }

        const duration = parseInt(row.duration);
        if (isNaN(duration) || duration < 0) {
          errors.push({ row: i + 1, error: `Invalid duration: ${row.duration}` });
          continue;
        }

        // Parse optional timestamp or use current time
        let timestamp = now;
        if (row.timestamp) {
          const parsed = new Date(row.timestamp);
          if (!isNaN(parsed.getTime())) timestamp = parsed;
        }

        events.push({
          source: row.source,
          duration,
          revenue: parseFloat(row.revenue) || 0,
          userId: row.userid || `usr_${Math.random().toString(36).slice(2, 11)}`,
          timestamp,
          country: row.country || 'Unknown',
          deviceType: ['desktop', 'mobile', 'tablet'].includes(row.devicetype) ? row.devicetype : '',
          campaign: row.campaign || '',
          pageUrl: row.pageurl || '/',
          browser: row.browser || '',
          os: row.os || '',
        });
      } catch (e) {
        errors.push({ row: i + 1, error: e.message });
      }
    }

    if (events.length === 0) {
      return res.status(400).json({ error: 'No valid events found in CSV.', errors });
    }

    const result = await TrafficEvent.insertMany(events, { ordered: false });

    // Log the import activity
    await ActivityLog.create({
      type: errors.length === 0 ? 'success' : 'warning',
      category: 'import',
      message: `Bulk imported ${result.length} events${errors.length > 0 ? ` (${errors.length} errors)` : ''}`,
      amount: undefined,
      timestamp: new Date(),
      severity: errors.length > 0 ? 'medium' : 'low',
      metadata: { totalRows: lines.length - 1, imported: result.length, errors: errors.length },
    });

    res.status(201).json({
      message: `Successfully imported ${result.length} events.`,
      imported: result.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    next(error);
  }
}

// ── Campaign CRUD ──

export async function createCampaign(req, res, next) {
  try {
    const campaign = await Campaign.create({
      ...req.body,
      createdBy: req.user?.id || 'system',
    });
    res.status(201).json(campaign);
  } catch (error) {
    next(error);
  }
}

export async function getCampaigns(req, res, next) {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const campaigns = await Campaign.find(filter).sort({ createdAt: -1 }).lean();
    res.status(200).json(campaigns);
  } catch (error) {
    next(error);
  }
}

export async function getCampaign(req, res, next) {
  try {
    const campaign = await Campaign.findById(req.params.id).lean();
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.status(200).json(campaign);
  } catch (error) {
    next(error);
  }
}

export async function updateCampaign(req, res, next) {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.status(200).json(campaign);
  } catch (error) {
    next(error);
  }
}

export async function deleteCampaign(req, res, next) {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.status(200).json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    next(error);
  }
}