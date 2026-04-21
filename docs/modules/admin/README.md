# Módulo 9 — Painel Admin (`admin`)

## Visão Geral

Dashboard administrativo para moderação de anúncios, gestão de usuários, métricas e denúncias.

---

## 9.1 Dashboard Principal

### Métricas em tempo real

- Total de usuários (ativos, suspensos, banidos)
- Total de anúncios (por status)
- Novos cadastros (hoje/semana/mês)
- Novos anúncios (hoje/semana/mês)
- Solicitações pendentes
- Denúncias abertas
- Receita (assinaturas + destaques)

### Gráficos

- Cadastros ao longo do tempo
- Anúncios por cidade/país
- Conversões (visita → solicitação → aceite)
- Receita mensal

---

## 9.2 Moderação de Anúncios

### Fila de revisão

- Lista de anúncios com status `pending_review`
- Ordenados por data de submissão (FIFO)
- Preview do anúncio completo

### Ações do moderador

| Ação             | Resultado                                   |
| ---------------- | ------------------------------------------- |
| Aprovar          | Status → `active`, anúncio visível na busca |
| Rejeitar         | Status → `rejected`, motivo obrigatório     |
| Solicitar edição | Notifica anfitrião para corrigir            |

### Critérios de rejeição

- Fotos inadequadas ou de baixa qualidade
- Informações falsas ou enganosas
- Conteúdo discriminatório
- Anúncio duplicado
- Preço irreal
- Endereço inválido

---

## 9.3 Gestão de Usuários

### Lista de usuários

- Busca por nome, e-mail, cidade
- Filtros: role, status, verificado, data de cadastro

### Ações

| Ação                  | Descrição                              |
| --------------------- | -------------------------------------- |
| Ver perfil completo   | Dados + anúncios + reviews + atividade |
| Verificar manualmente | Marcar como verificado                 |
| Suspender             | Suspensão temporária (1-30 dias)       |
| Banir                 | Banimento permanente (com motivo)      |
| Reativar              | Remover suspensão/banimento            |
| Resetar senha         | Forçar reset de senha                  |

---

## 9.4 Denúncias

### Tipos de denúncia

- Anúncio falso/enganoso
- Usuário suspeito/golpista
- Mensagem abusiva/assédio
- Review falsa
- Conteúdo discriminatório

### Fluxo de denúncia

```
denúncia criada → em análise → resolvida (ação tomada / descartada)
```

### Campos da denúncia

| Campo        | Tipo     | Obrigatório                                 |
| ------------ | -------- | ------------------------------------------- |
| `type`       | enum     | ✅                                          |
| `targetType` | enum     | ✅ (`listing`, `user`, `message`, `review`) |
| `targetId`   | UUID     | ✅                                          |
| `reason`     | text     | ✅                                          |
| `evidence`   | string[] | ❌ (URLs de screenshots)                    |

---

## 9.5 Financeiro (quando monetização ativa)

- Lista de transações (assinaturas, destaques, leads)
- Receita por período
- Assinaturas ativas/canceladas
- Reembolsos

---

## 9.6 Entidades do Banco

### Tabela `reports`

```
id              UUID        PK
reporter_id     UUID        FK -> users.id NOT NULL
target_type     VARCHAR(20) NOT NULL
target_id       UUID NOT NULL
type            VARCHAR(30) NOT NULL
reason          TEXT NOT NULL
evidence        TEXT[]
status          VARCHAR(20) DEFAULT 'open'
resolution      TEXT
resolved_by     UUID        FK -> users.id
resolved_at     TIMESTAMP
created_at      TIMESTAMP NOT NULL DEFAULT NOW()
updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
```

### Tabela `admin_actions`

```
id              UUID        PK
admin_id        UUID        FK -> users.id NOT NULL
action_type     VARCHAR(30) NOT NULL
target_type     VARCHAR(20) NOT NULL
target_id       UUID NOT NULL
details         JSONB
created_at      TIMESTAMP NOT NULL DEFAULT NOW()
```

---

## 9.7 Endpoints

| Método | Rota                                 | Descrição          | Auth     |
| ------ | ------------------------------------ | ------------------ | -------- |
| GET    | `/api/v1/admin/dashboard`            | Métricas dashboard | ✅ admin |
| GET    | `/api/v1/admin/listings/pending`     | Fila de moderação  | ✅ admin |
| POST   | `/api/v1/admin/listings/:id/approve` | Aprovar anúncio    | ✅ admin |
| POST   | `/api/v1/admin/listings/:id/reject`  | Rejeitar anúncio   | ✅ admin |
| GET    | `/api/v1/admin/users`                | Lista de usuários  | ✅ admin |
| GET    | `/api/v1/admin/users/:id`            | Detalhe do usuário | ✅ admin |
| POST   | `/api/v1/admin/users/:id/suspend`    | Suspender          | ✅ admin |
| POST   | `/api/v1/admin/users/:id/ban`        | Banir              | ✅ admin |
| POST   | `/api/v1/admin/users/:id/reactivate` | Reativar           | ✅ admin |
| GET    | `/api/v1/admin/reports`              | Lista de denúncias | ✅ admin |
| PATCH  | `/api/v1/admin/reports/:id`          | Resolver denúncia  | ✅ admin |
| POST   | `/api/v1/reports`                    | Criar denúncia     | ✅ user  |

---

## 9.8 Páginas Frontend

| Rota               | Página                | Auth     |
| ------------------ | --------------------- | -------- |
| `/admin`           | Dashboard             | ✅ admin |
| `/admin/listings`  | Moderação de anúncios | ✅ admin |
| `/admin/users`     | Gestão de usuários    | ✅ admin |
| `/admin/users/:id` | Detalhe do usuário    | ✅ admin |
| `/admin/reports`   | Denúncias             | ✅ admin |
| `/admin/finance`   | Financeiro            | ✅ admin |
