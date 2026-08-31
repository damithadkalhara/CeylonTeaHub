/**
 * Ceylon Tea Hub - Global Shopping Cart & Drawer Manager
 */

class CartManager {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('ceylon_cart')) || [];
    this.appliedCoupon = JSON.parse(localStorage.getItem('ceylon_coupon')) || null;
    this.freeShippingThresholdUSD = 60.00;
  }

  getCart() {
    return this.cart;
  }

  getItemCount() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotalUSD() {
    return this.cart.reduce((total, item) => total + (item.priceUSD * item.quantity), 0);
  }

  getDiscountUSD() {
    const subtotal = this.getSubtotalUSD();
    if (this.appliedCoupon && this.appliedCoupon.code === 'CEYLON10') {
      return subtotal * 0.10;
    }
    return 0;
  }

  getShippingUSD() {
    const subtotal = this.getSubtotalUSD();
    if (subtotal === 0) return 0;
    if (this.appliedCoupon && this.appliedCoupon.code === 'FREESHIP') return 0;
    if (subtotal >= this.freeShippingThresholdUSD) return 0;
    return 9.99; // Standard International Air Shipping flat rate
  }

  getTotalUSD() {
    return Math.max(0, this.getSubtotalUSD() - this.getDiscountUSD() + this.getShippingUSD());
  }

  addItem(productId, packSizeLabel = null, quantity = 1) {
    const product = typeof getProductById === 'function' ? getProductById(productId) : null;
    if (!product) {
      console.error("Product not found: " + productId);
      return;
    }

    let selectedSize = product.packSizes ? product.packSizes[0] : { label: "Standard Pack", multiplier: 1.0 };
    if (packSizeLabel && product.packSizes) {
      const match = product.packSizes.find(p => p.label === packSizeLabel);
      if (match) selectedSize = match;
    }

    const unitPriceUSD = product.priceUSD * selectedSize.multiplier;
    const cartItemId = `${product.id}__${selectedSize.label.replace(/\s+/g, '_')}`;

    const existingIndex = this.cart.findIndex(item => item.cartItemId === cartItemId);
    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({
        cartItemId,
        productId: product.id,
        name: product.name,
        image: product.image,
        packSize: selectedSize.label,
        unitPriceUSD,
        priceUSD: unitPriceUSD,
        quantity: quantity
      });
    }

    this.save();
    this.updateUI();
    this.openDrawer();

    if (window.toast) {
      window.toast.show(`Added ${quantity}x <strong>${product.name}</strong> (${selectedSize.label}) to your bag!`, 'success');
    }
  }

  updateQuantity(cartItemId, newQty) {
    const index = this.cart.findIndex(i => i.cartItemId === cartItemId);
    if (index > -1) {
      if (newQty <= 0) {
        this.cart.splice(index, 1);
        if (window.toast) window.toast.show("Item removed from bag", "info");
      } else {
        this.cart[index].quantity = newQty;
      }
      this.save();
      this.updateUI();
    }
  }

  removeItem(cartItemId) {
    this.updateQuantity(cartItemId, 0);
  }

  clearCart() {
    this.cart = [];
    this.appliedCoupon = null;
    localStorage.removeItem('ceylon_coupon');
    this.save();
    this.updateUI();
  }

  applyCoupon(code) {
    const cleanCode = (code || '').trim().toUpperCase();
    if (cleanCode === 'CEYLON10') {
      this.appliedCoupon = { code: 'CEYLON10', discountPercent: 10, label: '10% Welcome Discount' };
      localStorage.setItem('ceylon_coupon', JSON.stringify(this.appliedCoupon));
      this.updateUI();
      if (window.toast) window.toast.show("Coupon <strong>CEYLON10</strong> applied! You saved 10%", "success");
      return { success: true, message: "10% Discount Applied" };
    } else if (cleanCode === 'FREESHIP') {
      this.appliedCoupon = { code: 'FREESHIP', freeShipping: true, label: 'Free Worldwide Air Shipping' };
      localStorage.setItem('ceylon_coupon', JSON.stringify(this.appliedCoupon));
      this.updateUI();
      if (window.toast) window.toast.show("Coupon <strong>FREESHIP</strong> applied! Free Shipping granted", "success");
      return { success: true, message: "Free Global Shipping Applied" };
    } else {
      if (window.toast) window.toast.show("Invalid coupon code. Try <strong>CEYLON10</strong> or <strong>FREESHIP</strong>", "error");
      return { success: false, message: "Invalid Coupon Code" };
    }
  }

  removeCoupon() {
    this.appliedCoupon = null;
    localStorage.removeItem('ceylon_coupon');
    this.updateUI();
    if (window.toast) window.toast.show("Coupon removed", "info");
  }

  save() {
    localStorage.setItem('ceylon_cart', JSON.stringify(this.cart));
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: this.getItemCount(), total: this.getTotalUSD() } }));
  }

  openDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-drawer-backdrop');
    const panel = document.getElementById('cart-drawer-panel');
    if (drawer && backdrop && panel) {
      drawer.classList.remove('pointer-events-none');
      backdrop.classList.remove('opacity-0');
      backdrop.classList.add('opacity-100');
      panel.classList.remove('translate-x-full');
      panel.classList.add('translate-x-0');
      document.body.classList.add('overflow-hidden');
    }
  }

  closeDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-drawer-backdrop');
    const panel = document.getElementById('cart-drawer-panel');
    if (drawer && backdrop && panel) {
      backdrop.classList.remove('opacity-100');
      backdrop.classList.add('opacity-0');
      panel.classList.remove('translate-x-0');
      panel.classList.add('translate-x-full');
      setTimeout(() => {
        drawer.classList.add('pointer-events-none');
        document.body.classList.remove('overflow-hidden');
      }, 350);
    }
  }

  renderDrawerItems() {
    const container = document.getElementById('cart-drawer-items');
    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div class="py-16 text-center px-4">
          <div class="w-20 h-20 mx-auto rounded-full bg-emerald-900/10 flex items-center justify-center text-[#D4AF37] mb-4">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          </div>
          <h4 class="text-lg font-serif font-bold text-gray-900 mb-1">Your Tea Bag is Empty</h4>
          <p class="text-sm text-gray-500 max-w-xs mx-auto mb-6">Discover exquisite single-estate Ceylon teas hand-picked from the misty highlands of Sri Lanka.</p>
          <a href="shop.html" class="inline-flex items-center justify-center px-6 py-3 bg-[#0F382A] text-[#E5C07B] hover:bg-[#164E3D] font-medium text-sm rounded-lg transition-colors shadow-md">
            Explore Tea Catalog
          </a>
        </div>
      `;
      return;
    }

    const fmt = (usd) => window.currencyManager ? window.currencyManager.format(usd) : `$${usd.toFixed(2)}`;

    container.innerHTML = this.cart.map(item => `
      <div class="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
        <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-lg border border-amber-900/10 flex-shrink-0">
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start">
            <h5 class="font-serif font-semibold text-gray-900 text-sm leading-tight truncate pr-2">${item.name}</h5>
            <button onclick="window.cartManager.removeItem('${item.cartItemId}')" class="text-gray-400 hover:text-rose-600 transition-colors p-1" title="Remove">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
          <span class="inline-block text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-medium mt-1 mb-2">${item.packSize}</span>
          <div class="flex justify-between items-center mt-1">
            <div class="flex items-center border border-gray-200 rounded-md bg-white">
              <button onclick="window.cartManager.updateQuantity('${item.cartItemId}', ${item.quantity - 1})" class="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors rounded-l-md font-bold text-sm">-</button>
              <span class="w-8 text-center text-xs font-semibold text-gray-900">${item.quantity}</span>
              <button onclick="window.cartManager.updateQuantity('${item.cartItemId}', ${item.quantity + 1})" class="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors rounded-r-md font-bold text-sm">+</button>
            </div>
            <div class="text-right">
              <span class="text-sm font-bold text-[#0F382A]" data-price-usd="${item.priceUSD * item.quantity}">${fmt(item.priceUSD * item.quantity)}</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  updateUI() {
    const count = this.getItemCount();
    const subtotal = this.getSubtotalUSD();
    const discount = this.getDiscountUSD();
    const shipping = this.getShippingUSD();
    const total = this.getTotalUSD();

    // Badge counts
    const badges = document.querySelectorAll('.cart-count-badge');
    badges.forEach(b => {
      b.textContent = count;
      if (count > 0) {
        b.classList.remove('hidden');
      } else {
        b.classList.add('hidden');
      }
    });

    const fmt = (usd) => window.currencyManager ? window.currencyManager.format(usd) : `$${usd.toFixed(2)}`;

    // Drawer Totals
    const drawerSubtotal = document.getElementById('cart-drawer-subtotal');
    if (drawerSubtotal) drawerSubtotal.textContent = fmt(subtotal);

    const drawerDiscountRow = document.getElementById('cart-drawer-discount-row');
    const drawerDiscountVal = document.getElementById('cart-drawer-discount');
    if (drawerDiscountRow && drawerDiscountVal) {
      if (discount > 0) {
        drawerDiscountRow.classList.remove('hidden');
        drawerDiscountVal.textContent = `-${fmt(discount)}`;
      } else {
        drawerDiscountRow.classList.add('hidden');
      }
    }

    const drawerShippingVal = document.getElementById('cart-drawer-shipping');
    if (drawerShippingVal) {
      if (shipping === 0 && subtotal > 0) {
        drawerShippingVal.innerHTML = '<span class="text-emerald-600 font-bold uppercase text-xs">FREE</span>';
      } else {
        drawerShippingVal.textContent = fmt(shipping);
      }
    }

    const drawerTotal = document.getElementById('cart-drawer-total');
    if (drawerTotal) drawerTotal.textContent = fmt(total);

    // Free Shipping Progress Bar
    const progressBar = document.getElementById('free-shipping-progress');
    const shippingMsg = document.getElementById('free-shipping-msg');
    if (progressBar && shippingMsg) {
      const remaining = Math.max(0, this.freeShippingThresholdUSD - subtotal);
      const percentage = Math.min(100, Math.round((subtotal / this.freeShippingThresholdUSD) * 100));
      progressBar.style.width = `${percentage}%`;

      if (remaining === 0 && subtotal > 0) {
        shippingMsg.innerHTML = `<span class="text-emerald-700 font-bold">🎉 Congratulations! You qualify for Free Global Express Air Shipping!</span>`;
      } else {
        shippingMsg.innerHTML = `Add <span class="font-bold text-[#0F382A]">${fmt(remaining)}</span> more to unlock <strong>FREE Global Express Air Delivery</strong>`;
      }
    }

    // Render Items
    this.renderDrawerItems();

    // Trigger price update for any new price elements
    if (window.currencyManager) {
      window.currencyManager.updateDOM();
    }
  }

  init() {
    this.updateUI();

    // Event listener for drawer toggles
    document.addEventListener('click', (e) => {
      if (e.target.closest('.open-cart-drawer')) {
        e.preventDefault();
        this.openDrawer();
      }
      if (e.target.closest('.close-cart-drawer') || e.target.id === 'cart-drawer-backdrop') {
        e.preventDefault();
        this.closeDrawer();
      }
    });

    // Handle currency changes
    window.addEventListener('currencyChanged', () => {
      this.updateUI();
    });
  }
}

window.cartManager = new CartManager();

document.addEventListener('DOMContentLoaded', () => {
  window.cartManager.init();
});
