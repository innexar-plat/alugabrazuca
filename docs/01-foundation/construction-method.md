# BrasilQuartos — Método de Construção

## Visão Geral

Plataforma de aluguel de quartos nos EUA e Europa voltada para brasileiros.  
Conecta anfitriões (quem tem quarto) com inquilinos (quem busca quarto) em comunidades brasileiras no exterior.

## Ordem Oficial de Módulos

| # | Módulo | Slug | Prioridade |
|---|--------|------|-----------|
| 1 | Autenticação & Perfil | `auth` | 🔴 Crítico |
| 2 | Anúncio de Quarto | `listing` | 🔴 Crítico |
| 3 | Busca Pública | `search` | 🔴 Crítico |
| 4 | Landing Page & SEO | `landing` | 🔴 Crítico |
| 5 | Solicitações de Contato | `inquiries` | 🟡 Alto |
| 6 | Mensagens | `messages` | 🟡 Alto |
| 7 | Avaliações & Reviews | `reviews` | 🟡 Alto |
| 8 | Favoritos | `favorites` | 🟡 Alto |
| 9 | Painel Admin | `admin` | 🟡 Alto |
| 10 | Verificação de Identidade | `verification` | 🟢 Médio |
| 11 | Monetização (Assinatura + Destaque) | `monetization` | 🟢 Médio |
| 12 | Notificações | `notifications` | 🟢 Médio |
| 13 | Blog & Conteúdo | `blog` | 🔵 Pós-MVP |
| 14 | Chat Real-time | `chat` | 🔵 Pós-MVP |
| 15 | Pay-per-lead | `pay-per-lead` | 🔵 Pós-MVP |

## Regras de Avanço

1. Um módulo só inicia quando o anterior tem handoff completo
2. Cada módulo deve entregar: documentação, API, banco, testes, handoff
3. Migrations são criadas e aplicadas no mesmo avanço
4. Nunca pular módulo — seguir a ordem oficial acima
5. Se a ordem divergir do chat, prevalece este documento

## Stack

| Camada | Tecnologia |
|--------|-----------|
| **Monorepo** | Turborepo |
| **Frontend** | Next.js 16 (App Router) + React 19 + TypeScript 5.9 |
| **UI/Styling** | Tailwind CSS v4 + shadcn/ui |
| **State** | TanStack Query (server) + Zustand (client) |
| **i18n** | next-intl (PT padrão, EN, ES) |
| **Backend** | NestJS + TypeScript (Monolito Modular) |
| **ORM** | Prisma ORM + PostgreSQL 16 |
| **Cache/Jobs** | Redis + BullMQ |
| **Auth** | Auth.js (NextAuth v5) + Passport.js + JWT + Google OAuth |
| **Storage** | MinIO (self-hosted S3-compatible) ou AWS S3 |
| **Pagamentos** | Stripe |
| **E-mail** | Resend + React Email |
| **SMS** | Twilio |
| **Mapas** | Mapbox GL JS |
| **Testes** | Vitest + Supertest + Playwright |
| **Deploy** | Servidor próprio (VPS) + Docker + Nginx + Let's Encrypt |
| **CI/CD** | GitHub Actions → deploy automático no servidor |

## Infraestrutura do Servidor Próprio

```
┌─────────────────────────────────────────────┐
│              VPS / Servidor                  │
│                                              │
│  ┌─────────┐  ┌──────────┐  ┌────────────┐ │
│  │  Nginx  │→ │ Next.js  │  │  NestJS    │ │
│  │ (proxy) │→ │ :3000    │  │  :3001     │ │
│  └─────────┘  └──────────┘  └────────────┘ │
│       ↑                                      │
│   SSL/TLS     ┌──────────┐  ┌────────────┐ │
│  (Certbot)    │ Postgres │  │   Redis    │ │
│               │  :5432   │  │   :6379    │ │
│               └──────────┘  └────────────┘ │
│                                              │
│               ┌──────────┐                  │
│               │  MinIO   │  (storage S3)    │
│               │  :9000   │                  │
│               └──────────┘                  │
│                                              │
│  Tudo gerenciado via Docker Compose          │
└─────────────────────────────────────────────┘
```

### Docker Compose — Serviços

| Serviço | Imagem | Porta | Descrição |
|---------|--------|-------|-----------|
| `nginx` | nginx:alpine | 80, 443 | Reverse proxy + SSL |
| `web` | Node 22 (build) | 3000 | Frontend Next.js |
| `api` | Node 22 (build) | 3001 | Backend NestJS |
| `db` | postgres:16 | 5432 | Banco de dados |
| `redis` | redis:7-alpine | 6379 | Cache + filas |
| `minio` | minio/minio | 9000 | Storage S3-compatible |

### CI/CD — Fluxo

```
push → GitHub Actions → build → test → docker build → deploy via SSH
```

## Ambientes

| Ambiente | Propósito | Onde |
|----------|-----------|------|
| `development` | Desenvolvimento local | Docker Compose local |
| `staging` | Testes e validação | Servidor (branch develop) |
| `production` | Produção | Servidor (branch main) |

---

## Sequência de Criação — Fases

### FASE 0 — Fundação (antes de qualquer módulo)

| Step | Tarefa | Descrição |
|------|--------|-----------|
| 0.1 | Criar monorepo Turborepo | `apps/web`, `apps/api`, `packages/shared-types` |
| 0.2 | Configurar `apps/web` | Next.js 16 + Tailwind v4 + shadcn/ui + next-intl |
| 0.3 | Configurar `apps/api` | NestJS + Prisma + PostgreSQL + Redis |
| 0.4 | Configurar `packages/shared-types` | Tipos TypeScript compartilhados front/back |
| 0.5 | Docker Compose dev | Postgres + Redis + MinIO para desenvolvimento local |
| 0.6 | Qualidade de código | ESLint + Prettier + Husky (pre-commit) |
| 0.7 | i18n base | next-intl com routing `/pt`, `/en`, `/es` |
| 0.8 | Design System base | Tokens de cor, tipografia, componentes atoms |
| 0.9 | Layout base frontend | Header, Footer, Sidebar, ThemeProvider |
| 0.10 | Config global NestJS | CORS, Helmet, ValidationPipe, Logger, Exception filters |
| 0.11 | CI básico | GitHub Actions: lint + type-check + test + build |

### FASE 1 — Módulos (um por vez, nesta ordem)

Para **cada** módulo, a sequência interna é fixa:

```
1. 📄 Ler README do módulo (docs/modules/<modulo>/)
2. 🗄️ Criar/atualizar schema Prisma (entidades + relações)
3. 🔄 Gerar e aplicar migration
4. 📦 Backend: Entity → DTO → Repository → Service → Controller
5. 🧪 Backend: Testes unitários + integração (Vitest + Supertest)
6. 🌐 Frontend: Páginas + Componentes + Hooks + Services + API
7. 🧪 Frontend: Testes de componente (Vitest)
8. ✅ Validar checklist do módulo
9. 📋 Gerar handoff em docs/handoffs/
```

Ordem dos módulos: M1 Auth → M2 Listing → M3 Search → M4 Landing → M5 Inquiries → M6 Messages → M7 Reviews → M8 Favorites → M9 Admin → M10 Verification → M11 Monetization → M12 Notifications

### FASE 2 — Deploy & Produção

| Step | Tarefa | Descrição |
|------|--------|-----------|
| 2.1 | Dockerfile frontend | Next.js standalone build |
| 2.2 | Dockerfile backend | NestJS multi-stage build |
| 2.3 | Docker Compose produção | Todos os serviços + volumes + restart policies |
| 2.4 | Nginx config | Reverse proxy, gzip, cache headers, rate limit |
| 2.5 | SSL/TLS | Certbot + Let's Encrypt (HTTPS automático) |
| 2.6 | CI/CD completo | GitHub Actions: build → push → deploy via SSH |
| 2.7 | Backup | Cron para backup PostgreSQL + MinIO |
| 2.8 | Monitoramento | Healthcheck endpoints + uptime check |
