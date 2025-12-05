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

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment.

### Continuous Integration (CI)

The CI pipeline runs automatically on:
- Pull requests targeting `main`
- Pushes to `main`

**Quality Checks:**
- ✅ ESLint code linting
- ✅ TypeScript type checking
- ✅ Unit tests with Vitest
- ✅ Production build verification
- ✅ Build size monitoring (on PRs)

### Continuous Deployment (CD)

- **GitHub Pages**: Automatically deploys to GitHub Pages when changes are merged to `main`
- **Live Preview**: Test versions are available at: `https://[your-username].github.io/htk-tennis-court/`

### Branch Protection

The `main` branch is protected to ensure code quality:
- ❌ Direct pushes are blocked
- ✅ All changes must go through pull requests
- ✅ CI checks must pass before merging
- ✅ PR approval required

**Setup Instructions:** See [`.github/BRANCH_PROTECTION.md`](.github/BRANCH_PROTECTION.md) for detailed branch protection configuration.

### Workflow Files

- `.github/workflows/ci.yml` - Quality assurance checks
- `.github/workflows/deploy.yml` - GitHub Pages deployment

## License

MIT

