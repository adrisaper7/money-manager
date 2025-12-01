# GitHub Pages Deployment Guide

## Steps to Deploy

### 1. Add Firebase Secrets to GitHub

Go to your GitHub repository settings and add these secrets:

1. Navigate to: **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** for each of these:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

Copy the values from your `.env` file.

### 2. Configure GitHub Pages

1. Go to **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**

### 3. Push Your Changes

```bash
git add .
git commit -m "Add GitHub Actions deployment workflow"
git push origin main
```

### 4. Monitor Deployment

1. Go to the **Actions** tab in your repository
2. Watch the deployment workflow run
3. Once complete, your site will be live at: `https://adrisaper7.github.io/money-manager`

## Troubleshooting

If the deployment fails:
- Check the Actions tab for error messages
- Verify all Firebase secrets are correctly set
- Make sure the branch name is `main` (or update the workflow file if it's `master`)

## Manual Build (Local Testing)

To test the build locally before deploying:

```bash
npm run build
npm run preview
```

This will build and serve your app locally at `http://localhost:4173/money-manager/`
