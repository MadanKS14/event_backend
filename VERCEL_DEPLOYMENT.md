# Vercel Deployment Guide

This guide will help you deploy your Node.js backend to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your MongoDB connection string
3. Your frontend domain (if you have one)

## Environment Variables

Set these environment variables in your Vercel dashboard:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=https://your-frontend-domain.vercel.app
NODE_ENV=production
```

## Deployment Steps

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Vercel will automatically deploy your app

## Important Notes

1. **Socket.io Limitation**: Socket.io real-time features won't work on Vercel serverless functions. Consider using alternatives like Pusher or Ably for real-time features.

2. **Database Connection**: Make sure your MongoDB Atlas cluster allows connections from Vercel's IP ranges.

3. **CORS Configuration**: Update the `FRONTEND_URL` environment variable with your actual frontend domain.

## API Endpoints

After deployment, your API will be available at:
- `https://your-app.vercel.app/api/users`
- `https://your-app.vercel.app/api/events`
- `https://your-app.vercel.app/api/tasks`
- `https://your-app.vercel.app/api/health`

## Testing

Test your deployment by visiting:
- `https://your-app.vercel.app/` - Root endpoint
- `https://your-app.vercel.app/api/health` - Health check

## Troubleshooting

1. **Build Errors**: Check the Vercel build logs for any missing dependencies
2. **Database Connection**: Ensure your MongoDB URI is correct and accessible
3. **CORS Issues**: Verify your frontend URL is correctly set in environment variables
