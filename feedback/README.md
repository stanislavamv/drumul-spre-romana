# Site feedback form

A plain "something's wrong with the app" contact form on `PAGES.feedback`
(reachable from Progress → Settings → *Send feedback*, and from the mobile
menu), separate from [Corectorul](../agent/README.md). This isn't AI,
isn't per-call money, and its Lambda holds no Anthropic credentials — it
verifies a Cloudflare Turnstile token and emails the maintainer through
SES. See [`js/features/actions.js`](../js/features/actions.js) for
`sendSiteFeedback` and `ensureTurnstileWidget`, and
[`js/features/pages.js`](../js/features/pages.js) for `PAGES.feedback`.

A screenshot can be attached (one image, ≤3 MB, `png`/`jpeg`/`gif`/`webp`
only). It's base64-encoded client-side and sent inline with the rest of
the form — there's no S3 bucket or separate upload step — and
`handler.py` sends it as a real MIME attachment via SES's `SendRawEmail`,
which is the only SES call that supports attachments at all. Both the
type allowlist and the size cap are enforced again server-side, since the
client-side checks are only ever a courtesy.

**Why a real backend for a contact form:** the recipient address needs to
stay off the client entirely — a static page can't hide a string from
anyone who opens dev tools, but a Lambda env var never ships to the
browser at all. Turnstile is what keeps the volume down; not exposing the
address is what keeps a leaked/scraped copy of it from mattering much
either way.

## One-time setup (only you can do these — new accounts/keys)

### 1. Cloudflare Turnstile — the CAPTCHA

1. Sign up at [dash.cloudflare.com](https://dash.cloudflare.com) (free) if
   you don't already have an account.
2. Go to **Turnstile** in the sidebar → **Add site**.
3. Domain: `stanislavamv.github.io`. Widget mode: Managed (the default) is
   fine.
4. You get two keys:
   - **Site key** — public, safe to ship in client JS. Paste it into
     [`js/features/actions.js`](../js/features/actions.js) as
     `TURNSTILE_SITE_KEY`.
   - **Secret key** — private. This is the `TURNSTILE_SECRET` environment
     variable `deploy_lambda.py` reads below. Never commit it.

### 2. AWS SES — verify the address feedback gets sent to

SES starts every account in **sandbox mode**, which only allows sending
to/from *verified* addresses. Since this form sends the feedback address
email *from itself, to itself*, verifying that one address is enough —
no need to request production access.

1. AWS Console → **SES** → make sure you're in the same region as the
   Lambda (`us-east-1` by default, matching `agent/`).
2. **Verified identities** → **Create identity** → Email address →
   `stanislavamv@gmail.com` (or whichever address you want feedback sent
   to).
3. Click the verification link AWS emails to that address.
4. Confirm it shows **Verified** in the console before deploying — an
   unverified identity makes every send fail with `MessageRejected`.

## Deploying

```bash
cd feedback
# TURNSTILE_SECRET from step 1, FEEDBACK_TO from step 2, plus your usual
# AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_REGION.
python deploy_lambda.py
python deploy_apigw.py
```

`deploy_apigw.py` prints the live endpoint at the end — paste it into
`js/features/actions.js` as `SITE_FEEDBACK_ENDPOINT`, run
`python tools/stamp_assets.py`, and commit both.

Both scripts are safe to re-run: they update the existing role/function/API
instead of duplicating them, so changing the Turnstile secret or the
recipient address later is just re-running `deploy_lambda.py` with the new
value set.

## Testing it

1. Open the feedback page locally (`python tools/serve.py`, then
   Progress → Settings → *Send feedback*), or on the live site.
2. Fill in a message, solve the Turnstile challenge, submit.
3. Check the inbox at `FEEDBACK_TO` — a Reply-To header is set to whatever
   email the visitor optionally left, so replying in your normal mail
   client reaches them directly.

If submission fails immediately with a captcha error, double-check the
site key in `actions.js` matches the secret key deployed to the Lambda —
they're issued as a pair and a mismatched pair fails every time, not just
sometimes.
