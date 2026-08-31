/**
 * Ceylon Tea Hub - Elegant Toast Notification System
 */

class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    let existing = document.getElementById('toast-container');
    if (!existing) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
    } else {
      this.container = existing;
    }
  }

  show(message, type = 'success', duration = 3800) {
    if (!this.container) this.init();

    const toast = document.createElement('div');
    toast.className = 'toast-item';

    let iconSvg = '';
    let bgClasses = '';

    if (type === 'success') {
      bgClasses = 'bg-[#0F382A] text-white border border-[#D4AF37]/40';
      iconSvg = `<svg class="w-6 h-6 text-[#D4AF37] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    } else if (type === 'info') {
      bgClasses = 'bg-[#18181B] text-white border border-amber-500/30';
      iconSvg = `<svg class="w-6 h-6 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    } else if (type === 'error') {
      bgClasses = 'bg-rose-950 text-white border border-rose-500/40';
      iconSvg = `<svg class="w-6 h-6 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    }

    toast.className = `toast-item ${bgClasses}`;
    toast.innerHTML = `
      ${iconSvg}
      <div class="flex-1 text-sm font-medium leading-snug">${message}</div>
      <button class="text-white/60 hover:text-white transition-colors" onclick="this.parentElement.remove()">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    `;

    this.container.appendChild(toast);

    // Trigger enter animation
    setTimeout(() => {
      toast.classList.add('show');
    }, 20);

    // Auto remove
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 400);
    }, duration);
  }
}

window.toast = new ToastManager();
