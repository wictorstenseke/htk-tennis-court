# Branch Protection Setup Guide

This guide explains how to set up branch protection rules for the `main` branch to prevent direct pushes and enforce quality checks.

## Setting Up Branch Protection

### Step 1: Navigate to Repository Settings

1. Go to your GitHub repository
2. Click on **Settings** (top navigation bar)
3. In the left sidebar, click on **Branches**

### Step 2: Add Branch Protection Rule

1. Under **Branch protection rules**, click **Add rule** or **Add branch protection rule**
2. In the **Branch name pattern** field, enter: `main`

### Step 3: Configure Protection Settings

Enable the following settings:

#### ✅ Required Settings

- **✅ Require a pull request before merging**
  - ✅ Require approvals: `1` (or more as needed)
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners (if you have a CODEOWNERS file)

- **✅ Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - Select the following required status checks:
    - `quality-assurance (18.x)`
    - `quality-assurance (20.x)`
    - `build-and-deploy` (optional, but recommended)

- **✅ Require conversation resolution before merging**
  - This ensures all PR comments are addressed

- **✅ Do not allow bypassing the above settings**
  - Prevents even admins from bypassing protection rules

#### 🔒 Additional Recommended Settings

- **✅ Restrict who can push to matching branches**
  - This prevents direct pushes entirely
  - Only allow specific teams/users if needed

- **✅ Include administrators**
  - Ensures even admins follow the same rules

- **✅ Allow force pushes** → ❌ **DISABLED**
  - Prevents rewriting history on main branch

- **✅ Allow deletions** → ❌ **DISABLED**
  - Prevents accidental deletion of main branch

### Step 4: Save the Rule

Click **Create** or **Save changes** to apply the branch protection rule.

## How It Works

Once configured:

1. **Direct pushes to `main` are blocked** - All changes must go through pull requests
2. **CI checks must pass** - The quality assurance workflow must succeed before merging
3. **PR approval required** - At least one approval is needed before merging
4. **Conversations resolved** - All PR comments must be resolved

## Testing the Setup

1. Create a new branch: `git checkout -b test-branch`
2. Make a small change and commit
3. Push and create a PR: `git push origin test-branch`
4. Try to merge - you should see that CI checks must pass first
5. Try to push directly to main - it should be blocked

## Troubleshooting

### CI checks not showing up?

- Make sure the workflow files are committed to the repository
- Check that workflows are running in the **Actions** tab
- Verify the workflow file syntax is correct

### Can't push to main?

- This is expected! Use pull requests instead
- If you need to push directly (emergency), temporarily disable branch protection (not recommended)

### Need to bypass for hotfixes?

Consider creating a separate `hotfix/` branch pattern with different rules, or use a separate protected branch like `production` with stricter rules.

