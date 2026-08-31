/**
 * Ceylon Tea Hub - Wishlist Storage & Interaction
 */

class WishlistManager {
  constructor() {
    this.wishlist = JSON.parse(localStorage.getItem('ceylon_wishlist')) || [];
  }

  getItems() {
    return this.wishlist;
  }

  isWishlisted(productId) {
    return this.wishlist.includes(productId);
  }

  toggle(productId) {
    const idx = this.wishlist.indexOf(productId);
    let added = false;
    if (idx > -1) {
      this.wishlist.splice(idx, 1);
      if (window.toast) window.toast.show("Removed from your Tea Wishlist", "info");
    } else {
      this.wishlist.push(productId);
      added = true;
      if (window.toast) window.toast.show("Added to your Tea Wishlist!", "success");
    }
    this.save();
    this.updateUI();
    return added;
  }

  save() {
    localStorage.setItem('ceylon_wishlist', JSON.stringify(this.wishlist));
    window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { wishlist: this.wishlist } }));
  }

  updateUI() {
    // Update badge count
    const badges = document.querySelectorAll('.wishlist-count-badge');
    badges.forEach(b => {
      b.textContent = this.wishlist.length;
      if (this.wishlist.length > 0) {
        b.classList.remove('hidden');
      } else {
        b.classList.add('hidden');
      }
    });

    // Update wishlist buttons heart states
    const buttons = document.querySelectorAll('[data-wishlist-btn]');
    buttons.forEach(btn => {
      const id = btn.getAttribute('data-wishlist-btn');
      const isSaved = this.isWishlisted(id);
      const svg = btn.querySelector('svg');
      if (svg) {
        if (isSaved) {
          svg.setAttribute('fill', '#E11D48');
          svg.setAttribute('stroke', '#E11D48');
          btn.classList.add('text-rose-600');
        } else {
          svg.setAttribute('fill', 'none');
          svg.setAttribute('stroke', 'currentColor');
          btn.classList.remove('text-rose-600');
        }
      }
    });
  }

  init() {
    this.updateUI();

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-wishlist-btn]');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.getAttribute('data-wishlist-btn');
        this.toggle(id);
      }
    });
  }
}

window.wishlistManager = new WishlistManager();

document.addEventListener('DOMContentLoaded', () => {
  window.wishlistManager.init();
});
