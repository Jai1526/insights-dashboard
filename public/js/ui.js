import * as auth from './auth.js';
import { state } from './state.js';

let mainChart, donutChart;

export function init(stateRef, charts) {
  stateRef = state;
  mainChart = charts.main;
  donutChart = charts.donut;
}

// Auth UI helpers
export function showAuthPage(page) {
  const loginPage = document.getElementById('loginPage');
  const registerPage = document.getElementById('registerPage');
  const appShell = document.getElementById('dashboardShell');
  const loginError = document.getElementById('loginError');
  const loginSuccess = document.getElementById('loginSuccess');
  const registerError = document.getElementById('registerError');
  const registerSuccess = document.getElementById('registerSuccess');
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
  const registerSubmitBtn = document.getElementById('registerSubmitBtn');

  if (loginPage) loginPage.style.display = page === 'login' ? 'flex' : 'none';
  if (registerPage) registerPage.style.display = page === 'register' ? 'flex' : 'none';
  if (appShell) appShell.style.display = 'none';
  if (loginError) loginError.style.display = 'none';
  if (loginSuccess) loginSuccess.style.display = 'none';
  if (registerError) registerError.style.display = 'none';
  if (registerSuccess) registerSuccess.style.display = 'none';
  if (loginSubmitBtn) loginSubmitBtn.classList.remove('loading');
  if (registerSubmitBtn) registerSubmitBtn.classList.remove('loading');
}

export function showDashboard() {
  const loginPage = document.getElementById('loginPage');
  const registerPage = document.getElementById('registerPage');
  const appShell = document.getElementById('dashboardShell');
  const navLogout = document.getElementById('navLogout');
  if (loginPage) loginPage.style.display = 'none';
  if (registerPage) registerPage.style.display = 'none';
  if (appShell) appShell.style.display = 'flex';
  if (navLogout) navLogout.style.display = 'flex';
}

export function updateSidebarProfile(user) {
  if (!user) return;
  const sidebarProfileName = document.querySelector('.profile-name');
  const sidebarProfileRole = document.querySelector('.profile-role');
  const sidebarAvatar = document.querySelector('.avatar');
  const headerAvatar = document.querySelector('.header-avatar');
  const dropdownHeaderName = document.querySelector('.profile-panel-header strong');

  if (sidebarProfileName) sidebarProfileName.textContent = user.name || 'User';
  if (sidebarProfileRole) sidebarProfileRole.textContent = user.jobTitle || user.role || 'Member';
  if (sidebarAvatar && user.avatar) sidebarAvatar.src = user.avatar;
  if (headerAvatar && user.avatar) headerAvatar.src = user.avatar;
  if (dropdownHeaderName) dropdownHeaderName.textContent = `Signed in as ${user.name}`;
}

export function updateProfilePage(user) {
  if (!user) return;
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const profileJobTitle = document.getElementById('profileJobTitle');
  const profileCompany = document.getElementById('profileCompany');
  const profileAvatar = document.getElementById('profileAvatar');
  const profileVerifiedBadge = document.getElementById('profileVerifiedBadge');

  if (profileName) profileName.value = user.name || '';
  if (profileEmail) profileEmail.value = user.email || '';
  if (profileJobTitle) profileJobTitle.value = user.jobTitle || '';
  if (profileCompany) profileCompany.value = user.company || '';
  if (profileAvatar) profileAvatar.value = user.avatar || '';
  if (profileVerifiedBadge) {
    profileVerifiedBadge.textContent = user.isVerified ? 'Verified' : 'Unverified';
    profileVerifiedBadge.style.background = user.isVerified ? 'rgba(67, 217, 173, 0.16)' : 'rgba(255, 101, 132, 0.16)';
    profileVerifiedBadge.style.color = user.isVerified ? 'var(--accent-2)' : 'var(--accent-3)';
  }
}

export function logout() {
  auth.clearAuth();
  const navLogout = document.getElementById('navLogout');
  if (navLogout) navLogout.style.display = 'none';
  showAuthPage('login');
  window.location.reload();
}

// Toast notifications
export function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove('show'), 2200);
}

// Formatters
export const formatCurrency = (value) => `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const formatPercent = (value) => `${Number(value || 0).toFixed(2)}%`;

// Dropdowns
export function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-panel.open').forEach((p) => p.classList.remove('open'));
}

// Theme
export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  const themeSwitch = document.getElementById('themeSwitch');
  if (themeSwitch) themeSwitch.checked = theme === 'dark';
  applyThemeToCharts();
}

export function applyThemeToCharts() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(28,32,51,0.08)';
  [window.myMainChart, window.myDonutChart].forEach((chart) => {
    if (!chart) return;
    if (chart.options.scales?.y) chart.options.scales.y.grid.color = gridColor;
    chart.update('none');
  });
}

// View switching
export function setActiveView(viewId) {
  state.activeView = viewId;
  document.querySelectorAll('.view-section').forEach((el) => el.classList.remove('active'));
  const target = document.getElementById(`${viewId}View`);
  if (target) target.classList.add('active');
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach((item) => {
    item.classList.toggle('active', item.dataset.view === viewId);
  });
}

// Modal
export function openModal(title, contentHtml) {
  const modalRoot = document.getElementById('modalRoot');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');
  if (!modalRoot || !modalTitle || !modalContent) return;
  modalTitle.textContent = title;
  modalContent.innerHTML = contentHtml;
  modalRoot.classList.add('open');
  modalRoot.setAttribute('aria-hidden', 'false');
}

export function closeModal() {
  const modalRoot = document.getElementById('modalRoot');
  if (!modalRoot) return;
  modalRoot.classList.remove('open');
  modalRoot.setAttribute('aria-hidden', 'true');
}

// Panel renderers
export function renderAnalyticsPanel(data) {
  const el = document.getElementById('analyticsMetrics');
  if (!el) return;
  el.innerHTML = `
    <div class="metric-row"><span class="metric-label">Page views</span><span class="metric-value">${data.pageViews.toLocaleString()}</span></div>
    <div class="metric-row"><span class="metric-label">Bounce rate</span><span class="metric-value">${data.bounceRate}%</span></div>
    <div class="metric-row"><span class="metric-label">Avg. time on page</span><span class="metric-value">${data.avgTimeOnPage}</span></div>
  `;
}

export function renderCampaignsPanel(data) {
  const el = document.getElementById('campaignList');
  if (!el) return;
  el.innerHTML = data.map((c) => `<div class=\"list-row\"><strong>${c.name}</strong><span>${c.status}</span></div>`).join('');
}

export function renderAudiencePanel(data) {
  const el = document.getElementById('audienceMetrics');
  if (!el) return;
  el.innerHTML = `
    <div class="metric-row"><span class="metric-label">Total audience</span><span class="metric-value">${data.totalAudience.toLocaleString()}</span></div>
    <div class="metric-row"><span class="metric-label">New this period</span><span class="metric-value">+${data.newUsers.toLocaleString()}</span></div>
    <div class="metric-row"><span class="metric-label">Engagement rate</span><span class="metric-value">${data.engagementRate}%</span></div>
  `;
}

export function renderSegmentsPanel(data) {
  const el = document.getElementById('segmentList');
  if (!el) return;
  el.innerHTML = data.map((s) => `<div class=\"list-row\"><strong>${s.name}</strong><span>${s.count}</span></div>`).join('');
}

export function renderRevenuePanel(data) {
  const el = document.getElementById('revenueMetrics');
  if (!el) return;
  el.innerHTML = `
    <div class="metric-row"><span class="metric-label">MRR</span><span class="metric-value">$${data.mrr.toLocaleString()}</span></div>
    <div class="metric-row"><span class="metric-label">ARR</span><span class="metric-value">$${data.arr.toLocaleString()}</span></div>
    <div class="metric-row"><span class="metric-label">Churn rate</span><span class="metric-value">${data.churnRate}%</span></div>
  `;
}

export function renderRevenueListPanel(data) {
  const el = document.getElementById('revenueList');
  if (!el) return;
  el.innerHTML = data.map((r) => `<div class=\"list-row\"><strong>${r.name}</strong><span>${r.amount}</span></div>`).join('');
}

export function renderReportsPanel() {
  const el = document.getElementById('reportsList');
  if (!el) return;
  el.innerHTML = state.reports.map((r) => `<div class=\"list-row\"><strong>${r.name}</strong><span>${r.cadence}</span></div>`).join('');
}

export function renderSettingsPanel() {
  const el = document.getElementById('settingsSummary');
  if (!el) return;
  el.innerHTML = `
    <div class="metric-row"><span class="metric-label">Auto-refresh</span><span class="metric-value">${state.autoRefresh ? 'On' : 'Off'}</span></div>
    <div class="metric-row"><span class="metric-label">Alert digests</span><span class="metric-value">${state.alertsEnabled ? 'On' : 'Off'}</span></div>
    <div class="metric-row"><span class="metric-label">Export format</span><span class="metric-value">${state.exportFormat.toUpperCase()}</span></div>
  `;
}

export function renderFeaturePanels() {
  renderReportsPanel();
  renderSettingsPanel();
}