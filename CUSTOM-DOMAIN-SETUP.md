# Setting Up Custom Domain: type.va-n.com

Your Worker is now ready to work with the custom subdomain `type.va-n.com`. Follow these steps to connect it via Cloudflare Dashboard.

---

## ✅ What's Already Configured

1. **Clerk Authentication**: Publishable key integrated ✅
2. **CORS**: Configured to allow requests from:
   - `https://type.va-n.com`
   - `https://mbti-app.qmpro.workers.dev`
   - `http://localhost:8787` (development)

---

## 📋 Steps to Connect Custom Domain

### 1. Open Cloudflare Dashboard

Go to: https://dash.cloudflare.com

### 2. Select Your Worker

1. Click **Workers & Pages** in the left sidebar
2. Click on **mbti-app**

### 3. Add Custom Domain

1. Click the **Settings** tab
2. Scroll to **Domains & Routes**
3. Click **Add Custom Domain**
4. Enter: `type.va-n.com`
5. Click **Add Domain**

Cloudflare will automatically:
- Create the DNS record for `type.va-n.com`
- Issue an SSL certificate
- Route traffic to your Worker

### 4. Verify DNS (if va-n.com is on Cloudflare)

If `va-n.com` is already on Cloudflare:
- The subdomain will be created automatically ✅

If `va-n.com` is NOT on Cloudflare yet:
1. Go to **Websites** in the dashboard
2. Click **Add a site**
3. Enter `va-n.com`
4. Follow the nameserver setup instructions

### 5. Wait for DNS Propagation

- Usually takes **2-5 minutes**
- Check status in the Worker Settings → Domains & Routes section
- When active, you'll see: ✅ Active

---

## 🧪 Test Your Custom Domain

Once activated, test these URLs:

```bash
# Health check
curl https://type.va-n.com/api/health

# Questions API
curl https://type.va-n.com/api/questions

# Open in browser
open https://type.va-n.com
```

---

## 🔧 Alternative: Using Routes (Advanced)

If you want more control over routing, you can use Routes instead:

### In Cloudflare Dashboard:

1. Go to **Workers & Pages** → **mbti-app**
2. Click **Settings** → **Triggers**
3. Under **Routes**, click **Add Route**
4. Enter:
   - **Route**: `type.va-n.com/*`
   - **Zone**: Select `va-n.com`
5. Click **Add Route**

---

## 🎯 What Happens After Setup

Once the custom domain is connected:

1. **Users can access**: `https://type.va-n.com`
2. **Old URL still works**: `https://mbti-app.qmpro.workers.dev`
3. **CORS configured**: API calls work from both domains
4. **SSL automatic**: Free Cloudflare SSL certificate

---

## 📱 Update Clerk Settings (Important!)

After setting up the custom domain, update your Clerk dashboard:

1. Go to: https://dashboard.clerk.com
2. Select your application
3. Go to **Settings** → **Domains**
4. Add: `type.va-n.com`
5. Update **Allowed redirect URLs**:
   - `https://type.va-n.com/*`

This ensures Clerk authentication works on the custom domain.

---

## 🚀 Current Status

- ✅ Worker deployed: `https://mbti-app.qmpro.workers.dev`
- ✅ Clerk key integrated
- ✅ CORS configured for `type.va-n.com`
- ✅ Database connected (Turso)
- ⏳ Custom domain: **Waiting for you to connect via Dashboard**

---

## 💡 Quick Tips

- **No code changes needed** - Just connect in Cloudflare Dashboard
- **Instant updates** - Changes propagate in seconds
- **Both domains work** - Keep the workers.dev URL as backup
- **Free SSL** - Cloudflare handles certificates automatically

---

## 📞 Need Help?

If you encounter issues:

1. Check DNS propagation: https://dnschecker.org/#A/type.va-n.com
2. Verify nameservers point to Cloudflare
3. Check Worker logs: `wrangler tail`
4. Ensure `va-n.com` is added to your Cloudflare account

---

Ready to connect! Just follow the steps above in your Cloudflare Dashboard. 🎉
