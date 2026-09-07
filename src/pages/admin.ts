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
  updateApplicationBeneficiary,
  deleteApplication,
  fetchAllPledges,
  updatePledgeStatus,
  deletePledge,
  fetchOutreachRecords,
  addOutreachRecord,
  deleteOutreachRecord,
  type DonorProfile,
  type AllocationWithDonor,
  type ApplicationRecord,
  type PledgeRecord,
  type OutreachRecord,
} from '../lib/donor-auth';

const STAGE_OPTIONS = ['Applied', 'Under Review', 'Assessment', 'Shortlisted', 'Enrolled', 'Not Selected'];

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
  let pledges: PledgeRecord[] = [];
  let outreach: OutreachRecord[] = [];
  try {
    [donors, entries, applications, pledges, outreach] = await Promise.all([
      fetchAllProfiles(),
      fetchAllAllocations(),
      fetchAllApplications(),
      fetchAllPledges(),
      fetchOutreachRecords(),
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

  const appCards = applications.length
    ? applications
        .map(
          (a) => `
      <div class="admin-app-card" data-app-id="${a.id}">
        <div class="admin-app-top">
          <div>
            <h4>${escapeHtml(a.full_name)}${a.age ? ` <span class="admin-app-age">(${a.age})</span>` : ''}</h4>
            <p class="admin-app-meta">${escapeHtml(a.email)} &middot; ${escapeHtml(a.phone)} &middot; ${escapeHtml(a.location || '—')}</p>
            <p class="admin-app-meta">${escapeHtml(a.program)}</p>
          </div>
          <div class="admin-app-actions">
            <span class="admin-code-chip" title="Status code the applicant uses to check progress">${escapeHtml(a.access_code)}</span>
            <button type="button" class="admin-del-btn" data-del-app="${a.id}"><i class="fas fa-trash"></i></button>
          </div>
        </div>
        <div class="admin-row-2">
          <div class="admin-field">
            <label>Internal Status</label>
            <select class="admin-status-select" data-status-for="${a.id}">
              <option value="new" ${a.status === 'new' ? 'selected' : ''}>New</option>
              <option value="contacted" ${a.status === 'contacted' ? 'selected' : ''}>Contacted</option>
              <option value="accepted" ${a.status === 'accepted' ? 'selected' : ''}>Accepted</option>
              <option value="declined" ${a.status === 'declined' ? 'selected' : ''}>Declined</option>
            </select>
          </div>
          <div class="admin-field">
            <label>Stage (visible to applicant)</label>
            <select data-stage-for="${a.id}">
              ${STAGE_OPTIONS.map((s) => `<option value="${s}" ${a.stage === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="admin-field">
          <label>Score (optional, visible to applicant)</label>
          <input type="number" step="any" data-score-for="${a.id}" value="${a.score ?? ''}">
        </div>
        <div class="admin-field">
          <label>Note to applicant (optional)</label>
          <textarea data-notes-for="${a.id}" placeholder="e.g. Congratulations, you've been shortlisted for the next round.">${escapeHtml(a.beneficiary_notes || '')}</textarea>
        </div>
        <p class="admin-error" data-beneficiary-error="${a.id}" style="display:none"></p>
        <button type="button" class="admin-btn admin-btn-outline" data-save-beneficiary="${a.id}"><i class="fas fa-check"></i> Save Status Update</button>
      </div>`
        )
        .join('')
    : `<p class="admin-note">No applications yet.</p>`;

  const pledgeRows = pledges.length
    ? pledges
        .map(
          (p) => `
      <tr data-pledge-id="${p.id}">
        <td>${escapeHtml(p.full_name)}<br><span class="admin-app-meta">${escapeHtml(p.email)}</span></td>
        <td>${formatAmount(p.amount, p.currency)}</td>
        <td>${escapeHtml(p.created_at.slice(0, 10))}</td>
        <td>
          <select class="admin-status-select" data-pledge-status-for="${p.id}">
            <option value="pending" ${p.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="confirmed" ${p.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
          </select>
        </td>
        <td><button type="button" class="admin-del-btn" data-del-pledge="${p.id}"><i class="fas fa-trash"></i></button></td>
      </tr>`
        )
        .join('')
    : `<tr><td colspan="5" class="admin-note">No donations reported yet.</td></tr>`;

  const outreachBatches = new Map<string, OutreachRecord[]>();
  outreach.forEach((r) => {
    const list = outreachBatches.get(r.outreach_no) || [];
    list.push(r);
    outreachBatches.set(r.outreach_no, list);
  });

  const outreachNoOptions = Array.from(outreachBatches.keys())
    .map((n) => `<option value="${escapeHtml(n)}">`)
    .join('');

  const outreachGroupsHtml = outreachBatches.size
    ? Array.from(outreachBatches.entries())
        .map(([no, records]) => {
          const bodyRows = records
            .map(
              (r, i) => `
        <tr data-outreach-id="${r.id}">
          <td>${i + 1}</td>
          <td>${escapeHtml(r.entry_date || '—')}</td>
          <td>${escapeHtml(r.surname)}</td>
          <td>${escapeHtml(r.other_names || '—')}</td>
          <td>${escapeHtml(r.date_of_birth || '—')}</td>
          <td>${escapeHtml(r.sex || '—')}</td>
          <td>${r.age ?? '—'}</td>
          <td>${escapeHtml(r.phone || '—')}</td>
          <td>${escapeHtml(r.occupation || '—')}</td>
          <td>${escapeHtml(r.address || '—')}</td>
          <td>${escapeHtml(r.next_of_kin || '—')}</td>
          <td>${escapeHtml(r.next_of_kin_address || '—')}</td>
          <td><button type="button" class="admin-del-btn" data-del-outreach="${r.id}"><i class="fas fa-trash"></i></button></td>
        </tr>`
            )
            .join('');

          return `
      <h3 class="admin-section-title">Outreach No: ${escapeHtml(no)} <span class="admin-app-meta">(${records.length} attendee${records.length === 1 ? '' : 's'})</span></h3>
      <div class="admin-panel">
        <div class="admin-export-row">
          <button type="button" class="admin-btn admin-btn-outline" data-export-excel="${escapeHtml(no)}"><i class="fas fa-file-excel"></i> Export Excel</button>
          <button type="button" class="admin-btn admin-btn-outline" data-export-word="${escapeHtml(no)}"><i class="fas fa-file-word"></i> Export Word</button>
          <button type="button" class="admin-btn admin-btn-outline" data-export-pdf="${escapeHtml(no)}"><i class="fas fa-file-pdf"></i> Export PDF</button>
        </div>
        <div class="admin-table-scroll">
          <table class="admin-table admin-table-wide">
            <thead>
              <tr>
                <th>S/NO</th><th>Date</th><th>Surname</th><th>Other Names</th><th>DOB</th><th>Sex</th><th>Age</th>
                <th>Phone No.</th><th>Occupation</th><th>Address</th><th>Next of Kin</th><th>Next of Kin Address</th><th></th>
              </tr>
            </thead>
            <tbody>${bodyRows}</tbody>
          </table>
        </div>
      </div>`;
        })
        .join('')
    : '';

  root.innerHTML = `
    <div class="admin-header-row">
      <h1>Admin Dashboard</h1>
      <button type="button" class="admin-btn admin-btn-outline" id="adminLogoutBtn">Log Out</button>
    </div>

    <h3 class="admin-section-title" style="margin-top:0">Program Applications</h3>
    <div class="admin-panel" id="appsPanel">${appCards}</div>

    <h3 class="admin-section-title">Donation Pledges</h3>
    <div class="admin-panel">
      <p class="admin-note" style="padding:0 0 16px;text-align:left">Recorded automatically when someone submits the bank-transfer donate form. Mark as Confirmed once you've verified the transfer.</p>
      <table class="admin-table">
        <thead><tr><th>Donor</th><th>Amount</th><th>Date</th><th>Status</th><th></th></tr></thead>
        <tbody id="pledgesBody">${pledgeRows}</tbody>
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

    <h3 class="admin-section-title">Outreach Attendance Register</h3>
    <div class="admin-panel">
      <h3 class="admin-section-title" style="margin-top:0">Add Attendee</h3>
      <form id="outreachForm">
        <div class="admin-row-2">
          <div class="admin-field">
            <label>Outreach No.</label>
            <input type="text" id="outNo" list="outreachNoList" placeholder="e.g. OR-2026-01" required>
            <datalist id="outreachNoList">${outreachNoOptions}</datalist>
          </div>
          <div class="admin-field">
            <label>Date</label>
            <input type="date" id="outDate">
          </div>
        </div>
        <div class="admin-row-2">
          <div class="admin-field"><label>Surname</label><input type="text" id="outSurname" required></div>
          <div class="admin-field"><label>Other Names</label><input type="text" id="outOtherNames"></div>
        </div>
        <div class="admin-row-2">
          <div class="admin-field"><label>Date of Birth</label><input type="date" id="outDob"></div>
          <div class="admin-field">
            <label>Sex</label>
            <select id="outSex"><option value="">—</option><option value="Male">Male</option><option value="Female">Female</option></select>
          </div>
        </div>
        <div class="admin-row-2">
          <div class="admin-field"><label>Age</label><input type="number" id="outAge" min="0"></div>
          <div class="admin-field"><label>Phone No.</label><input type="tel" id="outPhone"></div>
        </div>
        <div class="admin-row-2">
          <div class="admin-field"><label>Occupation</label><input type="text" id="outOccupation"></div>
          <div class="admin-field"><label>Address</label><input type="text" id="outAddress"></div>
        </div>
        <div class="admin-row-2">
          <div class="admin-field"><label>Next of Kin</label><input type="text" id="outKin"></div>
          <div class="admin-field"><label>Next of Kin Address</label><input type="text" id="outKinAddress"></div>
        </div>
        <p class="admin-error" id="outError" style="display:none"></p>
        <button type="submit" class="admin-btn" id="outSubmitBtn"><i class="fas fa-plus"></i> Add Attendee</button>
      </form>
    </div>

    ${outreachGroupsHtml || '<div class="admin-panel"><p class="admin-note">No outreach attendance recorded yet.</p></div>'}
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

  const appsPanel = document.getElementById('appsPanel')!;

  appsPanel.querySelectorAll<HTMLSelectElement>('[data-status-for]').forEach((sel) => {
    sel.addEventListener('change', async () => {
      try {
        await updateApplicationStatus(sel.dataset.statusFor!, sel.value);
      } catch {
        alert("Couldn't update status.");
      }
    });
  });

  appsPanel.querySelectorAll<HTMLButtonElement>('[data-del-app]').forEach((btn) => {
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

  appsPanel.querySelectorAll<HTMLButtonElement>('[data-save-beneficiary]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.saveBeneficiary!;
      const stageSel = appsPanel.querySelector<HTMLSelectElement>(`[data-stage-for="${id}"]`)!;
      const scoreInput = appsPanel.querySelector<HTMLInputElement>(`[data-score-for="${id}"]`)!;
      const notesInput = appsPanel.querySelector<HTMLTextAreaElement>(`[data-notes-for="${id}"]`)!;
      const errorEl = appsPanel.querySelector<HTMLParagraphElement>(`[data-beneficiary-error="${id}"]`)!;
      errorEl.style.display = 'none';
      btn.disabled = true;

      try {
        await updateApplicationBeneficiary(id, {
          stage: stageSel.value,
          score: scoreInput.value ? Number(scoreInput.value) : null,
          beneficiary_notes: notesInput.value.trim(),
        });
        btn.innerHTML = '<i class="fas fa-check"></i> Saved';
        window.setTimeout(() => {
          btn.innerHTML = '<i class="fas fa-check"></i> Save Status Update';
          btn.disabled = false;
        }, 1500);
      } catch {
        btn.disabled = false;
        errorEl.textContent = "Couldn't save this update.";
        errorEl.style.display = 'block';
      }
    });
  });

  const pledgesBody = document.getElementById('pledgesBody');
  if (pledgesBody) {
    pledgesBody.querySelectorAll<HTMLSelectElement>('[data-pledge-status-for]').forEach((sel) => {
      sel.addEventListener('change', async () => {
        try {
          await updatePledgeStatus(sel.dataset.pledgeStatusFor!, sel.value);
        } catch {
          alert("Couldn't update status.");
        }
      });
    });

    pledgesBody.querySelectorAll<HTMLButtonElement>('[data-del-pledge]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this donation record?')) return;
        try {
          await deletePledge(btn.dataset.delPledge!);
          renderAdminDashboard();
        } catch {
          alert("Couldn't delete this record.");
        }
      });
    });
  }

  const outreachForm = document.getElementById('outreachForm') as HTMLFormElement | null;
  outreachForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('outError') as HTMLParagraphElement;
    const submitBtn = document.getElementById('outSubmitBtn') as HTMLButtonElement;
    errorEl.style.display = 'none';
    submitBtn.disabled = true;

    const outreachNo = (document.getElementById('outNo') as HTMLInputElement).value.trim();
    const entryDate = (document.getElementById('outDate') as HTMLInputElement).value;
    const surname = (document.getElementById('outSurname') as HTMLInputElement).value.trim();
    const otherNames = (document.getElementById('outOtherNames') as HTMLInputElement).value.trim();
    const dob = (document.getElementById('outDob') as HTMLInputElement).value;
    const sex = (document.getElementById('outSex') as HTMLSelectElement).value;
    const ageRaw = (document.getElementById('outAge') as HTMLInputElement).value;
    const phone = (document.getElementById('outPhone') as HTMLInputElement).value.trim();
    const occupation = (document.getElementById('outOccupation') as HTMLInputElement).value.trim();
    const address = (document.getElementById('outAddress') as HTMLInputElement).value.trim();
    const nextOfKin = (document.getElementById('outKin') as HTMLInputElement).value.trim();
    const nextOfKinAddress = (document.getElementById('outKinAddress') as HTMLInputElement).value.trim();

    try {
      await addOutreachRecord({
        outreach_no: outreachNo,
        entry_date: entryDate || new Date().toISOString().slice(0, 10),
        surname,
        other_names: otherNames,
        date_of_birth: dob || null,
        sex,
        age: ageRaw ? Number(ageRaw) : null,
        phone,
        occupation,
        address,
        next_of_kin: nextOfKin,
        next_of_kin_address: nextOfKinAddress,
      });
      renderAdminDashboard();
    } catch (err: any) {
      submitBtn.disabled = false;
      errorEl.textContent = err?.message || 'Could not save this attendee.';
      errorEl.style.display = 'block';
    }
  });

  root.querySelectorAll<HTMLButtonElement>('[data-del-outreach]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this attendance record?')) return;
      try {
        await deleteOutreachRecord(btn.dataset.delOutreach!);
        renderAdminDashboard();
      } catch {
        alert("Couldn't delete this record.");
      }
    });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-export-excel]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const no = btn.dataset.exportExcel!;
      btn.disabled = true;
      try {
        const { exportOutreachExcel } = await import('../lib/outreach-export');
        exportOutreachExcel(outreach.filter((r) => r.outreach_no === no), no);
      } catch {
        alert("Couldn't build the Excel file.");
      } finally {
        btn.disabled = false;
      }
    });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-export-word]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const no = btn.dataset.exportWord!;
      btn.disabled = true;
      try {
        const { exportOutreachWord } = await import('../lib/outreach-export');
        await exportOutreachWord(outreach.filter((r) => r.outreach_no === no), no);
      } catch {
        alert("Couldn't build the Word document.");
      } finally {
        btn.disabled = false;
      }
    });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-export-pdf]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const no = btn.dataset.exportPdf!;
      btn.disabled = true;
      try {
        const { exportOutreachPdf } = await import('../lib/outreach-export');
        await exportOutreachPdf(outreach.filter((r) => r.outreach_no === no), no);
      } catch {
        alert("Couldn't build the PDF.");
      } finally {
        btn.disabled = false;
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
