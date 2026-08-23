import { isSupabaseConfigured, fetchBeneficiaryByCode, type BeneficiaryRecord } from './donor-auth';

const STORAGE_KEY = 'evgBeneficiaryCode';

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

function stageClass(stage: string): string {
  const s = stage.toLowerCase();
  if (s.includes('enroll')) return 'stage-success';
  if (s.includes('shortlist')) return 'stage-good';
  if (s.includes('not selected') || s.includes('declined')) return 'stage-closed';
  if (s.includes('assessment')) return 'stage-pending';
  if (s.includes('review')) return 'stage-pending';
  return 'stage-neutral';
}

/** Renders the code-entry form, or the beneficiary's status dashboard once found. */
export function initBeneficiaryPortal(): void {
  const card = document.getElementById('beneficiaryCard');
  if (!card) return;

  if (!isSupabaseConfigured) {
    card.innerHTML = `
      <div class="donor-setup-notice">
        <i class="fas fa-tools"></i>
        <h3>Status Portal — Almost Ready</h3>
        <p>This is built and ready to go live. It just needs to be connected to our secure database. If you've applied to a program and want an update in the meantime, please reach us on WhatsApp.</p>
      </div>
    `;
    return;
  }

  let busy = false;
  let errorMsg = '';

  function renderCodeForm(): void {
    card!.innerHTML = `
      <form class="donor-form" id="beneficiaryForm">
        <div class="form-field">
          <label>Your Status Code</label>
          <input type="text" id="beneficiaryCode" placeholder="e.g. A1B2C3D4" maxlength="8" autocapitalize="characters" required>
        </div>
        ${errorMsg ? `<p class="donor-error">${escapeHtml(errorMsg)}</p>` : ''}
        <button type="submit" class="submit-btn" ${busy ? 'disabled' : ''}>
          <i class="fas fa-magnifying-glass"></i> ${busy ? 'Checking…' : 'Check Status'}
        </button>
        <p class="donor-hint">You received this code after applying to a program (e.g. KYDEEI Cohort).</p>
      </form>
    `;

    const input = card!.querySelector<HTMLInputElement>('#beneficiaryCode')!;
    input.addEventListener('input', () => {
      input.value = input.value.toUpperCase();
    });

    const form = card!.querySelector<HTMLFormElement>('#beneficiaryForm')!;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = input.value.trim();
      if (!code) return;

      busy = true;
      errorMsg = '';
      renderCodeForm();

      try {
        const record = await fetchBeneficiaryByCode(code);
        if (!record) {
          busy = false;
          errorMsg = "That code doesn't match any application. Double-check it and try again.";
          renderCodeForm();
          return;
        }
        sessionStorage.setItem(STORAGE_KEY, code);
        renderDashboard(record, code);
      } catch {
        busy = false;
        errorMsg = 'Something went wrong looking that up. Please try again.';
        renderCodeForm();
      }
    });
  }

  function renderDashboard(record: BeneficiaryRecord, code: string): void {
    const enrolled = record.stage.toLowerCase().includes('enroll');

    card!.innerHTML = `
      <div class="donor-dashboard">
        <div class="donor-dash-header">
          <div>
            <div class="section-tag" style="margin-bottom:6px">${escapeHtml(record.program)}</div>
            <h3>${escapeHtml(record.full_name)}</h3>
          </div>
          <button type="button" class="donor-logout" id="beneficiaryReset"><i class="fas fa-rotate-left"></i> Check Another Code</button>
        </div>

        ${enrolled ? `
        <div class="beneficiary-enrolled-banner">
          <i class="fas fa-graduation-cap"></i>
          <div>
            <h4>You're Enrolled!</h4>
            <p>Welcome to the program — our team will reach out with the next steps. Keep an eye on your email and phone.</p>
          </div>
        </div>` : ''}

        <div class="beneficiary-stage-row">
          <span class="stage-badge ${stageClass(record.stage)}">${escapeHtml(record.stage)}</span>
        </div>

        <h4 class="donor-subheading">Assessment Results</h4>
        ${record.score !== null
          ? `<div class="beneficiary-score-card"><span>Your Score</span><strong>${escapeHtml(String(record.score))}</strong></div>`
          : `<p class="donor-hint" style="text-align:left;margin:0 0 8px">Not yet assessed — check back after your assessment stage.</p>`}

        ${record.beneficiary_notes ? `
        <h4 class="donor-subheading">Message From Our Team</h4>
        <p class="beneficiary-notes"><i class="fas fa-message"></i> ${escapeHtml(record.beneficiary_notes)}</p>` : ''}

        <div class="beneficiary-code-reminder">
          <div>
            <span>Your Status Code</span>
            <strong id="beneficiaryCodeValue">${escapeHtml(code)}</strong>
          </div>
          <button type="button" class="beneficiary-copy-btn" id="beneficiaryCopyBtn"><i class="fas fa-copy"></i> Copy</button>
        </div>
        <p class="donor-hint">Keep this code safe — save it in your phone or write it down. You'll need it every time you come back to check your status.</p>

        <p class="donor-hint" style="margin-top:8px">Applied ${formatDate(record.created_at)}</p>
      </div>
    `;
    card!.querySelector<HTMLButtonElement>('#beneficiaryReset')!.addEventListener('click', () => {
      sessionStorage.removeItem(STORAGE_KEY);
      errorMsg = '';
      renderCodeForm();
    });
    const copyBtn = card!.querySelector<HTMLButtonElement>('#beneficiaryCopyBtn')!;
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code);
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied';
        window.setTimeout(() => {
          copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
        }, 1500);
      } catch {
        copyBtn.innerHTML = '<i class="fas fa-xmark"></i> Select & Copy Manually';
      }
    });
  }

  const savedCode = sessionStorage.getItem(STORAGE_KEY);
  if (savedCode) {
    fetchBeneficiaryByCode(savedCode)
      .then((record) => {
        if (record) renderDashboard(record, savedCode);
        else renderCodeForm();
      })
      .catch(() => renderCodeForm());
  } else {
    renderCodeForm();
  }
}
