import '../styles/admin.css';

import {
  isSupabaseConfigured,
  signInDonor,
  signOutDonor,
  getCurrentSession,
  onAuthChange,
  fetchMyProfile,
  fetchAllProfiles,
  fetchAllAllocations,
  insertAllocation,
  deleteAllocation,
  fetchAllApplications,
  updateApplicationStatus,
  deleteApplication,
  type DonorProfile,
  type AllocationWithDonor,
  type ApplicationRecord,
} from '../lib/donor-auth';

const root = document.getElementById('adminRoot')!;

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function formatAmount(amount: number | null, currency: string): string {
  if (amount === null) return '—';
  const symbol = currency === 'NGN' ? '₦' : currency + ' ';
  return symbol + amount.toLocaleString('en-NG');
}

function renderNotConfigured(): void {
  root.innerHTML = `
    <div class="admin-card">
      <h2>Not Configured Yet</h2>
      <p>The donor database isn't connected yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file (see supabase/schema.sql and README) and rebuild.</p>
    </div>
  `;
}

function renderLogin(errorMsg = ''): void {
  root.innerHTML = `
    <div class="admin-card">
      <h2>Staff Login</h2>
      <p>Sign in with your admin account to manage donor allocation records.</p>
      <form id="adminLoginForm">
        <div class="admin-field">
          <label>Email</label>
          <input type="email" id="adminEmail" required>
        </div>
        <div class="admin-field">
          <label>Password</label>
          <input type="password" id="adminPassword" required>
        </div>
        ${errorMsg ? `<p class="admin-error">${escapeHtml(errorMsg)}</p>` : ''}
        <button type="submit" class="admin-btn"><i class="fas fa-lock"></i> Log In</button>
      </form>
    </div>
  `;
  const form = document.getElementById('adminLoginForm') as HTMLFormElement;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = (document.getElementById('adminEmail') as HTMLInputElement).value.trim();
    const password = (document.getElementById('adminPassword') as HTMLInputElement).value;
    try {
      await signInDonor(email, password);
      // onAuthChange handler drives the next render.
    } catch (err: any) {
      renderLogin(err?.message || 'Login failed.');
    }
  });
}

function renderNotAuthorized(): void {
  root.innerHTML = `
    <div class="admin-card">
      <h2>Not Authorized</h2>
      <p>This account isn't set up as an admin yet. Ask whoever manages the database to run the promote-to-admin SQL command for your email (see supabase/schema.sql).</p>
      <button type="button" class="admin-btn admin-btn-outline" id="adminLogoutBtn">Log Out</button>
    </div>
  `;
  document.getElementById('adminLogoutBtn')!.addEventListener('click', () => signOutDonor());
}

async function renderAdminDashboard(): Promise<void> {
  root.innerHTML = `<p class="admin-note"><i class="fas fa-spinner fa-spin"></i> Loading admin dashboard…</p>`;

  let donors: DonorProfile[] = [];
  let entries: AllocationWithDonor[] = [];
  let applications: ApplicationRecord[] = [];
  try {
    [donors, entries, applications] = await Promise.all([
      fetchAllProfiles(),
      fetchAllAllocations(),
      fetchAllApplications(),
    ]);
  } catch {
    root.innerHTML = `<p class="admin-note">Couldn't load data. Please refresh.</p>`;
    return;
  }

  const donorOptions = donors
    .map((d) => `<option value="${d.id}">${escapeHtml(d.full_name || d.email)} — ${escapeHtml(d.email)}</option>`)
    .join('');

  const rows = entries.length
    ? entries
        .map(
          (e) => `
      <tr data-id="${e.id}">
        <td>${escapeHtml(e.profiles?.full_name || e.profiles?.email || '—')}</td>
        <td>${escapeHtml(e.title)}</td>
        <td>${escapeHtml(e.category)}</td>
        <td>${formatAmount(e.amount, e.currency)}</td>
        <td>${escapeHtml(e.entry_date)}</td>
        <td><button type="button" class="admin-del-btn" data-del="${e.id}"><i class="fas fa-trash"></i></button></td>
      </tr>`
        )
        .join('')
    : `<tr><td colspan="6" class="admin-note">No entries yet.</td></tr>`;

  const appRows = applications.length
    ? applications
        .map(
          (a) => `
      <tr data-app-id="${a.id}">
        <td>${escapeHtml(a.full_name)}${a.age ? ` <span class="admin-note" style="display:inline">(${a.age})</span>` : ''}</td>
        <td>${escapeHtml(a.email)}<br>${escapeHtml(a.phone)}</td>
        <td>${escapeHtml(a.location || '—')}</td>
        <td>${escapeHtml(a.program)}</td>
        <td>
          <select class="admin-status-select" data-status-for="${a.id}">
            <option value="new" ${a.status === 'new' ? 'selected' : ''}>New</option>
            <option value="contacted" ${a.status === 'contacted' ? 'selected' : ''}>Contacted</option>
            <option value="accepted" ${a.status === 'accepted' ? 'selected' : ''}>Accepted</option>
            <option value="declined" ${a.status === 'declined' ? 'selected' : ''}>Declined</option>
          </select>
        </td>
        <td><button type="button" class="admin-del-btn" data-del-app="${a.id}"><i class="fas fa-trash"></i></button></td>
      </tr>`
        )
        .join('')
    : `<tr><td colspan="6" class="admin-note">No applications yet.</td></tr>`;

  root.innerHTML = `
    <div class="admin-header-row">
      <h1>Admin Dashboard</h1>
      <button type="button" class="admin-btn admin-btn-outline" id="adminLogoutBtn">Log Out</button>
    </div>

    <h3 class="admin-section-title" style="margin-top:0">Program Applications</h3>
    <div class="admin-panel">
      <table class="admin-table">
        <thead><tr><th>Name</th><th>Contact</th><th>Location</th><th>Program</th><th>Status</th><th></th></tr></thead>
        <tbody id="appsBody">${appRows}</tbody>
      </table>
    </div>

    <h3 class="admin-section-title">Donor Allocations</h3>
    <div class="admin-panel">
      <h3 class="admin-section-title" style="margin-top:0">Add a New Entry</h3>
      ${donors.length === 0 ? '<p class="admin-note">No donors have signed up yet. Once someone creates a donor account on the site, they\'ll appear here.</p>' : `
      <form id="adminEntryForm">
        <div class="admin-field">
          <label>Donor</label>
          <select id="entryDonor" required>${donorOptions}</select>
        </div>
        <div class="admin-row-2">
          <div class="admin-field">
            <label>Title</label>
            <input type="text" id="entryTitle" placeholder="e.g. School supplies for 20 children" required>
          </div>
          <div class="admin-field">
            <label>Category</label>
            <input type="text" id="entryCategory" placeholder="e.g. Education" value="General">
          </div>
        </div>
        <div class="admin-row-2">
          <div class="admin-field">
            <label>Amount (₦)</label>
            <input type="number" id="entryAmount" min="0" step="1">
          </div>
          <div class="admin-field">
            <label>Date</label>
            <input type="date" id="entryDate">
          </div>
        </div>
        <div class="admin-field">
          <label>Program / Event</label>
          <input type="text" id="entryProgram" placeholder="e.g. KYDEEI Cohort 1">
        </div>
        <div class="admin-field">
          <label>Description</label>
          <textarea id="entryDescription" placeholder="Short note on how this portion of the donation was used"></textarea>
        </div>
        <p class="admin-error" id="entryError" style="display:none"></p>
        <button type="submit" class="admin-btn" id="entrySubmitBtn"><i class="fas fa-plus"></i> Add Entry</button>
      </form>
      `}
    </div>

    <h3 class="admin-section-title">Recent Entries</h3>
    <div class="admin-panel">
      <table class="admin-table">
        <thead><tr><th>Donor</th><th>Title</th><th>Category</th><th>Amount</th><th>Date</th><th></th></tr></thead>
        <tbody id="entriesBody">${rows}</tbody>
      </table>
    </div>
  `;

  document.getElementById('adminLogoutBtn')!.addEventListener('click', () => signOutDonor());

  const entryForm = document.getElementById('adminEntryForm') as HTMLFormElement | null;
  entryForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('entryError') as HTMLParagraphElement;
    const submitBtn = document.getElementById('entrySubmitBtn') as HTMLButtonElement;
    errorEl.style.display = 'none';
    submitBtn.disabled = true;

    const donorId = (document.getElementById('entryDonor') as HTMLSelectElement).value;
    const title = (document.getElementById('entryTitle') as HTMLInputElement).value.trim();
    const category = (document.getElementById('entryCategory') as HTMLInputElement).value.trim() || 'General';
    const amountRaw = (document.getElementById('entryAmount') as HTMLInputElement).value;
    const dateRaw = (document.getElementById('entryDate') as HTMLInputElement).value;
    const program = (document.getElementById('entryProgram') as HTMLInputElement).value.trim();
    const description = (document.getElementById('entryDescription') as HTMLTextAreaElement).value.trim();

    try {
      await insertAllocation({
        donor_id: donorId,
        title,
        category,
        amount: amountRaw ? Number(amountRaw) : null,
        currency: 'NGN',
        program,
        entry_date: dateRaw || new Date().toISOString().slice(0, 10),
        description,
      });
      renderAdminDashboard();
    } catch (err: any) {
      submitBtn.disabled = false;
      errorEl.textContent = err?.message || 'Could not save this entry.';
      errorEl.style.display = 'block';
    }
  });

  document.getElementById('entriesBody')!.querySelectorAll<HTMLButtonElement>('[data-del]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this entry?')) return;
      try {
        await deleteAllocation(btn.dataset.del!);
        renderAdminDashboard();
      } catch {
        alert("Couldn't delete this entry.");
      }
    });
  });

  document.getElementById('appsBody')!.querySelectorAll<HTMLSelectElement>('[data-status-for]').forEach((sel) => {
    sel.addEventListener('change', async () => {
      try {
        await updateApplicationStatus(sel.dataset.statusFor!, sel.value);
      } catch {
        alert("Couldn't update status.");
      }
    });
  });

  document.getElementById('appsBody')!.querySelectorAll<HTMLButtonElement>('[data-del-app]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this application?')) return;
      try {
        await deleteApplication(btn.dataset.delApp!);
        renderAdminDashboard();
      } catch {
        alert("Couldn't delete this application.");
      }
    });
  });
}

async function boot(): Promise<void> {
  if (!isSupabaseConfigured) {
    renderNotConfigured();
    return;
  }

  onAuthChange(async (session) => {
    if (!session?.user) {
      renderLogin();
      return;
    }
    const profile = await fetchMyProfile(session.user.id);
    if (profile?.is_admin) renderAdminDashboard();
    else renderNotAuthorized();
  });

  const session = await getCurrentSession();
  if (!session?.user) {
    renderLogin();
    return;
  }
  const profile = await fetchMyProfile(session.user.id);
  if (profile?.is_admin) renderAdminDashboard();
  else renderNotAuthorized();
}

boot();
