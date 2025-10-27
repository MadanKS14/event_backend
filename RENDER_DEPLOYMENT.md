# Render Deployment Guide for Event Backend

## 🚀 Deploying Backend on Render (WebSocket Supported)

### Prerequisites
1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Push your backend code to GitHub
3. **MongoDB Atlas**: Set up MongoDB Atlas database
4. **Environment Variables**: Prepare your environment variables

### Step 1: Prepare Your Repository

1. **Push to GitHub**: Make sure your backend code is in a GitHub repository
2. **Include render.yaml**: The configuration file is already created
3. **Verify package.json**: Ensure start script is correct (`npm start`)

### Step 2: Create Render Service

1. **Go to Render Dashboard**: [dashboard.render.com](https://dashboard.render.com)
2. **Click "New +"**: Select "Web Service"
3. **Connect GitHub**: Authorize Render to access your repository
4. **Select Repository**: Choose your backend repository

### Step 3: Configure Service Settings

#### Basic Settings:
- **Name**: `event-backend` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave empty (if backend is in root)

#### Build & Deploy:
- **Build Command**: `npm install`
- **Start Command**: `npm start`

#### Advanced Settings:
- **Plan**: `Starter` ($7/month) - Required for WebSocket support
- **Auto-Deploy**: `Yes` (deploys on every push)

### Step 4: Environment Variables

Add these environment variables in Render dashboard:

```env
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### Step 5: Deploy

1. **Click "Create Web Service"**
2. **Wait for Build**: First deployment takes 5-10 minutes
3. **Check Logs**: Monitor the build and deployment process
4. **Test WebSocket**: Verify WebSocket connection works

### Step 6: Update Frontend Configuration

Update your frontend environment variables:

```env
VITE_API_BASE_URL=https://your-backend-name.onrender.com/api
```

### Step 7: Test WebSocket Connection

1. **Deploy Frontend**: Update frontend with new API URL
2. **Open Browser Console**: Check for WebSocket connection logs
3. **Verify Real-time Updates**: Test event creation/updates

## 🔧 Render-Specific Optimizations

### WebSocket Configuration
Your current Socket.io setup is perfect for Render:

```javascript
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  },
});
```

### Keepalive Implementation
Add this to your Socket.io server for better reliability:

```javascript
io.on("connection", (socket) => {
  // Send ping every 30 seconds
  const pingInterval = setInterval(() => {
    socket.ping();
  }, 30000);

  socket.on("pong", () => {
    console.log("Client pong received");
  });

  socket.on("disconnect", () => {
    clearInterval(pingInterval);
  });
});
```

## 💰 Cost Comparison

### Render (WebSocket Supported)
- **Starter Plan**: $7/month
- **Features**: Persistent connections, WebSocket support, always-on
- **Best for**: Real-time applications

### Vercel (No WebSocket)
- **Hobby Plan**: Free
- **Features**: Serverless functions, static hosting
- **Best for**: Static sites, simple APIs

## 🎯 Benefits of Render Deployment

✅ **Full WebSocket Support**: Real-time updates work perfectly  
✅ **Persistent Connections**: No connection drops  
✅ **Better Performance**: No cold starts like serverless  
✅ **Reliable**: Always-on service  
✅ **Easy Deployment**: Simple GitHub integration  
✅ **Automatic HTTPS**: SSL certificates included  

## 🔍 Troubleshooting

### Common Issues:

1. **WebSocket Connection Failed**
   - Ensure you're using `wss://` protocol
   - Check CORS settings
   - Verify Render service is running

2. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Review build logs in Render dashboard

3. **Environment Variables**
   - Double-check all required variables are set
   - Ensure MongoDB URI is correct
   - Verify JWT_SECRET is set

### Support Resources:
- [Render Documentation](https://render.com/docs)
- [WebSocket Guide](https://render.com/docs/websocket)
- [Render Community](https://community.render.com)

## 🚀 Next Steps

1. **Deploy Backend**: Follow the steps above
2. **Update Frontend**: Change API URL to Render backend
3. **Test WebSocket**: Verify real-time updates work
4. **Monitor Performance**: Use Render dashboard for monitoring

Your WebSocket implementation will work perfectly on Render! 🎉
