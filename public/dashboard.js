document.addEventListener('DOMContentLoaded', () => {
  // ── Auth helpers ──────────────────────────────────────────────
  const API_BASE = '/api';
  const TOKEN_KEY = 'insights_token';
  const USER_KEY = 'insights_user';

  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); }
    catch { return null; }
  }
  function saveAuth(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
  function isAuthenticated() { return !!getToken(); }

  async function apiFetch(path, options = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  // ── DOM refs ─────────────────────────────────────────────────
  const appShell = document.getElementById('dashboardShell');
  const loginPage = document.getElementById('loginPage');
  const registerPage = document.getElementById('registerPage');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginError = document.getElementById('loginError');
  const loginSuccess = document.getElementById('loginSuccess');
  const registerError = document.getElementById('registerError');
  const registerSuccess = document.getElementById('registerSuccess');
  const showRegister = document.getElementById('showRegister');
  const showLogin = document.getElementById('showLogin');
  const navLogout = document.getElementById('navLogout');
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
  const registerSubmitBtn = document.getElementById('registerSubmitBtn');
  const loginPasswordToggle = document.getElementById('loginPasswordToggle');
  const registerPasswordToggle = document.getElementById('registerPasswordToggle');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');

  const collapseBtn = document.getElementById('collapseBtn');
  const themeSwitch = document.getElementById('themeSwitch');
  const menuToggle = document.getElementById('menuToggle');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const chips = document.querySelectorAll('.chip');
  const navItems = document.querySelectorAll('.nav-item');
  const notificationsBtn = document.getElementById('notificationsBtn');
  const profileBtn = document.getElementById('profileBtn');
  const newReportBtn = document.getElementById('newReportBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  const liveStatus = document.getElementById('liveStatus');
  const liveText = document.getElementById('liveText');
  const sidebarUpgradeBtn = document.getElementById('sidebarUpgradeBtn');
  const heroUpgradeBtn = document.getElementById('heroUpgradeBtn');
  const viewAllBtn = document.getElementById('viewAllBtn');
  const toast = document.getElementById('toast');
  const searchInput = document.getElementById('globalSearch');
  const notificationsPanel = document.getElementById('notificationsPanel');
  const profilePanel = document.getElementById('profilePanel');
  const modalRoot = document.getElementById('modalRoot');
  const modalClose = document.getElementById('modalClose');
  const modalContent = document.getElementById('modalContent');
  const modalTitle = document.getElementById('modalTitle');
  const totalRevenueValue = document.getElementById('totalRevenueValue');
  const activeUsersValue = document.getElementById('activeUsersValue');
  const conversionValue = document.getElementById('conversionValue');
  const sessionValue = document.getElementById('sessionValue');
  const revenueChange = document.getElementById('revenueChange');
  const usersChange = document.getElementById('usersChange');
  const conversionChange = document.getElementById('conversionChange');
  const sessionChange = document.getElementById('sessionChange');
  const activityList = document.getElementById('activityList');
  const sourceLegend = document.getElementById('sourceLegend');
  const performanceTableBody = document.getElementById('performanceTableBody');
  const heroEyebrow = document.getElementById('heroEyebrow');
  const heroTitle = document.getElementById('heroTitle');
  const heroCopy = document.getElementById('heroCopy');
  const workspaceViewLabel = document.getElementById('workspaceViewLabel');
  const workspaceSummary = document.getElementById('workspaceSummary');
  const analyticsMetrics = document.getElementById('analyticsMetrics');
  const campaignList = document.getElementById('campaignList');
  const audienceMetrics = document.getElementById('audienceMetrics');
  const segmentList = document.getElementById('segmentList');
  const revenueMetrics = document.getElementById('revenueMetrics');
  const revenueList = document.getElementById('revenueList');
  const reportsList = document.getElementById('reportsList');
  const reportComposer = document.getElementById('reportComposer');
  const reportQuickAdd = document.getElementById('reportQuickAdd');
  const settingsAutoRefresh = document.getElementById('settingsAutoRefresh');
  const settingsAlerts = document.getElementById('settingsAlerts');
  const settingsExport = document.getElementById('settingsExport');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const settingsSummary = document.getElementById('settingsSummary');
  // Profile page refs
  const profileView = document.getElementById('profileView');
  const profileForm = document.getElementById('profileForm');
  const passwordForm = document.getElementById('passwordForm');
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const profileJobTitle = document.getElementById('profileJobTitle');
  const profileCompany = document.getElementById('profileCompany');
  const profileAvatar = document.getElementById('profileAvatar');
  const profileVerifiedBadge = document.getElementById('profileVerifiedBadge');
  const deleteAccountBtn = document.getElementById('deleteAccountBtn');
  // Sidebar profile
  const sidebarProfileName = document.querySelector('.profile-name');
  const sidebarProfileRole = document.querySelector('.profile-role');
  const sidebarAvatar = document.querySelector('.avatar');
  // ── Socket.IO connection ─────
  let socket = null;

  function initSocketIO() {
    const token = getToken();
    if (!token) return;

    // Connect to the same host with auth token
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    socket = io(`${protocol}//${host}`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      if (liveText) liveText.textContent = 'Live • connected';
      if (liveStatus) liveStatus.classList.add('connected');
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      if (liveText) liveText.textContent = 'Live • reconnecting...';
      if (liveStatus) liveStatus.classList.remove('connected');
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
      if (liveText) liveText.textContent = 'Live • offline';
      if (liveStatus) liveStatus.classList.remove('connected');
    });

    // ── Real-time traffic event received ──
    socket.on('traffic_event', (payload) => {
      // Add the new activity to the top of the list
      if (payload.activity) {
        state.activityItems.unshift(payload.activity);
        // Keep only the last 50 items to prevent memory bloat
        if (state.activityItems.length > 50) {
          state.activityItems = state.activityItems.slice(0, 50);
        }
        renderActivity();
      }

      // Show a brief toast for revenue events
      if (payload.data && payload.data.revenue > 0) {
        showToast(`💰 New revenue: $${payload.data.revenue.toFixed(2)} from ${payload.data.source}`);
      }
    });

    // ── Dashboard update notification ──
    socket.on('dashboard_update', () => {
      // Silently refresh data in the background
      loadDashboard(state.currentRange);
    });
  }

  // ── State ────────────────────
  const state = {
    currentRange: 'month',
    activeView: 'overview',
    autoRefresh: localStorage.getItem('autoRefresh') !== 'false', // default true
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

  // ── Auth UI helpers ──────────────────────────
  function showAuthPage(page) {
    loginPage.style.display = page === 'login' ? 'flex' : 'none';
    registerPage.style.display = page === 'register' ? 'flex' : 'none';
    appShell.style.display = 'none';
    loginError.style.display = 'none';
    loginSuccess.style.display = 'none';
    registerError.style.display = 'none';
    registerSuccess.style.display = 'none';
    // Reset button states
    loginSubmitBtn?.classList.remove('loading');
    registerSubmitBtn?.classList.remove('loading');
  }

  function showDashboard() {
    loginPage.style.display = 'none';
    registerPage.style.display = 'none';
    appShell.style.display = 'flex';
    navLogout.style.display = 'flex';
  }

  function updateSidebarProfile(user) {
    if (!user) return;
    if (sidebarProfileName) sidebarProfileName.textContent = user.name || 'User';
    if (sidebarProfileRole) sidebarProfileRole.textContent = user.jobTitle || user.role || 'Member';
    if (sidebarAvatar) sidebarAvatar.src = user.avatar || 'https://i.pravatar.cc/64?img=12';

    // Also update the header avatar and the profile dropdown header
    const headerAvatar = document.querySelector('.header-avatar');
    if (headerAvatar && user.avatar) headerAvatar.src = user.avatar;

    const dropdownHeaderName = document.querySelector('.profile-panel-header strong');
    if (dropdownHeaderName) dropdownHeaderName.textContent = `Signed in as ${user.name}`;
  }

  function updateProfilePage(user) {
    if (!user) return;
    if (profileName) profileName.value = user.name || '';
    if (profileEmail) profileEmail.value = user.email || '';
    if (profileJobTitle) profileJobTitle.value = user.jobTitle || '';
    if (profileCompany) profileCompany.value = user.company || '';
    if (profileAvatar) profileAvatar.value = user.avatar || '';
    if (profileVerifiedBadge) {
      profileVerifiedBadge.textContent = user.isVerified ? 'Verified' : 'Unverified';
      profileVerifiedBadge.style.background = user.isVerified
        ? 'rgba(67, 217, 173, 0.16)'
        : 'rgba(255, 101, 132, 0.16)';
      profileVerifiedBadge.style.color = user.isVerified ? 'var(--accent-2)' : 'var(--accent-3)';
    }
  }

  function logout() {
    clearAuth();
    navLogout.style.display = 'none';
    showAuthPage('login');
    window.location.reload();
  }

  // ── Password visibility toggle ──────────────
  function setupPasswordToggle(toggleBtn, input) {
    toggleBtn?.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      const eyeIcon = toggleBtn.querySelector('.eye-icon');
      const eyeOffIcon = toggleBtn.querySelector('.eye-off-icon');
      if (eyeIcon) eyeIcon.style.display = isPassword ? 'none' : '';
      if (eyeOffIcon) eyeOffIcon.style.display = isPassword ? '' : 'none';
    });
  }
  const loginPasswordInput = loginForm?.querySelector('input[name="password"]');
  const registerPasswordInput = registerForm?.querySelector('input[name="password"]');
  setupPasswordToggle(loginPasswordToggle, loginPasswordInput);
  setupPasswordToggle(registerPasswordToggle, registerPasswordInput);

  // ── Forgot password ──────────────────────────
  forgotPasswordLink?.addEventListener('click', (e) => {
    e.preventDefault();
    const email = loginForm?.querySelector('input[name="email"]')?.value || 'your@email.com';
    const successTextEl = loginSuccess?.querySelector('.auth-success-text');
    if (successTextEl) {
      successTextEl.textContent = `If ${email} is registered, a reset link will be sent.`;
    }
    if (loginSuccess) {
      loginSuccess.style.display = 'block';
      setTimeout(() => { loginSuccess.style.display = 'none'; }, 4000);
    }
  });

  // ── Auth event handlers ──────────────────────
  showRegister?.addEventListener('click', (e) => { e.preventDefault(); showAuthPage('register'); });
  showLogin?.addEventListener('click', (e) => { e.preventDefault(); showAuthPage('login'); });
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.style.display = 'none';
    loginSuccess.style.display = 'none';
    loginSubmitBtn?.classList.add('loading');
    const form = new FormData(loginForm);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') })
      });
      saveAuth(data.token, data.user);
      showDashboard();
      updateSidebarProfile(data.user);
      updateProfilePage(data.user);
      initDashboard();
    } catch (err) {
      const errorTextEl = loginError?.querySelector('.auth-error-text');
      if (errorTextEl) errorTextEl.textContent = err.message;
      if (loginError) loginError.style.display = 'block';
      loginSubmitBtn?.classList.remove('loading');
    }
  });
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerError.style.display = 'none';
    registerSuccess.style.display = 'none';
    registerSubmitBtn?.classList.add('loading');
    const form = new FormData(registerForm);
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: form.get('name'), email: form.get('email'), password: form.get('password') })
      });
      saveAuth(data.token, data.user);
      showDashboard();
      updateSidebarProfile(data.user);
      updateProfilePage(data.user);
      initDashboard();
    } catch (err) {
      const errorTextEl = registerError?.querySelector('.auth-error-text');
      if (errorTextEl) errorTextEl.textContent = err.message;
      if (registerError) registerError.style.display = 'block';
      registerSubmitBtn?.classList.remove('loading');
    }
  });

  // ── Auth theme toggle ────────────────────────
  const authThemeToggle = document.getElementById('authThemeToggle');
  authThemeToggle?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    const icon = authThemeToggle.querySelector('.theme-toggle-icon');
    if (icon) icon.textContent = next === 'dark' ? '☀️' : '🌙';
  });
  // Sync theme toggle icon on load
  if (authThemeToggle) {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    const icon = authThemeToggle.querySelector('.theme-toggle-icon');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  // ── Social login buttons ─────────────────────
  document.querySelectorAll('.social-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const provider = btn.dataset.provider;
      showToast(`Sign in with ${provider} coming soon`);
    });
  });
  // ── Floating input auto-fill detection ───────
  document.querySelectorAll('.floating-input').forEach((input) => {
    const checkFilled = () => {
      if (input.value) input.setAttribute('data-filled', 'true');
      else input.removeAttribute('data-filled');
    };
    checkFilled();
    input.addEventListener('input', checkFilled);
    input.addEventListener('blur', checkFilled);
  });

  // ── Click demo hint to auto-fill ─────────────
  document.querySelector('.demo-hint')?.addEventListener('click', () => {
    const emailInput = loginForm?.querySelector('input[name="email"]');
    const passInput = loginForm?.querySelector('input[name="password"]');
    if (emailInput) { emailInput.value = 'demo@insights.io'; emailInput.dispatchEvent(new Event('input')); }
    if (passInput) { passInput.value = 'demo12345'; passInput.dispatchEvent(new Event('input')); }
    showToast('Demo credentials filled');
  });

  // ── Logout button in sidebar ────────────────
  navLogout?.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });

  // ── Profile page handlers ────────────────────
  profileForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData(profileForm);
    try {
      const data = await apiFetch('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          name: form.get('name'),
          jobTitle: form.get('jobTitle'),
          company: form.get('company'),
          avatar: form.get('avatar')
        })
      });
      saveAuth(getToken(), data.user);
      updateSidebarProfile(data.user);
      updateProfilePage(data.user);
      showToast('Profile updated');
    } catch (err) {
      showToast(err.message);
    }
  });

  passwordForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData(passwordForm);
    try {
      await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: form.get('currentPassword'), newPassword: form.get('newPassword') })
      });
      passwordForm.reset();
      showToast('Password changed');
    } catch (err) {
      showToast(err.message);
    }
  });

  deleteAccountBtn?.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    try {
      await apiFetch('/auth/account', { method: 'DELETE' });
      logout();
    } catch (err) {
      showToast(err.message);
    }
  });
  // ── Toast & formatters ───────────────────────
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => toast.classList.remove('show'), 2200);
  };

  const formatCurrency = (value) => `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatPercent = (value) => `${Number(value || 0).toFixed(2)}%`;

  // ── Sidebar / nav ────────────────────────────
  collapseBtn?.addEventListener('click', () => appShell?.classList.toggle('collapsed'));
  menuToggle?.addEventListener('click', () => {
    appShell?.classList.toggle('mobile-open');
    sidebarOverlay?.classList.toggle('active');
  });
  sidebarOverlay?.addEventListener('click', () => {
    appShell?.classList.remove('mobile-open');
    sidebarOverlay?.classList.remove('active');
  });

  // ── Theme ────────────────────────────────────
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (themeSwitch) themeSwitch.checked = theme === 'dark';
    applyThemeToCharts();
  }

  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);

  themeSwitch?.addEventListener('change', () => {
    applyTheme(themeSwitch.checked ? 'dark' : 'light');
  });

  function applyThemeToCharts() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(28,32,51,0.08)';
    [window.myMainChart, window.myDonutChart].forEach((chart) => {
      if (!chart) return;
      if (chart.options.scales?.y) chart.options.scales.y.grid.color = gridColor;
      chart.update('none');
    });
  }

  // ── View switching ───────────────────────────
  function setActiveView(viewId) {
    state.activeView = viewId;
    document.querySelectorAll('.view-section').forEach((el) => el.classList.remove('active'));
    const target = document.getElementById(`${viewId}View`);
    if (target) target.classList.add('active');
    navItems.forEach((item) => {
      item.classList.toggle('active', item.dataset.view === viewId);
    });
  }

  navItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const view = item.dataset.view;
      if (view) setActiveView(view);
      if (window.innerWidth <= 760) {
        appShell?.classList.remove('mobile-open');
        sidebarOverlay?.classList.remove('active');
      }
    });
  });

  // ── Range chips ──────────────────────────────
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      state.currentRange = chip.dataset.range || 'month';
      loadDashboard(state.currentRange);
    });
  });

  // ── Dropdowns ────────────────────────────────
  function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-panel.open').forEach((p) => p.classList.remove('open'));
  }

  notificationsBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    notificationsPanel?.classList.toggle('open');
  });

  profileBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    profilePanel?.classList.toggle('open');
  });

  // ── Profile Dropdown Actions ─────────────────
  document.getElementById('profileViewAccountBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    setActiveView('profile');
  });

  document.getElementById('profilePreferencesBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    setActiveView('settings');
  });

  document.getElementById('profileSignOutBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    logout();
  });

  // ── Modal ────────────────────────────────────
  function openModal(title, contentHtml) {
    if (!modalRoot || !modalTitle || !modalContent) return;
    modalTitle.textContent = title;
    modalContent.innerHTML = contentHtml;
    modalRoot.classList.add('open');
    modalRoot.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    if (!modalRoot) return;
    modalRoot.classList.remove('open');
    modalRoot.setAttribute('aria-hidden', 'true');
  }

  function openUpgradeModal() {
    openModal('Upgrade to Pro',
      '<p style="margin-bottom:12px;color:var(--text-secondary)">Unlock advanced analytics, custom reports, and priority support.</p>' +
      '<div class="modal-actions"><button type="button" class="primary-btn" data-action="cancel">Cancel</button><button type="button" class="primary-btn" style="background:var(--accent)">Upgrade now</button></div>'
    );
  }

  sidebarUpgradeBtn?.addEventListener('click', openUpgradeModal);

  newReportBtn?.addEventListener('click', () => {
    reportComposer?.querySelector('input[name="name"]')?.focus();
    showToast('Report composer ready');
  });

  // ── Quick-add Event Modal ────────────────────
  document.getElementById('quickAddEventBtn')?.addEventListener('click', () => {
    openModal('Quick-add Traffic Event', `
      <form id="quickEventForm" class="modal-form">
        <label>
          Traffic Source
          <select name="source" required>
            <option value="Organic">Organic</option>
            <option value="Social">Social</option>
            <option value="Referral">Referral</option>
            <option value="Direct">Direct</option>
          </select>
        </label>
        <label>
          Session Duration (seconds)
          <input type="number" name="duration" required min="1" value="120" />
        </label>
        <label>
          Revenue Generated ($)
          <input type="number" name="revenue" min="0" step="0.01" value="0" />
        </label>
        <div class="modal-actions" style="margin-top: 16px; display: flex; gap: 12px; justify-content: flex-end;">
          <button type="button" class="primary-btn" data-action="cancel" style="background: var(--text-muted)">Cancel</button>
          <button type="submit" class="primary-btn" style="background: var(--accent)">Submit Event</button>
        </div>
      </form>
    `);

    // Handle form submission inside modal
    document.getElementById('quickEventForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = new FormData(e.target);
      try {
        const res = await apiFetch('/analytics/event', {
          method: 'POST',
          body: JSON.stringify({
            source: form.get('source'),
            duration: Number(form.get('duration')),
            revenue: Number(form.get('revenue'))
          })
        });
        showToast(res.message);
        closeModal();
        // Reload dashboard to show the new data instantly
        loadDashboard(state.currentRange);
      } catch (err) {
        showToast(err.message);
      }
    });
  });
  refreshBtn?.addEventListener('click', () => {
    loadDashboard(state.currentRange);
    showToast('Dashboard refreshed');
  });

  viewAllBtn?.addEventListener('click', () => {
    searchInput?.focus();
    showToast('Activity list expanded');
  });

  searchInput?.addEventListener('input', () => {
    renderActivity();
    renderPerformanceTable();
  });

  // ── Report composer ──────────────────────────
  if (reportComposer) {
    reportComposer.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(reportComposer);
      const name = formData.get('name') || 'New report';
      state.activityItems.unshift({
        type: 'success',
        message: `${name} scheduled for ${formData.get('audience') || 'team'}`,
        amount: '+$0',
        timestamp: new Date().toISOString()
      });
      state.reports.unshift({
        name,
        cadence: formData.get('cadence') || 'Weekly'
      });
      renderActivity();
      renderFeaturePanels();
      showToast('Report saved');
    });
  }

  reportQuickAdd?.addEventListener('click', () => {
    reportComposer?.querySelector('input[name="name"]')?.focus();
    showToast('Report composer ready');
  });

  // ── Settings ─────────────────────────────────
  saveSettingsBtn?.addEventListener('click', () => {
    state.autoRefresh = settingsAutoRefresh?.checked ?? true;
    state.alertsEnabled = settingsAlerts?.checked ?? true;
    state.exportFormat = settingsExport?.value || 'csv';
    localStorage.setItem('autoRefresh', state.autoRefresh);
    localStorage.setItem('alertsEnabled', state.alertsEnabled);
    localStorage.setItem('exportFormat', state.exportFormat);
    renderFeaturePanels();
    showToast('Preferences saved');
  });

  // ── Global clicks / keyboard ─────────────────
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.dropdown')) {
      closeAllDropdowns();
    }
  });

  modalRoot?.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal-backdrop') || event.target.closest('[data-action="cancel"]')) closeModal();
  });

  modalClose?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllDropdowns();
      closeModal();
    }
  });

  // ── Dashboard data loading ───────────────────
  async function loadDashboard(range) {
    try {
      const [overviewData, trafficData, sourcesData, activityData] = await Promise.all([
        apiFetch(`/analytics/overview?range=${range}`),
        apiFetch(`/analytics/traffic-chart?range=${range}`),
        apiFetch(`/analytics/sources?range=${range}`),
        apiFetch(`/analytics/activity?range=${range}`),
      ]);

      updateOverview(overviewData);
      updateTrafficChart(trafficData);
      updateSources(sourcesData);
      updateActivity(activityData);

      // Also load panel data in parallel
      loadFeaturePanels(range);
    } catch (err) {
      if (err.message.includes('Token expired') || err.message.includes('Invalid token')) {
        logout();
      }
      console.error('Dashboard data load error:', err);
    }
  }

  function updateOverview(data) {
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

  function updateTrafficChart(data) {
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

  function updateSources(data) {
    const chart = window.myDonutChart;
    if (chart) {
      chart.data.datasets[0].data = data.data.map((s) => s.count);
      chart.update();
    }
    if (sourceLegend) {
      sourceLegend.innerHTML = data.data.map((s) =>
        `<div class="legend-item"><span class="legend-dot" style="background:${getSourceColor(s.source)}"></span><span>${s.source}</span><span class="legend-value">${s.percentage}%</span></div>`
      ).join('');
    }
  }

  function getSourceColor(source) {
    const colors = { Organic: '#7C6CFF', Social: '#43D9AD', Referral: '#FFB547', Direct: '#FF6584' };
    return colors[source] || '#7C6CFF';
  }

  function updateActivity(data) {
    state.activityItems = data;
    renderActivity();
  }

  function renderActivity() {
    if (!activityList) return;
    const query = searchInput?.value?.toLowerCase().trim() || '';
    const items = state.activityItems.filter((a) =>
      !query || a.message?.toLowerCase().includes(query)
    );
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

  function renderPerformanceTable() {
    if (!performanceTableBody) return;
    const query = searchInput?.value?.toLowerCase().trim() || '';
    const rows = state.performanceRows.filter((r) =>
      !query || r.account.toLowerCase().includes(query) || r.region.toLowerCase().includes(query)
    );
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

  function renderNotifications() {
    if (!notificationsPanel) return;
    notificationsPanel.innerHTML = state.notifications.map((n) =>
      `<div class="notification-item">
        <strong>${n.title}</strong>
        <p>${n.detail}</p>
        <span class="activity-time">${n.time}</span>
      </div>`
    ).join('');
  }

  // ── Loading states for panels ────────────────
  function setPanelLoading(element, loading) {
    if (!element) return;
    if (loading) {
      element.dataset.originalContent = element.innerHTML;
      element.innerHTML = `
        <div class="metric-row">
          <span class="metric-label shimmer">&nbsp;</span>
          <span class="metric-value shimmer">&nbsp;</span>
        </div>
        <div class="metric-row">
          <span class="metric-label shimmer">&nbsp;</span>
          <span class="metric-value shimmer">&nbsp;</span>
        </div>
        <div class="metric-row">
          <span class="metric-label shimmer">&nbsp;</span>
          <span class="metric-value shimmer">&nbsp;</span>
        </div>`;
    }
  }

  function setListLoading(element, loading) {
    if (!element) return;
    if (loading) {
      element.dataset.originalContent = element.innerHTML;
      element.innerHTML = `
        <div class="list-row"><strong class="shimmer">&nbsp;</strong><span class="shimmer">&nbsp;</span></div>
        <div class="list-row"><strong class="shimmer">&nbsp;</strong><span class="shimmer">&nbsp;</span></div>
        <div class="list-row"><strong class="shimmer">&nbsp;</strong><span class="shimmer">&nbsp;</span></div>`;
    }
  }

  // ── Real data panel loading ──────────────────
  async function loadFeaturePanels(range) {
    // Show loading states
    setPanelLoading(analyticsMetrics, true);
    setListLoading(campaignList, true);
    setPanelLoading(audienceMetrics, true);
    setListLoading(segmentList, true);
    setPanelLoading(revenueMetrics, true);
    setListLoading(revenueList, true);

    try {
      const [
        analyticsData, campaignsData,
        audienceData, segmentsData,
        revenueData, revenueListData
      ] = await Promise.all([
        apiFetch(`/analytics/panel/analytics?range=${range}`),
        apiFetch(`/analytics/panel/campaigns?range=${range}`),
        apiFetch(`/analytics/panel/audience?range=${range}`),
        apiFetch(`/analytics/panel/segments?range=${range}`),
        apiFetch(`/analytics/panel/revenue?range=${range}`),
        apiFetch(`/analytics/panel/revenue-list?range=${range}`),
      ]);

      renderAnalyticsPanel(analyticsData);
      renderCampaignsPanel(campaignsData);
      renderAudiencePanel(audienceData);
      renderSegmentsPanel(segmentsData);
      renderRevenuePanel(revenueData);
      renderRevenueListPanel(revenueListData);
    } catch (err) {
      if (err.message.includes('Token expired') || err.message.includes('Invalid token')) {
        logout();
      }
      console.error('Panel data load error:', err);
      // Fallback to empty state
      if (analyticsMetrics) analyticsMetrics.innerHTML = '<div class="empty-state">Failed to load</div>';
      if (campaignList) campaignList.innerHTML = '<div class="empty-state">Failed to load</div>';
      if (audienceMetrics) audienceMetrics.innerHTML = '<div class="empty-state">Failed to load</div>';
      if (segmentList) segmentList.innerHTML = '<div class="empty-state">Failed to load</div>';
      if (revenueMetrics) revenueMetrics.innerHTML = '<div class="empty-state">Failed to load</div>';
      if (revenueList) revenueList.innerHTML = '<div class="empty-state">Failed to load</div>';
    }

    // Reports & Settings (local state, no loading needed)
    renderReportsPanel();
    renderSettingsPanel();
  }

  function renderAnalyticsPanel(data) {
    if (!analyticsMetrics) return;
    analyticsMetrics.innerHTML = `
      <div class="metric-row"><span class="metric-label">Page views</span><span class="metric-value">${data.pageViews.toLocaleString()}</span></div>
      <div class="metric-row"><span class="metric-label">Bounce rate</span><span class="metric-value">${data.bounceRate}%</span></div>
      <div class="metric-row"><span class="metric-label">Avg. time on page</span><span class="metric-value">${data.avgTimeOnPage}</span></div>
    `;
  }

  function renderCampaignsPanel(data) {
    if (!campaignList) return;
    campaignList.innerHTML = data.map((c) =>
      `<div class="list-row"><strong>${c.name}</strong><span>${c.status}</span></div>`
    ).join('');
  }

  function renderAudiencePanel(data) {
    if (!audienceMetrics) return;
    audienceMetrics.innerHTML = `
      <div class="metric-row"><span class="metric-label">Total audience</span><span class="metric-value">${data.totalAudience.toLocaleString()}</span></div>
      <div class="metric-row"><span class="metric-label">New this period</span><span class="metric-value">+${data.newUsers.toLocaleString()}</span></div>
      <div class="metric-row"><span class="metric-label">Engagement rate</span><span class="metric-value">${data.engagementRate}%</span></div>
    `;
  }

  function renderSegmentsPanel(data) {
    if (!segmentList) return;
    segmentList.innerHTML = data.map((s) =>
      `<div class="list-row"><strong>${s.name}</strong><span>${s.count}</span></div>`
    ).join('');
  }

  function renderRevenuePanel(data) {
    if (!revenueMetrics) return;
    revenueMetrics.innerHTML = `
      <div class="metric-row"><span class="metric-label">MRR</span><span class="metric-value">$${data.mrr.toLocaleString()}</span></div>
      <div class="metric-row"><span class="metric-label">ARR</span><span class="metric-value">$${data.arr.toLocaleString()}</span></div>
      <div class="metric-row"><span class="metric-label">Churn rate</span><span class="metric-value">${data.churnRate}%</span></div>
    `;
  }

  function renderRevenueListPanel(data) {
    if (!revenueList) return;
    revenueList.innerHTML = data.map((r) =>
      `<div class="list-row"><strong>${r.name}</strong><span>${r.amount}</span></div>`
    ).join('');
  }

  function renderReportsPanel() {
    if (!reportsList) return;
    reportsList.innerHTML = state.reports.map((r) =>
      `<div class="list-row"><strong>${r.name}</strong><span>${r.cadence}</span></div>`
    ).join('');
  }

  function renderSettingsPanel() {
    if (!settingsSummary) return;
    settingsSummary.innerHTML = `
      <div class="metric-row"><span class="metric-label">Auto-refresh</span><span class="metric-value">${state.autoRefresh ? 'On' : 'Off'}</span></div>
      <div class="metric-row"><span class="metric-label">Alert digests</span><span class="metric-value">${state.alertsEnabled ? 'On' : 'Off'}</span></div>
      <div class="metric-row"><span class="metric-label">Export format</span><span class="metric-value">${state.exportFormat.toUpperCase()}</span></div>
    `;
  }

  function renderFeaturePanels() {
    renderReportsPanel();
    renderSettingsPanel();
  }

  // ── Chart initialization ─────────────────────
  function initCharts() {
    const ctxMain = document.getElementById('mainChart');
    const ctxDonut = document.getElementById('donutChart');

    if (ctxMain && typeof Chart !== 'undefined') {
      window.myMainChart = new Chart(ctxMain, {
        type: 'line',
        data: {
          labels: ['W1', 'W2', 'W3', 'W4'],
          datasets: [{
            label: 'Traffic Volume',
            data: [0, 0, 0, 0],
            borderColor: '#7C6CFF',
            backgroundColor: (ctx) => {
              const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
              gradient.addColorStop(0, 'rgba(124,108,255,0.28)');
              gradient.addColorStop(1, 'rgba(124,108,255,0.01)');
              return gradient;
            },
            borderWidth: 3,
            tension: 0.38,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#7C6CFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 1200, easing: 'easeOutQuart' },
          interaction: { mode: 'index', intersect: false },
          plugins: { legend: { display: false }, tooltip: { backgroundColor: '#111827', titleColor: '#fff', bodyColor: '#e5e7eb', displayColors: false } },
          scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: 'rgba(28,32,51,0.08)' } } }
        }
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
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 1100, easing: 'easeOutQuart' },
          cutout: '74%',
          plugins: { legend: { display: false }, tooltip: { backgroundColor: '#111827', titleColor: '#fff', bodyColor: '#e5e7eb', displayColors: false } }
        }
      });
    }
  }

  // ── Init dashboard (called after auth) ──────
  function initDashboard() {
    // Initialize Socket.IO for real-time updates
    initSocketIO();

    initCharts();
    renderNotifications();
    renderPerformanceTable();
    // Set loading states for panels immediately
    setPanelLoading(analyticsMetrics, true);
    setListLoading(campaignList, true);
    setPanelLoading(audienceMetrics, true);
    setListLoading(segmentList, true);
    setPanelLoading(revenueMetrics, true);
    setListLoading(revenueList, true);
    renderReportsPanel();
    renderSettingsPanel();
    applyThemeToCharts();
    setActiveView('overview');
    loadDashboard(state.currentRange);

    window.addEventListener('resize', () => {
      window.myMainChart?.resize();
      window.myDonutChart?.resize();
    });

    window.setInterval(() => {
      if (state.autoRefresh) {
        loadDashboard(state.currentRange);
      }
    }, 15000);
  }

  // ── Bootstrap: check auth on load ────────────
  if (isAuthenticated()) {
    const user = getUser();
    showDashboard();
    updateSidebarProfile(user);
    updateProfilePage(user);
    initDashboard();
  } else {
    showAuthPage('login');
  }
});