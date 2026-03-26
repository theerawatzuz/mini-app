# Weather Map Backend API

Backend API service for the Weather Map Application. This Node.js/Express service acts as a proxy between the frontend and external weather data providers, handling weather data requests and providing a clean REST API interface.

## Features

- RESTful API for weather data retrieval
- Integration with free weather API providers (OpenWeatherMap, WeatherAPI)
- CORS-enabled for cross-origin requests
- TypeScript for type safety
- Comprehensive error handling
- Environment-based configuration
- Property-based testing with fast-check
- Standalone microservice deployment

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Weather API key (from OpenWeatherMap or WeatherAPI)

## Quick Start

1. Clone the repository:

```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create environment configuration:

```bash
cp .env.example .env
```

4. Edit `.env` and add your configuration:

```env
WEATHER_API_KEY=your_actual_api_key_here
WEATHER_PROVIDER=openweathermap
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

5. Start the development server:

```bash
npm run dev
```

The server will start on `http://localhost:3001`.

## Environment Variables

The application requires the following environment variables:

| Variable           | Description                                   | Default        | Required |
| ------------------ | --------------------------------------------- | -------------- | -------- |
| `WEATHER_API_KEY`  | API key for weather provider                  | -              | Yes      |
| `WEATHER_PROVIDER` | Weather provider (openweathermap, weatherapi) | openweathermap | Yes      |
| `PORT`             | Server port                                   | 3001           | No       |
| `FRONTEND_URL`     | Frontend URL for CORS                         | \*             | No       |
| `NODE_ENV`         | Environment (development, production)         | development    | No       |

### WEATHER_API_KEY

Your API key from the weather provider. This is required to fetch weather data.

**How to obtain:**

- For OpenWeatherMap: Sign up at [openweathermap.org/api](https://openweathermap.org/api)
- For WeatherAPI: Sign up at [weatherapi.com](https://www.weatherapi.com/)

### WEATHER_PROVIDER

The weather provider to use. Supported values:

- `openweathermap` (recommended) - Free tier: 1,000 calls/day
- `weatherapi` - Free tier: 1,000,000 calls/month

### FRONTEND_URL

The URL of your frontend application for CORS configuration. Set to `*` to allow all origins (not recommended for production).

**Examples:**

- Development: `http://localhost:3000`
- Production: `https://your-frontend-domain.com`

### PORT

The port on which the server will listen. Defaults to `3001`.

## Getting a Weather API Key

### OpenWeatherMap (Recommended)

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to API keys section
4. Copy your API key
5. Free tier includes 1,000 calls/day
6. Set `WEATHER_PROVIDER=openweathermap` in your `.env` file

### WeatherAPI

1. Visit [WeatherAPI](https://www.weatherapi.com/)
2. Sign up for a free account
3. Copy your API key from the dashboard
4. Free tier includes 1,000,000 calls/month
5. Set `WEATHER_PROVIDER=weatherapi` in your `.env` file

## Development

Start the development server with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:3001` (or the port specified in `.env`).

### Development Features

- Hot reload with ts-node
- Request logging in console
- Detailed error messages
- CORS enabled for local development

## Building

Build the TypeScript code to JavaScript:

```bash
npm run build
```

The compiled code will be in the `dist/` directory.

## Production

1. Build the project:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

**Production Checklist:**

- Set `NODE_ENV=production` in your environment
- Configure `FRONTEND_URL` to your actual frontend domain
- Ensure `WEATHER_API_KEY` is set
- Use a process manager like PM2 for reliability
- Set up monitoring and logging

## Testing

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with coverage:

```bash
npm run test:coverage
```

The test suite includes:

- Unit tests for all components
- Property-based tests for correctness properties
- Integration tests for API endpoints
- Error handling tests

## API Endpoints

### Health Check

```
GET /health
```

Check if the server is running.

**Response:**

```json
{
  "status": "ok",
  "message": "Weather Map Backend API is running"
}
```

### Get Weather Data

```
GET /api/weather?lat={latitude}&lon={longitude}
```

Fetch weather data for a specific location.

**Query Parameters:**

- `lat` (required): Latitude (-90 to 90)
- `lon` (required): Longitude (-180 to 180)

**Success Response (200):**

```json
{
  "locationName": "Bangkok, TH",
  "temperature": 32.5,
  "humidity": 65,
  "condition": "Partly Cloudy",
  "icon": "02d"
}
```

**Error Responses:**

- `400 Bad Request`: Invalid coordinates

```json
{
  "success": false,
  "error": {
    "code": "INVALID_COORDINATES",
    "message": "Invalid coordinates provided",
    "statusCode": 400
  }
}
```

- `429 Too Many Requests`: Rate limit exceeded

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later",
    "statusCode": 429
  }
}
```

- `502 Bad Gateway`: Invalid data from weather provider

```json
{
  "success": false,
  "error": {
    "code": "PROVIDER_ERROR",
    "message": "Unable to retrieve weather data",
    "statusCode": 502
  }
}
```

- `503 Service Unavailable`: Weather provider unreachable

```json
{
  "success": false,
  "error": {
    "code": "PROVIDER_UNAVAILABLE",
    "message": "Weather service is temporarily unavailable",
    "statusCode": 503
  }
}
```

## Deployment

The backend is designed to be deployed as a standalone Node.js service. Below are deployment instructions for various platforms.

### Docker Deployment

1. Create a `Dockerfile` in the backend directory:

```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Start server
CMD ["npm", "start"]
```

2. Create a `.dockerignore` file:

```
node_modules
dist
.env
*.log
.git
```

3. Build the Docker image:

```bash
docker build -t weather-map-backend .
```

4. Run the container:

```bash
docker run -p 3001:3001 \
  -e WEATHER_API_KEY=your_key \
  -e WEATHER_PROVIDER=openweathermap \
  -e FRONTEND_URL=https://your-frontend.com \
  weather-map-backend
```

Or use an `.env` file:

```bash
docker run -p 3001:3001 --env-file .env weather-map-backend
```

### Docker Compose

Create a `docker-compose.yml`:

```yaml
version: "3.8"

services:
  backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - WEATHER_API_KEY=${WEATHER_API_KEY}
      - WEATHER_PROVIDER=${WEATHER_PROVIDER}
      - FRONTEND_URL=${FRONTEND_URL}
      - NODE_ENV=production
    restart: unless-stopped
```

Run with:

```bash
docker-compose up -d
```

### AWS Elastic Container Service (ECS)

1. Build and push Docker image to Amazon ECR:

```bash
# Authenticate Docker to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t weather-map-backend .

# Tag image
docker tag weather-map-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/weather-map-backend:latest

# Push image
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/weather-map-backend:latest
```

2. Create ECS Task Definition:

```json
{
  "family": "weather-map-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "weather-map-backend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/weather-map-backend:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "WEATHER_PROVIDER",
          "value": "openweathermap"
        },
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "WEATHER_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:region:account-id:secret:weather-api-key"
        }
      ]
    }
  ]
}
```

3. Create ECS Service with Application Load Balancer
4. Configure security groups to allow traffic on port 3001

### Google Cloud Run

1. Build and deploy:

```bash
gcloud run deploy weather-map-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars WEATHER_PROVIDER=openweathermap,NODE_ENV=production \
  --set-secrets WEATHER_API_KEY=weather-api-key:latest
```

2. Or use a `cloudbuild.yaml`:

```yaml
steps:
  - name: "gcr.io/cloud-builders/docker"
    args: ["build", "-t", "gcr.io/$PROJECT_ID/weather-map-backend", "."]
  - name: "gcr.io/cloud-builders/docker"
    args: ["push", "gcr.io/$PROJECT_ID/weather-map-backend"]
  - name: "gcr.io/cloud-builders/gcloud"
    args:
      - "run"
      - "deploy"
      - "weather-map-backend"
      - "--image=gcr.io/$PROJECT_ID/weather-map-backend"
      - "--region=us-central1"
      - "--platform=managed"
```

### Heroku

1. Create a Heroku app:

```bash
heroku create weather-map-backend
```

2. Set environment variables:

```bash
heroku config:set WEATHER_API_KEY=your_key
heroku config:set WEATHER_PROVIDER=openweathermap
heroku config:set FRONTEND_URL=https://your-frontend.com
heroku config:set NODE_ENV=production
```

3. Deploy:

```bash
git push heroku main
```

4. Scale the dyno:

```bash
heroku ps:scale web=1
```

### AWS Elastic Beanstalk

1. Install EB CLI:

```bash
pip install awsebcli
```

2. Initialize Elastic Beanstalk:

```bash
eb init -p node.js-18 weather-map-backend
```

3. Create environment:

```bash
eb create weather-map-backend-env
```

4. Set environment variables:

```bash
eb setenv WEATHER_API_KEY=your_key WEATHER_PROVIDER=openweathermap FRONTEND_URL=https://your-frontend.com
```

5. Deploy:

```bash
eb deploy
```

### DigitalOcean App Platform

1. Create `app.yaml`:

```yaml
name: weather-map-backend
services:
  - name: api
    source_dir: /
    github:
      repo: your-username/weather-map-backend
      branch: main
    build_command: npm run build
    run_command: npm start
    envs:
      - key: WEATHER_API_KEY
        scope: RUN_TIME
        type: SECRET
      - key: WEATHER_PROVIDER
        value: openweathermap
      - key: NODE_ENV
        value: production
    http_port: 3001
```

2. Deploy via DigitalOcean dashboard or CLI

### Vercel (Serverless)

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.ts"
    }
  ]
}
```

3. Deploy:

```bash
vercel --prod
```

4. Set environment variables in Vercel dashboard

## Troubleshooting

### Common Issues

**Issue: "Cannot reach weather provider"**

- Check your internet connection
- Verify `WEATHER_API_KEY` is correct
- Ensure weather provider API is not down
- Check if you've exceeded rate limits

**Issue: "CORS errors in browser"**

- Set `FRONTEND_URL` to your frontend's exact URL
- Ensure frontend is making requests to correct backend URL
- Check browser console for specific CORS error

**Issue: "Port already in use"**

- Change `PORT` in `.env` to a different port
- Kill the process using the port: `lsof -ti:3001 | xargs kill`

**Issue: "Module not found errors"**

- Run `npm install` to install dependencies
- Delete `node_modules` and `package-lock.json`, then run `npm install`

**Issue: "TypeScript compilation errors"**

- Ensure TypeScript version is compatible
- Run `npm run build` to see detailed errors
- Check `tsconfig.json` configuration

### Logging

The application logs requests and errors to the console. In production, consider integrating with a logging service:

- AWS CloudWatch
- Google Cloud Logging
- Datadog
- Loggly
- Papertrail

### Monitoring

For production deployments, set up monitoring:

- Health check endpoint: `GET /health`
- Monitor response times
- Track error rates
- Set up alerts for downtime

## Project Structure

```
backend/
├── src/
│   ├── server.ts              # Server entry point
│   ├── app.ts                 # Express app configuration
│   ├── controllers/           # Route controllers
│   │   ├── WeatherController.ts
│   │   └── WeatherController.test.ts
│   ├── services/              # Business logic services
│   │   ├── WeatherService.ts
│   │   └── WeatherService.test.ts
│   ├── models/                # Data models and interfaces
│   │   ├── Coordinates.ts
│   │   ├── WeatherData.ts
│   │   └── APIResponse.ts
│   ├── middleware/            # Express middleware
│   │   ├── errorHandler.ts
│   │   └── errorHandler.test.ts
│   └── errors/                # Custom error classes
│       ├── BadGatewayError.ts
│       ├── RateLimitError.ts
│       └── ServiceUnavailableError.ts
├── dist/                      # Compiled JavaScript (generated)
├── .env.example               # Example environment variables
├── .gitignore                 # Git ignore rules
├── tsconfig.json              # TypeScript configuration
├── jest.config.js             # Jest testing configuration
├── package.json               # Project dependencies and scripts
└── README.md                  # This file
```

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5
- **Language**: TypeScript 6
- **HTTP Client**: Axios
- **Testing**: Jest, Supertest, fast-check
- **Environment**: dotenv
- **CORS**: cors middleware

## Security Considerations

- Never commit `.env` file to version control
- Use environment variables for sensitive data
- Set `FRONTEND_URL` to specific domain in production (not `*`)
- Keep dependencies updated
- Use HTTPS in production
- Implement rate limiting if needed
- Validate all user inputs
- Use secrets management in cloud deployments

## Performance

- Response time target: < 2 seconds
- Supports concurrent requests
- Lightweight with minimal dependencies
- Efficient error handling
- Connection pooling for HTTP requests

## License

ISC

## Support

For issues and questions, please open an issue in the repository.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## Changelog

### Version 1.0.0

- Initial release
- Weather API integration
- CORS support
- Comprehensive error handling
- Docker support
- Cloud deployment guides
