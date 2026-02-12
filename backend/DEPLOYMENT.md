# Render Deployment Configuration

## Option 1: render.yaml (Auto-deploy)

Create a `render.yaml` file in your repository:

```yaml
services:
  - type: web
    name: research-portal-api
    env: python
    region: oregon
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: OPENAI_API_KEY
        sync: false
```

## Option 2: Manual Setup on Render

1. Go to https://render.com and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: research-portal-api
   - **Region**: Oregon (US West)
   - **Branch**: main
   - **Root Directory**: (leave empty)
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free

5. Add Environment Variable:
   - Key: `OPENAI_API_KEY`
   - Value: Your OpenAI API key

6. Click "Create Web Service"

## Accessing Your API

After deployment, Render will provide a URL like:
`https://research-portal-api.onrender.com`

Test it:
```bash
curl https://research-portal-api.onrender.com/
```

## Important Notes

### Free Tier Limitations
- Service spins down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- 750 hours/month free compute time
- No persistent storage (files are temporary)

### CORS Configuration
The API is configured to accept requests from any origin (`*`).
For production, update the CORS settings in `main.py` to specify your frontend URL.

## Alternative: Railway

1. Go to https://railway.app
2. Create new project from GitHub
3. Add environment variable: `OPENAI_API_KEY`
4. Railway auto-detects Python and deploys

## Alternative: Vercel (Serverless)

Note: Vercel is better for frontend. For backend, use Render or Railway.

If you still want to try Vercel:
1. Create `vercel.json`:
```json
{
  "builds": [
    {
      "src": "main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "main.py"
    }
  ]
}
```

2. Deploy: `vercel --prod`
