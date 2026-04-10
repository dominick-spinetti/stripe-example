(function () {
  const nameEl = document.getElementById('customerName');
  const emailEl = document.getElementById('email');
  const orderIdEl = document.getElementById('orderId');
  const amountEl = document.getElementById('amount');

  const launchBtn = document.getElementById('launchPaymentModal');
  const copyGuideLinkBtn = document.getElementById('copyGuideLink');
  const openGuideBtn = document.getElementById('openGuide');
  const guideLinkPreview = document.getElementById('guideLinkPreview');

  const paymentModal = document.getElementById('paymentModal');
  const closePaymentModalBtn = document.getElementById('closePaymentModal');
  const paymentSummary = document.getElementById('paymentSummary');
  const checkoutNotice = document.getElementById('checkoutNotice');
  const continueToBankBtn = document.getElementById('continueToBank');

  let currentPaymentData = null;

  function getFormData() {
    return {
      provider: 'santander',
      customerName: nameEl.value.trim(),
      email: emailEl.value.trim(),
      orderId: orderIdEl.value.trim(),
      amount: amountEl.value.trim()
    };
  }

  function buildGuidePaymentUrl(data = getFormData()) {
    const base = 'https://dominick-spinetti.github.io/stripe-example/index.html';
    const hash = new URLSearchParams({
      pay: '1',
      provider: 'santander',
      customerName: data.customerName,
      email: data.email,
      orderId: data.orderId,
      amount: data.amount
    }).toString();

    return `${base}#${hash}`;
  }

  function buildMockConsentUrl(data) {
    const base = 'https://dominick-spinetti.github.io/stripe-example/santander-consent-demo.html';
    const qs = new URLSearchParams({
      provider: 'santander',
      customerName: data.customerName,
      email: data.email,
      orderId: data.orderId,
      amount: data.amount
    }).toString();

    return `${base}?${qs}`;
  }

  function updatePreview() {
    guideLinkPreview.textContent = buildGuidePaymentUrl();
  }

  function openPaymentModal(data) {
    currentPaymentData = data;
    paymentSummary.textContent =
      `Order ${data.orderId} · ${data.customerName} · ${data.email} · $${data.amount}`;
    checkoutNotice.classList.add('hidden');
    paymentModal.classList.remove('hidden');
  }

  function closePaymentModal() {
    paymentModal.classList.add('hidden');
  }

  async function continueToBank() {
    if (!currentPaymentData) return;

    if (window.DEMO_CONFIG?.DEMO_MODE) {
      window.location.href = buildMockConsentUrl(currentPaymentData);
      return;
    }

    if (!window.DEMO_CONFIG?.API_BASE_URL) {
      checkoutNotice.textContent = 'Set API_BASE_URL in assets/config.js.';
      checkoutNotice.classList.remove('hidden');
      return;
    }

    try {
      const response = await fetch(
        `${window.DEMO_CONFIG.API_BASE_URL}/api/santander/create-payment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentPaymentData)
        }
      );

      const result = await response.json();

      if (!response.ok || !result.redirectUrl) {
        throw new Error(result.error || 'Failed to create Santander payment');
      }

      window.location.href = result.redirectUrl;
    } catch (err) {
      checkoutNotice.textContent = err.message || 'Could not start Santander payment.';
      checkoutNotice.classList.remove('hidden');
    }
  }

  function maybeLaunchFromHash() {
    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.substring(1)
      : '';

    const params = new URLSearchParams(hash);

    if (params.get('pay') !== '1') return;
    if ((params.get('provider') || '').toLowerCase() !== 'santander') return;

    const data = {
      provider: 'santander',
      customerName: params.get('customerName') || 'Jenny Rosen',
      email: params.get('email') || 'jenny.rosen@example.com',
      orderId: params.get('orderId') || 'POC-1001',
      amount: params.get('amount') || '25.00'
    };

    nameEl.value = data.customerName;
    emailEl.value = data.email;
    orderIdEl.value = data.orderId;
    amountEl.value = data.amount;

    updatePreview();
    openPaymentModal(data);
  }

  launchBtn?.addEventListener('click', () => openPaymentModal(getFormData()));

  copyGuideLinkBtn?.addEventListener('click', async () => {
    const url = buildGuidePaymentUrl();
    await navigator.clipboard.writeText(url);
    guideLinkPreview.textContent = `Copied: ${url}`;
  });

  openGuideBtn?.addEventListener('click', () => {
    if (typeof cxone !== 'function') {
      alert('Guide embed script is not active yet.');
      return;
    }

    const data = getFormData();
    const paymentUrl = buildGuidePaymentUrl(data);

    try {
      cxone('guide', 'setCustomFields', {
        customerName: { value: data.customerName, hidden: true },
        contactCustomFields: [
          { ident: 'email', value: data.email, hidden: true },
          { ident: 'orderId', value: data.orderId, hidden: true },
          { ident: 'paymentAmount', value: data.amount, hidden: true },
          { ident: 'paymentProvider', value: 'santander', hidden: true },
          { ident: 'paymentUrl', value: paymentUrl, hidden: true }
        ]
      });

      cxone('guide', 'hidePreSurvey', data.customerName, { email: data.email });

      if (window.DEMO_CONFIG?.GUIDE_ENTRYPOINT_ID && window.DEMO_CONFIG.GUIDE_ENTRYPOINT_ID !== 'REPLACE_ME') {
        cxone('guide', 'openEntrypoint', window.DEMO_CONFIG.GUIDE_ENTRYPOINT_ID);
      } else {
        cxone('guide', 'openMenu');
      }
    } catch (err) {
      console.error(err);
      alert('Guide is embedded, but configuration still needs updating.');
    }
  });

  continueToBankBtn?.addEventListener('click', continueToBank);
  closePaymentModalBtn?.addEventListener('click', closePaymentModal);
  paymentModal?.addEventListener('click', (e) => {
    if (e.target === paymentModal) closePaymentModal();
  });

  window.addEventListener('hashchange', maybeLaunchFromHash);

  updatePreview();
  maybeLaunchFromHash();
})();
