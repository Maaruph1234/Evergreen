import '../styles/apply.css';

import { initMobileMenu } from '../lib/menu';
import { initScrollTop } from '../lib/scrollTop';
import { initReveal } from '../lib/reveal';
import { isSupabaseConfigured, submitApplication } from '../lib/donor-auth';

initMobileMenu();
initScrollTop();
initReveal();

const card = document.getElementById('applyCard');

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function renderForm(): void {
  if (!card) return;
  card.innerHTML = `
    <h3>Application Form</h3>
    <p>Takes about 3 minutes. We'll follow up by email or phone with next steps.</p>
    <form id="applyForm">
      <div class="form-row">
        <div class="form-field"><label>Full Name *</label><input type="text" id="appName" placeholder="Aminu Muhammad" required></div>
        <div class="form-field"><label>Age *</label><input type="number" id="appAge" min="16" max="35" placeholder="22" required></div>
      </div>
      <div class="form-row">
        <div class="form-field"><label>Email *</label><input type="email" id="appEmail" placeholder="you@email.com" required></div>
        <div class="form-field"><label>Phone *</label><input type="tel" id="appPhone" placeholder="+234 912 979 7010" required></div>
      </div>
      <div class="form-field">
        <label>Location *</label>
        <input type="text" id="appLocation" placeholder="e.g. Birnin Kebbi, Kebbi State" required>
      </div>
      <div class="form-field">
        <label>Have you done any tech training before?</label>
        <textarea id="appExperience" placeholder="e.g. None, or briefly describe what you've learned/done"></textarea>
      </div>
      <div class="form-field">
        <label>Why do you want to join this cohort? *</label>
        <textarea id="appMotivation" placeholder="Tell us a bit about your goals" required></textarea>
      </div>
      <p class="apply-error" id="appError" style="display:none"></p>
      <button type="submit" class="submit-btn" id="appSubmitBtn"><i class="fas fa-paper-plane"></i> Submit Application</button>
      <p class="form-note"><i class="fas fa-lock" style="color:var(--green)"></i> Your information is kept private and only used to process your application.</p>
    </form>
  `;

  const form = document.getElementById('applyForm') as HTMLFormElement;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('appError') as HTMLParagraphElement;
    const submitBtn = document.getElementById('appSubmitBtn') as HTMLButtonElement;
    errorEl.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting…';

    const fullName = (document.getElementById('appName') as HTMLInputElement).value.trim();
    const ageRaw = (document.getElementById('appAge') as HTMLInputElement).value;
    const email = (document.getElementById('appEmail') as HTMLInputElement).value.trim();
    const phone = (document.getElementById('appPhone') as HTMLInputElement).value.trim();
    const location = (document.getElementById('appLocation') as HTMLInputElement).value.trim();
    const experience = (document.getElementById('appExperience') as HTMLTextAreaElement).value.trim();
    const motivation = (document.getElementById('appMotivation') as HTMLTextAreaElement).value.trim();

    try {
      await submitApplication({
        program: 'KYDEEI Cohort — September 21–30, 2026',
        full_name: fullName,
        email,
        phone,
        age: ageRaw ? Number(ageRaw) : null,
        location,
        experience,
        motivation,
      });
      if (!card) return;
      card.innerHTML = `
        <div class="apply-success">
          <i class="fas fa-circle-check"></i>
          <h3>Application Received</h3>
          <p>Thanks, ${escapeHtml(fullName || 'friend')} — we've got your application for KYDEEI Cohort. Our team will reach out at <strong>${escapeHtml(email)}</strong> or <strong>${escapeHtml(phone)}</strong> with next steps.</p>
        </div>
      `;
    } catch (err: any) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Application';
      errorEl.textContent = err?.message || 'Something went wrong submitting your application. Please try again, or message us on WhatsApp.';
      errorEl.style.display = 'block';
    }
  });
}

function renderNotConfigured(): void {
  if (!card) return;
  card.innerHTML = `
    <div class="apply-setup-notice">
      <i class="fas fa-tools"></i>
      <h3>Applications Almost Ready</h3>
      <p>This form is built and ready to go live — it just needs to be connected to our secure database. In the meantime, please message us on WhatsApp to apply and we'll get you registered directly.</p>
    </div>
  `;
}

if (isSupabaseConfigured) renderForm();
else renderNotConfigured();
