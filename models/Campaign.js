import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['Active', 'Draft', 'Scheduled', 'Completed', 'Paused'],
      default: 'Draft',
    },
    description: { type: String, default: '' },
    startDate: { type: Date },
    endDate: { type: Date },
    budget: { type: Number, default: 0, min: 0 },
    spent: { type: Number, default: 0, min: 0 },
    targetAudience: { type: String, default: '' },
    channels: [{ type: String }],
    goals: [{ type: String }],
    metrics: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
    },
    createdBy: { type: String, default: '' },
    tags: [{ type: String }],
  },
  { 
    versionKey: false,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  }
);

campaignSchema.index({ status: 1 });
campaignSchema.index({ startDate: -1 });

export default mongoose.model('Campaign', campaignSchema);