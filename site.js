(function () {
  const nameEl = document.getElementById('customerName');
  const emailEl = document.getElementById('email');
  const orderIdEl = document.getElementById('orderId');
  const amountEl = document.getElementById('amount');
  const openPaymentPageBtn = document.getElementById('openPaymentPage');
  const openGuideBtn = document.getElementById('openGuide');

  function buildPaymentUrl() {
    const params = new URLSearchParams({
      customerName: nameEl.value.trim(),
      email: emailEl.value.trim(),
      orderId: orderIdEl.value.trim(),
      amount: amountEl.value.trim()
    });

    return `./demo-pay.html?${params.toString()}`;
  }

  openPaymentPageBtn?.addEventListener('click', () => {
    location.href = buildPaymentUrl();
  });

  openGuideBtn?.addEventListener('click', () => {
    if (typeof cxone !== 'function') {
      alert('Guide embed script is not active yet.');
      return;
    }

    try {
      cxone('guide', 'setFullDisplay');
      cxone('guide', 'setCustomFields', {
        customerName: { value: nameEl.value.trim(), hidden: true },
        contactCustomFields: [
          { ident: 'email', value: emailEl.value.trim(), hidden: true },
          { ident: 'orderId', value: orderIdEl.value.trim(), hidden: true },
          { ident: 'paymentAmount', value: amountEl.value.trim(), hidden: true },
          { ident: 'paymentUrl', value: new URL(buildPaymentUrl(), location.href).toString(), hidden: true }
        ]
      });
      cxone('guide', 'hidePreSurvey', nameEl.value.trim(), { email: emailEl.value.trim() });

      if (window.DEMO_CONFIG?.GUIDE_ENTRYPOINT_ID && window.DEMO_CONFIG.GUIDE_ENTRYPOINT_ID !== 'REPLACE_ME') {
        cxone('guide', 'openEntrypoint', window.DEMO_CONFIG.GUIDE_ENTRYPOINT_ID);
      } else {
        cxone('guide', 'openMenu');
      }
    } catch (e) {
      console.error(e);
      alert('Guide is embedded, but one of the configuration values still needs to be updated.');
    }
  });
})();
