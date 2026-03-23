// ================================================================
// SANITY CMS CONFIGURATION
// ================================================================
// Replace these with your actual Sanity project values.
// See SETUP.md for instructions on how to get these.
const SANITY_PROJECT_ID = 'q7dso99v';
const SANITY_DATASET = 'production';

// Sanity CDN API base URL
const SANITY_API = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}`;

// ================================================================
// SANITY IMAGE URL BUILDER
// ================================================================
function sanityImageUrl(imageRef) {
  if (!imageRef || !imageRef.asset || !imageRef.asset._ref) return '';
  // Convert ref like "image-abc123-400x300-png" to URL
  const ref = imageRef.asset._ref;
  const [, id, dimensions, format] = ref.split('-');
  return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dimensions}.${format}`;
}

// ================================================================
// FETCH PRODUCTS FROM SANITY
// ================================================================
async function fetchProducts() {
  const query = encodeURIComponent('*[_type == "product"]{ _id, name, price, image, description }');
  try {
    const res = await fetch(`${SANITY_API}?query=${query}`);
    const data = await res.json();
    return data.result || [];
  } catch (err) {
    console.error('Failed to fetch products:', err);
    return [];
  }
}

async function fetchProduct(id) {
  const query = encodeURIComponent(`*[_type == "product" && _id == "${id}"][0]{ _id, name, price, image, description }`);
  try {
    const res = await fetch(`${SANITY_API}?query=${query}`);
    const data = await res.json();
    return data.result || null;
  } catch (err) {
    console.error('Failed to fetch product:', err);
    return null;
  }
}

// ================================================================
// HOMEPAGE — RENDER PRODUCT GRID
// ================================================================
async function renderHomepage() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  const products = await fetchProducts();

  if (products.length === 0) {
    grid.innerHTML = '<div class="error-msg">No products found. Make sure your Sanity project is set up correctly.</div>';
    return;
  }

  grid.innerHTML = products.map(product => `
    <a href="product.html?id=${product._id}" class="product-card" id="card-${product._id}">
      <div class="card-img-wrapper">
        <img class="card-img" src="${sanityImageUrl(product.image)}" alt="${product.name}" loading="lazy">
      </div>
      <div class="card-body">
        <h3>${product.name}</h3>
        <span class="card-price">${Number(product.price).toFixed(2)} ETB</span>
      </div>
    </a>
  `).join('');
}

// ================================================================
// PRODUCT DETAIL PAGE
// ================================================================
async function renderProductDetail() {
  const container = document.getElementById('product-detail');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    container.innerHTML = '<div class="error-msg" style="grid-column:1/-1">No product selected. <a href="index.html" class="nav-link" style="color:var(--accent)">Go back to shop</a></div>';
    return;
  }

  const product = await fetchProduct(id);

  if (!product) {
    container.innerHTML = '<div class="error-msg" style="grid-column:1/-1">Product not found.</div>';
    return;
  }

  container.innerHTML = `
    <img class="detail-img" src="${sanityImageUrl(product.image)}" alt="${product.name}">
    <div class="detail-info">
      <h1>${product.name}</h1>
      <span class="detail-price">${Number(product.price).toFixed(2)} ETB</span>
      <p class="detail-desc">${product.description || 'No description available.'}</p>
      <button class="btn btn-primary" id="buy-btn">Buy Now</button>
      <div id="payment-info" style="display:none;">
        <div class="payment-box">
          <h3>Send Payment To:</h3>
          <div class="payment-method">
            <strong>🏦 Commercial Bank of Ethiopia (CBE)</strong><br>
            Account: <strong>1000540249486</strong><br>
            Name: <strong>Mekdes Paulos</strong>
          </div>
          <div class="payment-method" style="margin-top:0.75rem;">
            <strong>📱 Telebirr</strong><br>
            Phone: <strong>0972770206</strong><br>
            Name: <strong>Phawulos</strong>
          </div>
          <p style="margin-top:1rem; color:var(--text-secondary); font-size:0.9rem;">
            Send <strong>${Number(product.price).toFixed(2)} ETB</strong> then click the button below to confirm.
          </p>
          <a href="confirm.html?id=${product._id}" class="btn btn-primary" style="margin-top:1rem; width:100%;">I've Paid — Confirm Payment</a>
        </div>
      </div>
    </div>
  `;

  document.getElementById('buy-btn').addEventListener('click', function() {
    this.style.display = 'none';
    document.getElementById('payment-info').style.display = 'block';
  });
}

// ================================================================
// CONFIRM PAYMENT PAGE
// ================================================================
async function renderConfirmPage() {
  const form = document.getElementById('confirm-form');
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) return;

  const product = await fetchProduct(id);
  if (!product) return;

  document.getElementById('product-name').value = product.name;
  document.getElementById('product-price').value = `${Number(product.price).toFixed(2)} ETB`;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const orderNumber = 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const now = new Date();

    const order = {
      orderNumber: orderNumber,
      productName: product.name,
      amount: `${Number(product.price).toFixed(2)} ETB`,
      time: now.toLocaleString(),
      customerName: document.getElementById('customer-name').value,
      customerPhone: document.getElementById('customer-phone').value
    };

    sessionStorage.setItem('ecom_order', JSON.stringify(order));
    window.location.href = 'receipt.html';
  });
}

// ================================================================
// RECEIPT PAGE
// ================================================================
function renderReceipt() {
  const card = document.getElementById('receipt-card');
  if (!card) return;

  const data = sessionStorage.getItem('ecom_order');
  if (!data) {
    card.innerHTML = '<div class="error-msg">No order found. <a href="index.html" style="color:var(--accent)">Go back to shop</a></div>';
    return;
  }

  const order = JSON.parse(data);

  card.innerHTML = `
    <div class="receipt-icon">✅</div>
    <h1>Payment Submitted!</h1>
    <p class="receipt-subtitle">Show this receipt to the shop owner to collect your drink.</p>
    <div class="receipt-details">
      <div class="receipt-row">
        <span class="receipt-label">Order Number</span>
        <span class="receipt-value order-number">${order.orderNumber}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Product</span>
        <span class="receipt-value">${order.productName}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Amount</span>
        <span class="receipt-value amount">${order.amount}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Time</span>
        <span class="receipt-value">${order.time}</span>
      </div>
    </div>
    <div class="receipt-footer">
      <p>Thank you for your purchase!</p>
      <a href="index.html" class="btn btn-secondary">Back to Shop</a>
    </div>
  `;

  // Clear the order from session so refreshing doesn't re-show stale data
  // (user already has the receipt on screen)
}

// ================================================================
// PAGE ROUTER — detect page and call the right function
// ================================================================
(function () {
  const path = window.location.pathname;

  if (path.endsWith('product.html')) {
    renderProductDetail();
  } else if (path.endsWith('confirm.html')) {
    renderConfirmPage();
  } else if (path.endsWith('receipt.html')) {
    renderReceipt();
  } else {
    // Default: homepage
    renderHomepage();
  }
})();
