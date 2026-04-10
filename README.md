# CXone Guide + Stripe POC

This repo contains:

- GitHub Pages front end
- Netlify functions for Stripe test mode
- Sample Guide launch pattern for a payment flow

## Static site
Host these files on GitHub Pages.

## Backend
Deploy `netlify/functions` on Netlify.

Set these environment variables in Netlify:

- `STRIPE_SECRET_KEY`
- `SITE_BASE_URL`

## Front-end config
Edit `assets/config.js`:

- `SITE_BASE_URL`
- `API_BASE_URL`
- `STRIPE_PUBLISHABLE_KEY`
- optional Guide IDs

## Test card
Use:

- `4242 4242 4242 4242`
- any future expiry
- any 3-digit CVC
- any ZIP/postal code

## Guide
Paste your tenant-specific embed script into `index.html`.

Then configure your Guide channel/bot to send users to:

`{{paymentUrl}}`

or a hard-coded test URL like:

`https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME/demo-pay.html?customerName=Jenny%20Rosen&email=jenny.rosen@example.com&orderId=POC-1001&amount=25.00`
