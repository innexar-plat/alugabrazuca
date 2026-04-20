# Módulo 5 — Solicitações de Contato (`inquiries`)

## Visão Geral
Permite ao inquilino enviar solicitação de contato/visita para um anúncio. O anfitrião pode aceitar, recusar ou responder.

---

## 5.1 Solicitação do Inquilino

### Campos da solicitação

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `listingId` | UUID | ✅ | Anúncio de interesse |
| `type` | enum | ✅ | `visit`, `info`, `apply` |
| `message` | text | ✅ | Mensagem ao anfitrião (min 20, max 1000 chars) |
| `moveInDate` | date | ❌ | Data pretendida de mudança |
| `stayDuration` | integer | ❌ | Duração pretendida (meses) |
| `occupants` | integer | ❌ | Quantas pessoas |
| `hasPets` | boolean | ❌ | Tem pets? |
| `petDetails` | string | ❌ | Tipo e tamanho do pet |
| `occupation` | string | ❌ | Profissão/ocupação |
| `aboutMe` | text | ❌ | Breve apresentação (max 500 chars) |

**Tipos de solicitação:**
- `visit` — Solicitar visita ao quarto
- `info` — Pedir mais informações
- `apply` — Candidatar-se ao quarto

---

## 5.2 Resposta do Anfitrião

| Ação | Descrição |
|------|-----------|
| `accept` | Aceitar solicitação → libera endereço + contato direto |
| `reject` | Recusar com motivo opcional |
| `reply` | Responder com mensagem (sem aceitar/recusar ainda) |

### Ao aceitar
- Endereço completo do quarto é liberado para o inquilino
- Dados de contato (WhatsApp/phone) são trocados
- Notificação enviada ao inquilino
- Status muda para `accepted`

### Ao recusar
- Motivo opcional enviado ao inquilino
- Status muda para `rejected`
- Inquilino pode enviar nova solicitação para outro quarto

---

## 5.3 Status da Solicitação

```
pending → accepted → completed (quarto alugado)
       → rejected
       → expired (sem resposta em 7 dias)
       → cancelled (inquilino cancelou)
```

---

## 5.4 Regras de Negócio

- Inquilino não pode enviar mais de 1 solicitação por anúncio
- Inquilino pode ter no máximo 10 solicitações pendentes simultâneas
- Anfitrião tem 7 dias para responder (após isso → expired)
- Solicitação para anúncio pausado/expirado → erro 400
- Inquilino deve ter e-mail verificado para enviar solicitação
- Anfitrião recebe notificação por e-mail + push a cada nova solicitação
- Contador de solicitações atualizado no anúncio

---

## 5.5 Entidades do Banco

### Tabela `inquiries`

```
id              UUID        PK
listing_id      UUID        FK -> listings.id NOT NULL
tenant_id       UUID        FK -> users.id NOT NULL
host_id         UUID        FK -> users.id NOT NULL
type            VARCHAR(20) NOT NULL
status          VARCHAR(20) DEFAULT 'pending'
message         TEXT NOT NULL
move_in_date    DATE
stay_duration   INTEGER
occupants       INTEGER DEFAULT 1
has_pets        BOOLEAN DEFAULT FALSE
pet_details     VARCHAR(255)
occupation      VARCHAR(100)
about_me        TEXT
host_reply      TEXT
rejection_reason TEXT
accepted_at     TIMESTAMP
rejected_at     TIMESTAMP
expired_at      TIMESTAMP
cancelled_at    TIMESTAMP
created_at      TIMESTAMP NOT NULL DEFAULT NOW()
updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
```

---

## 5.6 Endpoints

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/v1/inquiries` | Criar solicitação | ✅ tenant |
| GET | `/api/v1/inquiries/sent` | Minhas solicitações enviadas | ✅ tenant |
| GET | `/api/v1/inquiries/received` | Solicitações recebidas | ✅ host |
| GET | `/api/v1/inquiries/:id` | Detalhe da solicitação | ✅ owner |
| POST | `/api/v1/inquiries/:id/accept` | Aceitar | ✅ host |
| POST | `/api/v1/inquiries/:id/reject` | Recusar | ✅ host |
| POST | `/api/v1/inquiries/:id/reply` | Responder | ✅ host |
| POST | `/api/v1/inquiries/:id/cancel` | Cancelar | ✅ tenant |

---

## 5.7 Páginas Frontend

| Rota | Página | Auth |
|------|--------|------|
| `/my-inquiries` | Solicitações enviadas (inquilino) | ✅ |
| `/host/inquiries` | Solicitações recebidas (anfitrião) | ✅ |
| `/inquiries/:id` | Detalhe da solicitação | ✅ |
