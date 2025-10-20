# File Sharing App

## Backend Setup
1. Go to `/backend` folder.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill in your JWT secret and AWS credentials.
4. Run `npm start` to launch backend.

## Frontend Setup
1. Go to `/frontend` folder.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and set `REACT_APP_API_URL` to your backend URL.
4. Run `npm start` for local dev or `npm run build` for production.

## Deployment
- Backend: Deploy on Railway or Render.
- Frontend: Deploy on Vercel or Netlify.
- Ensure environment variables are set correctly on deployed platforms.`