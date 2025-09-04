# Setup Guide for GitHub Code Review Bot

This guide will walk you through setting up the automated code review bot in your GitHub repository.

## Prerequisites

- GitHub repository with admin access
- OpenAI API key with GPT-4 access
- Node.js 18+ (for local testing)

## Step-by-Step Setup

### Step 1: Add Files to Your Repository

Copy these files to your repository root:

```
your-repo/
├── .github/
│   └── workflows/
│       ├── code-review-dev.yml
│       ├── code-review-uat.yml
│       └── code-review-main.yml
├── config/
│   └── review-criteria.yml
├── scripts/
│   └── code-review.js
├── package.json
├── README.md
└── SETUP.md
```

### Step 2: Configure GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

#### Required Secrets:

**OPENAI_API_KEY**
- Name: `OPENAI_API_KEY`
- Value: Your OpenAI API key (starts with `sk-`)
- Description: API key for OpenAI GPT-4 access

**GITHUB_TOKEN** (usually automatic)
- Name: `GITHUB_TOKEN`
- Value: Automatically provided by GitHub Actions
- Description: Token for GitHub API access

### Step 3: Verify Branch Names

Ensure your repository has these branches (case-sensitive):
- `dev` (or `development`)
- `UAT` (or `uat`)
- `main` (or `master`)

If your branch names are different, update the workflow files:

```yaml
# In .github/workflows/code-review-dev.yml
on:
  push:
    branches: [ your-dev-branch-name ]
```

### Step 4: Test the Setup

1. Make a small change to a file
2. Push to the `dev` branch
3. Check the **Actions** tab in your repository
4. Look for the "Code Review - DEV Branch" workflow
5. Verify it runs without errors

### Step 5: Customize Configuration

Edit `config/review-criteria.yml` to match your needs:

#### Example: Add Custom Review Criteria

```yaml
branches:
  dev:
    review_criteria:
      security:
        - "Check for your custom security rule"
        - "Validate your specific requirement"
      standards:
        - "Follow your coding standards"
        - "Include your documentation requirements"
```

#### Example: Modify File Exclusions

```yaml
global:
  exclude_patterns:
    - "**/*.your-sensitive-file"
    - "**/your-excluded-directory/**"
```

### Step 6: Test Issue Creation

1. Create a test file with obvious issues (e.g., hardcoded password)
2. Push to `dev` branch
3. Check if a GitHub issue is created
4. Verify the issue has proper labels and content

## Verification Checklist

- [ ] All files copied to repository
- [ ] GitHub secrets configured
- [ ] Branch names match workflow configuration
- [ ] First push to dev branch triggers workflow
- [ ] Workflow completes without errors
- [ ] Test issue creation works
- [ ] Configuration file is editable

## Common Setup Issues

### Issue: Workflow Not Triggering

**Symptoms**: No workflow runs when pushing to branches

**Solutions**:
1. Check branch names are exact match (case-sensitive)
2. Verify workflow files are in `.github/workflows/`
3. Ensure files have `.yml` extension
4. Check repository has Actions enabled

### Issue: OpenAI API Errors

**Symptoms**: Workflow fails with API errors

**Solutions**:
1. Verify `OPENAI_API_KEY` secret is set correctly
2. Check API key has GPT-4 access
3. Ensure sufficient API credits
4. Test API key manually

### Issue: Permission Denied

**Symptoms**: Cannot create issues or access repository

**Solutions**:
1. Check `GITHUB_TOKEN` permissions
2. Verify repository Actions settings
3. Ensure bot has write access to issues

### Issue: No Files Analyzed

**Symptoms**: Workflow runs but analyzes no files

**Solutions**:
1. Check file extension filters in config
2. Verify exclude patterns aren't too broad
3. Ensure files are actually changed in commits

## Advanced Configuration

### Custom Branch Rules

Add new branches by creating workflow files:

```yaml
# .github/workflows/code-review-staging.yml
name: Code Review - STAGING Branch
on:
  push:
    branches: [ staging ]
```

And add configuration:

```yaml
# config/review-criteria.yml
branches:
  staging:
    blocking: false
    severity_threshold: "medium"
    review_criteria:
      # Your criteria
```

### Custom Labels

Modify issue labels in configuration:

```yaml
issue_labels:
  critical:
    name: "security-critical"
    color: "b60205"
    description: "Critical security issue"
```

### Custom OpenAI Model

Change the AI model in configuration:

```yaml
openai:
  model: "gpt-3.5-turbo"  # or "gpt-4"
  max_tokens: 1000
  temperature: 0.2
```

## Next Steps

After successful setup:

1. **Monitor Performance**: Check workflow execution times
2. **Tune Criteria**: Adjust review criteria based on results
3. **Team Training**: Educate team on issue format and responses
4. **Integration**: Consider integrating with other tools (Slack, email)
5. **Metrics**: Track issue creation and resolution rates

## Support

If you encounter issues:

1. Check GitHub Actions logs for detailed error messages
2. Verify all prerequisites are met
3. Test with a simple file change first
4. Review the troubleshooting section in README.md
5. Open an issue in this repository with:
   - Your repository name (if public)
   - Error messages from logs
   - Steps to reproduce
   - Your configuration (without secrets)
