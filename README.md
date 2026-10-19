# Admin Portal - Token Management

A modern, secure admin interface for managing long-lived API tokens. Built with React, TypeScript, and Tailwind CSS, authenticated via Google OAuth, and hosted on GitHub Pages.

## Features

- **Google OAuth Authentication** - Secure login using Google accounts
- **Token Generation** - Create new long-lived API tokens (valid for 365 days)
- **Token Management** - View and expire tokens
- **Token Display** - Show/hide and copy tokens securely
- **Expiration Tracking** - View when tokens were created and when they expire
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Modern UI** - Clean, accessible interface built with Tailwind CSS

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **@react-oauth/google** - Google OAuth integration
- **Lucide React** - Modern icon library
- **date-fns** - Date formatting utilities

## Prerequisites

- Node.js 18+ and npm
- Google OAuth Client ID ([Get one here](https://console.cloud.google.com/apis/credentials))
- Backend API for token storage and management

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd admin-emgeebee
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_API_BASE_URL=https://api.emgeebee.com
```

### 3. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized JavaScript origins: 
     - `http://localhost:5173` (for development)
     - `https://admin.emgeebee.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:5173`
     - `https://admin.emgeebee.com`

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## API Integration

The application integrates with the [trackmyholidays-api](https://github.com/emgeebee/trackmyholidays-api) token management endpoints.

### Authentication
- Tokens should be stored in localStorage as `authToken`
- All API requests include `Authorization: Bearer {token}` header

### Endpoints

```
POST /generateToken    - Generate a new long-lived token
GET  /tokens          - List all tokens for the authenticated user  
POST /expireToken     - Expire/delete a token
```

### Token Object Schema

```typescript
{
  token: string         // The JWT token string
  userid: string        // User ID who owns the token
  createdAt: string     // ISO 8601 timestamp
  expiresAt: string     // ISO 8601 timestamp
}
```

### Generate Token Response

```typescript
{
  token: string         // The JWT token string
  sub: string          // Subject (user ID)
  expiresIn: string    // e.g. "365d"
  expiresAt: string    // ISO 8601 timestamp
}
```

## Deployment to GitHub Pages

### 1. Configure GitHub Repository Settings

1. Go to your repository settings
2. Navigate to Pages
3. Set Source to "GitHub Actions"

### 2. Add GitHub Secrets

Add the following secrets to your repository:
- `VITE_GOOGLE_CLIENT_ID` - Your Google OAuth Client ID
- `VITE_API_BASE_URL` - Your API base URL

### 3. Set Up Custom Domain

1. In your repository settings under Pages, add your custom domain: `admin.emgeebee.com`
2. Configure DNS records with your domain provider:
   - Add a CNAME record pointing `admin.emgeebee.com` to `<your-username>.github.io`

### 4. Deploy

Push to the `main` branch or manually trigger the workflow:

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

The GitHub Actions workflow will automatically build and deploy your site.

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   └── TokenList.tsx    # Token list and management
│   ├── contexts/
│   │   └── AuthContext.tsx  # Authentication context
│   ├── services/
│   │   └── api.ts           # API service layer
│   ├── types/
│   │   └── token.ts         # TypeScript types
│   ├── lib/
│   │   └── utils.ts         # Utility functions
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── public/
│   └── CNAME                # Custom domain configuration
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions deployment
└── package.json
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run linter

### Code Style

This project uses:
- TypeScript for type safety
- ESLint for code linting (oxlint)
- Tailwind CSS for styling

## Security Considerations

- Authentication tokens are stored in localStorage
- All API calls include authentication headers
- Tokens are masked in the UI (only showing first and last 8 characters)
- Copy-to-clipboard functionality for secure token sharing
- HTTPS required for production deployment

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
