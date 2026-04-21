# M04 — Landing · Handoff

**Status:** ✅ Completo  
**Data:** 2026-04-20  
**Módulo anterior:** M03 Search  
**Próximo módulo:** M05 Inquiries

---

## 1. O que foi entregue

### Backend (NestJS)

| Arquivo                                                           | Descrição                                                         |
| ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| `apps/api/src/modules/landing/landing.module.ts`                  | Módulo Landing (controller + service)                             |
| `apps/api/src/modules/landing/landing.controller.ts`              | 4 GET + 1 POST endpoint público                                   |
| `apps/api/src/modules/landing/landing.service.ts`                 | Lógica de featured, cities, stats, testimonials e contact         |
| `apps/api/src/modules/landing/dto/contact.dto.ts`                 | DTO com validação class-validator (name, email, subject, message) |
| `apps/api/src/modules/landing/landing.service.spec.ts`            | 13 testes unitários                                               |
| `apps/api/src/modules/landing/landing.controller.spec.ts`         | 6 testes unitários                                                |
| `apps/api/prisma/schema.prisma`                                   | Model `ContactMessage` adicionado                                 |
| `apps/api/prisma/migrations/20260420151440_add_contact_messages/` | Tabela `contact_messages`                                         |

### Frontend (Next.js)

| Arquivo                                                    | Descrição                                          |
| ---------------------------------------------------------- | -------------------------------------------------- |
| `apps/web/src/app/[locale]/(public)/page.tsx`              | Landing page com todas as seções                   |
| `apps/web/src/components/landing/hero-section.tsx`         | Hero com busca e mosaico de imagens                |
| `apps/web/src/components/landing/how-it-works-section.tsx` | Seção "Como funciona" (3 passos)                   |
| `apps/web/src/components/landing/gallery-section.tsx`      | Galeria de imagens                                 |
| `apps/web/src/components/landing/featured-section.tsx`     | Listagens destacadas (API)                         |
| `apps/web/src/components/landing/cities-section.tsx`       | Cidades populares (API)                            |
| `apps/web/src/components/landing/stats-section.tsx`        | Estatísticas da plataforma (API)                   |
| `apps/web/src/components/landing/testimonials-section.tsx` | Depoimentos (placeholder)                          |
| `apps/web/src/components/landing/for-hosts-section.tsx`    | CTA para anfitriões                                |
| `apps/web/src/components/landing/contact-form.tsx`         | Formulário de contato funcional (client component) |
| `apps/web/src/app/[locale]/(public)/contact/page.tsx`      | Página de contato com form funcional               |
| `apps/web/src/app/[locale]/(public)/about/page.tsx`        | Página Sobre                                       |
| `apps/web/src/app/[locale]/(public)/terms/page.tsx`        | Termos de Uso                                      |
| `apps/web/src/app/[locale]/(public)/privacy/page.tsx`      | Política de Privacidade                            |
| `apps/web/src/app/[locale]/(public)/faq/page.tsx`          | Perguntas Frequentes                               |
| `apps/web/src/app/[locale]/(public)/host/page.tsx`         | Página para anfitriões                             |

### SEO

| Arquivo                       | Descrição                              |
| ----------------------------- | -------------------------------------- |
| `apps/web/src/app/robots.ts`  | robots.txt dinâmico                    |
| `apps/web/src/app/sitemap.ts` | sitemap.xml dinâmico                   |
| `apps/web/src/app/layout.tsx` | JSON-LD, OpenGraph, hreflang, favicons |

### i18n

| Arquivo                         | Chaves adicionadas                                                          |
| ------------------------------- | --------------------------------------------------------------------------- |
| `apps/web/src/messages/pt.json` | `home.*`, `contact.*`, `about.*`, `terms.*`, `privacy.*`, `faq.*`, `host.*` |
| `apps/web/src/messages/en.json` | Idem — tradução EN                                                          |
| `apps/web/src/messages/es.json` | Idem — tradução ES                                                          |

---

## 2. Endpoints

| Método | Rota                           | Auth    | Descrição                                                 |
| ------ | ------------------------------ | ------- | --------------------------------------------------------- |
| `GET`  | `/api/v1/landing/featured`     | Público | Listagens destacadas (até 8, preenche com recentes se <6) |
| `GET`  | `/api/v1/landing/cities`       | Público | Top 8 cidades com contagem                                |
| `GET`  | `/api/v1/landing/stats`        | Público | Estatísticas: anúncios, cidades, usuários, reviews        |
| `GET`  | `/api/v1/landing/testimonials` | Público | Depoimentos (placeholder até M07)                         |
| `POST` | `/api/v1/landing/contact`      | Público | Envio de mensagem de contato                              |

### POST /landing/contact — Body (JSON)

| Campo     | Tipo   | Obrigatório | Max Length | Descrição            |
| --------- | ------ | ----------- | ---------- | -------------------- |
| `name`    | string | ✅          | 100        | Nome do remetente    |
| `email`   | string | ✅          | 255        | E-mail válido        |
| `subject` | string | ✅          | 200        | Assunto              |
| `message` | string | ✅          | 5000       | Conteúdo da mensagem |

---

## 3. Entidades/Tabelas Criadas

| Tabela             | Descrição                                     |
| ------------------ | --------------------------------------------- |
| `contact_messages` | Mensagens recebidas via formulário de contato |

### Campos de `contact_messages`

| Coluna       | Tipo         | Descrição            |
| ------------ | ------------ | -------------------- |
| `id`         | UUID         | PK gerado pelo banco |
| `name`       | VARCHAR(100) | Nome do remetente    |
| `email`      | VARCHAR(255) | E-mail do remetente  |
| `subject`    | VARCHAR(200) | Assunto              |
| `message`    | TEXT         | Conteúdo da mensagem |
| `created_at` | TIMESTAMP    | Data de criação      |

---

## 4. Regras de Negócio Ativas

1. Featured listings priorizam `isFeatured=true` com `featuredUntil >= now`; se < 6, completa com recentes por viewCount.
2. Cities agrupam por (country, state, city) e limitam a 8 resultados ordenados por contagem desc.
3. Stats usam `$transaction` para consistência de contagem.
4. Testimonials são placeholder hardcoded até M07 (Reviews).
5. Contact form grava na tabela `contact_messages`; envio de e-mail será adicionado em M12 (Notifications).
6. Validação de DTO com class-validator: campos obrigatórios, e-mail válido, limites de comprimento.

---

## 5. Migrations Aplicadas

- `20260420151440_add_contact_messages`

---

## 6. O que ficou pendente

- **Envio de e-mail** ao receber mensagem de contato (aguarda M12 Notifications).
- **Depoimentos reais** (aguarda M07 Reviews).
- **Cache Redis** para endpoints de landing (melhoria futura).
- **Painel admin** para visualizar mensagens de contato (aguarda M-Admin).

---

## 7. O que o próximo módulo pode assumir como pronto

- Landing page completa com todas as seções funcionais.
- 5 endpoints públicos de landing operacionais (`/featured`, `/cities`, `/stats`, `/testimonials`, `/contact`).
- Tabela `contact_messages` criada e populável.
- Páginas estáticas (about, terms, privacy, faq, host, contact) prontas e traduzidas.
- SEO configurado (robots, sitemap, JSON-LD, OpenGraph, hreflang).
- Header e footer com logo, navegação e links funcionais.
- Formulário de contato funcional (frontend → API → DB).
- 19 testes unitários passando no módulo landing.

---

## 8. Decisões técnicas tomadas

- Formulário de contato extraído para client component (`ContactForm`) para gerenciar estado.
- Contact endpoint retorna HTTP 200 (não 201) para simplificar — não é uma resource REST clássica.
- Testimonials hardcoded no service em vez de seed no banco (será substituído por M07).
- `maxLength` aplicado tanto no DTO (backend) quanto nos inputs HTML (frontend) para defesa em profundidade.
