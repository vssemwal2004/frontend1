# Quick Start Deployment Guide

## 🚀 Deploy to Render in 5 Minutes

### Prerequisites
- ✅ AWS Hackwow backend running
- ✅ MongoDB Atlas configured
- ✅ GitHub account
- ✅ Render account (free)

---

## Step 1: Prepare Your Code (2 min)

### A. Create `.env.production` in frontend folder
```bash
cd frontend
```

Create file `.env.production`:
```env
VITE_API_URL=https://YOUR-BACKEND.onrender.com/api
VITE_RAZORPAY_KEY_ID=rzp_test_RU9FdAlzUTbysa
VITE_APP_NAME=EventBus
VITE_NODE_ENV=production
```
*(Replace YOUR-BACKEND with your actual backend URL after deploying backend)*

### B. Push to GitHub
```bash
cd ..
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

---

## Step 2: Deploy Backend (2 min)

1. Go to **https://dashboard.render.com**
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Fill in:
   ```
   Name: bus-booking-backend
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```

5. Add **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=5001
   JWT_SECRET=<your-secret-32-chars-min>
   JWT_EXPIRE=30d
   USE_HACKWOW=true
   HACKWOW_API_URL=<your-aws-url>
   HACKWOW_APP_ID=APP-1457f61c-772f-4ecf-824e-ba5918c83a3d
   HACKWOW_API_KEY=<your-key>
   MONGODB_URI=<your-mongodb-uri>
   RAZORPAY_KEY_ID=rzp_test_RU9FdAlzUTbysa
   RAZORPAY_KEY_SECRET=<your-secret>
   FRONTEND_URL=https://YOUR-FRONTEND.onrender.com
   ```

6. Click **"Create Web Service"**
7. **Copy the backend URL** (e.g., `https://bus-backend-xyz.onrender.com`)

---

## Step 3: Update and Deploy Frontend (1 min)

### A. Update `.env.production`
Replace `YOUR-BACKEND` with actual URL:
```env
VITE_API_URL=https://bus-backend-xyz.onrender.com/api
```

### B. Update Backend CORS
Edit `backend/server.js`, add your frontend URL:
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
  'https://YOUR-FRONTEND.onrender.com'  // Add this
];
```

### C. Commit and Push
```bash
git add .
git commit -m "Update production URLs"
git push
```

### D. Deploy Frontend on Render
1. Click **"New +"** → **"Static Site"**
2. Connect same GitHub repo
3. Fill in:
   ```
   Name: bus-booking-frontend
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

4. Add **Environment Variables**:
   ```
   VITE_API_URL=https://bus-backend-xyz.onrender.com/api
   VITE_RAZORPAY_KEY_ID=rzp_test_RU9FdAlzUTbysa
   VITE_APP_NAME=EventBus
   ```

5. Click **"Create Static Site"**

---

## Step 4: Final Configuration

### Update Backend with Frontend URL
1. Go to backend service in Render
2. Environment → Edit `FRONTEND_URL`
3. Set to: `https://YOUR-FRONTEND.onrender.com`
4. Click **"Save Changes"** (will auto-redeploy)

### Update AWS Hackwow CORS
Add your Render URLs to Hackwow CORS whitelist

---

## ✅ Done! Test Your App

Open: `https://YOUR-FRONTEND.onrender.com`

Test:
1. ✅ Login/Register
2. ✅ Search buses
3. ✅ Book seats
4. ✅ Payment (card: 4111 1111 1111 1111)
5. ✅ Test on mobile

---

## 🎉 Your URLs

- **Frontend**: https://bus-booking-frontend.onrender.com
- **Backend**: https://bus-booking-backend.onrender.com
- **Health Check**: https://bus-booking-backend.onrender.com/api/health

---

## ⚠️ Important Notes

### Free Tier
- Backend sleeps after 15 min → First request takes 30-60s
- 750 hours/month limit

### MongoDB Atlas
- Allow connections from: `0.0.0.0/0`
- Network Access → Add IP Address → Allow from anywhere

### Troubleshooting
- **Backend won't start**: Check logs in Render dashboard
- **CORS error**: Verify frontend URL in backend CORS
- **Payment fails**: Check Razorpay keys match

---

## Need Help?

1. Check `DEPLOYMENT_GUIDE.md` for detailed docs
2. Check `DEPLOYMENT_CHECKLIST.md` for step-by-step
3. View logs: Render Dashboard → Service → Logs

**Happy Deploying! 🚀**
