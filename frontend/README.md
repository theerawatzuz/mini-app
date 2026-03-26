# Weather Map Frontend

Frontend application for the Weather Map Application. This React-based single-page application displays an interactive world map where users can click to view real-time weather information.

## Features

- Interactive world map with Leaflet.js
- Click-to-view weather data
- Real-time weather information display
- Smooth animations and transitions
- Responsive design for mobile and desktop
- Environment-based configuration
- TypeScript for type safety
- Property-based testing with fast-check
- Standalone static web application deployment

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Backend API running (see backend README)

## Quick Start

1. Clone the repository:

```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create environment configuration:

```bash
cp .env.example .env
```

4. Edit `.env` and configure your backend API URL:

```env
VITE_API_URL=http://localhost:3001
```

5. Start the development server:

```bash
npm run dev
```

The application will start on `http://localhost:3000`.

## Environment Variables

The application requires the following environment variable:

| Variable       | Description     | Default               | Required |
| -------------- | --------------- | --------------------- | -------- |
| `VITE_API_URL` | Backend API URL | http://localhost:3001 | Yes      |

### VITE_API_URL

The URL of your backend API service. This is where the frontend will send weather data requests.

**Examples:**

- Development: `http://localhost:3001`
- Production: `https://your-backend-api.com`

**Important:**

- Do not include a trailing slash in the URL.
- For Vite applications, environment variables must be prefixed with `VITE_` to be exposed to the client-side code.
- Changes to `.env` require restarting the development server.

## Development

Start the development server with hot reload:

```bash
npm run dev
```

The application will start on `http://localhost:3000`.

### Development Features

- Hot module replacement (HMR)
- Fast refresh for React components
- TypeScript type checking
- ESLint for code quality

## Building

Build the application for production:

```bash
npm run build
```

The compiled static files will be in the `dist/` directory.

Preview the production build locally:

```bash
npm run preview
```

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
- Integration tests for user workflows

## Project Structure

```
frontend/
├── src/
│   ├── main.tsx              # Application entry point
│   ├── App.tsx               # Main App component
│   ├── App.css               # App styles
│   ├── index.css             # Global styles
│   ├── components/           # React components (to be added)
│   ├── services/             # API client services (to be added)
│   ├── types/                # TypeScript interfaces (to be added)
│   └── setupTests.ts         # Jest setup
├── dist/                     # Production build (generated)
├── index.html                # HTML template
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── jest.config.js            # Jest configuration
├── .env.example              # Example environment variables
├── .gitignore                # Git ignore rules
├── package.json              # Project dependencies and scripts
└── README.md                 # This file
```

## Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Map Library**: Leaflet.js with react-leaflet
- **HTTP Client**: Axios
- **Testing**: Jest, React Testing Library, fast-check
- **Styling**: CSS Modules

## Deployment

The frontend is designed to be deployed as a standalone static web application. Below are deployment instructions for various platforms.

### Vercel

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Deploy:

```bash
vercel --prod
```

3. Set environment variable in Vercel dashboard:
   - `VITE_API_URL`: Your backend API URL

### Netlify

1. Install Netlify CLI:

```bash
npm i -g netlify-cli
```

2. Build the project:

```bash
npm run build
```

3. Deploy:

```bash
netlify deploy --prod --dir=dist
```

4. Set environment variable in Netlify dashboard:
   - `VITE_API_URL`: Your backend API URL

### AWS S3 + CloudFront

1. Build the project:

```bash
npm run build
```

2. Create an S3 bucket and enable static website hosting

3. Upload the `dist/` directory to S3:

```bash
aws s3 sync dist/ s3://your-bucket-name --delete
```

4. Create a CloudFront distribution pointing to your S3 bucket

5. Configure environment variables by creating a `config.js` file in the build or using build-time environment variables

### Docker

1. Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. Build the Docker image:

```bash
docker build -t weather-map-frontend .
```

3. Run the container:

```bash
docker run -p 80:80 weather-map-frontend
```

### GitHub Pages

1. Install gh-pages:

```bash
npm install --save-dev gh-pages
```

2. Add to `package.json`:

```json
{
  "homepage": "https://yourusername.github.io/weather-map-frontend",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Deploy:

```bash
npm run deploy
```

## Performance

- Initial page load target: < 3 seconds
- Production bundle size target: < 500KB gzipped
- Map rendering target: 60fps
- Smooth transitions and animations

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Common Issues

**Issue: "Cannot connect to backend API"**

- Verify `VITE_API_URL` is set correctly in `.env`
- Ensure backend API is running
- Check browser console for CORS errors
- Verify backend CORS configuration allows your frontend URL

**Issue: "Map not displaying"**

- Check browser console for Leaflet errors
- Ensure Leaflet CSS is loaded in `index.html`
- Verify internet connection (map tiles require network access)

**Issue: "Build fails with TypeScript errors"**

- Run `npm install` to ensure all dependencies are installed
- Check `tsconfig.json` configuration
- Verify TypeScript version compatibility

**Issue: "Environment variables not working"**

- Ensure variables are prefixed with `VITE_`
- Restart development server after changing `.env`
- For production builds, set environment variables before building

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
