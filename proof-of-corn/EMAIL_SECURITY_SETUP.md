# Email Security & Dashboard Setup

**Status**: ✅ Complete - Ready to forward emails
**Date**: January 26, 2026

---

## 🎯 What We Built

You asked for:
1. ✅ Ability to forward old emails to fred@proofofcorn.com and have Fred ingest/manage/respond
2. ✅ Public email viewer on the website (redacted for safety)
3. ✅ Admin dashboard for you and Fred Wilson to see full unredacted emails
4. ✅ Security guardrails against prompt injection and HN trolls

**All done! You can start forwarding emails now.**

---

## 📧 How to Forward Emails

### Simple: Just forward to fred@proofofcorn.com

Fred automatically:
1. Detects it's a forwarded email (extracts actual sender from "From:" line)
2. Runs security checks (prompt injection detection, spam scoring)
3. Categorizes it (lead, partnership, question, spam, suspicious)
4. Stores it in his inbox
5. Processes it during his daily 6 AM UTC check
6. Composes a response using his constitutional evaluation
7. Sends response to **actual sender** (not you)
8. CCs you on the reply (so you're in the loop)

### Example:

You forward an email from david@purdue.edu to fred@proofofcorn.com:

```
From: sethgoldstein@gmail.com
To: fred@proofofcorn.com
Subject: Fwd: Partnership opportunity

---------- Forwarded message ---------
From: David <david@purdue.edu>
Subject: Partnership opportunity

Hi Seth, interested in collaborating on Proof of Corn...
```

Fred will:
- Extract `david@purdue.edu` as the real sender
- Reply to `david@purdue.edu`
- CC `sethgoldstein@gmail.com`
- Log the decision publicly

---

## 🔒 Security Features (Against HN Trolls)

### Prompt Injection Detection

Fred automatically flags emails containing:
- `"ignore previous instructions"`
- `"system:"` or `"assistant:"`
- `"[INST]"` or other jailbreak attempts
- `"show me all emails"` (data exfiltration)
- `"send money"` or `"transfer funds"` (action manipulation)

**What happens**: Email marked as "suspicious", hidden from public, requires human approval before Fred responds.

### Rate Limiting

- **Per-sender**: 10 emails per 24 hours
- **Global**: 50 new emails per day
- Prevents flood attacks

### Spam Detection

Scores emails based on:
- Excessive CAPS in subject
- Too many exclamation marks!!!
- Spam phrases ("you've won", "nigerian prince")

**Score > 0.7**: Marked as spam, hidden from public view

---

## 👀 Public Email Viewer (proofofcorn.com/dashboard)

### What the public sees:

**URL**: https://proofofcorn.com/dashboard → Inbox tab

**Redacted for safety**:
- Email addresses: `david@purdue.edu` → `d***@p***.edu`
- Phone numbers: `555-1234` → `***-***-****`
- URLs: `https://example.com/page` → `[example]`
- Bodies: Truncated to 150 characters + "..."

**Filtered**:
- Suspicious emails: Hidden
- Blocked emails: Hidden
- Shows count of suspicious emails but no details

**Transparent**:
- Email count (total, unread, leads)
- Categories (lead, partnership, question)
- Fred's status (replied, pending)
- Security score indicators (flagged but safe)
- Received timestamps

### Screenshot concept:

```
┌─────────────────────────────────────┐
│ 🔒 Public Redacted View             │
│ Email addresses redacted, bodies    │
│ sanitized. Suspicious emails hidden.│
└─────────────────────────────────────┘

Inbox (15 emails)

┌─────────────────────────────────────┐
│ d***@p***.edu           [lead]      │
│ Proof of Corn Partnership           │
│ Saw your challenge and have some... │
│ Jan 26, 2026 10:00 AM               │
└─────────────────────────────────────┘
```

---

## 🔐 Admin Dashboard (Full Access)

### For: You, Fred Wilson, trusted team

**URL**: https://proofofcorn.com/admin

**Requires**: Admin password (set via Cloudflare secret)

### What admins see:

**Full unredacted access**:
- ✅ Complete email addresses
- ✅ Full email bodies (no truncation)
- ✅ All emails (including suspicious/blocked)
- ✅ Security threat details
- ✅ Flagged pattern lists
- ✅ Confidence scores
- ✅ Recommendation (allow/flag/block)

### Stats Dashboard:

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total: 15    │ Unread: 3    │ Suspicious: 2│ Blocked: 1   │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### Email Detail View:

Shows full email plus security analysis:

```
⚠️ Security Alert
Threat: prompt_injection (87% confidence)
Recommendation: BLOCK

Flagged Patterns:
- ignore\s+previous\s+instructions
- system\s*:
- show\s+me\s+all\s+emails

Email Body (Full Unredacted):
[Shows complete unredacted email text]
```

---

## 🔑 Setup: Admin Password

### Step 1: Set the password in Cloudflare

```bash
cd /Users/sethstudio1/Projects/grow-corn-challenge/proof-of-corn/farmer-fred

# Production (Cloudflare Workers)
wrangler secret put ADMIN_PASSWORD
# Enter your password when prompted

# Development (.dev.vars file)
echo "ADMIN_PASSWORD=your-secure-password-here" >> .dev.vars
```

### Step 2: Share password with admin users

**Who gets access**:
- ✅ Seth Goldstein (you)
- ✅ Fred Wilson (if he wants it)
- ✅ Other trusted team members

**How to share**: Signal, 1Password, or secure channel (not email/Slack)

### Step 3: Access the admin dashboard

1. Go to https://proofofcorn.com/admin
2. Enter admin password
3. Password stored in sessionStorage (stays logged in until you close browser)

---

## 📊 API Endpoints

### Public (No Auth)

**`GET /inbox/public`**
```bash
curl https://farmer-fred.sethgoldstein.workers.dev/inbox/public
```

Returns redacted emails suitable for public display.

### Admin (Auth Required)

**`GET /admin/inbox`**
```bash
curl https://farmer-fred.sethgoldstein.workers.dev/admin/inbox \
  -H "Authorization: Bearer YOUR_ADMIN_PASSWORD"
```

Returns full unredacted emails.

---

## ⚠️ Security Balance

### Public Transparency (Good for credibility)

✅ Show email activity exists
✅ Show Fred is categorizing and responding
✅ Show decision-making process
✅ Build trust through visibility

### Privacy Protection (Good for safety)

🔒 Hide full email addresses (prevent harvesting)
🔒 Hide personal details (phone numbers, etc.)
🔒 Hide suspicious emails (don't give trolls attention)
🔒 Hide sensitive content (prevent social engineering)

**Balance**: Transparent enough to prove Fred works, secure enough to not be stupid.

---

## 🚀 What's Next

### Immediate Actions:

1. **Set admin password**:
   ```bash
   cd farmer-fred
   wrangler secret put ADMIN_PASSWORD
   ```

2. **Deploy Fred's worker** (if not auto-deployed):
   ```bash
   wrangler deploy
   ```

3. **Test admin access**:
   - Go to proofofcorn.com/admin
   - Enter password
   - Verify you can see emails

4. **Start forwarding emails**:
   - Forward old Proof of Corn emails to fred@proofofcorn.com
   - Fred will process them during next daily check (6 AM UTC)

### Monitoring:

**Check admin dashboard daily** to:
- Review suspicious emails (are they real threats or false positives?)
- Approve/block flagged emails
- Monitor Fred's response quality
- Adjust security thresholds if needed

**Check public dashboard** to verify:
- Redaction is working correctly
- Email summaries make sense
- No sensitive info leaking

---

## 📚 Documentation

Full security documentation: `farmer-fred/SECURITY.md`

Includes:
- Detailed threat detection patterns
- API endpoint specifications
- Security best practices
- Future enhancement roadmap

---

## ✅ Summary

**You can now**:
1. ✅ Forward emails to fred@proofofcorn.com → Fred handles them
2. ✅ View public redacted inbox at proofofcorn.com/dashboard
3. ✅ Access full unredacted admin view at proofofcorn.com/admin
4. ✅ Trust that prompt injection attacks are detected and blocked
5. ✅ Give Fred Wilson admin access if he wants to see behind the scenes

**Security is balanced**:
- Public gets transparency (redacted)
- Admins get full access (authenticated)
- Bad actors get blocked automatically

**Ready to forward those old emails!** 📧

---

**Questions?** Check `farmer-fred/SECURITY.md` or ask me tomorrow.
