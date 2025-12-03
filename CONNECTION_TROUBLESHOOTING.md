# Connection Troubleshooting Guide

If you're experiencing issues connecting the frontend to the backend after cloning/pulling the repository, follow these steps:

## 1. Check Environment Variables

### Backend (.env file in `/backend` directory)
Make sure you have a `.env` file with at least:
```env
NODE_ENV=development
PORT=5050
MONGODB_URI=mongodb://localhost:27017/gameclub
CLIENT_URL=http://localhost:3000
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
ADMIN_API_KEY=your-admin-api-key-here
```

### Frontend (.env.local file in `/frontend` directory)
Make sure you have a `.env.local` file with:
```env
NEXT_PUBLIC_API_URL=http://localhost:5050
NEXT_PUBLIC_ADMIN_API_KEY=your-admin-api-key-here
```

**Important:** The `ADMIN_API_KEY` in both files should match!

## 2. Restart Both Servers

After setting up environment variables, restart both servers:

```bash
# Terminal 1 - Backend
cd backend
npm install  # if you haven't already
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm install  # if you haven't already
npm run dev
```

**Note:** Next.js caches environment variables. If you change `.env.local`, you MUST restart the Next.js dev server.

## 3. Verify Backend is Running

Test the backend health endpoint:
```bash
curl http://localhost:5050/health
```

You should see: `{"status":"ok","timestamp":"..."}`

## 4. Verify Frontend Can Reach Backend

Test the games endpoint:
```bash
curl http://localhost:5050/api/games?limit=3
```

You should see a JSON response with games data.

## 5. Check Browser Console

Open your browser's developer console (F12) and check for:
- CORS errors
- Network errors (404, 500, etc.)
- Console warnings about API calls

The improved error logging will show detailed error messages.

## 6. Common Issues

### Issue: "Failed to load games" in console
**Solution:** 
- Make sure backend is running on port 5050
- Check that MongoDB is running
- Verify `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:5050`

### Issue: CORS errors
**Solution:**
- Backend CORS is configured to allow `http://localhost:3000` and `http://127.0.0.1:3000`
- Make sure frontend is running on port 3000
- If using a different port, update `CLIENT_URL` in backend `.env`

### Issue: Empty data arrays
**Solution:**
- Database might be empty. Seed sample games:
  ```bash
  # Make a POST request to seed games (requires admin auth)
  curl -X POST http://localhost:5050/api/games/seed \
    -H "x-admin-key: your-admin-api-key-here"
  ```

### Issue: Environment variables not loading
**Solution:**
- Restart the Next.js dev server after changing `.env.local`
- Make sure `.env.local` is in the `/frontend` directory (not `/frontend/src`)
- Check that variable names start with `NEXT_PUBLIC_` for client-side access

## 7. Debug Mode

Both frontend and backend now have improved logging:
- Backend logs CORS requests/blocked origins in development
- Frontend logs API URLs and errors in the console
- Check terminal output for backend logs
- Check browser console for frontend logs

