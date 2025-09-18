# Security Setup Guide

## 🔒 API Key Security Implementation

This guide explains the security improvements made to protect the Gemini API key and how to properly configure the application.

## ⚠️ Critical Security Fix Applied

**Issue**: The Gemini API key was previously hardcoded in the frontend code, exposing it to anyone who could view the client-side JavaScript.

**Solution**: Moved API key to backend environment variables and implemented a secure proxy pattern.

## 🛠️ Implementation Details

### 1. Frontend Changes

**Before (Insecure)**:
```typescript
const [geminiApiKey] = useState('AIzaSyCg544RYMC2JiIDRDl3Pzzu7nVyKYYgUnE');
```

**After (Secure)**:
```typescript
// API key removed from frontend
// All calls now go through backend proxy
const response = await axios.post('http://localhost:8000/api/v1/gemini/generate', {
  prompt: prompt,
  context: { analysis_type: "general" }
});
```

### 2. Backend Configuration

The backend already had proper environment variable configuration:

```python
# app/core/config.py
class Settings(BaseSettings):
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    # ... other settings
```

### 3. Environment File Setup

**Location**: `backend/.env`

```env
GEMINI_API_KEY=your_actual_api_key_here
GOOGLE_CLOUD_PROJECT_ID=your_project_id
PORT=8000
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 🚀 Setup Instructions

### Step 1: Configure Environment Variables

1. Navigate to the `backend/` directory
2. Update the `.env` file with your actual API key:
   ```bash
   cd backend/
   nano .env
   ```
3. Replace `your_gemini_api_key_here` with your actual Gemini API key

### Step 2: Verify Backend Configuration

Ensure the backend is properly configured to use environment variables:

```python
# The backend automatically loads from .env file
from app.core.config import settings
print(settings.GEMINI_API_KEY)  # Should show your API key
```

### Step 3: Start Services

1. **Start Backend**:
   ```bash
   cd backend/
   ./start_backend.sh
   # OR
   python -m uvicorn main:app --reload --port 8000
   ```

2. **Start Frontend**:
   ```bash
   npm start
   # Runs on http://localhost:3000
   ```

## 🔐 Security Benefits

### ✅ What's Now Secure:

1. **API Key Protection**: API key is never exposed to client-side code
2. **Server-Side Validation**: Backend can validate and sanitize requests
3. **Rate Limiting**: Can implement rate limiting on backend endpoints
4. **Request Logging**: All AI requests are logged server-side
5. **Environment Isolation**: Different API keys for dev/staging/production

### 🛡️ Additional Security Measures:

1. **CORS Configuration**: Restricts which domains can access the API
2. **Request Validation**: Backend validates all incoming requests
3. **Error Handling**: Sanitized error messages prevent information leakage
4. **Environment Variables**: Sensitive data stored securely

## 📊 API Endpoints

The frontend now uses these secure backend endpoints:

| Endpoint | Purpose | Method |
|----------|---------|--------|
| `/api/v1/gemini/generate` | General AI responses | POST |
| `/api/v1/gemini/analyze/kiln` | Kiln data analysis | POST |
| `/api/v1/gemini/analyze/mill` | Mill data analysis | POST |
| `/api/v1/gemini/optimize` | Process optimization | POST |
| `/api/v1/gemini/alert/burning-zone` | Temperature alerts | POST |

## 🧪 Testing the Security Fix

### Test 1: Verify API Key is Hidden
1. Open browser developer tools
2. Go to Network tab
3. Trigger an AI request in the application
4. Verify no API key is visible in request headers or body

### Test 2: Backend Proxy Works
1. Check that requests go to `localhost:8000/api/v1/gemini/*`
2. Verify responses are properly formatted
3. Test error handling when backend is unavailable

### Test 3: Environment Variables
```bash
cd backend/
python -c "from app.core.config import settings; print('API Key configured:', bool(settings.GEMINI_API_KEY))"
```

## 🚨 Important Notes

1. **Never commit `.env` files**: Add `.env` to `.gitignore`
2. **Use different keys for different environments**: Dev, staging, production
3. **Rotate API keys regularly**: Update keys periodically for security
4. **Monitor API usage**: Keep track of API calls and costs
5. **Backup configuration**: Document your environment setup

## 🔄 Migration Checklist

- [x] Remove hardcoded API key from frontend
- [x] Update frontend to use backend proxy
- [x] Verify backend environment configuration
- [x] Update documentation files
- [x] Test all AI functionality
- [ ] Deploy to production with secure environment variables
- [ ] Set up monitoring and alerting
- [ ] Implement rate limiting (optional)

## 📞 Support

If you encounter issues:

1. Check that the backend is running on port 8000
2. Verify the `.env` file has the correct API key
3. Check browser console for error messages
4. Verify CORS settings allow frontend domain

## 🎯 Next Steps

Consider implementing these additional security measures:

1. **Rate Limiting**: Prevent API abuse
2. **Authentication**: Add user authentication
3. **Request Logging**: Log all AI requests for monitoring
4. **API Key Rotation**: Implement automatic key rotation
5. **Monitoring**: Set up alerts for unusual API usage
