# BrasilQuartos — Resumo do Blueprint MVP

## Sobre
Plataforma de aluguel de quartos nos EUA e Europa para brasileiros.
Conecta anfitriões (quem tem quarto) com inquilinos (quem busca quarto).

---

## Módulos Planejados — Resumo Executivo

### 1. Auth (Autenticação & Perfil)
- Cadastro por e-mail + Google OAuth
- Login com JWT (access + refresh token)
- Perfil completo com foto, bio, idiomas, cidade
- Recuperação de senha por e-mail
- 4 tabelas: `users`, `refresh_tokens`, `password_resets`, `login_attempts`
- 15 endpoints

### 2. Listing (Anúncio de Quarto) ⭐ Módulo mais complexo
- Wizard de criação em 9 passos
- 80+ campos detalhando: tipo do quarto, cama (single/double/queen/king), móveis, banheiro (suíte/privativo/compartilhado), cozinha (acesso/horário/eletrodomésticos), lavanderia (frequência/custo), estacionamento, preço, depósito, contas incluídas, regras da casa (pets/fumo/casal/crianças/visitas), preferências de inquilino, fotos (3-20), vídeo tour
- Lifecycle: draft → pending_review → active → paused/rented/expired
- 2 tabelas: `listings`, `listing_photos`
- 12 endpoints

### 3. Search (Busca Pública)
- 30+ filtros (localização, preço, tipo, banheiro, cozinha, regras)
- 5 opções de ordenação
- Mapa interativo com pins (Mapbox)
- Cards de resultado com foto, preço, cidade, badges
- SEO: URLs amigáveis, structured data, sitemap
- 5 endpoints

### 4. Landing Page & SEO
- Hero + busca rápida + como funciona
- Quartos em destaque + cidades populares
- Números da plataforma + depoimentos
- Páginas estáticas (sobre, termos, FAQ)
- i18n (PT/EN/ES) com detecção automática
- 4 endpoints

### 5. Inquiries (Solicitações de Contato)
- 3 tipos: visita, informação, candidatura
- Formulário com mensagem, data, ocupantes, pets, apresentação
- Anfitrião aceita/recusa/responde
- Aceitação libera endereço + contato
- 1 tabela: `inquiries`
- 8 endpoints

### 6. Messages (Mensagens)
- Conversas assíncronas vinculadas a solicitações aceitas
- Indicador de não lidas
- Bloquear/reportar usuário
- 3 tabelas: `conversations`, `messages`, `blocked_users`
- 8 endpoints

### 7. Reviews (Avaliações)
- Bidirecional: inquilino ↔ anfitrião
- 5-7 critérios por tipo com nota 1-5
- Sistema de "reveal simultâneo"
- 1 tabela: `reviews`
- 5 endpoints

### 8. Favorites (Favoritos)
- Toggle favoritar/desfavoritar
- Lista de favoritos com paginação
- 1 tabela: `favorites`
- 4 endpoints

### 9. Admin (Painel Administrativo)
- Dashboard com métricas
- Moderação de anúncios (fila de revisão)
- Gestão de usuários (suspender/banir)
- Central de denúncias
- 2 tabelas: `reports`, `admin_actions`
- 11 endpoints

### 10. Verification (Verificação de ID)
- 3 níveis: e-mail → telefone → documento
- Upload de documento com selfie
- Revisão manual (MVP) ou OCR (futuro)
- 2 tabelas: `verifications`, `phone_verifications`
- 7 endpoints

### 11. Monetization (Monetização)
- 3 planos: Free, Pro ($19/mês), Business ($49/mês)
- Anúncio em destaque: $9-29
- Integração Stripe (assinaturas + pagamentos)
- 3 tabelas: `subscriptions`, `boosts`, `transactions`
- 7 endpoints

### 12. Notifications (Notificações)
- E-mail + in-app (push futuro)
- 20+ tipos de notificação
- Preferências configuráveis
- Templates por idioma
- 2 tabelas: `notifications`, `notification_preferences`
- 6 endpoints

### 13. Infra (Infraestrutura)
- Storage: AWS S3 + CloudFront
- Cache: Redis
- E-mail: Resend/SES
- Jobs: BullMQ
- Logging: Winston
- Rate limiting, headers de segurança, healthcheck
- Estrutura de pastas monorepo

---

## Totais

| Métrica | Quantidade |
|---------|-----------|
| Módulos | 13 |
| Tabelas no banco | ~20 |
| Endpoints da API | ~92 |
| Campos do anúncio | ~80 |
| Filtros de busca | ~30 |
| Templates de e-mail | ~12 |
| Páginas frontend | ~25 |

---

## Próximo Passo

Confirme o blueprint e eu inicio a implementação pelo **Módulo 1 — Auth**.
