# Módulo 12 — Notificações (`notifications`)

## Visão Geral
Sistema de notificações por e-mail e in-app (push futuro) para manter usuários engajados e informados.

---

## 12.1 Tipos de Notificação

### Para o Anfitrião

| Evento | E-mail | In-app | Push |
|--------|--------|--------|------|
| Nova solicitação recebida | ✅ | ✅ | ✅ |
| Solicitação cancelada pelo inquilino | ❌ | ✅ | ❌ |
| Nova avaliação recebida | ✅ | ✅ | ✅ |
| Anúncio aprovado | ✅ | ✅ | ❌ |
| Anúncio rejeitado | ✅ | ✅ | ❌ |
| Anúncio prestes a expirar (7 dias) | ✅ | ✅ | ❌ |
| Assinatura renovada | ✅ | ✅ | ❌ |
| Assinatura falhando | ✅ | ✅ | ✅ |
| Destaque expirado | ✅ | ✅ | ❌ |
| Nova mensagem | ❌ | ✅ | ✅ |
| Denúncia sobre seu anúncio | ✅ | ✅ | ❌ |

### Para o Inquilino

| Evento | E-mail | In-app | Push |
|--------|--------|--------|------|
| Solicitação aceita | ✅ | ✅ | ✅ |
| Solicitação recusada | ✅ | ✅ | ❌ |
| Anfitrião respondeu | ✅ | ✅ | ✅ |
| Solicitação expirou | ❌ | ✅ | ❌ |
| Nova avaliação recebida | ✅ | ✅ | ✅ |
| Favorito baixou de preço | ✅ | ✅ | ✅ |
| Favorito prestes a expirar | ❌ | ✅ | ❌ |
| Nova mensagem | ❌ | ✅ | ✅ |
| Convite para avaliar | ✅ | ✅ | ❌ |

### Para o Admin

| Evento | E-mail | In-app |
|--------|--------|--------|
| Novo anúncio para revisão | ✅ | ✅ |
| Nova denúncia | ✅ | ✅ |
| Nova verificação pendente | ✅ | ✅ |
| Pagamento falhou | ✅ | ✅ |

---

## 12.2 Preferências do Usuário

| Preferência | Opções |
|-------------|--------|
| E-mail de marketing | on/off |
| E-mail transacional | sempre on (não pode desligar) |
| Notificações in-app | on/off por tipo |
| Push notifications | on/off (futuro) |
| Horário de silêncio | ex: 22:00-08:00 |
| Idioma dos e-mails | PT, EN, ES |

---

## 12.3 Templates de E-mail

- Layout responsivo (MJML ou React Email)
- Branding consistente (logo, cores, fontes)
- Botão de ação principal (CTA)
- Link de unsubscribe obrigatório
- Footer com endereço legal
- Provider: **Resend** ou **AWS SES**
- Templates por idioma (PT, EN, ES)

---

## 12.4 Entidades do Banco

### Tabela `notifications`

```
id              UUID        PK
user_id         UUID        FK -> users.id NOT NULL
type            VARCHAR(50) NOT NULL
title           VARCHAR(200) NOT NULL
body            TEXT NOT NULL
data            JSONB       -- dados contextuais (listingId, inquiryId, etc.)
channel         VARCHAR(20) NOT NULL  -- 'in_app', 'email', 'push'
read_at         TIMESTAMP
sent_at         TIMESTAMP
created_at      TIMESTAMP NOT NULL DEFAULT NOW()
```

### Tabela `notification_preferences`

```
id                  UUID        PK
user_id             UUID        FK -> users.id NOT NULL UNIQUE
email_marketing     BOOLEAN DEFAULT TRUE
email_inquiries     BOOLEAN DEFAULT TRUE
email_reviews       BOOLEAN DEFAULT TRUE
email_listing       BOOLEAN DEFAULT TRUE
push_enabled        BOOLEAN DEFAULT TRUE
push_messages       BOOLEAN DEFAULT TRUE
push_inquiries      BOOLEAN DEFAULT TRUE
quiet_hours_start   TIME
quiet_hours_end     TIME
created_at          TIMESTAMP NOT NULL DEFAULT NOW()
updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
```

---

## 12.5 Endpoints

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/v1/notifications` | Listar notificações | ✅ |
| PATCH | `/api/v1/notifications/:id/read` | Marcar como lida | ✅ |
| PATCH | `/api/v1/notifications/read-all` | Marcar todas como lidas | ✅ |
| GET | `/api/v1/notifications/unread-count` | Total não lidas | ✅ |
| GET | `/api/v1/notifications/preferences` | Minhas preferências | ✅ |
| PATCH | `/api/v1/notifications/preferences` | Atualizar preferências | ✅ |

---

## 12.6 Páginas Frontend

| Rota | Página | Auth |
|------|--------|------|
| `/notifications` | Central de notificações | ✅ |
| `/settings/notifications` | Preferências | ✅ |
| Componente (sino) | Badge de não lidas no header | ✅ |
