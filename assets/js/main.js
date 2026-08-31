/**
 * Ceylon Tea Hub - Main UI & Global Interactive Controllers
 */

// Helper to generate luxury product HTML card
function renderProductCard(product) {
  const isWish = window.wishlistManager ? window.wishlistManager.isWishlisted(product.id) : false;
  const wishFill = isWish ? '#E11D48' : 'none';
  const wishStroke = isWish ? '#E11D48' : 'currentColor';
  const wishClass = isWish ? 'text-rose-600' : 'text-gray-400 hover:text-rose-500';

  const defaultPack = product.packSizes ? product.packSizes[0] : { label: "100g Tin", multiplier: 1 };
  const priceUSD = product.priceUSD * defaultPack.multiplier;
  const originalPriceUSD = product.originalPriceUSD ? product.originalPriceUSD * defaultPack.multiplier : null;

  const fmt = (usd) => window.currencyManager ? window.currencyManager.format(usd) : `$${usd.toFixed(2)}`;

  return `
    <div class="luxury-card bg-white rounded-2xl overflow-hidden border border-amber-900/10 shadow-sm flex flex-col group relative" data-product-id="${product.id}">
      <!-- Badges -->
      <div class="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        ${product.badge ? `<span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#0F382A] text-[#E5C07B] shadow-sm tracking-wide uppercase">${product.badge}</span>` : ''}
        <span class="px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-amber-50 text-amber-900 border border-amber-200/60">${product.elevation}</span>
      </div>

      <!-- Wishlist Action -->
      <button data-wishlist-btn="${product.id}" class="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center ${wishClass} shadow-md transition-transform hover:scale-110" title="Add to Wishlist">
        <svg class="w-4 h-4 transition-colors" fill="${wishFill}" stroke="${wishStroke}" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
        </svg>
      </button>

      <!-- Image & Quick Actions -->
      <div class="zoom-container relative aspect-[4/3] bg-stone-100 overflow-hidden cursor-pointer" onclick="window.location.href='product-detail.html?id=${product.id}'">
        <img src="${product.image}" alt="${product.name}" class="zoom-image w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
        
        <!-- Quick View Overlay Button -->
        <button onclick="event.stopPropagation(); openQuickView('${product.id}')" class="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 px-4 py-2 bg-white/95 text-gray-900 text-xs font-semibold rounded-full shadow-lg hover:bg-[#0F382A] hover:text-[#E5C07B] flex items-center gap-1.5 whitespace-nowrap">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
          Quick View
        </button>
      </div>

      <!-- Card Details -->
      <div class="p-5 flex-1 flex flex-col justify-between">
        <div>
          <!-- Terroir / Grade -->
          <div class="flex items-center justify-between text-xs text-stone-500 mb-1 font-medium">
            <span>${product.terroir}</span>
            <span class="text-amber-700 font-semibold">${product.grade.split(' ')[0]}</span>
          </div>

          <!-- Product Name -->
          <h3 class="font-serif font-bold text-gray-900 text-lg group-hover:text-[#0F382A] transition-colors line-clamp-1 mb-1">
            <a href="product-detail.html?id=${product.id}">${product.name}</a>
          </h3>

          <!-- Rating Stars -->
          <div class="flex items-center gap-1.5 mb-2.5">
            <div class="flex text-amber-400 text-xs">
              ${Array(5).fill(0).map((_, i) => `<svg class="w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-stone-300'}" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`).join('')}
            </div>
            <span class="text-xs text-stone-500 font-semibold">${product.rating.toFixed(1)} (${product.reviewsCount})</span>
          </div>

          <!-- Tasting tags -->
          <div class="flex flex-wrap gap-1 mb-4">
            ${product.tastingNotes.slice(0, 2).map(n => `<span class="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">${n}</span>`).join('')}
          </div>
        </div>

        <!-- Price & Add Button -->
        <div class="pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span class="text-xs text-stone-400 block font-medium">From</span>
            <div class="flex items-baseline gap-1.5">
              <span class="text-lg font-bold text-[#0F382A]" data-price-usd="${priceUSD}">${fmt(priceUSD)}</span>
              ${originalPriceUSD ? `<span class="text-xs text-stone-400 line-through" data-price-usd="${originalPriceUSD}">${fmt(originalPriceUSD)}</span>` : ''}
            </div>
          </div>

          <button onclick="window.cartManager.addItem('${product.id}', '${defaultPack.label}', 1)" class="px-3.5 py-2 bg-[#0F382A] text-[#E5C07B] hover:bg-[#164E3D] text-xs font-semibold rounded-lg shadow transition-all flex items-center gap-1.5 active:scale-95">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Add
          </button>
        </div>
      </div>
    </div>
  `;
}

// Quick View Modal
function openQuickView(productId) {
  const product = typeof getProductById === 'function' ? getProductById(productId) : null;
  if (!product) return;

  let modal = document.getElementById('quick-view-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'quick-view-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300';
    document.body.appendChild(modal);
  }

  const fmt = (usd) => window.currencyManager ? window.currencyManager.format(usd) : `$${usd.toFixed(2)}`;

  modal.innerHTML = `
    <div class="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-amber-900/10 flex flex-col md:flex-row max-h-[90vh] overflow-y-auto transform scale-95 transition-transform duration-300" id="quick-view-box">
      <!-- Close button -->
      <button onclick="closeQuickView()" class="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white shadow transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>

      <!-- Image Column -->
      <div class="md:w-1/2 bg-stone-100 relative min-h-[320px] flex items-center justify-center">
        <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover max-h-[480px]">
        <div class="absolute bottom-4 left-4">
          <span class="px-3 py-1 bg-[#0F382A] text-[#E5C07B] text-xs font-semibold rounded-full uppercase tracking-wider">${product.badge || 'Pure Ceylon'}</span>
        </div>
      </div>

      <!-- Info Column -->
      <div class="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
        <div>
          <div class="text-xs font-semibold text-amber-800 uppercase tracking-widest mb-1">${product.terroir} • ${product.grade}</div>
          <h2 class="text-2xl font-serif font-bold text-gray-900 mb-2">${product.name}</h2>
          <p class="text-xs text-stone-500 italic mb-4">${product.tagline}</p>

          <!-- Price -->
          <div class="flex items-baseline gap-3 mb-4">
            <span id="qv-price" class="text-2xl font-bold text-[#0F382A]" data-price-usd="${product.priceUSD}">${fmt(product.priceUSD)}</span>
            ${product.originalPriceUSD ? `<span class="text-sm text-stone-400 line-through" data-price-usd="${product.originalPriceUSD}">${fmt(product.originalPriceUSD)}</span>` : ''}
          </div>

          <p class="text-sm text-stone-600 mb-5 leading-relaxed">${product.shortDesc}</p>

          <!-- Pack Size Selection -->
          <div class="mb-5">
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Select Packaging Size</label>
            <div class="grid grid-cols-2 gap-2" id="qv-pack-options">
              ${(product.packSizes || []).map((pack, idx) => `
                <button type="button" onclick="selectQuickViewPack(this, ${pack.multiplier}, '${pack.label}')" class="qv-pack-btn text-left px-3 py-2 rounded-lg border text-xs font-medium transition-all ${idx === 0 ? 'border-[#0F382A] bg-[#0F382A]/5 text-[#0F382A] font-bold' : 'border-stone-200 text-stone-700 hover:border-stone-400'}">
                  ${pack.label}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Brewing Snapshot -->
          <div class="bg-stone-50 rounded-xl p-3.5 border border-stone-200/70 mb-5 flex items-center justify-around text-center text-xs">
            <div>
              <span class="text-stone-400 block text-[10px] uppercase font-bold">Temp</span>
              <span class="font-semibold text-gray-800">${product.brewing.tempC}°C / ${product.brewing.tempF}°F</span>
            </div>
            <div class="w-px h-6 bg-stone-200"></div>
            <div>
              <span class="text-stone-400 block text-[10px] uppercase font-bold">Steep</span>
              <span class="font-semibold text-gray-800">${product.brewing.timeFormatted}</span>
            </div>
            <div class="w-px h-6 bg-stone-200"></div>
            <div>
              <span class="text-stone-400 block text-[10px] uppercase font-bold">Leaf</span>
              <span class="font-semibold text-gray-800">${product.brewing.leafGrams.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        <!-- Quantity & Add to Cart -->
        <div>
          <div class="flex items-center gap-3 mb-3">
            <div class="flex items-center border border-gray-300 rounded-lg bg-white">
              <button type="button" onclick="changeQvQty(-1)" class="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-stone-100 rounded-l-lg font-bold">-</button>
              <input type="number" id="qv-qty-input" value="1" min="1" max="99" class="w-12 text-center text-sm font-bold text-gray-900 border-0 focus:ring-0">
              <button type="button" onclick="changeQvQty(1)" class="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-stone-100 rounded-r-lg font-bold">+</button>
            </div>

            <button type="button" id="qv-add-btn" onclick="addQuickViewToCart('${product.id}')" class="flex-1 py-3 px-6 bg-[#0F382A] text-[#E5C07B] hover:bg-[#164E3D] font-semibold text-sm rounded-lg shadow-lg transition-all flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              <span>Add to Tea Bag</span>
            </button>
          </div>

          <a href="product-detail.html?id=${product.id}" class="block text-center text-xs font-semibold text-amber-800 hover:text-amber-900 hover:underline">
            View Full Sommelier Tasting & Estate Heritage Details →
          </a>
        </div>
      </div>
    </div>
  `;

  // Base state
  window._currentQvProduct = product;
  window._currentQvPack = product.packSizes ? product.packSizes[0].label : null;
  window._currentQvMultiplier = 1.0;

  modal.classList.remove('pointer-events-none', 'opacity-0');
  modal.classList.add('opacity-100');
  setTimeout(() => {
    const box = document.getElementById('quick-view-box');
    if (box) box.classList.remove('scale-95');
  }, 20);

  if (window.currencyManager) window.currencyManager.updateDOM();
}

function selectQuickViewPack(btn, multiplier, packLabel) {
  const allBtns = document.querySelectorAll('.qv-pack-btn');
  allBtns.forEach(b => {
    b.className = 'qv-pack-btn text-left px-3 py-2 rounded-lg border text-xs font-medium transition-all border-stone-200 text-stone-700 hover:border-stone-400';
  });
  btn.className = 'qv-pack-btn text-left px-3 py-2 rounded-lg border text-xs font-bold transition-all border-[#0F382A] bg-[#0F382A]/5 text-[#0F382A]';

  window._currentQvPack = packLabel;
  window._currentQvMultiplier = multiplier;

  const priceEl = document.getElementById('qv-price');
  if (priceEl && window._currentQvProduct) {
    const newPrice = window._currentQvProduct.priceUSD * multiplier;
    priceEl.setAttribute('data-price-usd', newPrice);
    priceEl.textContent = window.currencyManager ? window.currencyManager.format(newPrice) : `$${newPrice.toFixed(2)}`;
  }
}

function changeQvQty(delta) {
  const input = document.getElementById('qv-qty-input');
  if (input) {
    let val = parseInt(input.value) || 1;
    val = Math.max(1, Math.min(99, val + delta));
    input.value = val;
  }
}

function addQuickViewToCart(productId) {
  const input = document.getElementById('qv-qty-input');
  const qty = input ? parseInt(input.value) || 1 : 1;
  if (window.cartManager) {
    window.cartManager.addItem(productId, window._currentQvPack, qty);
    closeQuickView();
  }
}

function closeQuickView() {
  const modal = document.getElementById('quick-view-modal');
  if (modal) {
    modal.classList.add('opacity-0');
    setTimeout(() => {
      modal.classList.add('pointer-events-none');
    }, 300);
  }
}

// Global Search Overlay
function openSearchModal() {
  let modal = document.getElementById('global-search-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'global-search-modal';
    modal.className = 'fixed inset-0 z-50 flex flex-col items-center pt-20 px-4 bg-black/80 backdrop-blur-md opacity-0 pointer-events-none transition-opacity duration-300';
    modal.innerHTML = `
      <div class="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-amber-900/20" onclick="event.stopPropagation()">
        <div class="p-4 border-b border-stone-200 flex items-center gap-3">
          <svg class="w-5 h-5 text-[#0F382A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input type="text" id="global-search-input" placeholder="Search Ceylon Silver Tips, Nuwara Eliya, Chai, Dimbula..." class="w-full text-base font-medium text-gray-900 focus:outline-none border-0 p-0" autocomplete="off">
          <button onclick="closeSearchModal()" class="text-stone-400 hover:text-stone-700 text-sm font-semibold px-2 py-1">ESC</button>
        </div>
        <div id="global-search-results" class="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          <div class="text-center py-8 text-stone-400 text-xs uppercase tracking-widest">Type above to explore our harvests</div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeSearchModal();
    });

    const searchInput = document.getElementById('global-search-input');
    searchInput.addEventListener('input', (e) => {
      handleSearchQuery(e.target.value);
    });
  }

  modal.classList.remove('pointer-events-none', 'opacity-0');
  modal.classList.add('opacity-100');
  setTimeout(() => {
    const input = document.getElementById('global-search-input');
    if (input) input.focus();
  }, 100);
}

function handleSearchQuery(query) {
  const resultsContainer = document.getElementById('global-search-results');
  if (!resultsContainer) return;
  const q = (query || '').toLowerCase().trim();

  if (q.length === 0) {
    resultsContainer.innerHTML = `<div class="text-center py-8 text-stone-400 text-xs uppercase tracking-widest">Type above to explore our harvests</div>`;
    return;
  }

  const matches = CEYLON_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(q) ||
    p.terroir.toLowerCase().includes(q) ||
    p.type.toLowerCase().includes(q) ||
    p.grade.toLowerCase().includes(q) ||
    p.tastingNotes.some(t => t.toLowerCase().includes(q))
  );

  if (matches.length === 0) {
    resultsContainer.innerHTML = `
      <div class="text-center py-8">
        <p class="text-sm text-stone-600 font-medium">No teas found matching "${query}"</p>
        <p class="text-xs text-stone-400 mt-1">Try searching for "Nuwara Eliya", "Silver Tips", "Green", or "Chai"</p>
      </div>
    `;
    return;
  }

  const fmt = (usd) => window.currencyManager ? window.currencyManager.format(usd) : `$${usd.toFixed(2)}`;

  resultsContainer.innerHTML = matches.map(p => `
    <a href="product-detail.html?id=${p.id}" class="flex items-center gap-4 p-3 rounded-xl hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-200">
      <img src="${p.image}" alt="${p.name}" class="w-14 h-14 object-cover rounded-lg flex-shrink-0">
      <div class="flex-1 min-w-0">
        <div class="text-xs text-amber-800 font-semibold uppercase tracking-wider">${p.terroir} • ${p.elevation}</div>
        <div class="text-sm font-serif font-bold text-gray-900 truncate">${p.name}</div>
        <div class="text-xs text-stone-500 truncate">${p.tastingNotes.join(', ')}</div>
      </div>
      <div class="text-right flex-shrink-0">
        <span class="text-sm font-bold text-[#0F382A]" data-price-usd="${p.priceUSD}">${fmt(p.priceUSD)}</span>
      </div>
    </a>
  `).join('');

  if (window.currencyManager) window.currencyManager.updateDOM();
}

function closeSearchModal() {
  const modal = document.getElementById('global-search-modal');
  if (modal) {
    modal.classList.add('opacity-0');
    setTimeout(() => {
      modal.classList.add('pointer-events-none');
    }, 300);
  }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu-drawer');
  const backdrop = document.getElementById('mobile-menu-backdrop');
  if (!menu || !backdrop) return;

  const isOpen = !menu.classList.contains('-translate-x-full');
  if (isOpen) {
    menu.classList.add('-translate-x-full');
    backdrop.classList.add('opacity-0', 'pointer-events-none');
    document.body.classList.remove('overflow-hidden');
  } else {
    menu.classList.remove('-translate-x-full');
    backdrop.classList.remove('opacity-0', 'pointer-events-none');
    document.body.classList.add('overflow-hidden');
  }
}

// Wishlist Modal View
function openWishlistModal() {
  let modal = document.getElementById('wishlist-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'wishlist-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300';
    document.body.appendChild(modal);
  }

  const items = window.wishlistManager ? window.wishlistManager.getItems() : [];
  const wishProducts = items.map(id => getProductById(id)).filter(Boolean);
  const fmt = (usd) => window.currencyManager ? window.currencyManager.format(usd) : `$${usd.toFixed(2)}`;

  modal.innerHTML = `
    <div class="relative w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-amber-900/10 flex flex-col max-h-[85vh]">
      <div class="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-rose-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <h3 class="font-serif font-bold text-lg text-gray-900">Your Tea Wishlist (${wishProducts.length})</h3>
        </div>
        <button onclick="closeWishlistModal()" class="text-stone-400 hover:text-stone-700 p-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div class="p-5 overflow-y-auto flex-1 space-y-3">
        ${wishProducts.length === 0 ? `
          <div class="text-center py-12">
            <p class="text-gray-500 text-sm">You haven't saved any teas to your wishlist yet.</p>
            <a href="shop.html" class="inline-block mt-4 px-5 py-2.5 bg-[#0F382A] text-[#E5C07B] text-xs font-semibold rounded-lg">Explore Tea Catalog</a>
          </div>
        ` : wishProducts.map(p => `
          <div class="flex items-center justify-between gap-4 p-3 bg-stone-50 rounded-xl border border-stone-200">
            <img src="${p.image}" alt="${p.name}" class="w-14 h-14 object-cover rounded-lg flex-shrink-0">
            <div class="flex-1 min-w-0">
              <a href="product-detail.html?id=${p.id}" class="font-serif font-bold text-sm text-gray-900 hover:text-[#0F382A] truncate block">${p.name}</a>
              <span class="text-xs text-stone-500">${p.terroir}</span>
            </div>
            <div class="text-right flex items-center gap-3">
              <span class="text-sm font-bold text-[#0F382A]" data-price-usd="${p.priceUSD}">${fmt(p.priceUSD)}</span>
              <button onclick="window.cartManager.addItem('${p.id}'); closeWishlistModal();" class="px-3 py-1.5 bg-[#0F382A] text-[#E5C07B] text-xs font-semibold rounded-md shadow">Add to Bag</button>
              <button onclick="window.wishlistManager.toggle('${p.id}'); openWishlistModal();" class="text-stone-400 hover:text-rose-600 p-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  modal.classList.remove('pointer-events-none', 'opacity-0');
  modal.classList.add('opacity-100');
  if (window.currencyManager) window.currencyManager.updateDOM();
}

function closeWishlistModal() {
  const modal = document.getElementById('wishlist-modal');
  if (modal) {
    modal.classList.add('opacity-0');
    setTimeout(() => {
      modal.classList.add('pointer-events-none');
    }, 300);
  }
}

// Global Keydown (ESC to close modals)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeQuickView();
    closeSearchModal();
    closeWishlistModal();
    if (window.cartManager) window.cartManager.closeDrawer();
  }
});
