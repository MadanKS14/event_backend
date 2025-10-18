# Vercel Environment Variables Setup

Based on your codebase analysis, here are the environment variables you need to set in your Vercel dashboard:

## Required Environment Variables

### 1. Database Configuration
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
```
**Description**: Your MongoDB connection string
**Example**: `mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/eventdb`

### 2. JWT Authentication
```
JWT_SECRET=your_super_secret_jwt_key_here
```
**Description**: Secret key for JWT token signing and verification
**Example**: `mySuperSecretJWTKey123!@#`

### 3. Frontend URL (CORS)
```
FRONTEND_URL=https://your-frontend-domain.vercel.app
```
**Description**: Your frontend domain for CORS configuration
**Example**: `https://my-event-frontend.vercel.app`

### 4. Node Environment
```
NODE_ENV=production
```
**Description**: Environment mode
**Value**: `production`

## Optional Environment Variables

### 5. Google OAuth (if using Google authentication)
```
GOOGLE_CLIENT_ID=your_google_client_id
```
**Description**: Google OAuth client ID (currently commented out in your code)
**Note**: Uncomment the Google OAuth code in `controllers/userController.js` if you want to use this

### 6. Port (for local development only)
```
PORT=5001
```
**Description**: Port for local development (not needed for Vercel)

## How to Set Environment Variables in Vercel

### Method 1: Vercel Dashboard
1. Go to your project in Vercel dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables"
4. Add each variable with its value
5. Make sure to set them for "Production" environment

### Method 2: Vercel CLI
```bash
vercel env add MONGO_URI
vercel env add JWT_SECRET
vercel env add FRONTEND_URL
vercel env add NODE_ENV
```

## Security Notes

1. **JWT_SECRET**: Use a strong, random string (at least 32 characters)
2. **MONGO_URI**: Ensure your MongoDB Atlas cluster allows connections from Vercel
3. **FRONTEND_URL**: Use your actual frontend domain, not localhost

## Example Complete Configuration

For a typical setup, your environment variables would look like:

```
MONGO_URI=mongodb+srv://eventuser:securepassword123@cluster0.abc123.mongodb.net/eventdb?retryWrites=true&w=majority
JWT_SECRET=mySuperSecretJWTKeyForEventApp2024!@#$%^&*()
FRONTEND_URL=https://my-event-app.vercel.app
NODE_ENV=production
```

## Verification

After setting these variables, you can verify they're working by:
1. Deploying to Vercel
2. Checking the health endpoint: `https://your-app.vercel.app/api/health`
3. Testing a simple API call to ensure database connection works
