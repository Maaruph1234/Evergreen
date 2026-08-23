import {
  isSupabaseConfigured,
  signInDonor,
  signUpDonor,
  signOutDonor,
  getCurrentSession,
  onAuthChange,
  fetchMyProfile,
  fetchMyAllocations,
  type AllocationEntry,
} from './donor-auth';

function formatAmount(amount: number | null, currency: string): string {
  if (amount === null) return '—';
  const symbol = currency === 'NGN' ? '₦' : currency + ' ';
  return symbol + amount.toLocaleString('en-NG');
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

/** Renders the donor login/signup card, or the dashboard once logged in. */
export function initDonorPortal(): void {
  const card = document.getElementById('donorCard');
  if (!card) return;

  if (!isSupabaseConfigured) {
    card.innerHTML = `
      <div class="donor-setup-notice">
        <i class="fas fa-tools"></i>
        <h3>Donor Portal — Almost Ready</h3>
        <p>The donor dashboard is built and ready to go live. It just needs to be connected to our secure database. If you're a donor and would like an update on your contribution in the meantime, please reach us on WhatsApp.</p>
      </div>
    `;
    return;
  }

  let mode: 'login' | 'signup' = 'login';
  let busy = false;
  let errorMsg = '';

  function renderAuthForm(): void {
    card!.innerHTML = `
      <div class="donor-tabs">
        <button type="button" class="donor-tab ${mode === 'login' ? 'active' : ''}" data-mode="login">Log In</button>
        <button type="button" class="donor-tab ${mode === 'signup' ? 'active' : ''}" data-mode="signup">Create Account</button>
      </div>
      <form class="donor-form" id="donorForm">
        ${mode === 'signup' ? `
        <div class="form-field">
          <label>Full Name</label>
          <input type="text" id="donorName" placeholder="Your name" required>
        </div>` : ''}
        <div class="form-field">
          <label>Email Address</label>
          <input type="email" id="donorEmail" placeholder="you@email.com" required>
        </div>
        <div class="form-field">
          <label>Password</label>
          <input type="password" id="donorPassword" placeholder="••••••••" minlength="6" required>
        </div>
        ${errorMsg ? `<p class="donor-error">${escapeHtml(errorMsg)}</p>` : ''}
        <button type="submit" class="submit-btn" ${busy ? 'disabled' : ''}>
          <i class="fas fa-user-lock"></i> ${busy ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
        </button>
        <p class="donor-hint">${mode === 'login' ? "New donor? Switch to \"Create Account\" above." : 'Already have an account? Switch to "Log In" above.'}</p>
      </form>
    `;

    card!.querySelectorAll<HTMLButtonElement>('.donor-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        mode = btn.dataset.mode === 'signup' ? 'signup' : 'login';
        errorMsg = '';
        renderAuthForm();
      });
    });

    const form = card!.querySelector<HTMLFormElement>('#donorForm')!;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (card!.querySelector<HTMLInputElement>('#donorEmail')!).value.trim();
      const password = card!.querySelector<HTMLInputElement>('#donorPassword')!.value;
      const nameInput = card!.querySelector<HTMLInputElement>('#donorName');

      busy = true;
      errorMsg = '';
      renderAuthForm();

      try {
        if (mode === 'signup') {
          await signUpDonor(email, password, nameInput?.value.trim() ?? '');
          errorMsg = '';
          card!.innerHTML = `
            <div class="donor-setup-notice">
              <i class="fas fa-envelope-open-text"></i>
              <h3>Check Your Email</h3>
              <p>We've sent a confirmation link to <strong>${escapeHtml(email)}</strong>. Confirm your email, then log in here to see your dashboard.</p>
            </div>`;
          return;
        } else {
          await signInDonor(email, password);
          // onAuthChange listener below will render the dashboard.
        }
      } catch (err: any) {
        busy = false;
        errorMsg = err?.message || 'Something went wrong. Please try again.';
        renderAuthForm();
      }
    });
  }

  async function renderDashboard(userId: string, email: string): Promise<void> {
    card!.innerHTML = `<div class="donor-loading"><i class="fas fa-spinner fa-spin"></i> Loading your dashboard…</div>`;
    try {
      const [profile, allocations] = await Promise.all([
        fetchMyProfile(userId),
        fetchMyAllocations(userId),
      ]);
      const name = profile?.full_name || email;
      const total = allocations.reduce((sum, a) => sum + (a.amount || 0), 0);

      const rows = allocations.length
        ? allocations
            .map(
              (a: AllocationEntry) => `
          <div class="donor-entry">
            <div class="donor-entry-top">
              <span class="donor-entry-cat">${escapeHtml(a.category)}</span>
              <span class="donor-entry-date">${formatDate(a.entry_date)}</span>
            </div>
            <h4>${escapeHtml(a.title)}</h4>
            ${a.program ? `<p class="donor-entry-program"><i class="fas fa-layer-group"></i> ${escapeHtml(a.program)}</p>` : ''}
            ${a.description ? `<p class="donor-entry-desc">${escapeHtml(a.description)}</p>` : ''}
            <div class="donor-entry-amount">${formatAmount(a.amount, a.currency)}</div>
          </div>`
            )
            .join('')
        : `<p class="donor-empty">No entries yet — our team logs each allocation as your donation is put to work. Check back soon.</p>`;

      card!.innerHTML = `
        <div class="donor-dashboard">
          <div class="donor-dash-header">
            <div>
              <div class="section-tag" style="margin-bottom:6px">Welcome back</div>
              <h3>${escapeHtml(name)}</h3>
            </div>
            <button type="button" class="donor-logout" id="donorLogout"><i class="fas fa-sign-out-alt"></i> Log Out</button>
          </div>
          <div class="donor-dash-total">
            <span>Total tracked for your account</span>
            <strong>${formatAmount(total || null, allocations[0]?.currency || 'NGN')}</strong>
          </div>
          <div class="donor-entries">${rows}</div>
        </div>
      `;
      card!.querySelector<HTMLButtonElement>('#donorLogout')!.addEventListener('click', async () => {
        await signOutDonor();
      });
    } catch {
      card!.innerHTML = `<p class="donor-error">Couldn't load your dashboard right now. Please refresh and try again.</p>`;
    }
  }

  onAuthChange((session) => {
    if (session?.user) {
      renderDashboard(session.user.id, session.user.email || '');
    } else {
      mode = 'login';
      errorMsg = '';
      renderAuthForm();
    }
  });

  getCurrentSession().then((session) => {
    if (session?.user) renderDashboard(session.user.id, session.user.email || '');
    else renderAuthForm();
  });
}
