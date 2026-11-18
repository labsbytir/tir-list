# Design

## Approach
- `moderate(text)`: length cap 500; link regex covers scheme, `www.`, and bare `name.tld` for common TLDs (com/io/dev/org/net/app/ai/co/xyz/site/online/me/so/to); banned/caps/duplicate rules stay.
- Stored flagged + reason; listings already filter flagged. UI hint line under the thread states the policy.

## Alternatives
- Reject with error instead of hold: rejected, adapter contract returns Comment; holds keep behavior uniform.
