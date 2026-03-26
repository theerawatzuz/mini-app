# Weather Map Application

A microservices-based weather map application that displays real-time weather information on an interactive world map. Users can click anywhere on the map to view current weather data for that location.

## Architecture

The application consists of two independently deployable services:

- **Frontend**: React-based single-page application with interactive Leaflet map
- **Backend**: Node.js/Express REST API that proxies requests to weather data providers

```
┌─────────────┐      HTTP/REST      ┌─────────────┐      HTTP      ┌──────────────────┐
│   Frontend  │ ──────────────────> │   Backend   │ ────────────> │ Weather Provider │
│  (React)    │ <────────────────── │  (Node.js)  │ <──────────── │  (OpenWeather)   │
└─────────────┘                     └─────────────┘                └──────────────────┘
```

## Features

- 🗺️ Interactive world map with pan and zoom
- 🌤️ Real-time weather data display
- ⚡ Fast response times (< 2 seconds)
- 📱 Responsive design for mobile and desktop
- 🔄 Smooth animations and transitions
- 🚀 Microservices architecture for independent scaling
- 🐳 Docker support for easy deployment
- ✅ Comprehensive test coverage (unit, property-based, integration)

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Weather API key (free from [OpenWeatherMap](https://openweathermap.org/api) or [WeatherAPI](https://www.weatherapi.com/))

### Option 1: Run with Docker Compose (Recommended)

1. Clone the repository:

```bash
git clone <repository-url>
cd weather-map-app
```

2. Create `.env` file in the root directory:

```bash
WEATHER_API_KEY=your_api_key_here
WEATHER_PROVIDER=openweathermap
```

3. Start both services:

```bash
docker-compose up --build
```

4. Open your browser:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

### Option 2: Run Services Separately

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed instructions on running backend and frontend separately for development.

## Documentation

- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Local development setup and testing
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guides for various platforms
- **[backend/README.md](backend/README.md)** - Backend API documentation
- **[frontend/README.md](frontend/README.md)** - Frontend application documentation

## Project Structure

```
weather-map-app/
├── backend/                 # Backend API service
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── services/       # Business logic
│   │   ├── models/         # Data models
│   │   ├── middleware/     # Express middleware
│   │   └── errors/         # Custom error classes
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
│
├── frontend/                # Frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API client
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # Main app component
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
│
├── .kiro/specs/            # Feature specifications
│   └── weather-map-app/
│       ├── requirements.md # Requirements document
│       ├── design.md       # Design document
│       └── tasks.md        # Implementation tasks
│
├── docker-compose.yml      # Docker Compose configuration
├── DEVELOPMENT.md          # Development guide
├── DEPLOYMENT.md           # Deployment guide
└── README.md               # This file
```

## Technology Stack

### Frontend

- React 18
- TypeScript
- Vite (build tool)
- Leaflet.js (maps)
- Axios (HTTP client)
- Jest + React Testing Library (testing)
- fast-check (property-based testing)

### Backend

- Node.js 18+
- Express.js 5
- TypeScript
- Axios (HTTP client)
- Jest + Supertest (testing)
- fast-check (property-based testing)

## Testing

### Run All Tests

**Backend:**

```bash
cd backend
npm test
```

**Frontend:**

```bash
cd frontend
npm test
```

### Test Coverage

The project includes:

- **Unit tests**: Specific examples and edge cases
- **Property-based tests**: Universal correctness properties
- **Integration tests**: Component integration and workflows

Coverage targets:

- Backend: > 85%
- Frontend: > 80%

## Performance Targets

- ✅ Initial page load: < 3 seconds
- ✅ API response time: < 2 seconds
- ✅ Bundle size: < 500KB gzipped
- ✅ Map rendering: 60fps

## Deployment

The application can be deployed to various platforms:

### Backend Options

- Docker (any container platform)
- AWS ECS / Fargate
- Google Cloud Run
- Heroku
- DigitalOcean App Platform

### Frontend Options

- Vercel (recommended)
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Any static hosting service

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Environment Variables

### Backend

| Variable           | Description                   | Required |
| ------------------ | ----------------------------- | -------- |
| `WEATHER_API_KEY`  | API key from weather provider | Yes      |
| `WEATHER_PROVIDER` | openweathermap or weatherapi  | Yes      |
| `FRONTEND_URL`     | Frontend URL for CORS         | Yes      |
| `PORT`             | Server port (default: 3001)   | No       |

### Frontend

| Variable       | Description     | Required |
| -------------- | --------------- | -------- |
| `VITE_API_URL` | Backend API URL | Yes      |

## API Endpoints

### Backend API

**Get Weather Data**

```
GET /api/weather?lat={latitude}&lon={longitude}
```

**Health Check**

```
GET /health
```

See [backend/README.md](backend/README.md) for complete API documentation.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Troubleshooting

### Common Issues

**"Cannot connect to backend API"**

- Verify backend is running
- Check `VITE_API_URL` in frontend `.env`
- Verify CORS configuration in backend

**"Weather provider unreachable"**

- Check your API key is correct
- Verify you haven't exceeded rate limits
- Check weather provider API status

**"Map not displaying"**

- Verify internet connection (map tiles require network)
- Check browser console for errors
- Ensure Leaflet CSS is loaded

See [DEVELOPMENT.md](DEVELOPMENT.md#troubleshooting) for more troubleshooting tips.

## License

ISC

## Support

For issues and questions:

1. Check the documentation in this README and linked guides
2. Review the troubleshooting sections
3. Open an issue in the repository

## Acknowledgments

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/) or [WeatherAPI](https://www.weatherapi.com/)
- Maps powered by [Leaflet](https://leafletjs.com/) and [OpenStreetMap](https://www.openstreetmap.org/)
- Built with [React](https://react.dev/) and [Node.js](https://nodejs.org/)
