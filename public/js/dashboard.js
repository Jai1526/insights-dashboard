import * as auth from './auth.js';
import { state } from './state.js';
import * as ui from './ui.js';
import * as charts from './charts.js';

document.addEventListener('DOMContentLoaded', () => {
  charts.initCharts();
  renderNotifications();

  // ── Auth flows ──
  setupAuth();
  setupPasswordToggles();
  setupForgotPassword();
  setupLogout();
  setupThemeToggle();
  setupSocialLogin();
  setupDemoHint();

  // ── Navigation & layout ──
  setupSidebar();
  setupViewSwitching();
  setupRangeChips();
  setupDropdowns();
  setupModal();
  setupSearch();
  setupSettings();
  setupReports();
  setupProfile();

  // ── Socket.IO ──
  initDashboardSocket();

  // ── Data loading ──
  loadDashboard(state.currentRange);
});

function setupAuth() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('loginError');
    const successEl = document.getElementById('loginSuccess');
    const submitBtn = document.getElementById('loginSubmitBtn');
    if (errorEl) errorEl.style.display = 'none';
    if (successEl) successEl.style.display = 'none';
    if (submitBtn) submitBtn.classList.add('loading');

    const form = new FormData(loginForm);
    try {
      const data = await auth.apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
      });
      auth.saveAuth(data.token, data.user);
      ui.showDashboard();
      ui.updateSidebarProfile(data.user);
      ui.updateProfilePage(data.user);
    } catch (err) {
      const errorTextEl = errorEl?.querySelector('.auth-error-text');
      if (errorTextEl) errorTextEl.textContent = err.message;
      if (errorEl) errorEl.style.display = 'block';
    } finally {
      if (submitBtn) submitBtn.classList.remove('loading');
    }
  });

  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('registerError');
    const successEl = document.getElementById('registerSuccess');
    const submitBtn = document.getElementById('registerSubmitBtn');
    if (errorEl) errorEl.style.display = 'none';
    if (successEl) successEl.style.display = 'none';
    if (submitBtn) submitBtn.classList.add('loading');

    const form = new FormData(registerForm);
    try {
      const data = await auth.apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: form.get('name'), email: form.get('email'), password: form.get('password') }),
      });
      auth.saveAuth(data.token, data.user);
      ui.showDashboard();
      ui.updateSidebarProfile(data.user);
      ui.updateProfilePage(data.user);
    } catch (err) {
      const errorTextEl = errorEl?.querySelector('.auth-error-text');
      if (errorTextEl) errorTextEl.textContent = err.message;
      if (errorEl) errorEl.style.display = 'block';
    } finally {
      if (submitBtn) submitBtn.classList.remove('loading');
    }
  });

  document.getElementById('showRegister')?.addEventListener('click', (e) => {
    e.preventDefault();
    ui.showAuthPage('register');
  });

  document.getElementById('showLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    ui.showAuthPage('login');
  });
}

function setupPasswordToggles() {
  const setup = (toggleBtn, input) => {
    toggleBtn?.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      const eyeIcon = toggleBtn.querySelector('.eye-icon');
      const eyeOffIcon = toggleBtn.querySelector('.eye-off-icon');
      if (eyeIcon) eyeIcon.style.display = isPassword ? 'none' : '';
      if (eyeOffIcon) eyeOffIcon.style.display = isPassword ? '' : 'none';
    });
  };
  const loginInput = document.querySelector('#loginForm input[name="password"]');
  const registerInput = document.querySelector('#registerForm input[name="password"]');
  setup(document.getElementById('loginPasswordToggle'), loginInput);
  setup(document.getElementById('registerPasswordToggle'), registerInput);

  document.querySelectorAll('.floating-input').forEach((input) => {
    const check = () => input.toggleAttribute('data-filled', !!input.value);
    check();
    input.addEventListener('input', check);
    input.addEventListener('blur', check);
  });
}

function setupForgotPassword() {
  document.getElementById('forgotPasswordLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.querySelector('#loginForm input[name="email"]')?.value || 'your@email.com';
    const successEl = document.getElementById('loginSuccess');
    const textEl = successEl?.querySelector('.auth-success-text');
    if (textEl) textEl.textContent = `If ${email} is registered, a reset link will be sent.`;
    if (successEl) {
      successEl.style.display = 'block';
      setTimeout(() => { successEl.style.display = 'none'; }, 4000);
    }
  });
}

function setupLogout() {
  document.getElementById('navLogout')?.addEventListener('click', (e) => {
    e.preventDefault();
    ui.logout();
  });
}

function setupThemeToggle() {
  const authThemeToggle = document.getElementById('authThemeToggle');
  authThemeToggle?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    ui.applyTheme(next);
    const icon = authThemeToggle.querySelector('.theme-toggle-icon');
    if (icon) icon.textContent = next === 'dark' ? '☀️' : '🌙';
  });

  const saved = localStorage.getItem('theme') || 'light';
  ui.applyTheme(saved);
  const icon = authThemeToggle?.querySelector('.theme-toggle-icon');
  if (icon) icon.textContent = saved === 'dark' ? '☀️' : '🌙';

  document.getElementById('themeSwitch')?.addEventListener('change', () => {
    ui.applyTheme(document.getElementById('themeSwitch').checked ? 'dark' : 'light');
  });
}

function setupSocialLogin() {
  document.querySelectorAll('.social-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      ui.showToast(`Sign in with ${btn.dataset.provider} coming soon`);
    });
  });
}

function setupDemoHint() {
  document.querySelector('.demo-hint')?.addEventListener('click', () => {
    const email = document.querySelector('#loginForm input[name="email"]');
    const pass = document.querySelector('#loginForm input[name="password"]');
    if (email) { email.value = 'demo@insights.io'; email.dispatchEvent(new Event('input')); }
    if (pass) { pass.value = 'demo12345'; pass.dispatchEvent(new Event('input')); }
    ui.showToast('Demo credentials filled');
  });
}

function setupSidebar() {
  document.getElementById('collapseBtn')?.addEventListener('click', () => {
    document.getElementById('dashboardShell')?.classList.toggle('collapsed');
  });
  document.getElementById('menuToggle')?.addEventListener('click', () => {
    const shell = document.getElementById('dashboardShell');
    const overlay = document.getElementById('sidebarOverlay');
    shell?.classList.toggle('mobile-open');
    overlay?.classList.toggle('active');
  });
  document.getElementById('sidebarOverlay')?.addEventListener('click', () => {
    const shell = document.getElementById('dashboardShell');
    const overlay = document.getElementById('sidebarOverlay');
    shell?.classList.remove('mobile-open');
    overlay?.classList.remove('active');
  });
}

function setupViewSwitching() {
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const view = item.dataset.view;
      if (view) ui.setActiveView(view);
      if (window.innerWidth <= 760) {
        document.getElementById('dashboardShell')?.classList.remove('mobile-open');
        document.getElementById('sidebarOverlay')?.classList.remove('active');
      }
    });
  });
}

function setupRangeChips() {
  document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      state.currentRange = chip.dataset.range || 'month';
      loadDashboard(state.currentRange);
    });
  });
}

function setupDropdowns() {
  const btn = document.getElementById('notificationsBtn');
  const panel = document.getElementById('notificationsPanel');
  btn?.addEventListener('click', (e) => {
    e.stopPropagation();
    ui.closeAllDropdowns();
    panel?.classList.toggle('open');
  });

  const profileBtn = document.getElementById('profileBtn');
  const profilePanel = document.getElementById('profilePanel');
  profileBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    ui.closeAllDropdowns();
    profilePanel?.classList.toggle('open');
  });

  document.getElementById('profileViewAccountBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    ui.closeAllDropdowns();
    ui.setActiveView('profile');
  });
  document.getElementById('profilePreferencesBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    ui.closeAllDropdowns();
    ui.setActiveView('settings');
  });
  document.getElementById('profileSignOutBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    ui.closeAllDropdowns();
    ui.logout();
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.dropdown')) ui.closeAllDropdowns();
  });
}

function setupModal() {
  const modalRoot = document.getElementById('modalRoot');
  const close = () => {
    modalRoot?.classList.remove('open');
    if (modalRoot) modalRoot.setAttribute('aria-hidden', 'true');
  };
  document.getElementById('modalClose')?.addEventListener('click', close);
  modalRoot?.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal-backdrop') || event.target.closest('[data-action="cancel"]')) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      ui.closeAllDropdowns();
      close();
    }
  });

  document.getElementById('sidebarUpgradeBtn')?.addEventListener('click', () => {
    ui.openModal('Upgrade to Pro',
      '<p style="margin-bottom:12px;color:var(--text-secondary)">Unlock advanced analytics, custom reports, and priority support.</p>' +
      '<div class=\"modal-actions\"><button type=\"button\" class=\"primary-btn\" data-action=\"cancel\">Cancel</button><button type=\"button\" class=\"primary-btn\" style=\"background:var(--accent)\">Upgrade now</button></div>'
    );
  });

  const heroUpgradeBtn = document.getElementById('heroUpgradeBtn');
  heroUpgradeBtn?.addEventListener('click', () => {
    ui.openModal('Upgrade to Pro',
      '<p style=\"margin-bottom:12px;color:var(--text-secondary)\">Get real-time exports and dedicated support.</p>' +
      '<div class=\"modal-actions\"><button type=\"button\" class=\"primary-btn\" data-action=\"cancel\">Cancel</button><button type=\"button\" class=\"primary-btn\" style=\"background:var(--accent)\">Upgrade now</button></div>'
    );
  });

  document.getElementById('quickAddEventBtn')?.addEventListener('click', () => {
    ui.openModal('Quick-add Traffic Event', `
      <form id="quickEventForm" class="modal-form">
        <label>Traffic Source
          <select name="source" required>
            <option value="Organic">Organic</option>
            <option value="Social">Social</option>
            <option value="Referral">Referral</option>
            <option value="Direct">Direct</option>
          </select>
        </label>
        <label>Session Duration (seconds)
          <input type="number" name="duration" required min="1" value="120" />
        </label>
        <label>Revenue Generated ($)
          <input type="number" name="revenue" min="0" step="0.01" value="0" />
        </label>
        <div class="modal-actions" style="margin-top:16px;display:flex;gap:12px;justify-content:flex-end;">
          <button type="button" class="primary-btn" data-action="cancel" style="background:var(--text-muted)">Cancel</button>
          <button type="submit" class="primary-btn" style="background:var(--accent)">Submit Event</button>
        </div>
      </form>
    `);

    document.getElementById('quickEventForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = new FormData(e.target);
      try {
        const res = await auth.apiFetch('/analytics/event', {
          method: 'POST',
          body: JSON.stringify({
            source: form.get('source'),
            duration: Number(form.get('duration')),
            revenue: Number(form.get('revenue')),
          }),
        });
        ui.showToast(res.message);
        close();
        loadDashboard(state.currentRange);
      } catch (err) {
        ui.showToast(err.message);
      }
    });
  });
}

function setupSearch() {
  const searchInput = document.getElementById('globalSearch');
  searchInput?.addEventListener('input', () => {
    charts.renderActivity();
    charts.renderPerformanceTable();
  });
}

function setupSettings() {
  document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
    const settingsAutoRefresh = document.getElementById('settingsAutoRefresh');
    const settingsAlerts = document.getElementById('settingsAlerts');
    const settingsExport = document.getElementById('settingsExport');
    state.autoRefresh = settingsAutoRefresh?.checked ?? true;
    state.alertsEnabled = settingsAlerts?.checked ?? true;
    state.exportFormat = settingsExport?.value || 'csv';
    localStorage.setItem('autoRefresh', state.autoRefresh);
    localStorage.setItem('alertsEnabled', state.alertsEnabled);
    localStorage.setItem('exportFormat', state.exportFormat);
    ui.renderFeaturePanels();
    ui.showToast('Preferences saved');
  });
}

function setupReports() {
  const reportComposer = document.getElementById('reportComposer');
  reportComposer?.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(reportComposer);
    const name = formData.get('name') || 'New report';
    state.activityItems.unshift({
      type: 'success',
      message: `${name} scheduled for ${formData.get('audience') || 'team'}`,
      amount: '+$0',
      timestamp: new Date().toISOString(),
    });
    state.reports.unshift({ name, cadence: formData.get('cadence') || 'Weekly' });
    charts.renderActivity();
    ui.renderFeaturePanels();
    ui.showToast('Report saved');
  });

  document.getElementById('newReportBtn')?.addEventListener('click', () => {
    reportComposer?.querySelector('input[name="name"]')?.focus();
    ui.showToast('Report composer ready');
  });

  document.getElementById('reportQuickAdd')?.addEventListener('click', () => {
    reportComposer?.querySelector('input[name="name"]')?.focus();
    ui.showToast('Report composer ready');
  });
}

function setupProfile() {
  const profileForm = document.getElementById('profileForm');
  profileForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData(profileForm);
    try {
      const data = await auth.apiFetch('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          name: form.get('name'),
          jobTitle: form.get('jobTitle'),
          company: form.get('company'),
          avatar: form.get('avatar'),
        }),
      });
      auth.saveAuth(auth.getToken(), data.user);
      ui.updateSidebarProfile(data.user);
      ui.updateProfilePage(data.user);
      ui.showToast('Profile updated');
    } catch (err) {
      ui.showToast(err.message);
    }
  });

  const passwordForm = document.getElementById('passwordForm');
  passwordForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData(passwordForm);
    try {
      await auth.apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: form.get('currentPassword'), newPassword: form.get('newPassword') }),
      });
      passwordForm.reset();
      ui.showToast('Password changed');
    } catch (err) {
      ui.showToast(err.message);
    }
  });

  document.getElementById('deleteAccountBtn')?.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    try {
      await auth.apiFetch('/auth/account', { method: 'DELETE' });
      ui.logout();
    } catch (err) {
      ui.showToast(err.message);
    }
  });
}

async function loadDashboard(range) {
  try {
    const [overviewData, trafficData, sourcesData, activityData] = await Promise.all([
      auth.apiFetch(`/analytics/overview?range=${range}`),
      auth.apiFetch(`/analytics/traffic-chart?range=${range}`),
      auth.apiFetch(`/analytics/sources?range=${range}`),
      auth.apiFetch(`/analytics/activity?range=${range}`),
    ]);

    charts.updateOverview(overviewData);
    charts.updateTrafficChart(trafficData);
    charts.updateSources(sourcesData);
    charts.updateActivity(activityData);

    await loadFeaturePanels(range);
  } catch (err) {
    if (err.message.includes('Token expired') || err.message.includes('Invalid token')) {
      ui.logout();
    }
    console.error('Dashboard data load error:', err);
  }
}

async function loadFeaturePanels(range) {
  charts.setPanelLoading(document.getElementById('analyticsMetrics'), true);
  charts.setListLoading(document.getElementById('campaignList'), true);
  charts.setPanelLoading(document.getElementById('audienceMetrics'), true);
  charts.setListLoading(document.getElementById('segmentList'), true);
  charts.setPanelLoading(document.getElementById('revenueMetrics'), true);
  charts.setListLoading(document.getElementById('revenueList'), true);

  try {
    const [
      analyticsData, campaignsData,
      audienceData, segmentsData,
      revenueData, revenueListData,
    ] = await Promise.all([
      auth.apiFetch(`/analytics/panel/analytics?range=${range}`),
      auth.apiFetch(`/analytics/panel/campaigns?range=${range}`),
      auth.apiFetch(`/analytics/panel/audience?range=${range}`),
      auth.apiFetch(`/analytics/panel/segments?range=${range}`),
      auth.apiFetch(`/analytics/panel/revenue?range=${range}`),
      auth.apiFetch(`/analytics/panel/revenue-list?range=${range}`),
    ]);

    ui.renderAnalyticsPanel(analyticsData);
    ui.renderCampaignsPanel(campaignsData);
    ui.renderAudiencePanel(audienceData);
    ui.renderSegmentsPanel(segmentsData);
    ui.renderRevenuePanel(revenueData);
    ui.renderRevenueListPanel(revenueListData);
  } catch (err) {
    if (err.message.includes('Token expired') || err.message.includes('Invalid token')) {
      ui.logout();
    }
    console.error('Panel data load error:', err);
    ['analyticsMetrics', 'campaignList', 'audienceMetrics', 'segmentList', 'revenueMetrics', 'revenueList'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '<div class="empty-state">Failed to load</div>';
    });
  }

  ui.renderFeaturePanels();
}

function initDashboardSocket() {
  const token = auth.getToken();
  if (!token) return;

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  const socket = io(`${protocol}//${host}`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on('connect', () => {
    const liveText = document.getElementById('liveText');
    const liveStatus = document.getElementById('liveStatus');
    console.log('[Socket] Connected:', socket.id);
    if (liveText) liveText.textContent = 'Live • connected';
    if (liveStatus) liveStatus.classList.add('connected');
  });

  socket.on('disconnect', (reason) => {
    const liveText = document.getElementById('liveText');
    const liveStatus = document.getElementById('liveStatus');
    console.log('[Socket] Disconnected:', reason);
    if (liveText) liveText.textContent = 'Live • reconnecting...';
    if (liveStatus) liveStatus.classList.remove('connected');
  });

  socket.on('connect_error', (err) => {
    const liveText = document.getElementById('liveText');
    const liveStatus = document.getElementById('liveStatus');
    console.error('[Socket] Connection error:', err.message);
    if (liveText) liveText.textContent = 'Live • offline';
    if (liveStatus) liveStatus.classList.remove('connected');
  });

  socket.on('traffic_event', (payload) => {
    if (payload.activity) {
      state.activityItems.unshift(payload.activity);
      if (state.activityItems.length > 50) state.activityItems = state.activityItems.slice(0, 50);
      charts.renderActivity();
    }

    if (payload.data && payload.data.revenue > 0) {
      ui.showToast(`💰 New revenue: $${payload.data.revenue.toFixed(2)} from ${payload.data.source}`);
    }
  });

  socket.on('dashboard_update', () => {
    loadDashboard(state.currentRange);
  });
}

function renderNotifications() {
  const panel = document.getElementById('notificationsPanel');
  if (!panel) return;
  panel.innerHTML = state.notifications.map((n) =>
    `<div class="notification-item">
      <strong>${n.title}</strong>
      <p>${n.detail}</p>
      <span class="activity-time">${n.time}</span>
    </div>`
  ).join('');
}