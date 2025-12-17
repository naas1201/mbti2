# Clerk Quick Reference Guide

## Essential Links

### Clerk Instance
- **Instance Name**: `renewed-serval-10`
- **Dashboard**: https://dashboard.clerk.com/apps/renewed-serval-10

### Authentication URLs
| Purpose | URL | Notes |
|---------|-----|-------|
| **Sign In** | `https://renewed-serval-10.accounts.dev/sign-in` | Add `?redirect_url=[encoded_url]?clerk_callback=success` |
| **Sign Up** | `https://renewed-serval-10.accounts.dev/sign-up` | Add `?redirect_url=[encoded_url]?clerk_callback=success` |
| **Unauthorized Sign-In** | `https://renewed-serval-10.accounts.dev/unauthorized-sign-in` | For unauthorized access attempts |
| **User Profile** | `https://renewed-serval-10.accounts.dev/user` | User management portal |
| **Account Portal** | `https://renewed-serval-10.accounts.dev/` | Main account portal |

### API Keys
- **Publishable Key**: `pk_test_cmVuZXdlZC1zZXJ2YWwtMTAuY2xlcmsuYWNjb3VudHMuZGV2JA`
- **Key Type**: Test key (starts with `pk_test_`)
- **API Keys Page**: https://dashboard.clerk.com/last-active?path=api-keys

## Implementation Code Snippets

### Redirect to Sign In
```javascript
const signInUrl = `https://renewed-serval-10.accounts.dev/sign-in?redirect_url=` + 
                 encodeURIComponent(window.location.href + '?clerk_callback=success');
window.location.href = signInUrl;
```

### Redirect to Sign Up
```javascript
const signUpUrl = `https://renewed-serval-10.accounts.dev/sign-up?redirect_url=` + 
                 encodeURIComponent(window.location.href + '?clerk_callback=success');
window.location.href = signUpUrl;
```

### Detect Callback
```javascript
// Check for Clerk callback in URL
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('clerk_callback') === 'success') {
    // User authenticated successfully
    // Clean URL: remove query parameters
    window.history.replaceState({}, document.title, window.location.pathname);
}
```

## LocalStorage Keys
- **Auth State**: `clerk-auth-state` (stores user info as JSON)
- **Example Structure**:
```json
{
  "email": "user@example.com",
  "name": "Test User",
  "timestamp": 1671234567890
}
```

## Environment Variables
```bash
# .env.example
CLERK_PUBLISHABLE_KEY=pk_test_cmVuZXdlZC1zZXJ2YWwtMTAuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_DOMAIN=renewed-serval-10.accounts.dev
```

## Testing Commands

### Browser Console
```javascript
// Check current auth state
console.log('Auth:', localStorage.getItem('clerk-auth-state'));

// Check URL parameters
console.log('Params:', new URLSearchParams(window.location.search).toString());

// Clear auth (for testing)
localStorage.removeItem('clerk-auth-state');
location.reload();
```

### curl Commands
```bash
# Test health endpoint
curl https://your-worker.workers.dev/health

# Test with Clerk callback simulation
curl "https://your-worker.workers.dev/test?clerk_callback=success"
```

## File Locations
- **Main Application**: `mbti2/public/index.html`
- **Auth Test Page**: `mbti2/public/test.html`
- **Clerk Docs**: `mbti2/CLERK-AUTHENTICATION.md`
- **Quick Reference**: `mbti2/CLERK-QUICK-REFERENCE.md` (this file)

## Common Issues & Fixes

### Issue: Redirect not working
**Check**: 
1. URL encoding is correct
2. Redirect URL includes `?clerk_callback=success`
3. No ad blockers interfering

### Issue: Auth state not persisting
**Check**:
1. localStorage is enabled in browser
2. JSON parsing/stringifying correctly
3. Key name is `clerk-auth-state`

### Issue: "Missing publishableKey"
**Solution**: Use custom Clerk constructor (already implemented in both HTML files)

## Quick Test Steps
1. Open `test.html` in browser
2. Click "Sign In with Clerk"
3. Should redirect to Clerk sign-in page
4. After auth, should redirect back with `?clerk_callback=success`
5. Should show user info

## Deployment Checklist
- [ ] Clerk domain URLs correct in code
- [ ] Redirect URLs properly encoded
- [ ] Callback detection working
- [ ] localStorage persistence tested
- [ ] Fallback mechanisms working
- [ ] No console errors

## Support Resources
- **Clerk Docs**: https://clerk.com/docs
- **Dashboard**: https://dashboard.clerk.com
- **API Reference**: https://clerk.com/docs/reference
- **Support**: https://clerk.com/docs/support

---

*Instance: renewed-serval-10*  
*Last Updated: December 2024*  
*Implementation: Bulletproof Custom Constructor*