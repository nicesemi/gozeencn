/**
 * Zeen Cart - Client-side shopping cart using localStorage
 * Shared between EN and zh-HK versions
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'zeen_cart';

  // Locale: gozeen-cn 为简体中文出租站（中文版已上提站根），恒为 CNY 押金口径
  var isZhHk = true; // 恒中文
  var CURRENCY_SYMBOL = '¥';
  var CURRENCY_CODE = 'CNY';
  var RATE = 7.2;

  // Tax & Shipping：租赁押金模式不另收运费/税费（税率归零、运费表清空）
  var TAX_RATE = 0;
  var SHIPPING_RATES = {};

  // ========== Cart Data ==========

  window.Cart = {
    _data: null,

    /**
     * Load cart from localStorage
     */
    _load: function () {
      if (this._data) return this._data;
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          this._data = JSON.parse(raw);
        }
      } catch (e) { /* ignore */ }
      if (!this._data || !Array.isArray(this._data.items)) {
        this._data = { items: [], total_price: 0, item_count: 0, currency: 'CNY' };
      }
      return this._data;
    },

    /**
     * Save cart to localStorage
     */
    _save: function () {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
      } catch (e) { /* ignore */ }
    },

    /**
     * Recalculate totals
     */
    _recalc: function () {
      var items = this._data.items;
      var count = 0;
      var total = 0;
      for (var i = 0; i < items.length; i++) {
        count += items[i].quantity;
        total += items[i].price * items[i].quantity;
      }
      this._data.item_count = count;
      this._data.total_price = Math.round(total * 100) / 100;
    },

    /**
     * Get current cart state
     */
    get: function () {
      return this._load();
    },

    /**
     * Add item to cart
     * @param {string} variantId - unique identifier for the variant
     * @param {object} product - { title, price, image, handle, variant_title, quantity }
     */
    add: function (variantId, product) {
      this._load();
      var items = this._data.items;
      var found = false;

      for (var i = 0; i < items.length; i++) {
        if (items[i].variant_id === variantId) {
          items[i].quantity += product.quantity || 1;
          found = true;
          break;
        }
      }

      if (!found) {
        items.push({
          variant_id: variantId,
          title: product.title || '',
          price: parseFloat(product.price) || 0,
          image: product.image || '',
          handle: product.handle || '',
          variant_title: product.variant_title || '',
          quantity: product.quantity || 1
        });
      }

      this._recalc();
      this._save();
      this.updateCartCount();
    },

    /**
     * Remove item from cart by variant_id
     */
    remove: function (variantId) {
      this._load();
      var items = this._data.items;
      for (var i = items.length - 1; i >= 0; i--) {
        if (items[i].variant_id === variantId) {
          items.splice(i, 1);
        }
      }
      this._recalc();
      this._save();
      this.updateCartCount();
    },

    /**
     * Update item quantity
     */
    updateQuantity: function (variantId, qty) {
      this._load();
      qty = parseInt(qty) || 0;
      if (qty <= 0) {
        this.remove(variantId);
        return;
      }
      var items = this._data.items;
      for (var i = 0; i < items.length; i++) {
        if (items[i].variant_id === variantId) {
          items[i].quantity = qty;
          break;
        }
      }
      this._recalc();
      this._save();
      this.updateCartCount();
    },

    /**
     * Clear entire cart
     */
    clear: function () {
      this._data = { items: [], total_price: 0, item_count: 0, currency: 'CNY' };
      this._save();
      this.updateCartCount();
    },

    /**
     * Get subtotal
     */
    subtotal: function () {
      this._load();
      return this._data.total_price;
    },

    /**
     * Format price
     */
    formatPrice: function (price) {
      var converted = (parseFloat(price) || 0) * RATE;
      return CURRENCY_SYMBOL + converted.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    /**
     * Calculate tax and shipping based on region code
     * @param {string} region - region code ('HK','CN','TW','MO') or ''/other
     * @returns {{ tax: number, shipping: number, total: number, regionKnown: boolean }}
     */
    calcTaxAndShipping: function (region) {
      var subtotal = this.subtotal();
      var tax = subtotal * TAX_RATE;
      var shipping = 0;
      var regionKnown = false;
      if (SHIPPING_RATES[region]) {
        shipping = SHIPPING_RATES[region].cost;
        regionKnown = true;
      }
      return {
        tax: tax,
        shipping: shipping,
        total: subtotal + tax + shipping,
        regionKnown: regionKnown
      };
    }
  };

  // ========== UI Functions ==========

  /**
   * Update cart count badge in navigation
   */
  Cart.updateCartCount = function () {
    var data = this.get();
    var count = data.item_count || 0;

    // Update EN cart count
    var countBubble = document.getElementById('CartCount');
    if (countBubble) {
      var countSpan = countBubble.querySelector('[data-cart-count]');
      if (countSpan) {
        countSpan.textContent = count;
      }
      if (count > 0) {
        countBubble.classList.remove('hide');
      } else {
        countBubble.classList.add('hide');
      }
    }

    // Update cart popup quantity
    var popupQty = document.querySelector('[data-cart-popup-cart-quantity]');
    if (popupQty) {
      popupQty.textContent = count;
    }
  };

  /**
   * Show "added to cart" popup
   */
  Cart.showAddedPopup = function (product) {
    var wrapper = document.querySelector('[data-cart-popup-wrapper]');
    if (!wrapper) return;

    // Set image
    var imgWrapper = document.querySelector('[data-cart-popup-image-wrapper]');
    if (imgWrapper && product.image) {
      imgWrapper.innerHTML = '<img class="cart-popup-item__image" src="' + product.image + '" alt="' + (product.title || '') + '" />';
      imgWrapper.classList.remove('hide');
    }

    // Set title
    var titleEl = document.querySelector('[data-cart-popup-title]');
    if (titleEl) {
      titleEl.textContent = product.title || '';
    }

    // Set variant details
    var detailsEl = document.querySelector('[data-cart-popup-product-details]');
    if (detailsEl) {
      var html = '';
      if (product.variant_title) {
        html += '<li>' + product.variant_title + '</li>';
      }
      if (product.price) {
        html += '<li>' + Cart.formatPrice(product.price) + '</li>';
      }
      detailsEl.innerHTML = html;
    }

    // Set quantity
    var qtyEl = document.querySelector('[data-cart-popup-quantity]');
    var qtyLabelEl = document.querySelector('[data-cart-popup-quantity-label]');
    if (qtyEl) {
      qtyEl.textContent = product.quantity || 1;
    }
    if (qtyLabelEl) {
      qtyLabelEl.textContent = '数量：';
    }

    // Update cart popup count
    var data = this.get();
    var popupQty = document.querySelector('[data-cart-popup-cart-quantity]');
    if (popupQty) {
      popupQty.textContent = data.item_count || 0;
    }

    // Show popup
    wrapper.classList.remove('cart-popup-wrapper--hidden');

    // Auto-hide after 3 seconds
    clearTimeout(this._popupTimer);
    this._popupTimer = setTimeout(function () {
      wrapper.classList.add('cart-popup-wrapper--hidden');
    }, 3000);
  };

  // ========== Event Bindings ==========

  /**
   * Bind add-to-cart by hooking into the product form submit event.
   * Reads product info from the DOM (h1, select, img, price span) instead of
   * relying on data-* attributes that don't exist on the product pages.
   */
  function bindAddToCartButtons() {
    // Find all product forms that contain an add-to-cart button
    var forms = document.querySelectorAll('form[data-product-form]');
    if (!forms.length) {
      // Fallback: find forms that have a .js-add-to-cart button inside
      var addBtn = document.querySelector('.js-add-to-cart');
      if (addBtn) {
        var parentForm = addBtn.closest('form');
        if (parentForm) forms = [parentForm];
      }
    }

    for (var i = 0; i < forms.length; i++) {
      (function (form) {
        form.addEventListener('submit', function (e) {
          e.stopImmediatePropagation();
          e.preventDefault();
          // Read variant_id from hidden select#ProductSelect-*[name="id"]
          var variantSelect = form.querySelector('select.product-form__variants[name="id"]');
          var variantId = variantSelect ? variantSelect.value : '';

          // Read title from h1.product-single__title
          var titleEl = document.querySelector('h1.product-single__title');
          var title = titleEl ? titleEl.textContent.trim() : '';

          // Read price — prioritize data-price-usd attribute, fallback to textContent
          var price = 0;
          var priceEl = document.querySelector('[data-price-usd]');
          if (priceEl) {
            var usdAttr = priceEl.getAttribute('data-price-usd');
            if (usdAttr) {
              price = parseFloat(usdAttr) || 0;
            }
          }
          if (!price) {
            // Fallback: parse textContent
            var selectors = [
              'form [data-regular-price]',
              '.price__regular [data-regular-price]',
              '[data-regular-price]',
              '.price-item--regular'
            ];
            for (var s = 0; s < selectors.length; s++) {
              var els = document.querySelectorAll(selectors[s]);
              for (var e = 0; e < els.length; e++) {
                var txt = els[e].textContent.trim();
                if (txt && parseFloat(txt.replace(/[^0-9.]/g, ''))) {
                  price = parseFloat(txt.replace(/[^0-9.]/g, '')) || 0;
                  break;
                }
              }
              if (price) break;
            }
          }

          // Read image from img.product-featured-media
          var img = document.querySelector('img.product-featured-media');
          var image = '';
          if (img) {
            var src = img.getAttribute('src') || '';
            // If src is a blank data URI, try srcset first, then currentSrc
            if (src.indexOf('data:image/gif;base64') === 0 || src === '') {
              var srcset = img.getAttribute('srcset') || '';
              if (srcset) {
                // Take the first URL from srcset (the smallest, e.g. 180w)
                var match = srcset.match(/(\/[^\s,]+)/);
                image = match ? match[1] : '';
              }
              if (!image) {
                image = img.currentSrc || '';
              }
            }
            if (!image) {
              image = src;
            }
          }

          // Read variant_title from selected options in single-option-selector
          var variantTitleParts = [];
          var optionSelects = form.querySelectorAll('select.single-option-selector');
          for (var j = 0; j < optionSelects.length; j++) {
            var selectedOption = optionSelects[j].selectedOptions[0];
            if (selectedOption) {
              variantTitleParts.push(selectedOption.textContent.trim());
            }
          }
          var variantTitle = variantTitleParts.join(' / ');

          // Read quantity from input[name="quantity"], default 1
          var qtyInput = form.querySelector('input[name="quantity"]');
          var qty = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;

          // Derive handle from pathname
          var path = window.location.pathname;
          var handle = '';
          var prodMatch = path.match(/\/products\/([^/]+)\.html$/);
          if (prodMatch) {
            handle = prodMatch[1];
          }

          if (!variantId || !title) return;

          var product = {
            title: title,
            price: price,
            image: image,
            handle: handle,
            variant_title: variantTitle,
            quantity: qty
          };

          Cart.add(variantId, product);
          Cart.showAddedPopup(product);
        });
      })(forms[i]);
    }
  }

  /**
   * Bind popup close / dismiss
   */
  function bindPopupEvents() {
    var wrapper = document.querySelector('[data-cart-popup-wrapper]');
    if (!wrapper) return;

    var closeBtn = wrapper.querySelector('[data-cart-popup-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        wrapper.classList.add('cart-popup-wrapper--hidden');
      });
    }

    var dismissBtn = wrapper.querySelector('[data-cart-popup-dismiss]');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', function () {
        wrapper.classList.add('cart-popup-wrapper--hidden');
      });
    }
  }

  /**
   * Update tax/shipping/total display based on selected region
   * @param {HTMLElement} cartWrapper
   */
  function updateTaxShippingDisplay(cartWrapper) {
    var regionSelect = cartWrapper.querySelector('#cart-region');
    var totalsBreakdown = cartWrapper.querySelector('.cart__totals-breakdown');
    if (!regionSelect || !totalsBreakdown) return;

    var region = regionSelect.value;
    if (!region) {
      totalsBreakdown.style.display = 'none';
      localStorage.removeItem('zeen_region');
      return;
    }

    // Save region to localStorage so checkout page can read it
    localStorage.setItem('zeen_region', region);

    var calc = Cart.calcTaxAndShipping(region);
    var taxEl = totalsBreakdown.querySelector('[data-cart-tax]');
    var shippingEl = totalsBreakdown.querySelector('[data-cart-shipping]');
    var totalEl = totalsBreakdown.querySelector('[data-cart-total]');

    if (taxEl) taxEl.textContent = Cart.formatPrice(calc.tax);
    if (shippingEl) {
      if (calc.regionKnown) {
        shippingEl.textContent = Cart.formatPrice(calc.shipping);
      } else {
        shippingEl.textContent = '—';
      }
    }
    if (totalEl) {
      if (calc.regionKnown) {
        totalEl.textContent = Cart.formatPrice(calc.total);
      } else {
        totalEl.textContent = Cart.formatPrice(calc.total);
      }
    }
    totalsBreakdown.style.display = 'block';
  }

  /**
   * Bind region selector change event
   */
  function bindRegionSelector(cartWrapper) {
    var regionSelect = cartWrapper.querySelector('#cart-region');
    if (!regionSelect) return;

    regionSelect.addEventListener('change', function () {
      updateTaxShippingDisplay(cartWrapper);
    });
  }

  /**
   * Render cart page if on cart page
   */
  function renderCartPage() {
    var cartWrapper = document.querySelector('[data-cart-wrapper]');
    var emptyContent = document.querySelector('[data-empty-page-content]');
    if (!cartWrapper || !emptyContent) return; // not on cart page

    var data = Cart.get();

    if (data.items.length === 0) {
      // Show empty state
      cartWrapper.classList.add('hide');
      emptyContent.classList.remove('hide');
      return;
    }

    // Show cart
    cartWrapper.classList.remove('hide');
    emptyContent.classList.add('hide');

    // Render line items
    var tbody = cartWrapper.querySelector('[data-cart-line-items]');
    if (!tbody) return;

    var rowsHtml = '';
    for (var i = 0; i < data.items.length; i++) {
      var item = data.items[i];
      var lineTotal = item.price * item.quantity;
      var imgSrc = item.image || '/assets/cdn/shop/files/Cushion_iso.png';

      rowsHtml +=
        '<tr class="cart__row" data-variant-id="' + item.variant_id + '">' +
          '<td class="cart__meta small--text-left" data-label="Product">' +
            '<div class="cart__product-information">' +
              '<div class="cart__image-wrapper">' +
                '<img class="cart__image" src="' + imgSrc + '" alt="' + item.title + '" style="max-width:120px;" />' +
              '</div>' +
              '<div>' +
                '<div class="list-view-item__title">' +
                  '<a href="/products/' + item.handle + '.html" class="cart__product-title">' + item.title + '</a>' +
                '</div>' +
                (item.variant_title ? '<div class="product-details-wrapper"><p>' + item.variant_title + '</p></div>' : '') +
                '<div class="small--hide">' +
                  '<span class="cart__price">' + Cart.formatPrice(item.price) + '</span>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</td>' +
          '<td class="cart__price text-right small--hide" data-label="Price">' +
            Cart.formatPrice(item.price) +
          '</td>' +
          '<td class="cart__quantity-td text-right small--hide" data-label="Quantity">' +
            '<input class="cart__qty-input" type="number" value="' + item.quantity + '" min="0" data-variant-id="' + item.variant_id + '" style="width:60px;text-align:center;" />' +
          '</td>' +
          '<td class="cart__final-price text-right small--hide" data-label="Total">' +
            '<span class="cart__line-total">' + Cart.formatPrice(lineTotal) + '</span>' +
          '</td>' +
          '<td class="cart__remove text-right">' +
            '<a class="cart__remove-btn text-link" href="#" data-variant-id="' + item.variant_id + '" style="color:#f73437;font-size:12px;">移除</a>' +
          '</td>' +
        '</tr>';
    }
    tbody.innerHTML = rowsHtml;

    // Update subtotal
    var subtotalEl = cartWrapper.querySelector('[data-cart-subtotal]');
    if (subtotalEl) {
      subtotalEl.textContent = Cart.formatPrice(data.total_price) + ' ' + CURRENCY_CODE;
    }

    // Bind region selector for tax & shipping calculation
    bindRegionSelector(cartWrapper);

    // Bind quantity change
    var qtyInputs = tbody.querySelectorAll('.cart__qty-input');
    for (var j = 0; j < qtyInputs.length; j++) {
      (function (input) {
        input.addEventListener('change', function () {
          var vid = input.getAttribute('data-variant-id');
          var newQty = parseInt(input.value) || 0;
          if (newQty <= 0) {
            Cart.remove(vid);
            renderCartPage();
            return;
          }
          Cart.updateQuantity(vid, newQty);
          // Update line total
          var row = input.closest('tr');
          var lineTotalEl = row.querySelector('.cart__line-total');
          if (lineTotalEl) {
            var itemData = Cart.get().items;
            for (var k = 0; k < itemData.length; k++) {
              if (itemData[k].variant_id === vid) {
                lineTotalEl.textContent = Cart.formatPrice(itemData[k].price * itemData[k].quantity);
                break;
              }
            }
          }
          // Update subtotal
          var subEl = cartWrapper.querySelector('[data-cart-subtotal]');
          if (subEl) {
            subEl.textContent = Cart.formatPrice(Cart.subtotal()) + ' ' + CURRENCY_CODE;
          }
        });
      })(qtyInputs[j]);
    }

    // Bind remove buttons
    var removeBtns = tbody.querySelectorAll('.cart__remove-btn');
    for (var m = 0; m < removeBtns.length; m++) {
      (function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var vid = btn.getAttribute('data-variant-id');
          Cart.remove(vid);
          renderCartPage();
        });
      })(removeBtns[m]);
    }

    // Bind checkout button - redirect to checkout page
    var checkoutBtn = cartWrapper.querySelector('input[name="checkout"], .cart__submit');
    if (checkoutBtn) {
      // gozeen-cn 中文版已上提站根，结账页固定为根路径
      var checkoutUrl = '/checkout.html';

      // Replace form action or button behavior
      var form = cartWrapper.querySelector('form.cart');
      if (form) {
        form.setAttribute('action', checkoutUrl);
        form.removeAttribute('method');
        form.onsubmit = function (e) {
          e.preventDefault();
          window.location.href = checkoutUrl;
          return false;
        };
      }
    }

    // Restore saved region selection from localStorage
    var savedRegion = localStorage.getItem('zeen_region');
    if (savedRegion) {
      var regionSelect = cartWrapper.querySelector('#cart-region');
      if (regionSelect) {
        regionSelect.value = savedRegion;
        updateTaxShippingDisplay(cartWrapper);
      }
    }
  }

  /**
   * Render checkout page if on checkout page
   */
  function renderCheckoutPage() {
    var orderSummary = document.getElementById('checkout-order-summary');
    if (!orderSummary) return; // not on checkout page

    var data = Cart.get();

    if (data.items.length === 0) {
      orderSummary.innerHTML = '<p style="text-align:center;padding:40px;">您的购物车是空的。</p>';
      return;
    }

    var itemsHtml = '';
    for (var i = 0; i < data.items.length; i++) {
      var item = data.items[i];
      var lineTotal = item.price * item.quantity;
      var imgSrc = item.image || '/assets/cdn/shop/files/Cushion_iso.png';

      itemsHtml +=
        '<div class="checkout-item" style="display:flex;gap:12px;padding:8px 0;border-bottom:1px solid #e5e5e5;">' +
          '<img src="' + imgSrc + '" alt="' + item.title + '" style="width:64px;height:64px;object-fit:cover;border-radius:4px;" />' +
          '<div style="flex:1;">' +
            '<div style="font-weight:600;">' + item.title + '</div>' +
            (item.variant_title ? '<div style="color:#666;font-size:13px;">' + item.variant_title + '</div>' : '') +
            '<div style="color:#666;font-size:13px;">数量：' + item.quantity + '</div>' +
          '</div>' +
          '<div style="font-weight:600;">' + Cart.formatPrice(lineTotal) + '</div>' +
        '</div>';
    }

    var subtotal = data.total_price;

    // 租赁押金模式：无运费/税费，应收 = 押金总额
    var summaryHtml =
      '<div style="border:1px solid #e5e5e5;border-radius:8px;padding:20px;">' +
        '<h3 style="margin:0 0 16px;font-size:18px;">订购押金</h3>' +
        itemsHtml +
        '<div style="margin-top:16px;padding-top:16px;border-top:1px solid #e5e5e5;">' +
          '<div style="display:flex;justify-content:space-between;padding:4px 0;"><span>押金</span><span>' + Cart.formatPrice(subtotal) + '</span></div>' +
          '<div style="display:flex;justify-content:space-between;padding:8px 0;font-size:18px;font-weight:700;border-top:2px solid #333;margin-top:8px;"><span>应付押金</span><span>' + Cart.formatPrice(subtotal) + ' ' + CURRENCY_CODE + '</span></div>' +
        '</div>' +
      '</div>';

    orderSummary.innerHTML = summaryHtml;
  }

  // ========== Init ==========

  function init() {
    // Load cart and update count
    Cart._load();
    Cart.updateCartCount();
    bindAddToCartButtons();
    bindPopupEvents();

    // Render cart page if on cart page
    if (document.querySelector('[data-cart-wrapper]')) {
      renderCartPage();
    }

    // Render checkout page if on checkout page
    if (document.getElementById('checkout-order-summary')) {
      renderCheckoutPage();
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
