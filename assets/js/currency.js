/**
 * Ceylon Tea Hub - Global Multi-Currency Conversion Engine
 */

const CURRENCY_DATA = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)', flag: '🇺🇸', decimals: 2 },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)', flag: '🇪🇺', decimals: 2 },
  GBP: { symbol: '£', rate: 0.79, label: 'GBP (£)', flag: '🇬🇧', decimals: 2 },
  AUD: { symbol: 'A$', rate: 1.52, label: 'AUD (A$)', flag: '🇦🇺', decimals: 2 },
  CAD: { symbol: 'C$', rate: 1.36, label: 'CAD (C$)', flag: '🇨🇦', decimals: 2 },
  JPY: { symbol: '¥', rate: 154.5, label: 'JPY (¥)', flag: '🇯🇵', decimals: 0 },
  AED: { symbol: 'AED ', rate: 3.67, label: 'AED (د.إ)', flag: '🇦🇪', decimals: 2 },
  LKR: { symbol: 'Rs. ', rate: 305.0, label: 'LKR (Rs)', flag: '🇱🇰', decimals: 0 },
  SGD: { symbol: 'S$', rate: 1.34, label: 'SGD (S$)', flag: '🇸🇬', decimals: 2 }
};

class CurrencyManager {
  constructor() {
    this.currentCurrency = localStorage.getItem('ceylon_currency') || 'USD';
    if (!CURRENCY_DATA[this.currentCurrency]) {
      this.currentCurrency = 'USD';
    }
  }

  getCurrency() {
    return this.currentCurrency;
  }

  getCurrencyInfo() {
    return CURRENCY_DATA[this.currentCurrency];
  }

  setCurrency(code) {
    if (CURRENCY_DATA[code]) {
      this.currentCurrency = code;
      localStorage.setItem('ceylon_currency', code);
      this.updateDOM();
      window.dispatchEvent(new CustomEvent('currencyChanged', { detail: { currency: code } }));
    }
  }

  convert(amountUSD) {
    const info = CURRENCY_DATA[this.currentCurrency];
    return amountUSD * info.rate;
  }

  format(amountUSD) {
    if (amountUSD === undefined || amountUSD === null || isNaN(amountUSD)) return '$0.00';
    const info = CURRENCY_DATA[this.currentCurrency];
    const converted = amountUSD * info.rate;
    
    if (info.decimals === 0) {
      return `${info.symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${info.symbol}${converted.toFixed(2)}`;
  }

  updateDOM() {
    // Update all elements with data-price-usd
    const priceElements = document.querySelectorAll('[data-price-usd]');
    priceElements.forEach(el => {
      const usd = parseFloat(el.getAttribute('data-price-usd'));
      if (!isNaN(usd)) {
        el.textContent = this.format(usd);
      }
    });

    // Update active currency selector indicators
    const currentCodeSpans = document.querySelectorAll('.active-currency-code');
    currentCodeSpans.forEach(span => {
      span.textContent = this.currentCurrency;
    });

    const currentFlagSpans = document.querySelectorAll('.active-currency-flag');
    currentFlagSpans.forEach(span => {
      span.textContent = CURRENCY_DATA[this.currentCurrency].flag;
    });

    const selectors = document.querySelectorAll('select.currency-dropdown');
    selectors.forEach(sel => {
      sel.value = this.currentCurrency;
    });
  }

  init() {
    this.updateDOM();
    // Bind all currency dropdowns
    document.addEventListener('change', (e) => {
      if (e.target && e.target.classList.contains('currency-dropdown')) {
        this.setCurrency(e.target.value);
      }
    });
  }
}

// Global instance
window.currencyManager = new CurrencyManager();

document.addEventListener('DOMContentLoaded', () => {
  window.currencyManager.init();
});
