export const state = {
  currentRange: 'month',
  activeView: 'overview',
  autoRefresh: localStorage.getItem('autoRefresh') !== 'false',
  alertsEnabled: localStorage.getItem('alertsEnabled') !== 'false',
  exportFormat: localStorage.getItem('exportFormat') || 'csv',
  activityItems: [],
  reports: [
    { name: 'Executive recap', cadence: 'Daily' },
    { name: 'Growth review', cadence: 'Weekly' },
    { name: 'Retention snapshot', cadence: 'Monthly' }
  ],
  notifications: [
    { title: 'Campaign approved', detail: 'Northstar Labs launched successfully', time: '2m ago' },
    { title: 'Review required', detail: 'Subscription renewal needs attention', time: '18m ago' },
    { title: 'Report ready', detail: 'Weekly summary is now available', time: '1h ago' }
  ],
  performanceRows: [
    { account: 'Northstar Labs', region: 'US East', status: 'Healthy', mrr: '$182k', trend: '+18%' },
    { account: 'Meridian AI', region: 'EMEA', status: 'Watch', mrr: '$96k', trend: '+7%' },
    { account: 'Helio Cloud', region: 'APAC', status: 'Healthy', mrr: '$144k', trend: '+14%' },
    { account: 'Astra Labs', region: 'LATAM', status: 'At risk', mrr: '$71k', trend: '-3%' }
  ]
};