# GitHub Actions Workflows Guide

[Back to README](../README.md)

This document explains the GitHub Actions workflows used in the pixi-questions project.

> **Naming Convention:** Reusable workflows are prefixed with an underscore (e.g., `_format.yml`, `_copyright.yml`)
> to distinguish them from caller workflows (e.g., `ci.yml`).

## Workflow Files

### Reusable Components

Located in `.github/workflows/`:

#### `_copyright.yml`
- **Purpose**: Verify MIT license headers in all `.js` and `.py` files
- **Runs**: `./scripts/check-copyright.sh`
- **Duration**: ~30 seconds

#### `_format.yml`
- **Purpose**: Verify code formatting with ESLint across all projects
- **Runs**: `./scripts/check-format.sh`
- **Duration**: ~1-2 minutes

#### `_test.yml`
- **Purpose**: Run tests for all projects
- **Runs**: `npm run test:run` in each project
- **Duration**: ~2-3 minutes

### Main Workflow

#### `ci.yml` - Continuous Integration
**Trigger**: Push or Pull Request to `main` or `master` branch

**Execution Flow**:
```
+----------------+----------------+
|                                 |
v                                 v
format                       copyright
(ESLint check)               (License headers)
|                                 |
+----------------+----------------+
                 |
                 v
               test
         (Run all tests)
```

**Jobs**:
1. **format** - ESLint formatting check (parallel with copyright)
2. **copyright** - MIT license headers check (parallel with format)
3. **test** - Run tests for all projects (after format and copyright pass)

## Adding New Projects

To add a new project to the CI pipeline, update the `PROJECTS` environment variable in:
- `.github/workflows/_format.yml`
- `.github/workflows/_test.yml`

Also update the project list in:
- `scripts/check-format.sh`

## Running CI Checks Locally

```bash
# Format check (all projects)
./scripts/check-format.sh

# Copyright check
./scripts/check-copyright.sh

# Run tests in a specific project
cd checkered-board-buttons
npm run test:run

# Auto-fix ESLint issues
cd checkered-board-buttons
npx eslint . --ext js,jsx --fix
```

## Pre-commit Hook

Install the pre-commit hook to run checks before each commit:

```bash
./scripts/setup-git-hooks.sh
```

## Debugging Failed Workflows

1. Go to Actions tab in GitHub
2. Click on the failed workflow run
3. Click on the failed job
4. Expand the failed step to see logs

**Common Failures**:
- **Format check fails**: Run `npx eslint . --fix` in the failing project
- **Copyright check fails**: Add MIT header to missing files
- **Test fails**: Run `npm run test:run` locally to debug
