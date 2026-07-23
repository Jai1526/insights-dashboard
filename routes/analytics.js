import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { cacheMiddleware, clearCache } from '../middleware/cache.js';
import {
  getActivity, getOverview, getSources, getTrafficChart,
  getPanelAnalytics, getPanelCampaigns, getPanelAudience, getPanelSegments,
  getPanelRevenue, getPanelRevenueList, createEvent, bulkImport,
  createCampaign, getCampaigns, getCampaign, updateCampaign, deleteCampaign,
} from '../controllers/analyticsController.js';

const router = Router();

// Analytics endpoints (reduced cache for real-time feel)
router.get('/overview', authenticate, cacheMiddleware(5), getOverview);
router.get('/traffic-chart', authenticate, cacheMiddleware(5), getTrafficChart);
router.get('/sources', authenticate, cacheMiddleware(5), getSources);
router.get('/activity', authenticate, cacheMiddleware(3), getActivity);

// Panel endpoints (reduced cache for real-time feel)
router.get('/panel/analytics', authenticate, cacheMiddleware(5), getPanelAnalytics);
router.get('/panel/campaigns', authenticate, cacheMiddleware(10), getPanelCampaigns);
router.get('/panel/audience', authenticate, cacheMiddleware(5), getPanelAudience);
router.get('/panel/segments', authenticate, cacheMiddleware(10), getPanelSegments);
router.get('/panel/revenue', authenticate, cacheMiddleware(5), getPanelRevenue);
router.get('/panel/revenue-list', authenticate, cacheMiddleware(5), getPanelRevenueList);

// Event creation
router.post('/event', authenticate, (req, res, next) => {
  clearCache();
  next();
}, createEvent);

// Bulk import (CSV)
router.post('/bulk-import', authenticate, (req, res, next) => {
  clearCache();
  next();
}, bulkImport);

// Campaign CRUD
router.post('/campaigns', authenticate, createCampaign);
router.get('/campaigns', authenticate, cacheMiddleware(30), getCampaigns);
router.get('/campaigns/:id', authenticate, cacheMiddleware(30), getCampaign);
router.put('/campaigns/:id', authenticate, updateCampaign);
router.delete('/campaigns/:id', authenticate, deleteCampaign);

export default router;