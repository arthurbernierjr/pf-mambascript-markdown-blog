---
title: "Git Workflow"
subTitle: "Version Control Best Practices"
excerpt: "Good Git habits make teamwork possible."
featureImage: "/img/git-workflow.png"
date: "2026-02-01"
order: 808
---

# Explanation

## Why Git Workflows Matter

A consistent Git workflow helps teams collaborate effectively. It prevents conflicts, enables code review, and maintains a clean history.

### Key Concepts

- **Branching**: Isolated development streams
- **Commits**: Atomic, logical changes
- **Pull Requests**: Code review process
- **Merging**: Combining branches

### Common Workflows

| Workflow | Best For |
|----------|----------|
| GitHub Flow | Small teams, continuous deployment |
| GitFlow | Release-based products |
| Trunk-Based | Large teams, frequent deploys |

---

# Demonstration

## Example 1: GitHub Flow

```bash
# 1. Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/user-authentication

# 2. Make changes and commit
git add src/auth/
git commit -m "Add user authentication module

- Implement login/logout endpoints
- Add JWT token generation
- Create auth middleware

Co-Authored-By: Claude <noreply@anthropic.com>"

# 3. Push branch
git push -u origin feature/user-authentication

# 4. Create Pull Request (via GitHub CLI)
gh pr create --title "Add user authentication" --body "## Summary
- Implements login/logout functionality
- Uses JWT for stateless auth
- Adds middleware for protected routes

## Test Plan
- [ ] Test login with valid credentials
- [ ] Test login with invalid credentials
- [ ] Test protected route access"

# 5. After review, merge
gh pr merge --squash

# 6. Delete branch
git checkout main
git pull origin main
git branch -d feature/user-authentication
```

## Example 2: Commit Best Practices

```bash
# Good commit messages
git commit -m "Add user registration endpoint

Implements POST /api/users endpoint that:
- Validates email and password
- Hashes password with bcrypt
- Returns JWT token on success

Closes #123"

git commit -m "Fix login rate limiting bug

The rate limiter was using IP address from X-Forwarded-For
without proper parsing, causing all users behind a proxy
to share the same limit.

Now correctly parses the first IP in the chain."

git commit -m "Refactor auth middleware for clarity

No functional changes. Extracts token validation
into separate function and adds JSDoc comments."

# Bad commit messages
# git commit -m "fix"
# git commit -m "WIP"
# git commit -m "changes"
# git commit -m "asdfasdf"

# Atomic commits - one logical change per commit
# Instead of one big commit with everything:
git add src/models/user.js
git commit -m "Add User model with validation"

git add src/routes/users.js
git commit -m "Add user CRUD routes"

git add tests/users.test.js
git commit -m "Add user route tests"
```

## Example 3: Branch Management

```bash
# Naming conventions
# feature/   - new features
# fix/       - bug fixes
# hotfix/    - urgent production fixes
# refactor/  - code improvements
# docs/      - documentation
# test/      - test additions

git checkout -b feature/shopping-cart
git checkout -b fix/login-validation
git checkout -b hotfix/security-patch
git checkout -b refactor/auth-module

# Keep branches up to date with main
git checkout feature/my-feature
git fetch origin
git rebase origin/main

# Or merge (creates merge commit)
git merge origin/main

# Interactive rebase to clean up commits
git rebase -i HEAD~3
# Opens editor to squash, reword, reorder commits

# Stash changes temporarily
git stash
git checkout other-branch
# Do work...
git checkout -
git stash pop

# Cherry-pick specific commits
git cherry-pick abc123

# View branch relationships
git log --oneline --graph --all
```

## Example 4: Handling Conflicts

```bash
# When merge conflict occurs
git merge feature-branch
# CONFLICT (content): Merge conflict in src/app.js

# View conflicting files
git status

# Edit file to resolve conflicts
# <<<<<<< HEAD
# const port = 3000;
# =======
# const port = process.env.PORT || 3000;
# >>>>>>> feature-branch

# After resolving:
git add src/app.js
git commit -m "Merge feature-branch, resolve port config conflict"

# Abort if needed
git merge --abort

# Using a merge tool
git mergetool

# Prevent conflicts with regular rebasing
git checkout feature-branch
git fetch origin
git rebase origin/main
# Resolve any conflicts one commit at a time
git add .
git rebase --continue
```

## Example 5: Advanced Operations

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Amend last commit
git add forgotten-file.js
git commit --amend --no-edit

# Revert a pushed commit (safe for shared branches)
git revert abc123

# Find when bug was introduced
git bisect start
git bisect bad HEAD
git bisect good v1.0.0
# Git will checkout commits for you to test
git bisect good  # or bad
# Continue until found
git bisect reset

# View file history
git log --follow -p -- src/app.js

# Find who changed a line
git blame src/app.js

# Clean up untracked files
git clean -fd

# Create patch
git diff > changes.patch
git apply changes.patch

# Squash all commits on branch into one
git checkout feature-branch
git reset --soft main
git commit -m "Feature: complete implementation"
```

## Example 6: Git Hooks

```bash
#!/bin/sh
# .git/hooks/pre-commit

# Run linter
npm run lint
if [ $? -ne 0 ]; then
    echo "Linting failed. Fix errors before committing."
    exit 1
fi

# Run tests
npm test
if [ $? -ne 0 ]; then
    echo "Tests failed. Fix tests before committing."
    exit 1
fi

# Check for console.log
if git diff --cached | grep -E '^\+.*console\.log'; then
    echo "Warning: console.log found in changes"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
```

```bash
#!/bin/sh
# .git/hooks/commit-msg

# Enforce commit message format
commit_msg=$(cat "$1")

# Check for conventional commits format
if ! echo "$commit_msg" | grep -qE "^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,50}"; then
    echo "Error: Commit message must follow conventional commits format"
    echo "Example: feat(auth): add login endpoint"
    exit 1
fi
```

**Key Takeaways:**
- Write meaningful commit messages
- Keep branches short-lived
- Rebase to keep history clean
- Use PRs for code review
- Automate with hooks

---

# Imitation

### Challenge 1: Set Up Git Hooks

**Task:** Create pre-commit hooks that lint and test code.

<details>
<summary>Solution</summary>

```bash
# Install husky (npm)
npm install husky lint-staged --save-dev
npx husky install

# package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{js,ts}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}

# Create pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"

# Create commit-msg hook for conventional commits
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'

# commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 72]
  }
};
```

</details>

### Challenge 2: Create Release Script

**Task:** Automate version bumping and changelog generation.

<details>
<summary>Solution</summary>

```bash
#!/bin/bash
# release.sh

set -e

# Get version type (major, minor, patch)
VERSION_TYPE=${1:-patch}

# Ensure clean working directory
if [[ -n $(git status --porcelain) ]]; then
    echo "Working directory not clean. Commit or stash changes first."
    exit 1
fi

# Ensure on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" ]]; then
    echo "Must be on main branch to release"
    exit 1
fi

# Pull latest
git pull origin main

# Run tests
npm test

# Bump version
NEW_VERSION=$(npm version $VERSION_TYPE --no-git-tag-version)
echo "Bumping to $NEW_VERSION"

# Generate changelog
npx conventional-changelog -p angular -i CHANGELOG.md -s

# Commit and tag
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore(release): $NEW_VERSION"
git tag -a "$NEW_VERSION" -m "Release $NEW_VERSION"

# Push
git push origin main --tags

echo "Released $NEW_VERSION!"
```

</details>

---

# Practice

### Exercise 1: Branch Strategy
**Difficulty:** Intermediate

Set up a GitFlow workflow:
- main, develop branches
- Feature branches
- Release process

### Exercise 2: Monorepo Management
**Difficulty:** Advanced

Configure Git for a monorepo:
- Sparse checkout
- Subtree management
- Selective CI triggers

---

## Summary

**What you learned:**
- GitHub Flow for simple projects
- Commit message best practices
- Branch management strategies
- Conflict resolution
- Git hooks for automation

**Next Steps:**
- Read: [CI/CD Pipelines](/api/guides/concepts/cicd)
- Practice: Contribute to open source
- Explore: Git internals

---

## Resources

- [Pro Git Book](https://git-scm.com/book)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
