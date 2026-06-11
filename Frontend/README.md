# College Platform - Frontend

Modern React frontend for the College Discovery Platform, built with Vite, React Router, and Tailwind CSS.

## Features

- ✅ Authentication (login/signup)
- ✅ College discovery with search and filters
- ✅ College comparison (up to 4 colleges side-by-side)
- ✅ Save favorite colleges to personal list
- ✅ Review system with ratings
- ✅ Dark/light theme support
- ✅ Fully responsive design
- ✅ Per-user state isolation (separate data for each account)

## Prerequisites

- Node.js 16+
- npm or yarn

## Installation

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
VITE_API_URL=http://localhost:5000
```

## Development

```bash
npm run dev              # Start development server (http://localhost:5173)
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
```

## Build

```bash
npm run build           # Build for production (outputs to dist/)
npm run preview         # Preview production build locally
```

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── auth/          # Login/signup components
│   ├── college/       # College cards and filters
│   ├── layout/        # Navbar and Footer
│   └── ui/            # Generic UI elements
├── pages/             # Page components (Home, Colleges, Compare, etc.)
├── hooks/             # Custom React hooks
│   ├── useSavedColleges    # User-scoped saved list
│   └── useCompare          # User-scoped comparison list
├── context/           # React Context (AuthContext)
├── utils/             # Utility functions
├── styles/            # Global styles
└── data/              # Static data
```

## Key Features Explained

### Per-User State (Fixed)
- Saved colleges and compare lists are now isolated per user account
- Guest (logged out) state is separate from authenticated user state
- Each account has independent lists on the same browser
- Lists persist across page refreshes (per-user)
- Logout clears guest state; login loads user's data

### Authentication
- Token-based JWT authentication
- Stored in localStorage (STORAGE_KEY: `collverse_auth`)
- Auto-logout on invalid token
- CORS-enabled API communication

## Deployment on Vercel

1. Push frontend code to separate GitHub repo
2. Connect repo to Vercel (vercel.com)
3. Set `VITE_API_URL` to your Render backend URL
4. Deploy (automatic on push to main)

## Technologies

- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4
- **HTTP**: Axios
- **Icons**: Lucide React
- **Validation**: Custom form validation

## License

MIT
