# GitHub Pages Setup Guide

This guide explains how to enable GitHub Pages for automatic deployment of your application.

## Prerequisites

- ✅ GitHub Actions workflows are set up (`.github/workflows/deploy.yml`)
- ✅ Repository is public (or GitHub Pages is enabled for private repos with GitHub Pro/Team)

## Step 1: Enable GitHub Pages

1. Go to your GitHub repository
2. Click on **Settings** (top navigation bar)
3. In the left sidebar, scroll down and click on **Pages**

## Step 2: Configure Source

1. Under **Source**, select:
   - **Source**: `GitHub Actions`
   
   This will use the deployment workflow instead of a branch.

## Step 3: Verify Deployment

1. After pushing to `main`, go to the **Actions** tab
2. Wait for the `Deploy to GitHub Pages` workflow to complete
3. Once successful, your site will be available at:
   ```
   https://[your-username].github.io/htk-tennis-v2/
   ```

## Step 4: Access Your Site

- The deployment URL will be shown in:
  - Repository Settings → Pages
  - Actions workflow run → Deployment step
  - Repository About section (you can add it manually)

## Troubleshooting

### Site not loading?

- Check the Actions tab for any deployment errors
- Verify the build completed successfully
- Ensure GitHub Pages is set to use "GitHub Actions" as the source
- Wait a few minutes after deployment (DNS propagation)

### 404 errors on routes?

- The Vite config is already set up with the correct base path
- Make sure you're accessing routes correctly (e.g., `/htk-tennis-v2/` prefix)

### Build failing?

- Check that all environment variables are set (if needed)
- Verify Node.js version compatibility
- Review build logs in the Actions tab

## Custom Domain (Optional)

If you want to use a custom domain:

1. Add a `CNAME` file to the `public/` directory with your domain
2. Configure DNS settings with your domain provider
3. Update the custom domain in GitHub Pages settings

## Notes

- Deployments happen automatically on every push to `main`
- Only successful builds are deployed
- Previous deployments are kept for rollback purposes
- The site is served over HTTPS automatically

