import { formatCurrency, formatPercent } from './ui.js';

export function initCharts() {
  const ctxMain = document.getElementById('mainChart');
  const ctxDonut = document.getElementById('donutChart');

  if (ctxMain && typeof Chart !== 'undefined') {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(28,32,51,0.08)';

    window.myMainChart = new Chart(ctxMain, {
      type: 'line',
      data: {
        labels: ['W1', 'W2', 'W3', 'W4'],
        datasets: [{
          label: 'Traffic Volume',
          data: [0, 0, 0, 0],
          borderColor: '#7C6CFF',
          backgroundColor: (ctx) => {
            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(124,108,255,0.35)');
            gradient.addColorStop(1, 'rgba(124,108,255,0.02)');
            return gradient;
          },
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: '#7C6CFF',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { color: 'transparent' },
            ticks: { color: '#8a8f9c' },
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: '#8a8f9c' },
          },
        },
      },
    });
  }

  if (ctxDonut && typeof Chart !== 'undefined') {
    window.myDonutChart = new Chart(ctxDonut, {
      type: 'doughnut',
      data: {
        labels: ['Organic', 'Social', 'Referral', 'Direct'],
        datasets: [{
          data: [0, 0, 0, 0],
          backgroundColor: ['#7C6CFF', '#43D9AD', '#FFB547', '#FF6584'],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
        },
      },
    });
  }
}

export function updateTrafficChart(data) {
  const chart = window.myMainChart;
  if (!chart) return;
  const labels = data.range === 'week'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : data.range === 'month'
      ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  chart.data.labels = labels;
  chart.data.datasets[0].data = data.data;
  chart.update();
}

export function updateSources(data) {
  const chart = window.myDonutChart;
  if (chart) {
    chart.data.datasets[0].data = data.data.map((s) => s.count);
    chart.update();
  }
  const sourceLegend = document.getElementById('sourceLegend');
  if (sourceLegend) {
    const colors = { Organic: '#7C6CFF', Social: '#43D9AD', Referral: '#FFB547', Direct: '#FF6584' };
    sourceLegend.innerHTML = data.data.map((s) =>
      `<div class="legend-item"><span class="legend-dot" style="background:${colors[s.source] || '#7C6CFF'}"></span><span>${s.source}</span><span class="legend-value">${s.percentage}%</span></div>`
    ).join('');
  }
}

export function updateOverview(data) {
  const totalRevenueValue = document.getElementById('totalRevenueValue');
  const activeUsersValue = document.getElementById('activeUsersValue');
  const conversionValue = document.getElementById('conversionValue');
  const sessionValue = document.getElementById('sessionValue');
  const revenueChange = document.getElementById('revenueChange');
  const usersChange = document.getElementById('usersChange');
  const conversionChange = document.getElementById('conversionChange');
  const sessionChange = document.getElementById('sessionChange');
  const heroEyebrow = document.getElementById('heroEyebrow');
  const heroTitle = document.getElementById('heroTitle');
  const heroCopy = document.getElementById('heroCopy');

  if (totalRevenueValue) totalRevenueValue.textContent = formatCurrency(data.totalRevenue);
  if (activeUsersValue) activeUsersValue.textContent = data.activeUsers.toLocaleString();
  if (conversionValue) conversionValue.textContent = formatPercent(data.conversionRate);
  if (sessionValue) sessionValue.textContent = data.avgSessionDuration || '0m 0s';
  if (revenueChange) revenueChange.textContent = '+12.5%';
  if (usersChange) usersChange.textContent = '+8.3%';
  if (conversionChange) conversionChange.textContent = '+2.1%';
  if (sessionChange) sessionChange.textContent = '-0.4%';
  if (heroEyebrow) heroEyebrow.textContent = `${data.range.charAt(0).toUpperCase() + data.range.slice(1)}ly report`;
  if (heroTitle) heroTitle.textContent = `$${(data.totalRevenue / 1000).toFixed(1)}k total revenue`;
  if (heroCopy) heroCopy.textContent = `${data.activeUsers} active users this ${data.range}`;
}

export function updateActivity(data) {
  const activityList = document.getElementById('activityList');
  if (!activityList) return;
  stateRef.activityItems = data;
  renderActivity();
}

function renderActivity() {
  const activityList = document.getElementById('activityList');
  const searchInput = document.getElementById('globalSearch');
  if (!activityList) return;
  const query = searchInput?.value?.toLowerCase().trim() || '';
  const items = stateRef.activityItems.filter((a) => !query || a.message?.toLowerCase().includes(query));
  if (items.length === 0) {
    activityList.innerHTML = '<div class="empty-state">No activity matches your search.</div>';
    return;
  }
  activityList.innerHTML = items.map((a) =>
    `<div class="activity-row">
      <div class="activity-icon ${a.type}"></div>
      <div class="activity-text">
        <p>${a.message}</p>
        <span class="activity-time">${a.timestamp ? new Date(a.timestamp).toLocaleDateString() : ''}</span>
      </div>
      ${a.amount ? `<span class="activity-amount">${a.amount}</span>` : ''}
    </div>`
  ).join('');
}

export function renderPerformanceTable() {
  const performanceTableBody = document.getElementById('performanceTableBody');
  const searchInput = document.getElementById('globalSearch');
  if (!performanceTableBody) return;
  const query = searchInput?.value?.toLowerCase().trim() || '';
  const rows = stateRef.performanceRows.filter((r) => !query || r.account.toLowerCase().includes(query) || r.region.toLowerCase().includes(query));
  performanceTableBody.innerHTML = rows.map((r) =>
    `<tr>
      <td><strong>${r.account}</strong></td>
      <td>${r.region}</td>
      <td><span class="status-pill" style="background:${r.status === 'Healthy' ? 'rgba(67,217,173,0.16)' : r.status === 'Watch' ? 'rgba(255,181,71,0.16)' : 'rgba(255,101,132,0.16)'};color:${r.status === 'Healthy' ? 'var(--accent-2)' : r.status === 'Watch' ? 'var(--accent-4)' : 'var(--accent-3)'}">${r.status}</span></td>
      <td>${r.mrr}</td>
      <td style="color:${r.trend.startsWith('+') ? 'var(--accent-2)' : 'var(--accent-3)'}">${r.trend}</td>
    </tr>`
  ).join('');
}

export function renderNotifications() {
  const panel = document.getElementById('notificationsPanel');
  if (!panel) return;
  panel.innerHTML = stateRef.notifications.map((n) =>
    `<div class="notification-item">
      <strong>${n.title}</strong>
      <p>${n.detail}</p>
      <span class="activity-time">${n.time}</span>
    </div>`
  ).join('');
}

export function setPanelLoading(element, loading) {
  if (!element) return;
  if (loading) {
    element.dataset.originalContent = element.innerHTML;
    element.innerHTML = `
      <div class="metric-row"><span class="metric-label shimmer">&nbsp;</span><span class="metric-value shimmer">&nbsp;</span></div>
      <div class="metric-row"><span class="metric-label shimmer">&nbsp;</span><span class="metric-value shimmer">&nbsp;</span></div>
      <div class="metric-row"><span class="metric-label shimmer">&nbsp;</span><span class="metric-value shimmer">&nbsp;</span></div>`;
  }
}

export function setListLoading(element, loading) {
  if (!element) return;
  if (loading) {
    element.dataset.originalContent = element.innerHTML;
    element.innerHTML = `
      <div class="list-row"><strong class="shimmer">&nbsp;</strong><span class="shimmer">&nbsp;</span></div>
      <div class="list-row"><strong class="shimmer">&nbsp;</strong><span class="shimmer">&nbsp;</span></div>
      <div class="list-row"><strong class="shimmer">&nbsp;</strong><span class="shimmer">&nbsp;</span></div>`;
  }
}