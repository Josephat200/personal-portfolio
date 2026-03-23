const authScreen = document.getElementById('auth-screen');
const adminApp = document.getElementById('admin-app');
const authStatus = document.getElementById('auth-status');
const statusNode = document.getElementById('status');
const bootstrapResult = document.getElementById('bootstrap-result');
const loggedUser = document.getElementById('logged-user');

const API_BASE = 'https://personal-portfolio-api.onrender.com';

function apiUrl(path) {
  return `${API_BASE}${path}`;
}

let dashboardCache = null;

function setAuthStatus(message) {
  authStatus.textContent = message;
}

function setStatus(message) {
  statusNode.textContent = message;
}

function token() {
  return localStorage.getItem('admin_token') || '';
}

function saveToken(value) {
  localStorage.setItem('admin_token', value);
}

function clearToken() {
  localStorage.removeItem('admin_token');
}

function authHeaders() {
  return token() ? { Authorization: `Bearer ${token()}` } : {};
}

async function authApi(path, method = 'GET', body) {
  const response = await fetch(apiUrl(`/api/auth${path}`), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Auth request failed');
  }
  return data;
}

async function adminApi(path, method = 'GET', body) {
  const response = await fetch(apiUrl(`/api/admin${path}`), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Admin request failed');
  }
  return data;
}

function showApp() {
  authScreen.classList.add('hidden');
  adminApp.classList.remove('hidden');
}

function showAuth() {
  adminApp.classList.add('hidden');
  authScreen.classList.remove('hidden');
}

function formObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function sectionByName(name) {
  return document.getElementById(`section-${name}`);
}

function switchSection(name) {
  document.querySelectorAll('.nav-btn').forEach((button) => {
    button.classList.toggle('active', button.getAttribute('data-section') === name);
  });

  document.querySelectorAll('.admin-section').forEach((section) => section.classList.add('hidden'));
  sectionByName(name).classList.remove('hidden');
}

function statusPill(isActive) {
  if (typeof isActive === 'undefined') return '';
  return `<span class="pill ${isActive ? 'active' : 'inactive'}">${isActive ? 'active' : 'inactive'}</span>`;
}

function renderOverview(data) {
  const cards = [
    { label: 'Sections', value: data.sections.length },
    { label: 'Services', value: data.services.length },
    { label: 'Portfolio Items', value: data.portfolio.length },
    { label: 'Testimonials', value: data.testimonials.length },
    { label: 'Terms', value: data.terms.length },
    { label: 'Messages', value: data.messages.length },
    { label: 'Admin Users', value: data.adminUsers.length }
  ];

  document.getElementById('overview-cards').innerHTML = cards
    .map(
      (card) => `
      <article class="overview-card">
        <h4>${card.label}</h4>
        <p>${card.value}</p>
      </article>
    `
    )
    .join('');
}

async function submitForm(formId, endpoint, transform) {
  const form = document.getElementById(formId);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const payload = formObject(form);
      await adminApi(endpoint, 'POST', transform ? transform(payload) : payload);
      setStatus('Saved successfully.');
      form.reset();
      await loadDashboard();
    } catch (error) {
      setStatus(error.message);
    }
  });
}

async function update(path, payload, successMessage = 'Updated successfully.') {
  try {
    await adminApi(path, 'PUT', payload);
    setStatus(successMessage);
    await loadDashboard();
  } catch (error) {
    setStatus(error.message);
  }
}

async function remove(path) {
  try {
    await adminApi(path, 'DELETE');
    setStatus('Deleted successfully.');
    await loadDashboard();
  } catch (error) {
    setStatus(error.message);
  }
}

function bindSimpleList(containerId, items, config) {
  const node = document.getElementById(containerId);
  node.innerHTML = items
    .map(
      (item) => `
      <article class="item">
        ${config.format(item)}
        <div class="actions">
          ${config.edit ? '<button data-edit>Edit</button>' : ''}
          ${config.toggle ? `<button class="ghost" data-toggle>${item.is_active ? 'Deactivate' : 'Activate'}</button>` : ''}
          ${config.delete ? '<button class="danger" data-delete>Delete</button>' : ''}
        </div>
      </article>
    `
    )
    .join('');

  if (config.edit) {
    node.querySelectorAll('[data-edit]').forEach((button, index) => {
      button.addEventListener('click', async () => {
        const payload = config.edit(items[index]);
        if (!payload) return;
        await update(`${config.basePath}/${items[index].id}`, payload);
      });
    });
  }

  if (config.toggle) {
    node.querySelectorAll('[data-toggle]').forEach((button, index) => {
      button.addEventListener('click', async () => {
        await update(`${config.basePath}/${items[index].id}/status`, { is_active: !items[index].is_active }, 'Status updated.');
      });
    });
  }

  if (config.delete) {
    node.querySelectorAll('[data-delete]').forEach((button, index) => {
      button.addEventListener('click', async () => {
        await remove(`${config.basePath}/${items[index].id}`);
      });
    });
  }
}

function renderSections(items) {
  bindSimpleList('sections-admin', items, {
    basePath: '/sections',
    format: (s) => `<h3>${s.slug} ${statusPill(s.is_active)}</h3><p><strong>${s.title}</strong></p><small>${s.body || ''}</small>`,
    edit: (s) => {
      const title = prompt('Section title', s.title || '');
      if (!title) return null;
      const subtitle = prompt('Subtitle', s.subtitle || '') || '';
      const body = prompt('Body', s.body || '') || '';
      const cta_text = prompt('CTA text', s.cta_text || '') || '';
      const cta_link = prompt('CTA link', s.cta_link || '') || '';
      return { title, subtitle, body, cta_text, cta_link };
    },
    toggle: true,
    delete: false
  });
}

function renderSettings(items) {
  const node = document.getElementById('settings-admin');
  node.innerHTML = items
    .map(
      (item) => `
      <article class="item">
        <h3>${item.key}</h3>
        <p>${item.value}</p>
        <div class="actions">
          <button data-edit>Edit</button>
        </div>
      </article>
    `
    )
    .join('');

  node.querySelectorAll('[data-edit]').forEach((button, index) => {
    button.addEventListener('click', async () => {
      const current = items[index];
      const value = prompt(`Value for ${current.key}`, current.value || '');
      if (value == null) return;
      await adminApi('/settings', 'POST', { key: current.key, value });
      setStatus('Setting updated.');
      await loadDashboard();
    });
  });
}

function renderAdminUsers(items) {
  const node = document.getElementById('admin-users-list');
  node.innerHTML = items
    .map(
      (item) => `
      <article class="item">
        <h3>${item.username} ${statusPill(item.is_active)}</h3>
        <small>Created: ${new Date(item.created_at).toLocaleString()}</small>
        <div class="actions">
          <button class="ghost" data-toggle>${item.is_active ? 'Deactivate' : 'Activate'}</button>
        </div>
      </article>
    `
    )
    .join('');

  node.querySelectorAll('[data-toggle]').forEach((button, index) => {
    button.addEventListener('click', async () => {
      await update(`/admin-users/${items[index].id}/status`, { is_active: !items[index].is_active }, 'Admin user status updated.');
    });
  });
}

function renderMessages(items) {
  const node = document.getElementById('messages-admin');
  node.innerHTML = items
    .map(
      (message) => `
      <article class="item">
        <h3>${message.name} (${message.email}) ${statusPill(message.is_resolved)}</h3>
        <p>${message.message}</p>
        <small>${message.phone || ''}</small>
        <div class="actions">
          <button class="ghost" data-resolve>${message.is_resolved ? 'Mark Open' : 'Mark Resolved'}</button>
          <button class="danger" data-delete>Delete</button>
        </div>
      </article>
    `
    )
    .join('');

  node.querySelectorAll('[data-resolve]').forEach((button, index) => {
    button.addEventListener('click', async () => {
      await update(`/messages/${items[index].id}/status`, { is_resolved: !items[index].is_resolved }, 'Message status updated.');
    });
  });

  node.querySelectorAll('[data-delete]').forEach((button, index) => {
    button.addEventListener('click', async () => {
      await remove(`/messages/${items[index].id}`);
    });
  });
}

function renderContentLists(data) {
  renderSections(data.sections || []);

  bindSimpleList('services-admin', data.services || [], {
    basePath: '/services',
    format: (s) => `<h3>${s.name} ${statusPill(s.is_active)}</h3><p>${s.description || ''}</p><small>Order: ${s.display_order || 0}</small>`,
    edit: (s) => {
      const name = prompt('Service name', s.name);
      if (!name) return null;
      const description = prompt('Description', s.description || '') || '';
      const price_note = prompt('Price note', s.price_note || '') || '';
      const display_order = Number(prompt('Display order', String(s.display_order || 0)) || s.display_order || 0);
      return { name, description, price_note, display_order };
    },
    toggle: true,
    delete: true
  });

  bindSimpleList('portfolio-admin', data.portfolio || [], {
    basePath: '/portfolio',
    format: (p) => `<h3>${p.title} ${statusPill(p.is_active)}</h3><p>${p.summary || ''}</p><small>${p.category || ''} | Order: ${p.display_order || 0}</small>`,
    edit: (p) => {
      const title = prompt('Project title', p.title);
      if (!title) return null;
      const summary = prompt('Summary', p.summary || '') || '';
      const category = prompt('Category', p.category || '') || '';
      const image_url = prompt('Image URL', p.image_url || '') || '';
      const project_url = prompt('Project URL', p.project_url || '') || '';
      const display_order = Number(prompt('Display order', String(p.display_order || 0)) || p.display_order || 0);
      return { title, summary, category, image_url, project_url, display_order };
    },
    toggle: true,
    delete: true
  });

  bindSimpleList('testimonials-admin', data.testimonials || [], {
    basePath: '/testimonials',
    format: (t) => `<h3>${t.client_name} ${statusPill(t.is_active)}</h3><p>${t.quote || ''}</p><small>${t.company || ''} | Rating: ${t.rating || 5}</small>`,
    edit: (t) => {
      const client_name = prompt('Client name', t.client_name);
      if (!client_name) return null;
      const company = prompt('Company', t.company || '') || '';
      const quote = prompt('Quote', t.quote || '') || '';
      const rating = Number(prompt('Rating', String(t.rating || 5)) || t.rating || 5);
      const display_order = Number(prompt('Display order', String(t.display_order || 0)) || t.display_order || 0);
      return { client_name, company, quote, rating, display_order };
    },
    toggle: true,
    delete: true
  });

  bindSimpleList('terms-admin', data.terms || [], {
    basePath: '/terms',
    format: (t) => `<h3>${t.title} ${statusPill(t.is_active)}</h3><p>${t.body || ''}</p><small>Order: ${t.display_order || 0}</small>`,
    edit: (t) => {
      const title = prompt('Title', t.title);
      if (!title) return null;
      const body = prompt('Body', t.body || '') || '';
      const display_order = Number(prompt('Display order', String(t.display_order || 0)) || t.display_order || 0);
      return { title, body, display_order };
    },
    toggle: true,
    delete: true
  });

  renderMessages(data.messages || []);
  renderSettings(data.settings || []);
  renderAdminUsers(data.adminUsers || []);
}

async function loadDashboard() {
  try {
    const dashboardData = await adminApi('/dashboard');
    const adminUsers = await adminApi('/admin-users');
    dashboardCache = { ...dashboardData, adminUsers };

    renderOverview(dashboardCache);
    renderContentLists(dashboardCache);
    setStatus('Dashboard loaded.');
  } catch (error) {
    setStatus(error.message);
    if (String(error.message).toLowerCase().includes('session')) {
      clearToken();
      showAuth();
    }
  }
}

async function ensureLogin() {
  const sessionToken = token();
  if (!sessionToken) {
    showAuth();
    return;
  }

  try {
    const me = await authApi('/me');
    loggedUser.textContent = me.user.username;
    showApp();
    await loadDashboard();
  } catch (_error) {
    clearToken();
    showAuth();
  }
}

function initAuthHandlers() {
  document.getElementById('bootstrap-btn').addEventListener('click', async () => {
    try {
      const data = await authApi('/bootstrap', 'POST');
      bootstrapResult.innerHTML = `
        <strong>Generated Credentials</strong>
        <div>Username: ${data.credentials.username}</div>
        <div>Password: ${data.credentials.password}</div>
      `;
      setAuthStatus('Bootstrap credentials generated. Save them securely.');
    } catch (error) {
      setAuthStatus(error.message);
    }
  });

  document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = formObject(event.target);

    try {
      const data = await authApi('/login', 'POST', payload);
      saveToken(data.token);
      loggedUser.textContent = data.user.username;
      setAuthStatus('');
      showApp();
      await loadDashboard();
    } catch (error) {
      setAuthStatus(error.message);
    }
  });

  document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
      await authApi('/logout', 'POST');
    } catch (_error) {
      // ignore
    }

    clearToken();
    showAuth();
    setStatus('Logged out.');
  });
}

function initNavigation() {
  document.querySelectorAll('.nav-btn').forEach((button) => {
    button.addEventListener('click', () => {
      switchSection(button.getAttribute('data-section'));
    });
  });
}

function initForms() {
  submitForm('section-form', '/sections', (data) => data);
  submitForm('service-form', '/services', (data) => ({ ...data, display_order: Number(data.display_order || 0), is_active: true }));
  submitForm('portfolio-form', '/portfolio', (data) => ({ ...data, display_order: Number(data.display_order || 0), is_active: true }));
  submitForm('testimonial-form', '/testimonials', (data) => ({ ...data, display_order: Number(data.display_order || 0), rating: Number(data.rating || 5), is_active: true }));
  submitForm('term-form', '/terms', (data) => ({ ...data, display_order: Number(data.display_order || 0), is_active: true }));
  submitForm('setting-form', '/settings', (data) => data);
  submitForm('admin-user-form', '/admin-users', (data) => data);

  document.getElementById('account-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const payload = formObject(event.target);
      await update('/account', payload, 'Login details updated successfully.');
      event.target.reset();
    } catch (error) {
      setStatus(error.message);
    }
  });
}

initAuthHandlers();
initNavigation();
initForms();
ensureLogin();
