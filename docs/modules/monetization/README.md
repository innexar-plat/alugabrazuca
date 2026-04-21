# Módulo 11 — Monetização (`monetization`)

## Visão Geral

Sistema de monetização com 3 fontes de receita: assinatura do anfitrião, anúncio em destaque e pay-per-lead (futuro).

---

## 11.1 Planos de Assinatura do Anfitrião

### Plano Free (Gratuito)

| Feature           | Limite          |
| ----------------- | --------------- |
| Anúncios ativos   | 1               |
| Fotos por anúncio | 5               |
| Solicitações/mês  | 10              |
| Suporte           | Comunidade      |
| Badge             | Nenhum          |
| Estatísticas      | Básicas (views) |

### Plano Pro ($19/mês ou $190/ano)

| Feature           | Limite                                 |
| ----------------- | -------------------------------------- |
| Anúncios ativos   | Ilimitados                             |
| Fotos por anúncio | 20                                     |
| Solicitações/mês  | Ilimitadas                             |
| Suporte           | Prioritário (e-mail)                   |
| Badge             | ⭐ Anfitrião Pro                       |
| Estatísticas      | Completas (views, conversões, ranking) |
| Destaque          | 1 anúncio featured/mês incluso         |
| Posição na busca  | Prioridade sobre Free                  |

### Plano Business ($49/mês ou $490/ano)

| Feature           | Limite                           |
| ----------------- | -------------------------------- |
| Anúncios ativos   | Ilimitados                       |
| Fotos por anúncio | 30                               |
| Solicitações/mês  | Ilimitadas                       |
| Suporte           | Prioritário (chat + e-mail)      |
| Badge             | 🏆 Anfitrião Business            |
| Estatísticas      | Avançadas + relatórios           |
| Destaque          | 3 anúncios featured/mês inclusos |
| Posição na busca  | Máxima prioridade                |
| Multi-propriedade | Dashboard consolidado            |

---

## 11.2 Anúncio em Destaque (Boost)

### Opções de destaque

| Pacote    | Duração | Preço | Benefício                            |
| --------- | ------- | ----- | ------------------------------------ |
| Semanal   | 7 dias  | $9    | Topo da busca por cidade             |
| Quinzenal | 14 dias | $15   | Topo da busca + badge destaque       |
| Mensal    | 30 dias | $29   | Topo da busca + badge + landing page |

### Regras

- Destaque posiciona anúncio no topo dos resultados da cidade
- Badge "Destaque" visível no card
- Anúncio aparece na seção "Em Destaque" da landing
- Máximo de anúncios destacados por cidade: 10 (para manter exclusividade)
- Renovação automática opcional

---

## 11.3 Pay-per-Lead (Pós-MVP)

| Evento                            | Custo |
| --------------------------------- | ----- |
| Solicitação de contato recebida   | $2    |
| Solicitação de visita recebida    | $3    |
| Contato aceito (lead qualificado) | $5    |

### Regras

- Anfitrião define budget máximo mensal
- Pausa automática quando budget é atingido
- Reembolso se lead for fraudulento (análise admin)

---

## 11.4 Integração Stripe

### Assinaturas

- Stripe Checkout para nova assinatura
- Stripe Customer Portal para gerenciar
- Webhooks: `customer.subscription.created`, `updated`, `deleted`, `invoice.paid`, `invoice.payment_failed`
- Período de teste: 7 dias grátis no Pro

### Pagamentos avulsos (destaque)

- Stripe Checkout (modo payment)
- Webhook: `checkout.session.completed`

### Regras de segurança

- Webhooks verificados com assinatura Stripe
- Idempotency key em toda transação
- Retry automático em falha de webhook
- Logs de todas as transações

---

## 11.5 Entidades do Banco

### Tabela `subscriptions`

```
id                    UUID        PK
user_id               UUID        FK -> users.id NOT NULL
plan                  VARCHAR(20) NOT NULL  -- 'free', 'pro', 'business'
status                VARCHAR(20) NOT NULL  -- 'active', 'past_due', 'cancelled', 'trialing'
stripe_customer_id    VARCHAR(100)
stripe_subscription_id VARCHAR(100)
stripe_price_id       VARCHAR(100)
current_period_start  TIMESTAMP
current_period_end    TIMESTAMP
cancel_at_period_end  BOOLEAN DEFAULT FALSE
trial_end             TIMESTAMP
created_at            TIMESTAMP NOT NULL DEFAULT NOW()
updated_at            TIMESTAMP NOT NULL DEFAULT NOW()
```

### Tabela `boosts`

```
id              UUID        PK
listing_id      UUID        FK -> listings.id NOT NULL
user_id         UUID        FK -> users.id NOT NULL
package         VARCHAR(20) NOT NULL  -- 'weekly', 'biweekly', 'monthly'
status          VARCHAR(20) DEFAULT 'active'
starts_at       TIMESTAMP NOT NULL
ends_at         TIMESTAMP NOT NULL
amount          DECIMAL(10,2) NOT NULL
currency        VARCHAR(3) DEFAULT 'USD'
stripe_payment_id VARCHAR(100)
auto_renew      BOOLEAN DEFAULT FALSE
created_at      TIMESTAMP NOT NULL DEFAULT NOW()
```

### Tabela `transactions`

```
id                  UUID        PK
user_id             UUID        FK -> users.id NOT NULL
type                VARCHAR(20) NOT NULL  -- 'subscription', 'boost', 'lead'
amount              DECIMAL(10,2) NOT NULL
currency            VARCHAR(3) DEFAULT 'USD'
status              VARCHAR(20) NOT NULL  -- 'pending', 'completed', 'failed', 'refunded'
stripe_payment_id   VARCHAR(100)
stripe_invoice_id   VARCHAR(100)
description         VARCHAR(255)
metadata            JSONB
created_at          TIMESTAMP NOT NULL DEFAULT NOW()
```

---

## 11.6 Endpoints

| Método | Rota                             | Descrição           | Auth                    |
| ------ | -------------------------------- | ------------------- | ----------------------- |
| GET    | `/api/v1/subscriptions/plans`    | Listar planos       | ❌                      |
| GET    | `/api/v1/subscriptions/my`       | Minha assinatura    | ✅                      |
| POST   | `/api/v1/subscriptions/checkout` | Criar sessão Stripe | ✅                      |
| POST   | `/api/v1/subscriptions/portal`   | Abrir portal Stripe | ✅                      |
| POST   | `/api/v1/boosts`                 | Comprar destaque    | ✅ host                 |
| GET    | `/api/v1/boosts/my`              | Meus destaques      | ✅ host                 |
| GET    | `/api/v1/transactions`           | Meu histórico       | ✅                      |
| POST   | `/api/v1/webhooks/stripe`        | Webhook Stripe      | ❌ (verificação Stripe) |

---

## 11.7 Páginas Frontend

| Rota                | Página                     | Auth    |
| ------------------- | -------------------------- | ------- |
| `/pricing`          | Página de planos (pública) | ❌      |
| `/subscription`     | Gerenciar assinatura       | ✅      |
| `/boost/:listingId` | Comprar destaque           | ✅ host |
| `/billing`          | Histórico de pagamentos    | ✅      |
