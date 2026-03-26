# Deployment Guide - Weather Map Application

This guide provides comprehensive deployment instructions for both the backend API and frontend application across various platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Backend Deployment](#backend-deployment)
  - [Docker](#backend-docker)
  - [AWS ECS](#backend-aws-ecs)
  - [Google Cloud Run](#backend-google-cloud-run)
  - [Heroku](#backend-heroku)
- [Frontend Deployment](#frontend-deployment)
  - [Vercel](#frontend-vercel)
  - [Netlify](#frontend-netlify)
  - [AWS S3 + CloudFront](#frontend-aws-s3--cloudfront)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- Weather API key (from OpenWeatherMap or WeatherAPI)
- Git repository with your code
- Account on your chosen deployment platform
- Node.js 18+ installed locally for testing

## Backend Deployment

The backend is a Node.js/Express application that can be deployed as a containerized service or directly on various platforms.

### Backend: Docker

Docker provides a consistent deployment environment across all platforms.

#### Step 1: Build Docker Image

```bash
cd backend

# Build the image
docker build -t weather-map-backend:latest .

# Test locally
docker run -p 3001:3001 \
  -e WEATHER_API_KEY=your_key \
  -e WEATHER_PROVIDER=openweathermap \
  -e FRONTEND_URL=http://localhost:3000 \
  weather-map-backend:latest
```

#### Step 2: Push to Container Registry

**Docker Hub:**

```bash
docker tag weather-map-backend:latest yourusername/weather-map-backend:latest
docker push yourusername/weather-map-backend:latest
```

**AWS ECR:**

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker tag weather-map-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/weather-map-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/weather-map-backend:latest
```

**Google Container Registry:**

```bash
gcloud auth configure-docker

docker tag weather-map-backend:latest gcr.io/<project-id>/weather-map-backend:latest
docker push gcr.io/<project-id>/weather-map-backend:latest
```

### Backend: AWS ECS

AWS Elastic Container Service provides managed container orchestration.

#### Step 1: Create Task Definition

Create `backend-task-definition.json`:

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
        },
        {
          "name": "PORT",
          "value": "3001"
        }
      ],
      "secrets": [
        {
          "name": "WEATHER_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:weather-api-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/weather-map-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Step 2: Register Task Definition

```bash
aws ecs register-task-definition --cli-input-json file://backend-task-definition.json
```

#### Step 3: Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name weather-map-cluster
```

#### Step 4: Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name weather-map-alb \
  --subnets subnet-12345678 subnet-87654321 \
  --security-groups sg-12345678

# Create target group
aws elbv2 create-target-group \
  --name weather-map-backend-tg \
  --protocol HTTP \
  --port 3001 \
  --vpc-id vpc-12345678 \
  --target-type ip \
  --health-check-path /health

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn <alb-arn> \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=<target-group-arn>
```

#### Step 5: Create ECS Service

```bash
aws ecs create-service \
  --cluster weather-map-cluster \
  --service-name weather-map-backend-service \
  --task-definition weather-map-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345678,subnet-87654321],securityGroups=[sg-12345678],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=<target-group-arn>,containerName=weather-map-backend,containerPort=3001"
```

#### Environment Variables for ECS

Set in Task Definition:

- `WEATHER_API_KEY`: Store in AWS Secrets Manager
- `WEATHER_PROVIDER`: openweathermap or weatherapi
- `FRONTEND_URL`: Your frontend domain (e.g., https://your-app.vercel.app)
- `NODE_ENV`: production
- `PORT`: 3001

### Backend: Google Cloud Run

Google Cloud Run provides serverless container deployment.

#### Step 1: Deploy to Cloud Run

```bash
cd backend

# Deploy directly from source
gcloud run deploy weather-map-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3001 \
  --set-env-vars WEATHER_PROVIDER=openweathermap,NODE_ENV=production,PORT=3001 \
  --set-secrets WEATHER_API_KEY=weather-api-key:latest
```

#### Step 2: Configure Custom Domain (Optional)

```bash
# Map custom domain
gcloud run domain-mappings create \
  --service weather-map-backend \
  --domain api.yourdomain.com \
  --region us-central1
```

#### Environment Variables for Cloud Run

Set via command line or Cloud Console:

- `WEATHER_API_KEY`: Store in Secret Manager
- `WEATHER_PROVIDER`: openweathermap or weatherapi
- `FRONTEND_URL`: Your frontend domain
- `NODE_ENV`: production
- `PORT`: 3001

### Backend: Heroku

Heroku provides simple platform-as-a-service deployment.

#### Step 1: Create Heroku App

```bash
cd backend

# Login to Heroku
heroku login

# Create app
heroku create weather-map-backend

# Or use existing app
heroku git:remote -a weather-map-backend
```

#### Step 2: Set Environment Variables

```bash
heroku config:set WEATHER_API_KEY=your_api_key_here
heroku config:set WEATHER_PROVIDER=openweathermap
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-frontend.vercel.app
```

#### Step 3: Deploy

```bash
# Deploy via Git
git push heroku main

# Or deploy specific branch
git push heroku your-branch:main
```

#### Step 4: Scale Dynos

```bash
# Scale to 1 dyno
heroku ps:scale web=1

# View logs
heroku logs --tail
```

#### Environment Variables for Heroku

Set via CLI or Heroku Dashboard:

- `WEATHER_API_KEY`: Your weather API key
- `WEATHER_PROVIDER`: openweathermap or weatherapi
- `FRONTEND_URL`: Your frontend domain
- `NODE_ENV`: production

## Frontend Deployment

The frontend is a React application built with Vite that can be deployed as static files.

### Frontend: Vercel

Vercel provides optimized hosting for frontend applications with automatic deployments.

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Deploy

```bash
cd frontend

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### Step 3: Configure Environment Variables

Via Vercel Dashboard or CLI:

```bash
vercel env add VITE_API_URL production
# Enter your backend URL: https://your-backend.herokuapp.com
```

#### Step 4: Configure Build Settings

Vercel should auto-detect Vite. If not, set in `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

#### Environment Variables for Vercel

Set in Vercel Dashboard → Settings → Environment Variables:

- `VITE_API_URL`: Your backend API URL (e.g., https://api.yourdomain.com)

### Frontend: Netlify

Netlify provides similar features to Vercel with excellent static site hosting.

#### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### Step 2: Build and Deploy

```bash
cd frontend

# Build the project
npm run build

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

#### Step 3: Configure via netlify.toml

Create `netlify.toml` in frontend directory:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Step 4: Set Environment Variables

Via Netlify Dashboard or CLI:

```bash
netlify env:set VITE_API_URL https://your-backend.herokuapp.com
```

#### Environment Variables for Netlify

Set in Netlify Dashboard → Site settings → Environment variables:

- `VITE_API_URL`: Your backend API URL

### Frontend: AWS S3 + CloudFront

AWS S3 with CloudFront provides scalable static hosting with CDN.

#### Step 1: Build the Application

```bash
cd frontend
npm run build
```

#### Step 2: Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://weather-map-frontend

# Enable static website hosting
aws s3 website s3://weather-map-frontend \
  --index-document index.html \
  --error-document index.html
```

#### Step 3: Configure Bucket Policy

Create `bucket-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::weather-map-frontend/*"
    }
  ]
}
```

Apply policy:

```bash
aws s3api put-bucket-policy \
  --bucket weather-map-frontend \
  --policy file://bucket-policy.json
```

#### Step 4: Upload Files

```bash
# Upload dist files
aws s3 sync dist/ s3://weather-map-frontend --delete

# Set cache headers
aws s3 sync dist/ s3://weather-map-frontend \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html" \
  --delete

# Don't cache index.html
aws s3 cp dist/index.html s3://weather-map-frontend/index.html \
  --cache-control "no-cache"
```

#### Step 5: Create CloudFront Distribution

```bash
aws cloudfront create-distribution \
  --origin-domain-name weather-map-frontend.s3-website-us-east-1.amazonaws.com \
  --default-root-object index.html
```

Or via AWS Console:

1. Go to CloudFront → Create Distribution
2. Origin Domain: Select your S3 bucket
3. Default Root Object: index.html
4. Custom Error Response: 404 → /index.html (for SPA routing)

#### Step 6: Configure Environment Variables

For S3/CloudFront, environment variables must be set at build time:

```bash
# Build with environment variable
VITE_API_URL=https://your-backend.com npm run build

# Then upload
aws s3 sync dist/ s3://weather-map-frontend --delete
```

#### Environment Variables for S3 + CloudFront

Set at build time:

- `VITE_API_URL`: Your backend API URL

## Environment Variables

### Backend Environment Variables

| Variable           | Description                                  | Required | Example                  |
| ------------------ | -------------------------------------------- | -------- | ------------------------ |
| `WEATHER_API_KEY`  | API key from weather provider                | Yes      | `abc123def456`           |
| `WEATHER_PROVIDER` | Weather provider (openweathermap/weatherapi) | Yes      | `openweathermap`         |
| `FRONTEND_URL`     | Frontend URL for CORS                        | Yes      | `https://app.vercel.app` |
| `PORT`             | Server port                                  | No       | `3001`                   |
| `NODE_ENV`         | Environment                                  | No       | `production`             |

### Frontend Environment Variables

| Variable       | Description     | Required | Example                     |
| -------------- | --------------- | -------- | --------------------------- |
| `VITE_API_URL` | Backend API URL | Yes      | `https://api.herokuapp.com` |

## Troubleshooting

### Common Backend Issues

#### Issue: "Cannot reach weather provider"

**Symptoms:** 503 errors, timeout errors

**Solutions:**

1. Verify `WEATHER_API_KEY` is correct
2. Check weather provider API status
3. Verify network connectivity from deployment environment
4. Check rate limits on weather provider account

#### Issue: "CORS errors"

**Symptoms:** Browser console shows CORS errors

**Solutions:**

1. Set `FRONTEND_URL` to exact frontend domain (including protocol)
2. Don't use trailing slash in `FRONTEND_URL`
3. Verify CORS middleware is configured correctly
4. Check browser network tab for actual origin being sent

#### Issue: "Container fails to start"

**Symptoms:** ECS tasks fail, Cloud Run services don't start

**Solutions:**

1. Check container logs for errors
2. Verify all required environment variables are set
3. Test Docker image locally first
4. Check health check endpoint `/health`

#### Issue: "High response times"

**Symptoms:** API responses > 2 seconds

**Solutions:**

1. Check weather provider API response times
2. Verify network latency between services
3. Consider caching weather data
4. Scale up container resources (CPU/memory)

### Common Frontend Issues

#### Issue: "Cannot connect to backend"

**Symptoms:** Network errors, failed API calls

**Solutions:**

1. Verify `VITE_API_URL` is set correctly
2. Check backend is running and accessible
3. Verify CORS is configured on backend
4. Check browser console for exact error

#### Issue: "Environment variables not working"

**Symptoms:** API calls go to wrong URL or fail

**Solutions:**

1. Ensure variables are prefixed with `VITE_`
2. Rebuild application after changing environment variables
3. For S3/CloudFront, set variables at build time
4. Check build logs to verify variables were included

#### Issue: "Map not displaying"

**Symptoms:** Blank map area, Leaflet errors

**Solutions:**

1. Verify Leaflet CSS is included
2. Check browser console for errors
3. Verify internet connection (map tiles need network)
4. Check Content Security Policy headers

#### Issue: "404 errors on refresh"

**Symptoms:** Page works initially but 404 on refresh

**Solutions:**

1. Configure SPA routing:
   - **Vercel:** Automatic
   - **Netlify:** Add redirects in `netlify.toml`
   - **S3/CloudFront:** Configure error pages to serve `index.html`

### Deployment Checklist

Before going to production:

**Backend:**

- [ ] Set `NODE_ENV=production`
- [ ] Configure `FRONTEND_URL` to production domain
- [ ] Store `WEATHER_API_KEY` in secrets manager
- [ ] Set up health check monitoring
- [ ] Configure logging and error tracking
- [ ] Set up SSL/TLS certificate
- [ ] Test all API endpoints
- [ ] Verify CORS configuration

**Frontend:**

- [ ] Set `VITE_API_URL` to production backend
- [ ] Build with production environment variables
- [ ] Test bundle size (< 500KB gzipped)
- [ ] Configure CDN caching headers
- [ ] Set up SSL/TLS certificate
- [ ] Test on multiple browsers
- [ ] Verify map loads correctly
- [ ] Test error handling

**Both:**

- [ ] Run full test suite
- [ ] Test complete user workflow
- [ ] Verify performance targets
- [ ] Set up monitoring and alerts
- [ ] Document deployment process
- [ ] Create rollback plan

## Monitoring and Maintenance

### Health Checks

**Backend:**

- Endpoint: `GET /health`
- Expected: `200 OK` with `{"status": "ok"}`
- Monitor every 30 seconds

**Frontend:**

- Check: Homepage loads successfully
- Expected: `200 OK` with HTML content
- Monitor every 60 seconds

### Logging

**Backend:**

- Log all errors with stack traces
- Log API requests (without sensitive data)
- Use structured logging (JSON format)
- Integrate with logging service (CloudWatch, Stackdriver, etc.)

**Frontend:**

- Log errors to console in development
- Integrate error tracking (Sentry, Rollbar, etc.) in production
- Track user interactions for debugging

### Scaling

**Backend:**

- Monitor CPU and memory usage
- Scale horizontally by adding more containers
- Consider caching for frequently requested locations
- Implement rate limiting if needed

**Frontend:**

- CDN handles scaling automatically
- Monitor bandwidth usage
- Optimize assets if needed

## Support

For deployment issues:

1. Check this troubleshooting guide
2. Review service-specific documentation
3. Check backend/frontend README files
4. Open an issue in the repository

## Additional Resources

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [Development Guide](DEVELOPMENT.md)
- [Requirements](.kiro/specs/weather-map-app/requirements.md)
- [Design Document](.kiro/specs/weather-map-app/design.md)
