# BrasilQuartos

> Plataforma de aluguel de quartos nos EUA e Europa para brasileiros.

**Nome configurável** via `APP_NAME` no `.env` (padrão: BrasilQuartos).

---

## Stack

| Camada     | Tecnologia                                 |
| ---------- | ------------------------------------------ |
| Monorepo   | Turborepo                                  |
| Frontend   | Next.js 16 + React 19 + TypeScript 5.9     |
| UI         | Tailwind CSS v4 + shadcn/ui                |
| i18n       | next-intl (PT, EN, ES)                     |
| Backend    | NestJS (Modular Monolith)                  |
| ORM/DB     | Prisma + PostgreSQL 16                     |
| Cache/Jobs | Redis 7 + BullMQ                           |
| Auth       | Auth.js + Passport.js + JWT + Google OAuth |
| Storage    | MinIO (dev) / S3 (prod)                    |
| Pagamentos | Stripe                                     |
| E-mail     | Resend + React Email                       |
| Testes     | Vitest + Supertest + Playwright            |
| Deploy     | Docker Compose + Nginx + Let's Encrypt     |
| CI/CD      | GitHub Actions                             |

---

## Estrutura

```
├── apps/
│   ├── web/            → Next.js 16 (App Router)
│   └── api/            → NestJS
├── packages/
│   └── shared-types/   → Tipos TypeScript compartilhados
├── docs/               → Documentação completa (módulos, fundação, handoffs)
├── .github/            → Instruções IA, agents, skills, rules, workflows
├── docker-compose.yml  → Infra local (Postgres, Redis, MinIO)
└── .env.example        → Template de configuração
```

---

## Pré-requisitos

- Node.js 22+
- pnpm 9+
- Docker & Docker Compose

---

## Setup Local

```bash
# 1. Clonar e instalar
git clone <repo-url>
cd brasilquartos
pnpm install

# 2. Configurar ambiente
cp .env.example .env
# Editar .env com suas credenciais

# 3. Subir infraestrutura (Postgres, Redis, MinIO)
docker compose up -d

# 4. Rodar migrations
pnpm --filter api prisma migrate dev

# 5. Iniciar desenvolvimento
pnpm dev
```

| Serviço       | URL                   |
| ------------- | --------------------- |
| Frontend      | http://localhost:3000 |
| Backend API   | http://localhost:3001 |
| MinIO Console | http://localhost:9001 |
| PostgreSQL    | localhost:5432        |
| Redis         | localhost:6379        |

---

## Módulos (ordem oficial)

| #   | Módulo            | Status |
| --- | ----------------- | ------ |
| 1   | Auth & Perfil     | ⬜     |
| 2   | Anúncio de Quarto | ⬜     |
| 3   | Busca Pública     | ⬜     |
| 4   | Landing & SEO     | ⬜     |
| 5   | Solicitações      | ⬜     |
| 6   | Mensagens         | ⬜     |
| 7   | Avaliações        | ⬜     |
| 8   | Favoritos         | ⬜     |
| 9   | Painel Admin      | ⬜     |
| 10  | Verificação       | ⬜     |
| 11  | Monetização       | ⬜     |
| 12  | Notificações      | ⬜     |

---

## Qualidade

- Cobertura mínima de testes: **95%**
- Lint + type-check obrigatórios no CI
- Code review obrigatório antes de merge
- Conventional Commits (feat, fix, chore, etc.)

---

## Documentação

- `docs/01-foundation/` — Método, checklist, design system, estrutura frontend
- `docs/modules/` — Spec de cada módulo (tabelas, endpoints, regras)
- `docs/handoffs/` — Entregas de cada módulo
- `docs/BLUEPRINT.md` — Visão executiva
- `.github/instructions/` — Padrões técnicos para IA/devs

---

## Licença

Projeto privado. Todos os direitos reservados.
