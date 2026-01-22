# Deployment Checklist

## Before Deployment

### 1. Backend Setup
- [ ] MongoDB Atlas allows connections from `0.0.0.0/0`
- [ ] AWS Hackwow backend is running and accessible
- [ ] Have all API keys ready:
  - MongoDB URI
  - JWT Secret
  - Razorpay Key ID & Secret
  - Hackwow App ID & API Key

### 2. Code Ready
- [ ] All code committed to Git
- [ ] Tests passing (if any)
- [ ] `.env.production` created in frontend
- [ ] CORS origins updated in backend

---

## Deployment Steps

### Backend Deployment (Render Web Service)

1. **Create GitHub Repository**
   ```bash
   cd d:\hee\frontend1
   git init
   git add .
   git commit -m "Ready for deployment"
   # Create repo on GitHub, then:
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy on Render**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect GitHub repo
   - Settings:
     - Root Directory: `backend`
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Plan: Free

3. **Add Environment Variables** (in Render dashboard):
   ```
   NODE_ENV=production
   PORT=5001
   JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
   JWT_EXPIRE=30d
   USE_HACKWOW=true
   HACKWOW_API_URL=https://your-aws-hackwow-url.com
   HACKWOW_APP_ID=APP-1457f61c-772f-4ecf-824e-ba5918c83a3d
   HACKWOW_API_KEY=your_hackwow_api_key
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/busdb
   RAZORPAY_KEY_ID=rzp_test_RU9FdAlzUTbysa
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   FRONTEND_URL=https://your-frontend.onrender.com
   ```

4. **Deploy** - Click "Create Web Service"

5. **Copy Backend URL** - e.g., `https://bus-backend-abc.onrender.com`

---

### Frontend Deployment (Render Static Site)

1. **Update `.env.production`**
   - Replace `VITE_API_URL` with your backend URL:
   ```
   VITE_API_URL=https://bus-backend-abc.onrender.com/api
   ```

2. **Update Backend CORS**
   - Edit `backend/server.js`
   - Add your frontend URL to `allowedOrigins`
   - Commit and push

3. **Deploy on Render**
   - Click "New +" → "Static Site"
   - Connect same GitHub repo
   - Settings:
     - Root Directory: `frontend`
     - Build Command: `npm install && npm run build`
     - Publish Directory: `dist`

4. **Add Environment Variables**:
   ```
   VITE_API_URL=https://bus-backend-abc.onrender.com/api
   VITE_RAZORPAY_KEY_ID=rzp_test_RU9FdAlzUTbysa
   VITE_APP_NAME=EventBus
   ```

5. **Deploy** - Click "Create Static Site"

---

## After Deployment

### 1. Update AWS Hackwow CORS
Add Render URLs to Hackwow backend CORS whitelist:
```javascript
const allowedOrigins = [
  'https://bus-backend-abc.onrender.com',
  'https://bus-frontend-xyz.onrender.com'
];
```

### 2. Update Frontend URL in Backend
Go to Render backend → Environment → Update `FRONTEND_URL`

### 3. Test Everything
- [ ] Open frontend URL in browser
- [ ] Test user registration
- [ ] Test login
- [ ] Search for buses
- [ ] Book a seat
- [ ] Complete payment (test card: 4111 1111 1111 1111)
- [ ] Check booking confirmation page
- [ ] Test on mobile device

---

## URLs After Deployment

- **Frontend**: `https://_______.onrender.com`
- **Backend**: `https://_______.onrender.com`
- **Backend Health**: `https://_______.onrender.com/api/health`

---

## Common Issues

### ❌ Backend won't start
- Check logs in Render dashboard
- Verify all environment variables
- Check MongoDB allows connections from `0.0.0.0/0`

### ❌ Frontend can't connect to backend
- Verify `VITE_API_URL` in frontend env vars
- Check browser console for CORS errors
- Update backend CORS origins

### ❌ Payment not working
- Check Razorpay keys match in frontend and backend
- Test with card: 4111 1111 1111 1111

### ❌ Hackwow integration failing
- Verify AWS Hackwow URL is accessible
- Check Hackwow App ID and API Key
- Add Render URLs to Hackwow CORS

---

## Performance Tips

### Free Tier Limitations
- Backend sleeps after 15 min inactivity
- First request takes 30-60s to wake up
- Consider adding a health check monitor

### Optimization
- Enable gzip compression (already configured)
- Use CDN for static assets
- Consider upgrading to paid plan for production

---

## Need Help?

1. Check Render logs: Dashboard → Service → Logs
2. Check browser console for frontend errors
3. Test backend health endpoint
4. Verify environment variables match

---

**Ready to Deploy!** Follow the steps above and your app will be live on Render. 🚀
