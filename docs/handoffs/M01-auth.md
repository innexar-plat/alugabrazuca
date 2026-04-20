# Handoff — M01 Auth & Perfil

**Data:** 2026-04-19
**Status:** ✅ Implementado (MVP)

---

## O que foi entregue

### Banco de Dados
- **4 tabelas** criadas via Prisma migration `m1_auth_tables`:
  - `users` — 22 campos (UUID pk, nome, email, passwordHash, phone, whatsapp, avatar, bio, nationality, languages[], currentCity, currentCountry, preferredLang, role enum, status enum, isVerified, emailVerified, provider, providerId, lastLoginAt, timestamps, softDelete)
  - `refresh_tokens` — rotação segura de tokens (tokenHash, expiresAt, isRevoked)
  - `password_resets` — reset de senha com token hash e expiração
  - `login_attempts` — registro de tentativas de login (email, ip, success, userAgent)
- **Enums:** `UserRole` (tenant/host/admin), `UserStatus` (active/suspended/banned), `AuthProvider` (email/google), `Locale` (pt/en/es)

### Backend (NestJS)
- **AuthModule** registrado no AppModule com PassportModule + JwtModule
- **AuthService** — lógica completa:
  - `register()` — bcrypt (12 rounds), email único, token de verificação JWT
  - `login()` — rate limiting (5 tentativas/15min), verificação de email, token JWT (15min) + refresh token (7d) em cookie httpOnly
  - `logout()` — revoga todos os refresh tokens do usuário
  - `refreshAccessToken()` — rotação: revoga antigo, gera novo
  - `verifyEmail()` — verifica token JWT tipo email_verification
  - `forgotPassword()` — gera token hash (SHA-256), expira em 1h, anti-enumeration
  - `resetPassword()` — valida token, atualiza senha, revoga tokens, transaction
  - `googleLogin()` — cria/vincula conta, emailVerified=true
  - `getProfile()` / `getPublicProfile()` / `updateProfile()` / `changePassword()`
- **AuthController** — 9 endpoints `/auth/*`:
  - POST register, login, logout, refresh, forgot-password, reset-password
  - GET verify-email/:token, google, google/callback
- **UsersController** — 4 endpoints `/users/*`:
  - GET me, PATCH me, PATCH me/password, GET :id/public
- **Strategies:** JwtStrategy (Bearer token), GoogleStrategy (OAuth2 com placeholder para dev)
- **Guards:** JwtAuthGuard, GoogleAuthGuard
- **DTOs:** RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto, UpdateProfileDto — todos com class-validator
- **Decorators:** @CurrentUser, @Match
- **cookie-parser** configurado no main.ts
- Sanitização XSS no campo `bio`

### Frontend (Next.js)
- **8 páginas** implementadas:
  - **6 páginas auth** (grupo `(auth)`):
    - `/login` — formulário com email/senha, links, tratamento de erros específicos
    - `/register` — formulário completo com todos os campos, aceite de termos
    - `/forgot-password` — formulário + estado de sucesso
    - `/reset-password` — formulário com token da query string
    - `/verify-email` — verificação automática via token na URL
    - `/auth/callback` — callback do Google OAuth, salva token no localStorage
  - **1 página dashboard** (grupo `(dashboard)`):
    - `/profile` — edição de perfil (nome, telefone, bio, cidade, idioma) + alteração de senha
  - **1 página pública** (grupo `(public)`):
    - `/user/:id` — perfil público de qualquer usuário (nome, avatar, bio, cidade, data de entrada, contagem de listings)
- **i18n** — strings completas em PT, EN, ES para auth + profile
- **API client** (`lib/api.ts`) — fetch wrapper com auth headers, cookies, error handling

### Infraestrutura
- Docker Compose rodando: PostgreSQL 16, Redis 7, MinIO (todos healthy)
- Migration aplicada no banco

---

## Endpoints disponíveis

| Método | Rota | Auth |
|--------|------|------|
| POST | `/api/v1/auth/register` | ❌ |
| POST | `/api/v1/auth/login` | ❌ |
| POST | `/api/v1/auth/logout` | ✅ |
| POST | `/api/v1/auth/refresh` | ❌ (cookie) |
| POST | `/api/v1/auth/forgot-password` | ❌ |
| POST | `/api/v1/auth/reset-password` | ❌ (token) |
| GET | `/api/v1/auth/verify-email/:token` | ❌ |
| GET | `/api/v1/auth/google` | ❌ |
| GET | `/api/v1/auth/google/callback` | ❌ |
| GET | `/api/v1/users/me` | ✅ |
| PATCH | `/api/v1/users/me` | ✅ |
| PATCH | `/api/v1/users/me/password` | ✅ |
| GET | `/api/v1/users/:id/public` | ❌ |

---

## Pendente (futuro)

- [ ] Envio real de e-mails (verificação + reset) — módulo M12 Notificações
- [ ] Upload de avatar (POST/DELETE `/users/me/avatar`) — requer integração MinIO/S3
- [x] Testes automatizados (unit + integration) do módulo auth — 50 testes (37 service + 9 controller + 4 users controller)
- [ ] Google OAuth com credenciais reais (requer GOOGLE_CLIENT_ID/SECRET)
- [ ] Apple Sign-in (futuro)

---

## Validações implementadas

- **Senha:** mín. 8 chars, 1 maiúscula, 1 número, 1 caractere especial (`@Matches` no RegisterDto)
- **Telefone:** formato internacional `+XXXXXXXXXXX` (`@Matches` no RegisterDto)
- **Email:** validação com `@IsEmail`
- **confirmPassword:** deve coincidir com password (decorator `@Match`)
- **Bio:** sanitização XSS (remove tags HTML)

---

## O que o próximo módulo (M2 Listing) pode assumir

- Tabela `users` existe com id UUID
- JWT auth funcional — usar `JwtAuthGuard` + `@CurrentUser('id')`
- Enums `UserRole`, `UserStatus` disponíveis no schema
- Usuário autenticado tem `id`, `email`, `role`, `status` no payload JWT
- API client frontend (`lib/api.ts`) envia Bearer token automaticamente
