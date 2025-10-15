# 🚀 Deployment Guide - Nyxta CMS

## Quick Deploy Options

### Option 1: Vercel (Recommended) ⚡

**Steps:**

1. **Install Vercel CLI** (optional)
```bash
npm i -g vercel
```

2. **Build the project**
```bash
npm run build
```

3. **Deploy via Vercel website**
   - Go to [vercel.com](https://vercel.com)
   - Import your Git repository
   - Configure environment variables
   - Deploy!

**Environment Variables on Vercel:**
```
VITE_BACKEND_URL=https://your-backend-api.com
VITE_IMGHIPPO_API=your_api_key
```

---

### Option 2: Netlify 🎯

**Steps:**

1. **Build the project**
```bash
npm run build
```

2. **Deploy via Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag & drop `dist/` folder
   - Or connect Git repository

**netlify.toml** (optional):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Environment Variables:**
```
VITE_BACKEND_URL=https://your-backend-api.com
VITE_IMGHIPPO_API=your_api_key
```

---

### Option 3: GitHub Pages 🐙

**Steps:**

1. **Install gh-pages**
```bash
npm install --save-dev gh-pages
```

2. **Update vite.config.ts**
```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ... rest of config
})
```

3. **Add deploy script to package.json**
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

4. **Deploy**
```bash
npm run deploy
```

⚠️ **Note:** GitHub Pages doesn't support environment variables. You'll need to hardcode URLs or use a different solution for production.

---

### Option 4: AWS S3 + CloudFront ☁️

**Steps:**

1. **Build the project**
```bash
npm run build
```

2. **Install AWS CLI**
```bash
# Follow AWS CLI installation guide
aws configure
```

3. **Create S3 bucket**
```bash
aws s3 mb s3://nyxta-cms
```

4. **Upload files**
```bash
aws s3 sync dist/ s3://nyxta-cms --delete
```

5. **Configure bucket for website hosting**
```bash
aws s3 website s3://nyxta-cms --index-document index.html
```

6. **Setup CloudFront** (optional, for HTTPS)
   - Create CloudFront distribution
   - Point to S3 bucket
   - Configure SSL certificate

---

### Option 5: Docker 🐳

**Dockerfile:**
```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Build and run:**
```bash
docker build -t nyxta-cms .
docker run -p 8080:80 nyxta-cms
```

---

## Pre-Deployment Checklist

- [ ] Update `.env` with production values
- [ ] Test build locally: `npm run build && npm run preview`
- [ ] Check all API endpoints work
- [ ] Verify ImageHippo integration
- [ ] Test on different browsers
- [ ] Test responsive design
- [ ] Remove console.logs (if any)
- [ ] Update README with deployment URL

---

## Environment Variables Setup

### For Development
```env
VITE_BACKEND_URL=http://localhost:3000
VITE_IMGHIPPO_API=your_development_key
```

### For Production
```env
VITE_BACKEND_URL=https://api.nyxta.com
VITE_IMGHIPPO_API=your_production_key
```

---

## CORS Configuration

Ensure your backend allows requests from your frontend domain:

**Backend (Express):**
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend-domain.com'
  ]
}));
```

---

## Custom Domain Setup

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Netlify
1. Go to Domain Settings
2. Add custom domain
3. Update DNS records

---

## SSL/HTTPS

Most modern hosting platforms (Vercel, Netlify) provide free SSL certificates automatically.

For manual setup:
- Use Let's Encrypt
- Configure in your web server (Nginx/Apache)

---

## Performance Optimization

### Before Deploy

1. **Code Splitting** (already enabled with Vite)
2. **Image Optimization**
   - ImageHippo handles this
3. **Minification** (automatic in build)
4. **Tree Shaking** (automatic in build)

### After Deploy

1. **Enable Gzip/Brotli** on server
2. **Setup CDN** (CloudFlare, AWS CloudFront)
3. **Cache static assets**
4. **Monitor with analytics**

---

## Continuous Deployment

### GitHub Actions Example

**.github/workflows/deploy.yml:**
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_BACKEND_URL: ${{ secrets.VITE_BACKEND_URL }}
          VITE_IMGHIPPO_API: ${{ secrets.VITE_IMGHIPPO_API }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## Monitoring & Analytics

### Add Analytics (Optional)

1. **Google Analytics**
```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
```

2. **Error Tracking** (Sentry)
```bash
npm install @sentry/react
```

---

## Troubleshooting Deployment

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### 404 on Refresh
- Add redirect rules (see Netlify/Vercel configs above)
- Ensure SPA routing is configured

### API Connection Issues
- Check CORS settings
- Verify environment variables
- Check network tab in browser

### Images Not Loading
- Verify ImageHippo API key
- Check browser console for errors
- Test ImageHippo endpoint directly

---

## Rollback Strategy

1. Keep previous builds
2. Use Git tags for versions
3. Vercel/Netlify have instant rollback

```bash
# Git tag for versions
git tag v1.0.0
git push --tags
```

---

## Post-Deployment

1. **Test Everything**
   - Create a branch
   - Upload images
   - Manage enquiries
   
2. **Monitor**
   - Check error logs
   - Monitor API calls
   - Watch for performance issues

3. **Update Documentation**
   - Add deployment URL to README
   - Document any custom configurations

---

## Cost Estimates

| Platform | Free Tier | Paid Plans |
|----------|-----------|------------|
| Vercel | 100GB bandwidth | $20/mo |
| Netlify | 100GB bandwidth | $19/mo |
| GitHub Pages | Free | Free |
| AWS S3 + CloudFront | 1 year free tier | ~$5-20/mo |

---

## Support & Maintenance

### Regular Tasks
- Monitor backend API health
- Check ImageHippo usage
- Review enquiries
- Update dependencies monthly

### Updates
```bash
# Check for updates
npm outdated

# Update packages
npm update

# Test after updates
npm run dev
npm run build
```

---

## 🎉 You're Ready to Deploy!

Choose a platform, follow the steps, and your Nyxta CMS will be live!

Need help? Check the platform's documentation or reach out to their support.
