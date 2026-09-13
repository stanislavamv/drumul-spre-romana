# -*- coding: utf-8 -*-
"""AWS Lambda entrypoint for the site's general feedback form.

Separate from agent/ on purpose: agent/ is Corectorul, the writing-feedback
agent, which costs real money per call and checks a learner's Romanian.
This is a plain contact form -- verify a Cloudflare Turnstile token, then
email the maintainer. No AI involved, no per-call API cost. The two exist
as different Lambdas so a bug or an incident in one can't take down the
other, and so this one's IAM role only ever needs ses:SendEmail, never the
Anthropic credentials the other holds.

The address it sends to lives only here, as an environment variable --
never in the client code, never in a response body. Turnstile is what
keeps the volume of that inbox down.
"""
import base64
import json
import os
import urllib.parse
import urllib.request
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import boto3

TURNSTILE_SECRET = os.environ["TURNSTILE_SECRET"]
FEEDBACK_TO = os.environ["FEEDBACK_TO"]
SES_REGION = os.environ.get("SES_REGION", "us-east-1")

# A contact-form message has no reason to be long; this is just a hard
# stop against someone pasting megabytes into the textarea.
MAX_MESSAGE_CHARS = 4000

# Matches MAX_FEEDBACK_ATTACHMENT_BYTES in js/features/actions.js. The
# client already enforces this; this is the copy that actually matters,
# since a request can always skip the browser entirely. Base64 inflates
# the decoded size by roughly a third on the wire, which is why the
# client's own cap leaves headroom under Lambda's 6MB synchronous-invoke
# payload ceiling rather than sitting right at 3MB of *encoded* data.
MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024
ALLOWED_ATTACHMENT_TYPES = {"image/png", "image/jpeg", "image/gif", "image/webp"}

CATEGORY_LABELS = {
    "bug": "Something is broken",
    "confusing": "Explanation is confusing",
    "content": "Romanian content issue",
    "feature": "Feature suggestion",
    "general": "General feedback",
}

_ses = boto3.client("ses", region_name=SES_REGION)


def handler(event, context):
    try:
        body = json.loads(event.get("body") or "{}")
    except (json.JSONDecodeError, AttributeError):
        body = {}

    token = str(body.get("token") or "").strip()
    message = str(body.get("message") or "").strip()
    category = str(body.get("category") or "general")
    reply_to = str(body.get("email") or "").strip()

    if not token:
        return _response(400, {"error": "Missing captcha token."})
    if not message:
        return _response(400, {"error": "No feedback text submitted."})
    if len(message) > MAX_MESSAGE_CHARS:
        return _response(400, {"error": "Feedback is too long (max %d characters)." % MAX_MESSAGE_CHARS})

    attachment = body.get("attachment")
    att_bytes = att_type = att_name = None
    if attachment:
        att_type = str(attachment.get("type") or "")
        att_name = str(attachment.get("name") or "screenshot")[:100]
        if att_type not in ALLOWED_ATTACHMENT_TYPES:
            return _response(400, {"error": "Unsupported attachment type."})
        try:
            att_bytes = base64.b64decode(str(attachment.get("data") or ""), validate=True)
        except Exception:
            return _response(400, {"error": "Attachment could not be read."})
        if len(att_bytes) > MAX_ATTACHMENT_BYTES:
            return _response(400, {"error": "Attachment is too large (max 3 MB)."})

    remote_ip = _source_ip(event)
    if not _verify_turnstile(token, remote_ip):
        return _response(400, {"error": "Captcha verification failed. Please try again."})

    _send_email(category, message, reply_to, att_bytes, att_type, att_name)
    return _response(200, {"ok": True})


def _source_ip(event):
    try:
        return event["requestContext"]["http"]["sourceIp"]
    except (KeyError, TypeError):
        return None


def _verify_turnstile(token, remote_ip):
    params = {"secret": TURNSTILE_SECRET, "response": token}
    if remote_ip:
        params["remoteip"] = remote_ip
    data = urllib.parse.urlencode(params).encode()
    req = urllib.request.Request(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify", data=data
    )
    with urllib.request.urlopen(req, timeout=5) as resp:
        result = json.loads(resp.read())
    return bool(result.get("success"))


def _send_email(category, message, reply_to, att_bytes, att_type, att_name):
    label = CATEGORY_LABELS.get(category, category)
    body_text = "%s\n\n%s" % (message, ("Reply-to: %s" % reply_to if reply_to else "(no reply email given)"))
    subject = "Drumul spre Romana feedback: %s" % label

    if not att_bytes:
        kwargs = dict(
            Source=FEEDBACK_TO,
            Destination={"ToAddresses": [FEEDBACK_TO]},
            Message={
                "Subject": {"Data": subject},
                "Body": {"Text": {"Data": body_text}},
            },
        )
        if reply_to:
            kwargs["ReplyToAddresses"] = [reply_to]
        _ses.send_email(**kwargs)
        return

    # SendEmail has no attachment support at all -- a raw MIME message via
    # SendRawEmail is the only way SES accepts one, hence the two
    # completely separate send paths rather than one call with an
    # optional part.
    msg = MIMEMultipart()
    msg["Subject"] = subject
    msg["From"] = FEEDBACK_TO
    msg["To"] = FEEDBACK_TO
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.attach(MIMEText(body_text, "plain"))
    image = MIMEImage(att_bytes, _subtype=att_type.split("/")[-1])
    image.add_header("Content-Disposition", "attachment", filename=att_name)
    msg.attach(image)
    _ses.send_raw_email(
        Source=FEEDBACK_TO,
        Destinations=[FEEDBACK_TO],
        RawMessage={"Data": msg.as_string()},
    )


def _response(status_code, payload):
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(payload, ensure_ascii=False),
    }
