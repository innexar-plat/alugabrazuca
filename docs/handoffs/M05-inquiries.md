# Handoff — M05: Inquiries (Solicitações de Contato)

**Data de entrega:** 2026-04-20  
**Módulo:** M5 — Inquiries  
**Status:** ✅ Completo

---

## 1. O que foi entregue

Módulo completo de solicitações de contato entre inquilinos e anfitriões, incluindo:

- Banco de dados (migration + model Prisma)
- Backend NestJS completo (8 endpoints REST)
- Frontend: 3 páginas + 1 componente de formulário
- Tradução trilingue (pt, en, es)
- 24 testes unitários (100% passando)

---

## 2. Banco de Dados

### Tabela criada: `inquiries`

| Coluna           | Tipo                  | Detalhe                |
| ---------------- | --------------------- | ---------------------- |
| id               | UUID PK               | gen_random_uuid()      |
| listing_id       | UUID FK → listings.id | CASCADE                |
| tenant_id        | UUID FK → users.id    | CASCADE                |
| host_id          | UUID FK → users.id    | CASCADE                |
| type             | InquiryType ENUM      | visit \| info \| apply |
| status           | InquiryStatus ENUM    | pending (default)      |
| message          | TEXT                  | min 20 chars           |
| move_in_date     | DATE                  | opcional               |
| stay_duration    | INT                   | opcional               |
| occupants        | INT                   | default 1              |
| has_pets         | BOOLEAN               | default false          |
| pet_details      | VARCHAR(255)          | opcional               |
| occupation       | VARCHAR(100)          | opcional               |
| about_me         | TEXT                  | opcional               |
| host_reply       | TEXT                  | opcional               |
| rejection_reason | TEXT                  | opcional               |
| accepted_at      | TIMESTAMP             | nullable               |
| rejected_at      | TIMESTAMP             | nullable               |
| expired_at       | TIMESTAMP             | nullable               |
| cancelled_at     | TIMESTAMP             | nullable               |
| created_at       | TIMESTAMP             | default now()          |
| updated_at       | TIMESTAMP             | auto-update            |

### Enums adicionados

- `InquiryType`: `visit`, `info`, `apply`
- `InquiryStatus`: `pending`, `accepted`, `rejected`, `expired`, `cancelled`, `completed`

### Constraints

- `UNIQUE(listing_id, tenant_id)` — 1 solicitação por anúncio por inquilino
- Índices em: `listing_id`, `tenant_id`, `host_id`, `status`, `created_at`

### Relações adicionadas ao schema existente

- `User.sentInquiries` → `@relation("InquiryTenant")`
- `User.hostInquiries` → `@relation("InquiryHost")`
- `Listing.inquiries` → `Inquiry[]`

### Migration

`apps/api/prisma/migrations/20260420212734_add_inquiries/migration.sql`

---

## 3. Endpoints da API

Base: `/api/v1/inquiries` | Auth: JWT obrigatório em todos

| Método | Rota                    | Actor          | Descrição                   |
| ------ | ----------------------- | -------------- | --------------------------- |
| POST   | `/inquiries`            | tenant         | Criar solicitação           |
| GET    | `/inquiries/sent`       | tenant         | Listar enviadas (paginado)  |
| GET    | `/inquiries/received`   | host           | Listar recebidas (paginado) |
| GET    | `/inquiries/:id`        | tenant ou host | Detalhe da solicitação      |
| POST   | `/inquiries/:id/accept` | host           | Aceitar solicitação         |
| POST   | `/inquiries/:id/reject` | host           | Recusar solicitação         |
| POST   | `/inquiries/:id/reply`  | host           | Adicionar/editar resposta   |
| POST   | `/inquiries/:id/cancel` | tenant         | Cancelar solicitação        |

### Regras de negócio ativas

1. Máx 1 solicitação por anúncio por inquilino (`UNIQUE` constraint + check no service)
2. Máx 10 solicitações pendentes simultâneas por inquilino
3. Anfitrião não pode solicitar seu próprio anúncio
4. Somente anúncios com `status = active` aceitam solicitações
5. Após aceitação: `streetAddress`, `zipCode` e contatos revelados no detalhe
6. `expiredAt` definido para 7 dias após criação (expiração automática não implementada — job pendente para M9 Admin)
7. `inquiryCount` em `Listing` incrementado ao criar solicitação
8. Apenas `pending` pode ser aceita, recusada ou cancelada
9. Reply permitida em qualquer status exceto `rejected` e `cancelled`

---

## 4. Arquivos backend criados

```
apps/api/src/modules/inquiry/
├── dto/
│   ├── create-inquiry.dto.ts
│   ├── reject-inquiry.dto.ts
│   └── reply-inquiry.dto.ts
├── inquiry.controller.ts
├── inquiry.module.ts
├── inquiry.service.ts
└── inquiry.service.spec.ts     ← 24 testes, 100% passando
```

**Registrado em:** `apps/api/src/app.module.ts`

---

## 5. Páginas frontend criadas

| Rota                       | Arquivo                               | Descrição                                                         |
| -------------------------- | ------------------------------------- | ----------------------------------------------------------------- |
| `/[locale]/my-inquiries`   | `(dashboard)/my-inquiries/page.tsx`   | Lista de solicitações enviadas (inquilino)                        |
| `/[locale]/host/inquiries` | `(dashboard)/host/inquiries/page.tsx` | Lista de solicitações recebidas (anfitrião) com filtro por status |
| `/[locale]/inquiries/[id]` | `(dashboard)/inquiries/[id]/page.tsx` | Detalhe com ações (aceitar, recusar, responder, cancelar)         |

**Componente criado:**

```
apps/web/src/components/inquiry/
└── inquiry-form.tsx   ← Modal de formulário de solicitação (abre na página do anúncio)
```

**Modificado:**

- `apps/web/src/app/[locale]/(public)/listings/[id]/page.tsx` — botão "Contact" agora abre `InquiryForm` modal

---

## 6. i18n

Chave `inquiry.*` adicionada em:

- `apps/web/src/messages/pt.json`
- `apps/web/src/messages/en.json`
- `apps/web/src/messages/es.json`

Subchaves: `title`, `sentTitle`, `receivedTitle`, `detailTitle`, `empty*`, `sendInquiry`, `type.*`, `status.*`, `form.*`, `sentAt`, `hostReply`, `*Success`, etc.

---

## 7. Testes

```
apps/api/src/modules/inquiry/inquiry.service.spec.ts
24 testes — 100% passando
```

Cobertura dos cenários:

- `create`: listagem não encontrada, inativa, host own listing, já existe, max pending, sucesso
- `findSent`, `findReceived`: paginação
- `findOne`: acesso tenant, acesso host, endereços escondidos, não encontrado, forbidden
- `accept`: sucesso, forbidden, não pending
- `reject`: sucesso, forbidden
- `reply`: sucesso, erro em status fechado
- `cancel`: sucesso, forbidden, não pending, não encontrado

---

## 8. Pendências / Próximo módulo pode assumir como pronto

### Disponível para M6 (Messages):

- Modelo `Inquiry` com todos os campos, enums e relações
- Endpoints funcionais para criar, listar, aceitar, recusar, responder e cancelar
- Lógica de revelação de contatos após aceitação
- Counter `inquiryCount` em `Listing` atualizado automaticamente

### Itens fora do escopo do M5 (deixados para módulos específicos):

- **Notificações** por e-mail ou push ao criar/aceitar/recusar — M12 Notifications
- **Job de expiração automática** (marcar `pending` como `expired` após 7 dias) — M9 Admin
- **Atualização do `inquiryCount`** ao cancelar/rejeitar — refinamento futuro
- **Upload de documentos** pelo inquilino — M10 Verification

---

## 9. O próximo módulo (M6 — Messages) pode assumir:

- Tabela `inquiries` com todos os campos
- Relações User ↔ Inquiry (tenant e host)
- Relação Listing ↔ Inquiry
- Endpoints `/inquiries/*` todos funcionais
- `status` flow: `pending → accepted | rejected | expired | cancelled | completed`
- Contato do anfitrião disponível ao inquilino aceito via `GET /inquiries/:id`
