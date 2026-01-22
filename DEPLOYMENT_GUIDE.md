# Deployment Guide for Render

## Prerequisites
- GitHub account
- Render account (https://render.com)
- AWS Hackwow backend already deployed

## Backend Deployment (Web Service)

### Step 1: Push Code to GitHub
```bash
cd d:\hee\frontend1
git init
git add .
git commit -m "Initial commit for deployment"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Deploy on Render

1. **Go to Render Dashboard** → https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository (`frontend1`)
4. Configure:
   - **Name**: `bus-booking-backend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

5. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=5001
   JWT_SECRET=<your-secret-key>
   JWT_EXPIRE=30d
   USE_HACKWOW=true
   HACKWOW_API_URL=<your-aws-hackwow-url>
   HACKWOW_APP_ID=APP-1457f61c-772f-4ecf-824e-ba5918c83a3d
   HACKWOW_API_KEY=<your-hackwow-api-key>
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   RAZORPAY_KEY_ID=rzp_test_RU9FdAlzUTbysa
   RAZORPAY_KEY_SECRET=<your-razorpay-secret>
   FRONTEND_URL=https://your-frontend.onrender.com
   ```

6. Click **"Create Web Service"**
7. Wait for deployment (5-10 minutes)
8. **Copy the backend URL** (e.g., `https://bus-booking-backend.onrender.com`)

---

## Frontend Deployment (Static Site)

### Step 1: Update Frontend Environment

1. Open `frontend/.env.production`
2. Replace `VITE_API_URL` with your Render backend URL:
   ```
   VITE_API_URL=https://bus-booking-backend.onrender.com/api
   ```

3. Commit changes:
   ```bash
   git add .
   git commit -m "Update production API URL"
   git push
   ```

### Step 2: Deploy Frontend on Render

1. **Go to Render Dashboard**
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository (`frontend1`)
4. Configure:
   - **Name**: `bus-booking-frontend` (or your preferred name)
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

5. **Add Environment Variables**:
   ```
   VITE_API_URL=https://bus-booking-backend.onrender.com/api
   VITE_RAZORPAY_KEY_ID=rzp_test_RU9FdAlzUTbysa
   VITE_APP_NAME=EventBus
   VITE_NODE_ENV=production
   ```

6. Click **"Create Static Site"**
7. Wait for deployment
8. **Your app is live!** → `https://bus-booking-frontend.onrender.com`

---

## Post-Deployment Configuration

### 1. Update Backend CORS
The backend is already configured to allow your frontend URL. Verify in `backend/server.js`:
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://your-frontend.onrender.com',  // Add your actual URL here
  process.env.FRONTEND_URL
];
```

### 2. Update AWS Hackwow CORS
Add your Render URLs to Hackwow backend CORS whitelist:
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5001',
  'https://bus-booking-frontend.onrender.com',  // Your frontend
  'https://bus-booking-backend.onrender.com'    // Your backend
];
```

### 3. Test the Deployment

1. **Open your frontend URL** in browser
2. **Test user registration/login**
3. **Search for buses**
4. **Complete a booking** with Razorpay test card:
   - Card: 4111 1111 1111 1111
   - CVV: Any 3 digits
   - Expiry: Any future date

---

## Important Notes

### Free Tier Limitations
- **Backend spins down after 15 min of inactivity** (takes 30-60s to wake up)
- **Limited to 750 hours/month**
- Consider upgrading for production use

### Custom Domain (Optional)
1. Go to your Render service → **Settings** → **Custom Domain**
2. Add your domain
3. Update DNS records as instructed

### SSL/HTTPS
- Render provides **free SSL** automatically
- All traffic is HTTPS by default

### Monitoring
- View logs: Service Dashboard → **Logs** tab
- Check metrics: Service Dashboard → **Metrics** tab

---

## Troubleshooting

### Backend Won't Start
1. Check logs in Render dashboard
2. Verify all environment variables are set
3. Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

### Frontend Can't Connect to Backend
1. Verify `VITE_API_URL` is correct in `.env.production`
2. Check CORS settings in backend
3. Open browser console to see error messages

### Database Connection Failed
1. MongoDB Atlas → Network Access → Add IP: `0.0.0.0/0`
2. Verify connection string in environment variables

### Hackwow Integration Not Working
1. Verify `HACKWOW_API_URL` points to your AWS deployment
2. Check `HACKWOW_APP_ID` and `HACKWOW_API_KEY` are correct
3. Ensure AWS Hackwow allows requests from Render URLs

---

## Quick Deployment Commands

```bash
# Update frontend API URL
cd d:\hee\frontend1\frontend
# Edit .env.production with your backend URL

# Commit and push
git add .
git commit -m "Update production config"
git push

# Render will auto-deploy!
```

---

## Environment Variables Checklist

### Backend (`bus-booking-backend`)
- ✅ NODE_ENV=production
- ✅ PORT=5001
- ✅ JWT_SECRET
- ✅ JWT_EXPIRE
- ✅ USE_HACKWOW=true
- ✅ HACKWOW_API_URL
- ✅ HACKWOW_APP_ID
- ✅ HACKWOW_API_KEY
- ✅ MONGODB_URI
- ✅ RAZORPAY_KEY_ID
- ✅ RAZORPAY_KEY_SECRET
- ✅ FRONTEND_URL

### Frontend (`bus-booking-frontend`)
- ✅ VITE_API_URL
- ✅ VITE_RAZORPAY_KEY_ID
- ✅ VITE_APP_NAME
- ✅ VITE_NODE_ENV

---

## Success! 🎉

Your app should now be accessible from any device:
- **Frontend**: https://bus-booking-frontend.onrender.com
- **Backend**: https://bus-booking-backend.onrender.com
- **Test on mobile, tablet, and desktop**

Happy Deploying! 🚀
