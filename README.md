# HTK Tennis v2

A modern Vue 3 application built with TypeScript, Vite, and Firebase.

## Tech Stack

- **Vite** - Next generation frontend tooling
- **Vue 3** - Progressive JavaScript framework with Composition API
- **TypeScript** - Typed JavaScript at any scale
- **Vue Router** - Official router for Vue.js
- **Pinia** - The Vue Store that you will enjoy using
- **VueUse** - Collection of Vue Composition Utilities
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library for Tailwind CSS
- **Firebase** - Backend as a Service (Auth, Firestore, Storage)
- **ESLint + Prettier** - Code linting and formatting
- **Vitest** - Fast unit test framework

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your Firebase configuration values.

### Development

Start the development server:
```bash
npm run dev
```

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

### Linting and Formatting

Lint your code:
```bash
npm run lint
```

Format your code:
```bash
npm run format
```

### Testing

Run tests:
```bash
npm run test
```

Run tests with UI:
```bash
npm run test:ui
```

## Project Structure

```
src/
├── components/     # Vue components
├── views/         # Route views
├── stores/        # Pinia stores
├── router/        # Vue Router configuration
├── composables/   # VueUse and custom composables
├── utils/         # Utility functions
├── config/        # Configuration files (Firebase, etc.)
├── types/         # TypeScript type definitions
└── styles/        # Global styles and Tailwind imports
```

## Firebase Setup

### Initial Setup (Already Done)
- ✅ Firebase project "htk-tennis" is active
- ✅ Web app created
- ✅ Firestore initialized with region `europe-west1`
- ✅ Firestore rules deployed

### Next Steps

1. **Activate Firestore API** (Required):
   - Visit: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=htk-tennis
   - Click "Enable" to activate the Firestore API
   - Wait 1-2 minutes for propagation

2. **Create Firestore Database**:
   - After API is enabled, visit: https://console.firebase.google.com/project/htk-tennis/firestore
   - Click "Create database"
   - Select "Start in production mode" (rules are already deployed)
   - Choose region: `europe-west1` (Belgium)
   - Click "Enable"

3. **Environment Variables**:
   - Copy `env.example` to `.env`
   - Firebase config values are already set (see `env.example`)

4. **Test the Setup**:
   - Run `npm run dev`
   - The app will automatically initialize Firestore on startup
   - Check Firebase Console to verify database creation

### Firebase Services
- **Authentication**: Ready to use (`src/config/firebase.ts`)
- **Firestore**: Configured, waiting for database creation
- **Storage**: Ready to use (`src/config/firebase.ts`)

## License

MIT

