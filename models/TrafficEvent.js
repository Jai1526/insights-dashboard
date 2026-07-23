import mongoose from 'mongoose';

const trafficEventSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now, index: true },
    source: { type: String, enum: ['Organic', 'Social', 'Referral', 'Direct', 'Email', 'Paid'], required: true },
    duration: { type: Number, required: true, min: 0 },
    revenue: { type: Number, default: 0, min: 0 },
    userId: { type: String, required: true, index: true },
    
    // Enhanced fields
    sessionId: { type: String, index: true },
    pageUrl: { type: String, default: '' },
    referrer: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    country: { type: String, default: 'Unknown' },
    deviceType: { type: String, enum: ['desktop', 'mobile', 'tablet', ''], default: '' },
    browser: { type: String, default: '' },
    os: { type: String, default: '' },
    campaign: { type: String, default: '' },
    landingPage: { type: String, default: '' },
    exitPage: { type: String, default: '' },
    pagesViewed: { type: Number, default: 1, min: 1 },
    interactions: { type: Number, default: 0 },
    goalCompleted: { type: Boolean, default: false },
    goalType: { type: String, default: '' },
    
    // Metadata
    tags: [{ type: String }],
    customData: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  },
  { 
    versionKey: false,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  }
);

trafficEventSchema.index({ timestamp: 1, source: 1 });
trafficEventSchema.index({ country: 1, timestamp: -1 });
trafficEventSchema.index({ campaign: 1, timestamp: -1 });
trafficEventSchema.index({ deviceType: 1 });

export default mongoose.model('TrafficEvent', trafficEventSchema);