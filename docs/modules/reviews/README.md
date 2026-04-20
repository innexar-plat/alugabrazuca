# Módulo 7 — Avaliações & Reviews (`reviews`)

## Visão Geral
Sistema de avaliações bidirecionais: inquilino avalia o quarto/anfitrião e anfitrião avalia o inquilino. Baseado em experiência real de moradia.

---

## 7.1 Quem pode avaliar

| Avaliador | Avalia | Quando |
|-----------|--------|--------|
| Inquilino → Quarto + Anfitrião | Listing + Host | Após 30 dias de moradia ou após sair |
| Anfitrião → Inquilino | Tenant | Após inquilino sair |

### Pré-requisitos
- Solicitação aceita (`inquiry.status = accepted`)
- Mínimo 30 dias desde a aceitação OU anúncio marcado como `rented`
- Cada parte pode avaliar apenas 1 vez por estadia

---

## 7.2 Avaliação do Inquilino → Quarto

### Notas (1 a 5 estrelas)

| Critério | Descrição |
|----------|-----------|
| `accuracyRating` | Anúncio corresponde à realidade? |
| `cleanlinessRating` | Limpeza do quarto e áreas comuns |
| `locationRating` | Localização e acessibilidade |
| `valueRating` | Custo-benefício |
| `communicationRating` | Comunicação com o anfitrião |
| `overallRating` | Nota geral (calculada: média das anteriores) |

### Campos adicionais

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `comment` | text | ✅ | Comentário (min 20, max 1000 chars) |
| `pros` | string[] | ❌ | Pontos positivos |
| `cons` | string[] | ❌ | Pontos negativos |
| `wouldRecommend` | boolean | ✅ | Recomendaria? |
| `stayDuration` | integer | ✅ | Quanto tempo morou (meses) |

---

## 7.3 Avaliação do Anfitrião → Inquilino

### Notas (1 a 5 estrelas)

| Critério | Descrição |
|----------|-----------|
| `cleanlinessRating` | Manteve o quarto limpo? |
| `respectRating` | Respeitou regras da casa? |
| `communicationRating` | Comunicação e convivência |
| `paymentRating` | Pagamento em dia? |
| `overallRating` | Nota geral (média) |

### Campos adicionais

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `comment` | text | ✅ |
| `wouldRentAgain` | boolean | ✅ |

---

## 7.4 Regras de Negócio

- Reviews são públicas após ambas as partes avaliarem (ou após 14 dias)
- Sistema de "reveal simultâneo" evita retaliação
- Reviews podem ser reportadas por conteúdo inadequado
- Admin pode remover reviews com conteúdo ofensivo
- Não é possível editar review após publicação
- Média de avaliações exibida no perfil e no anúncio
- Reviews sanitizadas contra XSS

---

## 7.5 Entidades do Banco

### Tabela `reviews`

```
id                    UUID        PK
listing_id            UUID        FK -> listings.id NOT NULL
inquiry_id            UUID        FK -> inquiries.id NOT NULL
reviewer_id           UUID        FK -> users.id NOT NULL
reviewee_id           UUID        FK -> users.id NOT NULL
type                  VARCHAR(20) NOT NULL  -- 'tenant_to_host', 'host_to_tenant'
accuracy_rating       SMALLINT    -- 1-5 (só tenant_to_host)
cleanliness_rating    SMALLINT NOT NULL  -- 1-5
location_rating       SMALLINT    -- 1-5 (só tenant_to_host)
value_rating          SMALLINT    -- 1-5 (só tenant_to_host)
communication_rating  SMALLINT NOT NULL  -- 1-5
respect_rating        SMALLINT    -- 1-5 (só host_to_tenant)
payment_rating        SMALLINT    -- 1-5 (só host_to_tenant)
overall_rating        DECIMAL(2,1) NOT NULL
comment               TEXT NOT NULL
pros                  TEXT[]
cons                  TEXT[]
would_recommend       BOOLEAN
would_rent_again      BOOLEAN
stay_duration         INTEGER
is_published          BOOLEAN DEFAULT FALSE
published_at          TIMESTAMP
reported              BOOLEAN DEFAULT FALSE
report_reason         TEXT
removed_by_admin      BOOLEAN DEFAULT FALSE
created_at            TIMESTAMP NOT NULL DEFAULT NOW()
updated_at            TIMESTAMP NOT NULL DEFAULT NOW()
```

---

## 7.6 Endpoints

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/v1/reviews` | Criar avaliação | ✅ |
| GET | `/api/v1/reviews/listing/:listingId` | Reviews do anúncio | ❌ |
| GET | `/api/v1/reviews/user/:userId` | Reviews do usuário | ❌ |
| GET | `/api/v1/reviews/pending` | Minhas avaliações pendentes | ✅ |
| POST | `/api/v1/reviews/:id/report` | Reportar review | ✅ |

---

## 7.7 Páginas Frontend

| Rota | Página | Auth |
|------|--------|------|
| `/reviews/new/:inquiryId` | Formulário de avaliação | ✅ |
| `/reviews/pending` | Avaliações pendentes | ✅ |
| Componente inline | Reviews na página do anúncio e perfil | ❌ |
