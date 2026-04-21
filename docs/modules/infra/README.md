# Módulo 13 — Infraestrutura Transversal (`infra`)

## Visão Geral

Serviços compartilhados e infraestrutura que suportam todos os módulos da plataforma.

---

## 13.1 Upload de Arquivos (Storage)

### Provider: AWS S3 + CloudFront

| Config            | Valor                       |
| ----------------- | --------------------------- |
| Bucket            | `brasilquartos-media-{env}` |
| Região            | `us-east-1`                 |
| CDN               | CloudFront distribution     |
| Formatos imagem   | JPG, PNG, WebP              |
| Tamanho máximo    | 10MB por arquivo            |
| Total por anúncio | Máximo 20 fotos             |

### Processamento de imagens

- Thumbnail: 300x200px (cards de busca)
- Médio: 800x600px (galeria)
- Full: 1200x800px (lightbox)
- Compressão WebP automática
- Lazy loading no frontend
- Blurhash para placeholder

### Segurança

- URLs pré-assinadas para upload direto
- Validação de MIME type no backend
- Scan de malware (ClamAV ou AWS)
- Documentos de verificação encriptados (KMS)

---

## 13.2 Cache (Redis)

### Uso

| Dado                 | TTL      | Justificativa        |
| -------------------- | -------- | -------------------- |
| Sessões de busca     | 5min     | Paginação rápida     |
| Contadores (views)   | 1h       | Reduzir writes no DB |
| Cidades com anúncios | 1h       | Landing page         |
| Stats da plataforma  | 30min    | Dashboard            |
| Rate limiting        | variável | Segurança            |
| OTP/códigos          | 5min     | Verificação          |

---

## 13.3 E-mail

### Provider: Resend (ou AWS SES)

| Tipo         | Exemplos                                     |
| ------------ | -------------------------------------------- |
| Transacional | Verificação, reset senha, solicitação aceita |
| Notificação  | Nova solicitação, nova review                |
| Marketing    | Newsletter (com opt-in/unsubscribe)          |

### Templates (por idioma: PT/EN/ES)

- welcome
- verify-email
- reset-password
- new-inquiry
- inquiry-accepted
- inquiry-rejected
- new-review
- listing-approved
- listing-rejected
- subscription-renewed
- payment-failed

---

## 13.4 Jobs/Filas (Background Jobs)

### Provider: BullMQ (Redis-based)

| Job                      | Frequência       | Descrição                                  |
| ------------------------ | ---------------- | ------------------------------------------ |
| `expire-listings`        | Diário 00:00     | Expirar anúncios com availableTo passada   |
| `expire-inquiries`       | Diário 00:00     | Expirar solicitações sem resposta (7 dias) |
| `send-email`             | Real-time (fila) | Enviar e-mails via queue                   |
| `process-image`          | Real-time (fila) | Redimensionar/comprimir imagens            |
| `update-stats`           | A cada 30min     | Atualizar contadores da landing            |
| `cleanup-expired-tokens` | Diário           | Limpar tokens expirados                    |
| `boost-expiry-check`     | Diário           | Verificar destaques expirados              |
| `review-reminder`        | Diário           | Lembrar avaliações pendentes               |
| `subscription-warning`   | Diário           | Avisar assinaturas prestes a vencer        |

---

## 13.5 Logging e Monitoramento

### Logs estruturados (JSON)

| Campo       | Descrição                          |
| ----------- | ---------------------------------- |
| `timestamp` | ISO 8601                           |
| `level`     | info, warn, error                  |
| `service`   | Nome do módulo                     |
| `action`    | Ação executada                     |
| `userId`    | ID do usuário (quando autenticado) |
| `requestId` | UUID da requisição                 |
| `duration`  | Tempo de execução (ms)             |
| `error`     | Stack trace (quando error)         |

### Regras de segurança nos logs

- NUNCA logar: senhas, tokens JWT, dados de cartão, CPF, documentos
- SEMPRE logar: login attempts, mudanças de permissão, ações admin
- Alertas: múltiplos 401/403, rate limit atingido, erros 500

### Provider

- **Winston** para logging no NestJS
- **Datadog** ou **Grafana Cloud** para monitoramento (futuro)

---

## 13.6 Rate Limiting

| Rota                              | Limite     | Janela |
| --------------------------------- | ---------- | ------ |
| `/api/v1/auth/login`              | 5 req      | 15min  |
| `/api/v1/auth/register`           | 3 req      | 1h     |
| `/api/v1/auth/forgot-password`    | 3 req      | 1h     |
| `/api/v1/verification/phone/send` | 5 req      | 24h    |
| Rotas públicas (busca)            | 60 req     | 1min   |
| Rotas autenticadas                | 120 req    | 1min   |
| Upload de fotos                   | 30 req     | 1min   |
| Webhooks Stripe                   | sem limite | —      |

---

## 13.7 Segurança Global

### Headers HTTP

```
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
```

### CORS

```
Allowed Origins: [frontendUrl]
Methods: GET, POST, PATCH, DELETE
Credentials: true
```

### Outras medidas

- Helmet.js no NestJS
- CSRF protection (cookies)
- Input sanitization global
- Request ID em toda requisição
- Timeout de requisição: 30s
- Payload máximo: 10MB

---

## 13.8 Healthcheck

| Endpoint              | Verifica           |
| --------------------- | ------------------ |
| `GET /health`         | App running        |
| `GET /health/db`      | Conexão PostgreSQL |
| `GET /health/redis`   | Conexão Redis      |
| `GET /health/storage` | Conexão S3         |

---

## 13.9 Variáveis de Ambiente

```env
# App
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/brasilquartos

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=<secret>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=<secret>
REFRESH_TOKEN_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=<id>
GOOGLE_CLIENT_SECRET=<secret>
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

# AWS S3
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_REGION=us-east-1
AWS_S3_BUCKET=brasilquartos-media-dev
AWS_CLOUDFRONT_URL=https://media.brasilquartos.com

# Stripe
STRIPE_SECRET_KEY=<key>
STRIPE_WEBHOOK_SECRET=<secret>
STRIPE_PRO_PRICE_ID=<id>
STRIPE_BUSINESS_PRICE_ID=<id>

# E-mail
RESEND_API_KEY=<key>
EMAIL_FROM=noreply@brasilquartos.com

# Twilio (SMS)
TWILIO_ACCOUNT_SID=<sid>
TWILIO_AUTH_TOKEN=<token>
TWILIO_PHONE_NUMBER=<number>

# Maps
MAPBOX_ACCESS_TOKEN=<token>
```

---

## 13.10 Estrutura de Pastas do Projeto

```
/
├── apps/
│   ├── web/                     # Next.js frontend
│   │   ├── app/                 # App Router
│   │   │   ├── [locale]/        # i18n routing
│   │   │   │   ├── (public)/    # Rotas públicas
│   │   │   │   │   ├── page.tsx         # Landing
│   │   │   │   │   ├── rooms/           # Busca
│   │   │   │   │   ├── login/
│   │   │   │   │   ├── register/
│   │   │   │   │   └── ...
│   │   │   │   ├── (auth)/      # Rotas autenticadas
│   │   │   │   │   ├── profile/
│   │   │   │   │   ├── my-listings/
│   │   │   │   │   ├── messages/
│   │   │   │   │   ├── favorites/
│   │   │   │   │   └── ...
│   │   │   │   └── (admin)/     # Rotas admin
│   │   │   │       ├── admin/
│   │   │   │       └── ...
│   │   │   └── api/             # API routes Next.js (auth callbacks)
│   │   ├── components/
│   │   │   ├── ui/              # Componentes base (Button, Input, Card, Modal)
│   │   │   ├── layout/          # Header, Footer, Sidebar
│   │   │   ├── listing/         # Componentes de anúncio
│   │   │   ├── search/          # Filtros, Map, Results
│   │   │   ├── auth/            # Forms de login/registro
│   │   │   └── shared/          # Componentes compartilhados
│   │   ├── hooks/               # Custom hooks
│   │   ├── lib/                 # Utilitários, API client
│   │   ├── i18n/                # Traduções
│   │   │   ├── pt.json
│   │   │   ├── en.json
│   │   │   └── es.json
│   │   ├── styles/              # Global styles
│   │   └── types/               # TypeScript types
│   │
│   └── api/                     # NestJS backend
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   │   ├── controllers/
│       │   │   │   ├── services/
│       │   │   │   ├── repositories/
│       │   │   │   ├── entities/
│       │   │   │   ├── dtos/
│       │   │   │   └── guards/
│       │   │   ├── users/
│       │   │   ├── listings/
│       │   │   ├── search/
│       │   │   ├── inquiries/
│       │   │   ├── messages/
│       │   │   ├── reviews/
│       │   │   ├── favorites/
│       │   │   ├── admin/
│       │   │   ├── verification/
│       │   │   ├── monetization/
│       │   │   └── notifications/
│       │   ├── common/
│       │   │   ├── decorators/
│       │   │   ├── filters/
│       │   │   ├── guards/
│       │   │   ├── interceptors/
│       │   │   ├── pipes/
│       │   │   └── utils/
│       │   ├── config/
│       │   ├── database/
│       │   │   └── migrations/
│       │   └── jobs/
│       └── prisma/
│           └── schema.prisma
│
├── packages/                    # Monorepo shared packages
│   ├── shared-types/            # Types compartilhados front/back
│   └── ui/                      # Component library (futuro)
│
├── docs/
│   ├── 01-foundation/
│   ├── modules/
│   └── handoffs/
│
└── .github/
    ├── instructions/
    ├── agents/
    ├── skills/
    └── workflows/
```
