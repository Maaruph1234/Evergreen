import {
  isSupabaseConfigured,
  signInDonor,
  signUpDonor,
  signOutDonor,
  getCurrentSession,
  onAuthEvent,
  fetchMyProfile,
  fetchMyAllocations,
  fetchMyPledges,
  sendPasswordReset,
  updatePassword,
  type AllocationEntry,
  type PledgeRecord,
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

function downloadStatement(name: string, email: string, allocations: AllocationEntry[], pledges: PledgeRecord[]): void {
  const lines: string[] = [];
  lines.push('EVERGREEN LIFECARE SUPPORT FOUNDATION');
  lines.push('Donor Statement');
  lines.push('='.repeat(40));
  lines.push(`Name: ${name}`);
  lines.push(`Email: ${email}`);
  lines.push(`Generated: ${new Date().toLocaleString('en-NG')}`);
  lines.push('');

  lines.push('DONATIONS SENT');
  lines.push('-'.repeat(40));
  if (pledges.length) {
    pledges.forEach((p) => {
      lines.push(`${formatDate(p.created_at)}  ${formatAmount(p.amount, p.currency)}  [${p.status}]`);
    });
  } else {
    lines.push('No donations on record yet.');
  }
  lines.push('');

  lines.push('HOW YOUR DONATIONS WERE USED');
  lines.push('-'.repeat(40));
  if (allocations.length) {
    allocations.forEach((a) => {
      lines.push(`${formatDate(a.entry_date)}  ${a.title}  (${a.category})  ${formatAmount(a.amount, a.currency)}`);
      if (a.description) lines.push(`  ${a.description}`);
    });
  } else {
    lines.push('No allocations recorded yet.');
  }
  lines.push('');
  lines.push('Thank you for supporting Evergreen Lifecare Support Foundation.');

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `evergreen-statement-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
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

  let mode: 'login' | 'signup' | 'forgot' = 'login';
  let busy = false;
  let errorMsg = '';
  let recoveryMode = window.location.hash.includes('type=recovery');

  function renderForgotForm(): void {
    card!.innerHTML = `
      <form class="donor-form" id="forgotForm">
        <h3 style="font-family:var(--serif);font-size:1.2rem;color:var(--dark);margin-bottom:8px">Reset Your Password</h3>
        <p class="donor-hint" style="margin:0 0 16px;text-align:left">Enter your account email and we'll send you a reset link.</p>
        <div class="form-field">
          <label>Email Address</label>
          <input type="email" id="forgotEmail" placeholder="you@email.com" required>
        </div>
        ${errorMsg ? `<p class="donor-error">${escapeHtml(errorMsg)}</p>` : ''}
        <button type="submit" class="submit-btn" ${busy ? 'disabled' : ''}>
          <i class="fas fa-paper-plane"></i> ${busy ? 'Sending…' : 'Send Reset Link'}
        </button>
        <p class="donor-hint"><a href="#" id="backToLogin">&larr; Back to Log In</a></p>
      </form>
    `;
    card!.querySelector<HTMLAnchorElement>('#backToLogin')!.addEventListener('click', (e) => {
      e.preventDefault();
      mode = 'login';
      errorMsg = '';
      renderAuthForm();
    });
    card!.querySelector<HTMLFormElement>('#forgotForm')!.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = card!.querySelector<HTMLInputElement>('#forgotEmail')!.value.trim();
      busy = true;
      errorMsg = '';
      renderForgotForm();
      try {
        await sendPasswordReset(email);
        card!.innerHTML = `
          <div class="donor-setup-notice">
            <i class="fas fa-envelope-open-text"></i>
            <h3>Check Your Email</h3>
            <p>If an account exists for <strong>${escapeHtml(email)}</strong>, a reset link is on its way. Follow it to set a new password.</p>
          </div>`;
      } catch (err: any) {
        busy = false;
        errorMsg = err?.message || 'Something went wrong. Please try again.';
        renderForgotForm();
      }
    });
  }

  function renderRecoveryForm(): void {
    card!.innerHTML = `
      <form class="donor-form" id="recoveryForm">
        <h3 style="font-family:var(--serif);font-size:1.2rem;color:var(--dark);margin-bottom:8px">Set a New Password</h3>
        <div class="form-field">
          <label>New Password</label>
          <input type="password" id="newPassword" placeholder="••••••••" minlength="6" required>
        </div>
        ${errorMsg ? `<p class="donor-error">${escapeHtml(errorMsg)}</p>` : ''}
        <button type="submit" class="submit-btn" ${busy ? 'disabled' : ''}>
          <i class="fas fa-key"></i> ${busy ? 'Saving…' : 'Save New Password'}
        </button>
      </form>
    `;
    card!.querySelector<HTMLFormElement>('#recoveryForm')!.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPassword = card!.querySelector<HTMLInputElement>('#newPassword')!.value;
      busy = true;
      errorMsg = '';
      renderRecoveryForm();
      try {
        await updatePassword(newPassword);
        recoveryMode = false;
        history.replaceState(null, '', window.location.pathname + window.location.search);
        const session = await getCurrentSession();
        if (session?.user) renderDashboard(session.user.id, session.user.email || '');
        else renderAuthForm();
      } catch (err: any) {
        busy = false;
        errorMsg = err?.message || "Couldn't save your new password. Please try again.";
        renderRecoveryForm();
      }
    });
  }

  function renderAuthForm(): void {
    if (mode === 'forgot') {
      renderForgotForm();
      return;
    }

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
        ${mode === 'login' ? '<p class="donor-hint"><a href="#" id="forgotLink">Forgot password?</a></p>' : ''}
      </form>
    `;

    card!.querySelectorAll<HTMLButtonElement>('.donor-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        mode = btn.dataset.mode === 'signup' ? 'signup' : 'login';
        errorMsg = '';
        renderAuthForm();
      });
    });

    card!.querySelector<HTMLAnchorElement>('#forgotLink')?.addEventListener('click', (e) => {
      e.preventDefault();
      mode = 'forgot';
      errorMsg = '';
      renderAuthForm();
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
          // onAuthEvent listener below will render the dashboard.
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
      const [profile, allocations, pledges] = await Promise.all([
        fetchMyProfile(userId),
        fetchMyAllocations(userId),
        fetchMyPledges().catch(() => [] as PledgeRecord[]),
      ]);
      const name = profile?.full_name || email;
      const total = allocations.reduce((sum, a) => sum + (a.amount || 0), 0);
      const currency = allocations[0]?.currency || pledges[0]?.currency || 'NGN';

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

      // Breakdown by category, largest first.
      const byCategory = new Map<string, number>();
      allocations.forEach((a) => {
        byCategory.set(a.category, (byCategory.get(a.category) || 0) + (a.amount || 0));
      });
      const breakdown = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);
      const breakdownHtml = breakdown.length
        ? breakdown
            .map(([cat, amt]) => {
              const pct = total > 0 ? Math.round((amt / total) * 100) : 0;
              return `
          <div class="donor-breakdown-row">
            <div class="donor-breakdown-label"><span>${escapeHtml(cat)}</span><span>${formatAmount(amt, currency)}</span></div>
            <div class="donor-breakdown-bar"><div class="donor-breakdown-fill" style="width:${pct}%"></div></div>
          </div>`;
            })
            .join('')
        : '';

      const pledgeRows = pledges.length
        ? pledges
            .map(
              (p) => `
          <div class="donor-pledge-row">
            <span>${formatDate(p.created_at)}</span>
            <span>${formatAmount(p.amount, p.currency)}</span>
            <span class="pledge-status pledge-${p.status}">${escapeHtml(p.status)}</span>
          </div>`
            )
            .join('')
        : `<p class="donor-empty">No donations recorded yet.</p>`;

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
            <strong>${formatAmount(total || null, currency)}</strong>
          </div>

          ${breakdownHtml ? `<h4 class="donor-subheading">By Category</h4><div class="donor-breakdown">${breakdownHtml}</div>` : ''}

          <h4 class="donor-subheading">Donations Sent</h4>
          <div class="donor-pledges">${pledgeRows}</div>

          <h4 class="donor-subheading">How It Was Used</h4>
          <div class="donor-entries">${rows}</div>

          <button type="button" class="donor-logout" id="donorStatementBtn" style="width:100%;justify-content:center;margin-top:18px">
            <i class="fas fa-file-arrow-down"></i> Download Statement
          </button>
        </div>
      `;
      card!.querySelector<HTMLButtonElement>('#donorLogout')!.addEventListener('click', async () => {
        await signOutDonor();
      });
      card!.querySelector<HTMLButtonElement>('#donorStatementBtn')!.addEventListener('click', () => {
        downloadStatement(name, email, allocations, pledges);
      });
    } catch {
      card!.innerHTML = `<p class="donor-error">Couldn't load your dashboard right now. Please refresh and try again.</p>`;
    }
  }

  onAuthEvent((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      recoveryMode = true;
      renderRecoveryForm();
      return;
    }
    if (recoveryMode) return;
    if (session?.user) {
      renderDashboard(session.user.id, session.user.email || '');
    } else {
      mode = 'login';
      errorMsg = '';
      renderAuthForm();
    }
  });

  if (recoveryMode) {
    renderRecoveryForm();
    return;
  }

  getCurrentSession().then((session) => {
    if (recoveryMode) return;
    if (session?.user) renderDashboard(session.user.id, session.user.email || '');
    else renderAuthForm();
  });
}
