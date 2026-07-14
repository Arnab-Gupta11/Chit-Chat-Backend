# ChitChat Backend

Industry-grade, production-ready backend — Vercel deployable. Latest packages, latest patterns.

## 🏗️ Tech Stack

| Category | Technology | Version |
|---|---|---|
| Runtime | Node.js | 20+ |
| Language | TypeScript | 5.x (strict) |
| Framework | Express.js | 5.x |
| ORM | Prisma | 7.x |
| Database | NeonDB (Serverless PostgreSQL) | latest |
| Validation | Zod | 4.x |
| Logging | Pino | 9.x |
| Testing | Jest + Supertest | 29.x |
| Linting | ESLint + Prettier | 9.x |
| Git Hooks | Husky + lint-staged + commitlint | latest |
| CI/CD | GitHub Actions | — |
| Deploy | Vercel (serverless) | — |

## ⚠️ Breaking Changes from Previous Versions

### Prisma 7
- `url` ও `directUrl` এখন `schema.prisma` তে নেই → **`prisma.config.ts`** এ আছে
- Import path বদলেছে: `@prisma/client` → **`@/generated/prisma`**
- `@neondatabase/serverless` আলাদা install লাগবে না → `@prisma/adapter-neon` এ bundled

### Zod 4
- `z.string().email()` → **`z.email()`**
- `z.string().url()` → **`z.url()`**
- `error.errors` → **`error.issues`**

### Express 5
- Async route handlers এ errors **automatically** error middleware এ যায়

---

## 📁 Project Structure

```
.
├── prisma.config.ts          # Prisma 7 — CLI config (migration URL)
├── prisma/
│   ├── schema.prisma         # DB schema (url নেই, prisma.config.ts এ আছে)
│   └── seed.ts
└── src/
    ├── generated/prisma/     # pnpm db:generate এ তৈরি হয় (.gitignore এ আছে)
    ├── config/
    │   └── env.ts            # Zod 4 validated env
    ├── lib/
    │   ├── prisma.ts         # PrismaClient (NeonDB adapter, runtime)
    │   └── logger.ts         # Pino logger
    ├── middlewares/
    │   ├── errorHandler.ts   # Global error handler
    │   └── validate.ts       # Zod 4 request validation
    ├── modules/
    │   ├── health/
    │   └── user/
    │       ├── user.routes.ts
    │       ├── user.controller.ts
    │       ├── user.service.ts
    │       ├── user.repository.ts
    │       ├── user.schema.ts
    │       └── __tests__/
    └── utils/
        ├── asyncHandler.ts
        ├── errors.ts
        └── response.ts
```

---

## 🚀 Quick Start

### 1. Install
```bash
make setup
```

### 2. Environment
```bash
cp .env.example .env
# .env এ DATABASE_URL ও DIRECT_URL দাও (NeonDB dashboard থেকে)
```

### 3. Migrate & Seed
```bash
make db-migrate    # migration name: "init"
make db-seed
```

### 4. Run
```bash
make dev
# http://localhost:8080/api/v1
```

---

## 📡 API Endpoints

```
GET  /api/v1/health         # Server health
GET  /api/v1/health/db      # DB health

GET    /api/v1/users        # List (page, limit, search)
GET    /api/v1/users/:id    # Get by ID
POST   /api/v1/users        # Create
PATCH  /api/v1/users/:id    # Update
DELETE /api/v1/users/:id    # Delete
```

## 🗂️ Response Format

```json
{ "success": true, "message": "Users fetched", "data": [...], "meta": { "total": 10, "page": 1, "limit": 10, "totalPages": 1 } }
{ "success": false, "message": "User not found" }
```

---

## 🧪 Testing
```bash
make test
make test-coverage
```

## 🗄️ Database
```bash
make db-generate      # Prisma client generate (src/generated/prisma)
make db-migrate       # Migration চালাও (dev)
make db-migrate-prod  # Migration চালাও (production)
make db-studio        # Prisma Studio UI
make db-seed          # Sample data
make db-reset         # Reset (সব data যাবে!)
```

## 🚢 Deploy to Vercel

1. GitHub এ push করো
2. Vercel dashboard এ import করো
3. Environment variables দাও:
   - `DATABASE_URL` (pooled)
   - `DIRECT_URL` (direct)
   - `NODE_ENV=production`
4. Deploy!

```bash
# Production migration
make db-migrate-prod
```

---

## ✍️ Commit Convention

```
feat: add jwt authentication
fix: resolve user email validation
docs: update readme
refactor: simplify user service
test: add user controller tests
chore: update dependencies
```

---

## 🔧 All Commands
```bash
make help
```

---

## নতুন Module যোগ করার Pattern

```
src/modules/post/
├── post.routes.ts
├── post.controller.ts
├── post.service.ts
├── post.repository.ts
├── post.schema.ts
└── __tests__/post.service.test.ts
```

`src/app.ts` এ register করো:
```ts
app.use(`${apiPrefix}/posts`, postRouter);
```
