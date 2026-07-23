export const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Insights Dashboard API',
    version: '1.0.0',
    description: 'Real-time analytics API with Socket.IO, authentication, and campaign management',
    contact: {
      name: 'API Support',
      url: 'https://github.com/Jai1526/insights-dashboard',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      TrafficEvent: {
        type: 'object',
        required: ['source', 'duration', 'userId'],
        properties: {
          _id: { type: 'string' },
          source: { type: 'string', enum: ['Organic', 'Social', 'Referral', 'Direct', 'Email', 'Paid'] },
          duration: { type: 'number', minimum: 0 },
          revenue: { type: 'number', minimum: 0, default: 0 },
          userId: { type: 'string' },
          sessionId: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
          country: { type: 'string' },
          deviceType: { type: 'string' },
          campaign: { type: 'string' },
          pageUrl: { type: 'string' },
        },
      },
      ActivityLog: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          type: { type: 'string', enum: ['info', 'success', 'warning', 'error'] },
          category: { type: 'string' },
          message: { type: 'string' },
          amount: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
          read: { type: 'boolean' },
        },
      },
      Campaign: {
        type: 'object',
        required: ['name', 'status'],
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          status: { type: 'string', enum: ['Draft', 'Scheduled', 'Active', 'Paused', 'Completed'] },
          budget: { type: 'number' },
          spent: { type: 'number' },
          metrics: {
            type: 'object',
            properties: {
              impressions: { type: 'number' },
              clicks: { type: 'number' },
              conversions: { type: 'number' },
              revenue: { type: 'number' },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string' },
          isVerified: { type: 'boolean' },
          jobTitle: { type: 'string' },
          company: { type: 'string' },
          avatar: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
};