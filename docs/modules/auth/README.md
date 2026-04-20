# Módulo 1 — Autenticação & Perfil (`auth`)

## Visão Geral
Sistema de cadastro, login, gerenciamento de sessão e perfil de usuário. Base para todos os outros módulos.

---

## 1.1 Cadastro

### Métodos de cadastro
- **E-mail + senha** (formulário)
- **Google OAuth** (1 clique)
- **Apple Sign-in** (futuro)

### Campos do cadastro por e-mail

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `firstName` | string | ✅ | min 2, max 50 caracteres |
| `lastName` | string | ✅ | min 2, max 50 caracteres |
| `email` | string | ✅ | formato e-mail válido, único |
| `password` | string | ✅ | min 8 chars, 1 maiúscula, 1 número, 1 especial |
| `confirmPassword` | string | ✅ | deve ser igual a `password` |
| `phone` | string | ❌ | formato internacional (+1...) |
| `acceptTerms` | boolean | ✅ | deve ser `true` |

### Regras de negócio
- E-mail deve ser único (409 se duplicado)
- Senha hasheada com bcrypt (salt rounds ≥ 12)
- Enviar e-mail de verificação após cadastro
- Conta inativa até verificar e-mail
- Google OAuth cria conta automaticamente se não existir

---

## 1.2 Login

### Campos

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `email` | string | ✅ |
| `password` | string | ✅ |

### Regras de negócio
- Retorna `accessToken` (JWT, 15min) + `refreshToken` (cookie httpOnly, 7 dias)
- Rate limiting: máximo 5 tentativas por e-mail em 15min
- Bloqueio temporário (30min) após 5 falhas
- Logar tentativas de login com falha (IP, timestamp)
- Conta não verificada → erro 403 com mensagem para verificar e-mail

---

## 1.3 Recuperação de Senha

### Fluxo
1. Usuário informa e-mail
2. Sistema envia link com token (expira em 1h)
3. Usuário clica no link → tela de nova senha
4. Senha atualizada → todos os tokens anteriores invalidados

---

## 1.4 Perfil do Usuário

### Campos do perfil

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `firstName` | string | ✅ | Nome |
| `lastName` | string | ✅ | Sobrenome |
| `displayName` | string | ❌ | Nome exibido publicamente |
| `email` | string | ✅ | E-mail (não editável diretamente) |
| `phone` | string | ❌ | Telefone com código do país |
| `whatsapp` | string | ❌ | Número de WhatsApp |
| `avatar` | string (URL) | ❌ | Foto de perfil (upload S3) |
| `bio` | text | ❌ | Sobre mim (max 500 chars) |
| `nationality` | string | ❌ | Nacionalidade |
| `languages` | string[] | ❌ | Idiomas que fala |
| `currentCity` | string | ❌ | Cidade atual |
| `currentCountry` | string | ❌ | País atual |
| `memberSince` | timestamp | auto | Data de cadastro |
| `isVerified` | boolean | auto | Se passou verificação de ID |
| `role` | enum | auto | `tenant`, `host`, `admin` |
| `status` | enum | auto | `active`, `suspended`, `banned` |
| `preferredLanguage` | enum | ❌ | `pt`, `en`, `es` |

### Regras de negócio
- Usuário pode ser `tenant` (inquilino), `host` (anfitrião) ou ambos
- Ao criar primeiro anúncio, recebe role `host` automaticamente
- Avatar: upload de imagem (max 5MB, jpg/png/webp)
- Bio sanitizada contra XSS
- Perfil público mostra apenas: displayName, avatar, bio, languages, memberSince, isVerified, avaliações

---

## 1.5 Entidades do Banco

### Tabela `users`

```
id              UUID        PK DEFAULT gen_random_uuid()
first_name      VARCHAR(50) NOT NULL
last_name       VARCHAR(50) NOT NULL
display_name    VARCHAR(100)
email           VARCHAR(255) NOT NULL UNIQUE
password_hash   VARCHAR(255)
phone           VARCHAR(20)
whatsapp        VARCHAR(20)
avatar_url      VARCHAR(500)
bio             TEXT
nationality     VARCHAR(50)
languages       TEXT[]
current_city    VARCHAR(100)
current_country VARCHAR(100)
preferred_lang  VARCHAR(2) DEFAULT 'pt'
role            VARCHAR(20) DEFAULT 'tenant'
status          VARCHAR(20) DEFAULT 'active'
is_verified     BOOLEAN DEFAULT FALSE
email_verified  BOOLEAN DEFAULT FALSE
provider        VARCHAR(20) DEFAULT 'email'
provider_id     VARCHAR(255)
last_login_at   TIMESTAMP
created_at      TIMESTAMP NOT NULL DEFAULT NOW()
updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
deleted_at      TIMESTAMP
```

### Tabela `refresh_tokens`

```
id              UUID        PK DEFAULT gen_random_uuid()
user_id         UUID        FK -> users.id NOT NULL
token_hash      VARCHAR(255) NOT NULL
expires_at      TIMESTAMP NOT NULL
is_revoked      BOOLEAN DEFAULT FALSE
created_at      TIMESTAMP NOT NULL DEFAULT NOW()
```

### Tabela `password_resets`

```
id              UUID        PK DEFAULT gen_random_uuid()
user_id         UUID        FK -> users.id NOT NULL
token_hash      VARCHAR(255) NOT NULL
expires_at      TIMESTAMP NOT NULL
used_at         TIMESTAMP
created_at      TIMESTAMP NOT NULL DEFAULT NOW()
```

### Tabela `login_attempts`

```
id              UUID        PK DEFAULT gen_random_uuid()
email           VARCHAR(255) NOT NULL
ip_address      VARCHAR(45) NOT NULL
success         BOOLEAN NOT NULL
user_agent      TEXT
created_at      TIMESTAMP NOT NULL DEFAULT NOW()
```

---

## 1.6 Endpoints

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/v1/auth/register` | Cadastro por e-mail | ❌ |
| POST | `/api/v1/auth/login` | Login | ❌ |
| POST | `/api/v1/auth/logout` | Logout (revogar refresh) | ✅ |
| POST | `/api/v1/auth/refresh` | Renovar access token | ❌ (cookie) |
| POST | `/api/v1/auth/forgot-password` | Solicitar reset | ❌ |
| POST | `/api/v1/auth/reset-password` | Resetar senha | ❌ (token) |
| GET | `/api/v1/auth/verify-email/:token` | Verificar e-mail | ❌ |
| GET | `/api/v1/auth/google` | Iniciar OAuth Google | ❌ |
| GET | `/api/v1/auth/google/callback` | Callback Google | ❌ |
| GET | `/api/v1/users/me` | Meu perfil | ✅ |
| PATCH | `/api/v1/users/me` | Atualizar perfil | ✅ |
| POST | `/api/v1/users/me/avatar` | Upload foto perfil | ✅ |
| DELETE | `/api/v1/users/me/avatar` | Remover foto perfil | ✅ |
| PATCH | `/api/v1/users/me/password` | Alterar senha | ✅ |
| GET | `/api/v1/users/:id/public` | Perfil público | ❌ |

---

## 1.7 Páginas Frontend

| Rota | Página | Auth |
|------|--------|------|
| `/register` | Cadastro | ❌ |
| `/login` | Login | ❌ |
| `/forgot-password` | Esqueci a senha | ❌ |
| `/reset-password` | Nova senha | ❌ |
| `/verify-email` | Verificação de e-mail | ❌ |
| `/profile` | Meu perfil (edição) | ✅ |
| `/user/:id` | Perfil público | ❌ |
