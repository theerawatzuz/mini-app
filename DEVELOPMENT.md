# Development Guide - Weather Map Application

This guide explains how to run both the backend and frontend services locally for development.

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Weather API key (from OpenWeatherMap or WeatherAPI)
- Docker and Docker Compose (optional, for containerized development)

## Quick Start - Local Development

### Option 1: Run Services Separately (Recommended for Development)

This approach gives you hot reload and better debugging capabilities.

#### Step 1: Set Up Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env and add your Weather API key
# WEATHER_API_KEY=your_actual_api_key_here
# WEATHER_PROVIDER=openweathermap
# PORT=3001
# FRONTEND_URL=http://localhost:3000
# NODE_ENV=development

# Start backend development server
npm run dev
```

The backend will start on `http://localhost:3001`.

#### Step 2: Set Up Frontend

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env to point to backend
# VITE_API_URL=http://localhost:3000

# Start frontend development server
npm run dev
```

The frontend will start on `http://localhost:3000`.

#### Step 3: Test the Application

1. Open your browser and navigate to `http://localhost:3000`
2. You should see an interactive world map
3. Click anywhere on the map
4. Weather data for that location should appear

### Option 2: Run with Docker Compose

This approach runs both services in containers, useful for testing production-like environments.

#### Step 1: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy from backend example
cp backend/.env.example .env

# Edit .env and add your Weather API key
# WEATHER_API_KEY=your_actual_api_key_here
# WEATHER_PROVIDER=openweathermap
```

#### Step 2: Build and Run

```bash
# Build and start both services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

#### Step 3: Access the Application

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Backend Health Check: `http://localhost:3001/health`

#### Step 4: Stop Services

```bash
# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Development Workflow

### Running Tests

#### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

#### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Building for Production

#### Backend

```bash
cd backend

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

#### Frontend

```bash
cd frontend

# Build for production
npm run build

# Preview production build
npm run preview
```

## Verifying CORS Configuration

CORS should be configured correctly for local development. To verify:

1. Start both backend and frontend services
2. Open browser DevTools (F12)
3. Go to the Network tab
4. Click on the map to trigger a weather request
5. Check the request to `http://localhost:3001/api/weather`
6. Verify the response headers include:
   - `Access-Control-Allow-Origin: http://localhost:3000`
   - `Access-Control-Allow-Methods: GET`

If you see CORS errors:

- Verify `FRONTEND_URL` in backend `.env` is set to `http://localhost:3000`
- Verify `VITE_API_URL` in frontend `.env` is set to `http://localhost:3001`
- Restart both services after changing environment variables

## Complete User Flow Testing

### Test Scenario 1: Successful Weather Fetch

1. Open `http://localhost:3000` in your browser
2. Click anywhere on the map
3. Verify:
   - A loading indicator appears
   - A marker appears at the clicked location
   - Weather data displays with temperature, humidity, condition, and location name
   - A weather icon is shown
   - The transition is smooth

### Test Scenario 2: Error Handling

#### Test Invalid Coordinates (Backend Validation)

```bash
# Test with invalid latitude
curl "http://localhost:3001/api/weather?lat=91&lon=0"

# Expected: 400 Bad Request with error message
```

#### Test Network Error (Frontend Handling)

1. Stop the backend service
2. Click on the map in the frontend
3. Verify: Error message "Unable to connect to weather service" appears

#### Test Rate Limit (If applicable)

1. Make many rapid requests (click map multiple times quickly)
2. If rate limit is hit, verify: Error message about rate limiting appears

### Test Scenario 3: Multiple Clicks

1. Click on different locations on the map
2. Verify:
   - Each click fetches new weather data
   - The marker moves to the new location
   - Weather data updates without page refresh
   - No memory leaks or performance degradation

## Troubleshooting

### Backend Issues

**Issue: "Cannot find module" errors**

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

**Issue: "Port 3001 already in use"**

```bash
# Find and kill the process using port 3001
lsof -ti:3001 | xargs kill

# Or change PORT in backend/.env
```

**Issue: "Weather provider unreachable"**

- Check your internet connection
- Verify `WEATHER_API_KEY` is correct
- Test the API key directly:

```bash
# For OpenWeatherMap
curl "https://api.openweathermap.org/data/2.5/weather?lat=13.7563&lon=100.5018&appid=YOUR_API_KEY"
```

### Frontend Issues

**Issue: "Cannot connect to backend API"**

- Verify backend is running on `http://localhost:3001`
- Check `VITE_API_URL` in frontend/.env
- Check browser console for CORS errors

**Issue: "Map not displaying"**

- Check browser console for Leaflet errors
- Verify internet connection (map tiles require network)
- Clear browser cache

**Issue: "Environment variables not working"**

- Ensure variables are prefixed with `VITE_` in frontend
- Restart development server after changing `.env`

### Docker Issues

**Issue: "Cannot connect to Docker daemon"**

- Ensure Docker Desktop is running
- Check Docker service status

**Issue: "Build fails in Docker"**

- Check Dockerfile syntax
- Verify all files are copied correctly
- Check Docker logs: `docker-compose logs`

**Issue: "Services can't communicate"**

- Verify both services are in the same Docker network
- Check `docker-compose ps` to see service status
- Check `docker-compose logs backend` and `docker-compose logs frontend`

## Performance Monitoring

### Frontend Performance

Check in browser DevTools:

1. **Network Tab**:
   - Initial page load should be < 3 seconds
   - Weather API requests should complete < 2 seconds
   - Bundle size should be < 500KB gzipped

2. **Performance Tab**:
   - Record a session while interacting with the map
   - Verify 60fps during pan/zoom
   - Check for memory leaks

### Backend Performance

Monitor backend logs for:

- Request/response times
- Error rates
- Weather provider response times

## Next Steps

After verifying local development works:

1. Run the full test suite for both services
2. Check test coverage reports
3. Review the deployment documentation in each service's README
4. Set up CI/CD pipelines
5. Deploy to staging environment

## Additional Resources

- Backend README: `backend/README.md`
- Frontend README: `frontend/README.md`
- Requirements: `.kiro/specs/weather-map-app/requirements.md`
- Design: `.kiro/specs/weather-map-app/design.md`
- Tasks: `.kiro/specs/weather-map-app/tasks.md`
