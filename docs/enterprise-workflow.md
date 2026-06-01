# 🏢 Enterprise CI/CD Workflow cho LaunchCart

## 📊 Tổng quan

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌─────────┐
│  Code   │───▶│  Build   │───▶│  Test    │───▶│  Stage   │───▶│Production│
│  Push   │    │  Docker  │    │  + Lint  │    │  Deploy  │    │  Deploy  │
└─────────┘    └──────────┘    └──────────┘    └──────────┘    └─────────┘
     │              │               │               │               │
     ▼              ▼               ▼               ▼               ▼
  GitHub       GitHub Actions   GitHub Actions   Vercel/Render   Vercel/Render
  Push/PR      Build Image      Run Tests         Staging         Production
```

## 📁 Cấu trúc thư mục

```
.github/
├── workflows/
│   ├── ci.yml              # CI: Build + Test (mỗi push/PR)
│   ├── staging.yml         # CD: Deploy staging (merge vào develop)
│   ├── production.yml      # CD: Deploy production (tag/release)
│   └── security.yml        # Security scan (daily + PR)
├── dependabot.yml          # Auto-update dependencies
└── CODEOWNERS              # Code review rules
```

## 🔄 Workflow 1: CI (Continuous Integration)

**Kích hoạt:** Mỗi push hoặc pull request

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '20'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # ─── Job 1: Lint + Type Check ───────────────────────
  lint:
    name: 🔍 Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: TypeScript type check
        run: npx tsc --noEmit

  # ─── Job 2: Unit Tests ──────────────────────────────
  test:
    name: 🧪 Unit Tests
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test -- --coverage

      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/

  # ─── Job 3: Build Docker Image ──────────────────────
  build:
    name: 🐳 Build Docker Image
    runs-on: ubuntu-latest
    needs: test
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix=sha-
            type=semver,pattern={{version}}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # ─── Job 4: E2E Tests (Playwright) ──────────────────
  e2e:
    name: 🎭 E2E Tests
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: npx playwright test
        env:
          CI: true

      - name: Upload E2E results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

## 🔄 Workflow 2: Deploy Staging

**Kích hoạt:** Merge vào branch `develop`

```yaml
# .github/workflows/staging.yml
name: Deploy Staging

on:
  push:
    branches: [develop]

jobs:
  deploy-staging:
    name: 🚀 Deploy to Staging
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel (Staging)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          alias-domains: |
            staging.launchcart.vercel.app

      - name: Run smoke tests
        run: |
          sleep 30
          curl -sf https://staging.launchcart.vercel.app || exit 1
          echo "✅ Staging is up!"

      - name: Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: "Staging deploy: ${{ job.status }}"
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## 🔄 Workflow 3: Deploy Production

**Kích hoạt:** Tạo git tag `v*.*.*` hoặc GitHub Release

```yaml
# .github/workflows/production.yml
name: Deploy Production

on:
  push:
    tags:
      - 'v*.*.*'
  release:
    types: [published]

jobs:
  deploy-production:
    name: 🚀 Deploy to Production
    runs-on: ubuntu-latest
    environment: production  # Requires manual approval
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

      - name: Run health check
        run: |
          sleep 30
          for i in 1 2 3 4 5; do
            STATUS=$(curl -sf -o /dev/null -w "%{http_code}" https://launchcart-gamma.vercel.app)
            if [ "$STATUS" = "200" ]; then
              echo "✅ Production is healthy (HTTP $STATUS)"
              exit 0
            fi
            echo "Attempt $i: HTTP $STATUS, retrying in 10s..."
            sleep 10
          done
          echo "❌ Production health check failed"
          exit 1

      - name: Create Sentry release
        uses: getsentry/action-release@v1
        with:
          environment: production
          version: ${{ github.ref_name }}
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
          SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}

      - name: Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: "🚀 Production deploy ${{ github.ref_name }}: ${{ job.status }}"
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## 🔄 Workflow 4: Security Scan

**Kích hoạt:** Daily + mỗi PR

```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM UTC
  pull_request:
    branches: [main]

jobs:
  security:
    name: 🔒 Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run npm audit
        run: npm audit --audit-level=high
        continue-on-error: true

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'

      - name: Run CodeQL Analysis
        uses: github/codeql-action/init@v3
        with:
          languages: javascript, typescript

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
```

## 🔄 Workflow 5: Dependency Updates (Dependabot)

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "rabuno"
    labels:
      - "dependencies"
      - "automated"

  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "monthly"
```

## 📋 Environment & Secrets cần setup trong GitHub

**Settings → Secrets and variables → Actions:**

| Secret | Mô tả |
|--------|--------|
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `SLACK_WEBHOOK` | Slack incoming webhook URL |
| `SENTRY_AUTH_TOKEN` | Sentry auth token |
| `SENTRY_ORG` | Sentry organization slug |
| `SENTRY_PROJECT` | Sentry project slug |

**Settings → Environments:**

| Environment | Protection Rules |
|-------------|-----------------|
| `staging` | No approval required |
| `production` | Required reviewers: 1, Wait timer: 5 min |

## 📋 CODEOWNERS

```
# .github/CODEOWNERS
*           @rabuno
/app/       @rabuno
/backend/   @rabuno
```

## 📊 Branching Strategy

```
main (production)  ←── release/v1.0.0 ←── develop ←── feature/new-page
     │                                        │
     │                                        │
     ▼                                        ▼
  tag v1.0.0                            PR + Code Review
  auto-deploy                           auto-deploy staging
```

## 📈 So sánh: Hiện tại vs Enterprise

| Tiêu chí | Hiện tại | Enterprise |
|----------|----------|------------|
| CI/CD | ❌ Manual deploy | ✅ GitHub Actions auto |
| Testing | ✅ Vitest unit | ✅ Unit + E2E + Coverage |
| Lint/Type | ❌ Manual | ✅ Auto trên mỗi PR |
| Staging | ❌ Không có | ✅ Auto deploy staging |
| Production | ✅ Manual | ✅ Auto với approval gate |
| Security | ❌ Không | ✅ Trivy + CodeQL + npm audit |
| Monitoring | ❌ Không | ✅ Sentry + health check |
| Notifications | ❌ Không | ✅ Slack |
| Dependencies | ❌ Manual | ✅ Dependabot auto |
| Code Review | ❌ Không | ✅ CODEOWNERS + PR required |
| Rollback | ❌ Manual git revert | ✅ Vercel instant rollback |
