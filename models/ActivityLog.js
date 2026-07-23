import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['success', 'info', 'warning', 'error'], required: true },
    message: { type: String, required: true, trim: true },
    amount: { type: String, trim: true },
    timestamp: { type: Date, default: Date.now, index: true },
    
    // Enhanced fields
    userId: { type: String, default: '' },
    category: { type: String, enum: ['revenue', 'user', 'system', 'campaign', 'import'], default: 'system' },
    relatedEntityId: { type: String, default: '' },
    relatedEntityType: { type: String, default: '' },
    metadata: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    read: { type: Boolean, default: false, index: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
  },
  { versionKey: false }
);

activityLogSchema.index({ timestamp: -1, type: 1 });
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ category: 1, read: 1 });

export default mongoose.model('ActivityLog', activityLogSchema);