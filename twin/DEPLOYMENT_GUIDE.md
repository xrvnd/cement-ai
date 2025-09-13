# 🚀 Cement Plant Digital Twin - GCP Firebase Deployment Guide

This guide provides step-by-step instructions for deploying the Cement Plant Digital Twin application to Google Cloud Platform (GCP) using Firebase Hosting and Cloud Functions.

## 📋 Prerequisites

### Required Tools
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Python](https://python.org/) (v3.11 or higher)
- [Google Cloud CLI](https://cloud.google.com/sdk/docs/install)
- [Firebase CLI](https://firebase.google.com/docs/cli)
- [Git](https://git-scm.com/)

### Required Accounts
- Google Cloud Platform account
- Firebase project
- Gemini API access

## 🔧 Initial Setup

### 1. Install Required Tools

```bash
# Install Google Cloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Install Firebase CLI
npm install -g firebase-tools

# Verify installations
gcloud --version
firebase --version
```

### 2. Authenticate with Google Cloud

```bash
# Login to Google Cloud
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable firebase.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable aiplatform.googleapis.com
```

### 3. Initialize Firebase Project

```bash
# Login to Firebase
firebase login

# Initialize Firebase in your project directory
firebase init

# Select the following options:
# - Hosting: Configure files for Firebase Hosting
# - Functions: Configure a Cloud Functions directory
# - Use existing project: Select your GCP project
```

## 🏗️ Project Configuration

### 1. Update Firebase Configuration

Edit `.firebaserc` and replace `your-project-id` with your actual project ID:

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

### 2. Environment Variables Setup

Create a `.env.production` file in the backend directory:

```bash
# Backend Environment Variables
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
CORS_ORIGINS=https://your-project-id.web.app,https://your-project-id.firebaseapp.com
PORT=8080
ENVIRONMENT=production
```

### 3. Service Account Setup

```bash
# Create a service account
gcloud iam service-accounts create cement-plant-backend \
    --description="Service account for Cement Plant Digital Twin" \
    --display-name="Cement Plant Backend"

# Grant necessary permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:cement-plant-backend@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"

# Create and download key
gcloud iam service-accounts keys create service-account-key.json \
    --iam-account=cement-plant-backend@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

## 🧹 Pre-Deployment Cleanup

### Benefits of Clean Deployment
- **Reduced Project Size**: Removes ~1.3GB of node_modules
- **Faster Transfers**: Smaller repository for version control
- **Clean Dependencies**: Ensures fresh, up-to-date packages
- **Deployment Efficiency**: Faster CI/CD pipeline execution
- **Consistency**: Same environment across all deployments

### Clean Installation Process
The project is configured for clean dependency installation:
- `node_modules/` directory removed
- `package-lock.json` regenerated on each install
- Fresh dependency resolution for each deployment

## 🚀 Deployment Steps

### Step 1: Build Frontend

```bash
# Clean install dependencies (recommended for deployment)
npm ci --only=production

# Alternative: Standard install
npm install

# Build for production
npm run build

# Verify build
ls -la build/
```

### Step 2: Prepare Backend for Cloud Functions

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Test backend locally
python main.py
```

### Step 3: Deploy to Firebase

```bash
# Deploy hosting (frontend)
firebase deploy --only hosting

# Deploy functions (backend)
firebase deploy --only functions

# Deploy everything
firebase deploy
```

### Step 4: Configure Environment Variables for Functions

```bash
# Set environment variables for Cloud Functions
firebase functions:config:set \
    gemini.api_key="your_gemini_api_key" \
    app.environment="production" \
    app.cors_origins="https://your-project-id.web.app,https://your-project-id.firebaseapp.com"

# Deploy functions with new config
firebase deploy --only functions
```

## 🔧 Advanced Configuration

### 1. Custom Domain Setup

```bash
# Add custom domain
firebase hosting:channel:deploy production --only hosting

# Configure custom domain in Firebase Console
# Go to Hosting > Add custom domain
```

### 2. SSL Certificate

Firebase automatically provides SSL certificates for custom domains.

### 3. CDN Configuration

Firebase Hosting includes global CDN by default. No additional configuration needed.

## 📊 Monitoring and Logs

### 1. View Logs

```bash
# View function logs
firebase functions:log

# View hosting logs
firebase hosting:channel:list
```

### 2. Monitor Performance

- Go to [Firebase Console](https://console.firebase.google.com/)
- Navigate to your project
- Check Performance, Analytics, and Crashlytics

## 🔒 Security Configuration

### 1. CORS Configuration

Update `backend/app/core/config.py`:

```python
CORS_ORIGINS: List[str] = [
    "https://your-project-id.web.app",
    "https://your-project-id.firebaseapp.com",
    "https://your-custom-domain.com"
]
```

### 2. API Key Security

- Store API keys in Firebase Functions config
- Never commit API keys to version control
- Use environment variables for sensitive data

### 3. Firestore Security Rules (if using)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and rebuild
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Function Deployment Errors**
   ```bash
   # Check Python version
   python --version
   
   # Update requirements.txt
   pip freeze > requirements.txt
   ```

3. **CORS Issues**
   - Verify CORS_ORIGINS in backend config
   - Check Firebase Functions environment variables

4. **API Key Issues**
   ```bash
   # Verify API key is set
   firebase functions:config:get
   
   # Test API key
   curl -H "Authorization: Bearer YOUR_API_KEY" \
        https://generativelanguage.googleapis.com/v1beta/models
   ```

### Performance Optimization

1. **Frontend Optimization**
   - Enable gzip compression
   - Optimize images
   - Use CDN for static assets

2. **Backend Optimization**
   - Use connection pooling
   - Implement caching
   - Monitor function cold starts

## 📈 Scaling Considerations

### 1. Auto-scaling

Firebase Functions automatically scale based on demand.

### 2. Database Scaling

- Use Firestore for real-time data
- Implement proper indexing
- Consider sharding for large datasets

### 3. CDN Optimization

- Configure cache headers
- Use Firebase Hosting rewrites
- Implement proper cache invalidation

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run build
      
    - name: Deploy to Firebase
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
        channelId: live
        projectId: your-project-id
```

## 📞 Support

For deployment issues:

1. Check [Firebase Documentation](https://firebase.google.com/docs)
2. Review [Google Cloud Documentation](https://cloud.google.com/docs)
3. Check project logs in Firebase Console
4. Verify API quotas and billing

## 🎯 Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] Backend API responds
- [ ] 3D scene renders properly
- [ ] AI features work
- [ ] Real-time data updates
- [ ] Mobile responsiveness
- [ ] Performance monitoring active
- [ ] SSL certificate valid
- [ ] Custom domain configured (if applicable)
- [ ] Analytics tracking enabled

---

**Deployment URL**: `https://your-project-id.web.app`

**API Documentation**: `https://your-project-id.web.app/api/docs`

**Firebase Console**: [https://console.firebase.google.com/](https://console.firebase.google.com/)
