# Firebase Secrets Setup for GitHub Actions

This guide explains how to configure Firebase environment variables as GitHub Secrets for the CI/CD pipeline.

## Why This Is Needed

Firebase configuration requires environment variables that are embedded into the build at build time. Since `.env` files are not committed to the repository, we need to configure these as GitHub Secrets.

## Step 1: Get Your Firebase Configuration Values

If you don't have them already, you can find your Firebase configuration in:
1. Firebase Console → Project Settings → Your apps → Web app config
2. Or check your local `.env` file (if it exists)

You'll need these 6 values:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Step 2: Add GitHub Secrets

1. Go to your GitHub repository
2. Click on **Settings** (top navigation bar)
3. In the left sidebar, click on **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each of the following secrets one by one:

### Required Secrets:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase API Key | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | `123456789012` |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | `1:123456789012:web:abc123def456` |

## Step 3: Verify Setup

After adding the secrets:
1. Push a commit or trigger a workflow run
2. Check the Actions tab to ensure the build completes successfully
3. Verify that Firebase initializes correctly in the deployed site

## Security Notes

- ✅ These secrets are only available to GitHub Actions workflows
- ✅ They are encrypted and cannot be viewed after creation
- ✅ They are not exposed in build logs (Vite handles this automatically)
- ⚠️ Firebase API keys are safe to expose in client-side code (they're public by design)
- ⚠️ However, using secrets prevents accidental exposure and allows rotation

## Troubleshooting

### Build fails with "Firebase: Error (auth/invalid-api-key)"
- Verify all 6 secrets are added correctly
- Check that secret names match exactly (case-sensitive)
- Ensure values don't have extra spaces or quotes

### Build succeeds but Firebase doesn't work in production
- Check browser console for Firebase errors
- Verify the secrets are being used in the deploy job (not just QA)
- Ensure Firebase project settings allow your GitHub Pages domain

## Related Files

- `.github/workflows/ci.yml` - Workflow that uses these secrets
- `src/config/firebase.ts` - Firebase configuration file
- `env.example` - Example environment variables file

