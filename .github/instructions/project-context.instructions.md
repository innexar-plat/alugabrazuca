---
applyTo: "**"
description: "Use ALWAYS: project identity, architecture overview, module order, mandatory reading sequence, naming conventions, and environment configuration for the BrasilQuartos platform."
---

# Contexto do Projeto — BrasilQuartos

## 1. Identidade

| Campo               | Valor                                                              |
| ------------------- | ------------------------------------------------------------------ |
| **Nome do projeto** | Definido em `APP_NAME` no `.env` (padrão: `BrasilQuartos`)         |
| **Descrição**       | Plataforma de aluguel de quartos nos EUA e Europa para brasileiros |
| **Público**         | Brasileiros morando ou se mudando para o exterior                  |
| **Idiomas**         | PT (padrão), EN, ES — trilíngue, detecção automática do navegador  |
| **Deploy**          | Servidor próprio (VPS) + Docker Compose + Nginx + Let's Encrypt    |

> O nome da plataforma ainda pode mudar. **Nunca hardcode o nome** — usar sempre `process.env.APP_NAME` no backend e a variável de ambiente no frontend. Toda referência ao nome no código deve vir do `.env`.

---

## 2. Leitura Obrigatória (nesta ordem)

Antes de qualquer implementação de módulo, a IA DEVE ler:

1. `docs/01-foundation/construction-method.md` — ordem oficial, stack, fases
2. `docs/01-foundation/module-delivery-checklist.md` — critérios de completude
3. `docs/01-foundation/module-handoff-template.md` — template de entrega
4. `docs/01-foundation/design-system.md` — cores, tipografia, tokens
5. `docs/01-foundation/frontend-structure.md` — layouts, componentes, páginas
6. `docs/BLUEPRINT.md` — visão executiva dos módulos
7. `docs/modules/<modulo-atual>/README.md` — spec do módulo em trabalho
8. `docs/handoffs/<handoff-anterior>.md` — o que o módulo anterior entregou

---

## 3. Arquitetura

```
Monorepo (Turborepo)
├── apps/web          → Next.js 16 + React 19 + TypeScript 5.9
├── apps/api          → NestJS + Prisma + PostgreSQL 16
└── packages/shared-types → Tipos compartilhados
```

| Serviço    | Porta  | Tecnologia                |
| ---------- | ------ | ------------------------- |
| Frontend   | 3000   | Next.js 16 (App Router)   |
| Backend    | 3001   | NestJS (Modular Monolith) |
| PostgreSQL | 5432   | PostgreSQL 16             |
| Redis      | 6379   | Redis 7                   |
| MinIO      | 9000   | MinIO (storage S3)        |
| Nginx      | 80/443 | Reverse proxy + SSL       |

---

## 4. Ordem de Módulos (fonte de verdade)

```
M1 Auth → M2 Listing → M3 Search → M4 Landing → M5 Inquiries →
M6 Messages → M7 Reviews → M8 Favorites → M9 Admin →
M10 Verification → M11 Monetization → M12 Notifications
```

Nunca pular módulo. Nunca iniciar o próximo sem handoff completo do anterior.

---

## 5. Regras de Naming (código)

| Elemento    | Padrão                     | Exemplo                  |
| ----------- | -------------------------- | ------------------------ |
| Nome do app | Via `APP_NAME` env var     | `process.env.APP_NAME`   |
| Nome do DB  | Via `DATABASE_URL` env var | Nunca hardcoded          |
| Arquivos    | kebab-case                 | `user.service.ts`        |
| Classes     | PascalCase                 | `UserService`            |
| Funções     | camelCase                  | `createUser()`           |
| Variáveis   | camelCase                  | `userId`                 |
| Constantes  | UPPER_SNAKE                | `MAX_RETRY_COUNT`        |
| Tabelas SQL | snake_case plural          | `users`, `order_items`   |
| Colunas SQL | snake_case                 | `created_at`, `user_id`  |
| Env vars    | UPPER_SNAKE                | `APP_NAME`, `JWT_SECRET` |

---

## 6. Configuração do Ambiente

Todas as configurações estão em `.env` na raiz do projeto.  
O template com todos os campos está em `.env.example`.  
**Nunca commitar `.env` no git** — apenas `.env.example` com valores de exemplo.

Variáveis obrigatórias de identidade:

```
APP_NAME=BrasilQuartos
APP_URL=http://localhost:3000
API_URL=http://localhost:3001
APP_ENV=development
```

---

## 7. Docker

- **Desenvolvimento**: `docker compose up` sobe todos os serviços
- **Produção**: `docker compose -f docker-compose.prod.yml up -d`
- Banco, cache e storage rodam sempre em container
- Frontend e backend rodam em container em produção, local em dev (hot reload)

---

## 8. Padrões Que a IA Deve Seguir Sempre

1. **Nome do projeto vem do `.env`** — nunca hardcoded
2. **Cores vêm de `tokens.css`** — nunca hex inline
3. **Textos vêm do i18n** — nunca strings em português/inglês direto no componente
4. **Queries usam ORM (Prisma)** — nunca SQL raw com interpolação
5. **Segredos ficam no `.env`** — nunca no código fonte
6. **Cada módulo tem seu README** — ler antes de implementar
7. **Todo módulo entrega handoff** — sem handoff = não está pronto
8. **Testes são obrigatórios** — cobertura mínima 95%
9. **Documentação acompanha código** — Swagger atualizado
10. **Um módulo por vez** — ordem definida em `construction-method.md`
