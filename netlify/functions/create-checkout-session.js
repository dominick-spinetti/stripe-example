const Stripe = require('stripe');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return json(405, { error: 'Method not allowed' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const body = JSON.parse(event.body || '{}');

    const orderId = body.orderId || 'POC-1001';
    const email = body.email || 'jenny.rosen@example.com';
    const customerName = body.customerName || 'Jenny Rosen';
    const amount = Number(body.amount || 25);

    if (!amount || amount <= 0) {
      return json(400, { error: 'Invalid amount' });
    }

    const unitAmount = Math.round(amount * 100);
    const siteBase = process.env.SITE_BASE_URL;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      ui_mode: 'embedded',
      customer_email: email,
      client_reference_id: orderId,
      return_url: `${siteBase}/demo-return.html?session_id={CHECKOUT_SESSION_ID}`,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `CXone Guide POC payment ${orderId}`,
              description: `Demo payment for ${customerName}`
            },
            unit_amount: unitAmount
          },
          quantity: 1
        }
      ],
      metadata: {
        source: 'cxone-guide-poc',
        orderId,
        customerName
      }
    });

    return json(200, { clientSecret: session.client_secret });
  } catch (err) {
    console.error(err);
    return json(500, { error: err.message || 'Failed to create Checkout Session' });
  }
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    body: JSON.stringify(body)
  };
}
