# Módulo 6 — Mensagens (`messages`)

## Visão Geral
Sistema de mensagens assíncronas entre inquilino e anfitrião. Vinculado a uma solicitação aceita ou a um anúncio.

---

## 6.1 Conversas

### Regras
- Conversa é criada automaticamente quando uma solicitação é aceita
- Cada conversa está vinculada a 1 anúncio + 2 participantes (host + tenant)
- Mensagens são assíncronas (polling ou SSE, sem WebSocket no MVP)
- Histórico persistido no banco
- Possibilidade de enviar fotos/arquivos (futuro)

### Campos da mensagem

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `conversationId` | UUID | ✅ | Conversa |
| `senderId` | UUID | auto | Quem enviou |
| `content` | text | ✅ | Texto da mensagem (max 2000 chars) |
| `type` | enum | auto | `text`, `system`, `image` |
| `readAt` | timestamp | auto | Quando foi lida |

---

## 6.2 Status da Conversa

| Status | Descrição |
|--------|-----------|
| `active` | Conversa aberta |
| `archived` | Arquivada por um dos participantes |
| `blocked` | Um participante bloqueou o outro |

---

## 6.3 Regras de Negócio

- Mensagem só pode ser enviada entre participantes da conversa
- Sistema cria mensagem automática ao aceitar solicitação
- Usuário pode bloquear outro (impede novas mensagens)
- Usuário pode reportar conversa (moderação admin)
- Sanitizar conteúdo contra XSS
- Indicador de "não lidas" no menu/badge
- Paginação de mensagens (mais antigas primeiro)

---

## 6.4 Entidades do Banco

### Tabela `conversations`

```
id              UUID        PK
listing_id      UUID        FK -> listings.id NOT NULL
inquiry_id      UUID        FK -> inquiries.id
host_id         UUID        FK -> users.id NOT NULL
tenant_id       UUID        FK -> users.id NOT NULL
status          VARCHAR(20) DEFAULT 'active'
last_message_at TIMESTAMP
created_at      TIMESTAMP NOT NULL DEFAULT NOW()
updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
```

### Tabela `messages`

```
id              UUID        PK
conversation_id UUID        FK -> conversations.id NOT NULL
sender_id       UUID        FK -> users.id NOT NULL
content         TEXT NOT NULL
type            VARCHAR(20) DEFAULT 'text'
read_at         TIMESTAMP
created_at      TIMESTAMP NOT NULL DEFAULT NOW()
```

### Tabela `blocked_users`

```
id              UUID        PK
blocker_id      UUID        FK -> users.id NOT NULL
blocked_id      UUID        FK -> users.id NOT NULL
reason          VARCHAR(255)
created_at      TIMESTAMP NOT NULL DEFAULT NOW()
```

---

## 6.5 Endpoints

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/v1/conversations` | Listar minhas conversas | ✅ |
| GET | `/api/v1/conversations/:id` | Detalhe + mensagens | ✅ participante |
| POST | `/api/v1/conversations/:id/messages` | Enviar mensagem | ✅ participante |
| PATCH | `/api/v1/conversations/:id/read` | Marcar como lidas | ✅ participante |
| POST | `/api/v1/conversations/:id/archive` | Arquivar | ✅ participante |
| POST | `/api/v1/conversations/:id/block` | Bloquear usuário | ✅ participante |
| POST | `/api/v1/conversations/:id/report` | Reportar conversa | ✅ participante |
| GET | `/api/v1/conversations/unread-count` | Total não lidas | ✅ |

---

## 6.6 Páginas Frontend

| Rota | Página | Auth |
|------|--------|------|
| `/messages` | Lista de conversas | ✅ |
| `/messages/:id` | Conversa aberta | ✅ |
