# BrasilQuartos — Estrutura do Frontend

## 1. Visão Geral da Arquitetura

```
apps/web/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Routing i18n (/pt, /en, /es)
│   │   ├── (public)/             # Layout público (Header + Footer)
│   │   ├── (auth)/               # Layout autenticado (Header + Sidebar + Footer)
│   │   └── (admin)/              # Layout admin (Sidebar admin + Topbar)
│   ├── api/                      # Route handlers (auth callbacks)
│   └── layout.tsx                # Root layout (providers, fonts, theme)
│
├── components/                   # Componentes reutilizáveis globais
│   ├── ui/                       # Atoms — shadcn/ui base
│   ├── shared/                   # Molecules — composições reutilizáveis
│   ├── layout/                   # Organisms — Header, Footer, Sidebar
│   └── forms/                    # Formulários reutilizáveis
│
├── modules/                      # Domínios de negócio (DDD)
│   ├── auth/
│   ├── listing/
│   ├── search/
│   ├── inquiries/
│   ├── messages/
│   ├── reviews/
│   ├── favorites/
│   ├── admin/
│   ├── verification/
│   ├── monetization/
│   └── notifications/
│
├── hooks/                        # Hooks globais
├── lib/                          # Utilitários, API client, helpers
├── store/                        # Zustand stores
├── services/                     # API services (fetch wrapper)
├── i18n/                         # Traduções
├── styles/                       # Tokens CSS, globals
└── types/                        # TypeScript types
```

---

## 2. Layouts — 3 Variações

### 2.1 Layout Público (`(public)`)

Para visitantes e páginas abertas.

```
┌──────────────────────────────────────────────────┐
│  HEADER                                           │
│  [Logo]  [Buscar quartos] [Anunciar]  [🌐] [Login]│
├──────────────────────────────────────────────────┤
│                                                    │
│                  CONTEÚDO                          │
│              (full width)                          │
│                                                    │
├──────────────────────────────────────────────────┤
│  FOOTER                                           │
│  [Links] [Redes] [Idioma] [Legal]                 │
└──────────────────────────────────────────────────┘
```

**Header público:**

- Logo (link para home)
- Busca rápida (input com autocomplete)
- Link "Anunciar meu quarto"
- Seletor de idioma (🌐 PT/EN/ES)
- Botões Login / Cadastrar
- Mobile: hamburger menu

**Páginas neste layout:**

- `/` — Landing page
- `/rooms` — Busca de quartos
- `/rooms/:city` — Busca por cidade
- `/rooms/:city/:slug` — Detalhe do anúncio
- `/login` — Login
- `/register` — Cadastro
- `/forgot-password` — Esqueci senha
- `/reset-password` — Resetar senha
- `/verify-email` — Verificar e-mail
- `/about` — Sobre
- `/terms` — Termos
- `/privacy` — Privacidade
- `/faq` — FAQ
- `/contact` — Contato
- `/host` — Landing para anfitriões
- `/pricing` — Planos e preços
- `/user/:id` — Perfil público

---

### 2.2 Layout Autenticado (`(auth)`)

Para usuários logados (inquilino e anfitrião).

```
┌──────────────────────────────────────────────────┐
│  HEADER                                           │
│  [Logo] [Busca] [+Anunciar] [🔔 3] [💬 2] [Avatar▾]│
├────────────┬─────────────────────────────────────┤
│  SIDEBAR   │                                      │
│            │         CONTEÚDO                     │
│  Dashboard │        (com padding)                  │
│  Meus Q.   │                                      │
│  Favoritos │                                      │
│  Mensagens │                                      │
│  Solic.    │                                      │
│  Avaliações│                                      │
│  Perfil    │                                      │
│  Verificar │                                      │
│  Assinat.  │                                      │
│  ─────────│                                      │
│  Config.   │                                      │
│  Sair      │                                      │
├────────────┴─────────────────────────────────────┤
│  FOOTER (simplificado)                            │
└──────────────────────────────────────────────────┘
```

**Header autenticado:**

- Logo
- Busca rápida
- Botão "+ Anunciar" (CTA accent)
- Ícone notificações com badge de contagem
- Ícone mensagens com badge de contagem
- Avatar do usuário com dropdown (perfil, config, sair)

**Sidebar — Itens (ícones + texto):**

| Ícone | Label         | Rota            | Roles |
| ----- | ------------- | --------------- | ----- |
| 📊    | Dashboard     | `/dashboard`    | todos |
| 🏠    | Meus Quartos  | `/my-listings`  | host  |
| ❤️    | Favoritos     | `/favorites`    | todos |
| 💬    | Mensagens     | `/messages`     | todos |
| 📩    | Solicitações  | `/inquiries`    | todos |
| ⭐    | Avaliações    | `/reviews`      | todos |
| 👤    | Meu Perfil    | `/profile`      | todos |
| ✅    | Verificação   | `/verification` | todos |
| 💳    | Assinatura    | `/subscription` | host  |
| 📊    | Faturamento   | `/billing`      | host  |
| ⚙️    | Configurações | `/settings`     | todos |
| 🚪    | Sair          | —               | todos |

**Comportamento da Sidebar:**

- Desktop (≥1024px): sidebar fixa, 260px largura, collapsível para 72px (ícones)
- Tablet (768-1023px): sidebar oculta, abre com botão hamburger (overlay)
- Mobile (<768px): bottom navigation com 5 itens principais + hamburger para restante

**Páginas neste layout:**

- `/dashboard` — Painel do usuário
- `/my-listings` — Meus anúncios
- `/listings/new` — Criar anúncio (wizard)
- `/listings/:id/edit` — Editar anúncio
- `/favorites` — Favoritos
- `/messages` — Lista de conversas
- `/messages/:id` — Conversa aberta
- `/inquiries` — Solicitações (enviadas/recebidas)
- `/inquiries/:id` — Detalhe da solicitação
- `/reviews/pending` — Avaliações pendentes
- `/reviews/new/:id` — Formulário de avaliação
- `/profile` — Editar perfil
- `/verification` — Centro de verificação
- `/subscription` — Gerenciar assinatura
- `/billing` — Histórico de pagamentos
- `/boost/:id` — Comprar destaque
- `/settings` — Configurações gerais
- `/settings/notifications` — Preferências de notificação

---

### 2.3 Layout Admin (`(admin)`)

Para administradores da plataforma.

```
┌──────────────────────────────────────────────────┐
│  TOPBAR (dark)                                    │
│  [Logo Admin] [🔔] [Avatar▾]                     │
├────────────┬─────────────────────────────────────┤
│  SIDEBAR   │                                      │
│  (dark bg) │         CONTEÚDO                     │
│            │        (background neutral-50)        │
│  Dashboard │                                      │
│  Anúncios  │                                      │
│  Usuários  │                                      │
│  Verific.  │                                      │
│  Denúncias │                                      │
│  Financeiro│                                      │
│  Config.   │                                      │
│            │                                      │
├────────────┴─────────────────────────────────────┤
```

**Sidebar Admin — Itens:**

| Ícone | Label         | Rota                   |
| ----- | ------------- | ---------------------- |
| 📊    | Dashboard     | `/admin`               |
| 🏠    | Anúncios      | `/admin/listings`      |
| 👥    | Usuários      | `/admin/users`         |
| ✅    | Verificações  | `/admin/verifications` |
| 🚨    | Denúncias     | `/admin/reports`       |
| 💰    | Financeiro    | `/admin/finance`       |
| ⚙️    | Configurações | `/admin/settings`      |

**Páginas neste layout:**

- `/admin` — Dashboard com métricas
- `/admin/listings` — Fila de moderação
- `/admin/users` — Lista de usuários
- `/admin/users/:id` — Detalhe do usuário
- `/admin/verifications` — Fila de verificações
- `/admin/reports` — Central de denúncias
- `/admin/finance` — Receitas e transações
- `/admin/settings` — Configurações da plataforma

---

## 3. Componentes Reutilizáveis — Mapa Completo

### 3.1 UI Atoms (`components/ui/`)

Componentes base do shadcn/ui, customizados com tokens de cor.

| Componente   | Variantes                                                | Descrição                   |
| ------------ | -------------------------------------------------------- | --------------------------- |
| `Button`     | primary, secondary, accent, danger, ghost, outline, link | Botão com loading state     |
| `Input`      | default, error                                           | Campo de texto              |
| `Textarea`   | default, error                                           | Campo de texto multilinha   |
| `Select`     | default, multi                                           | Seletor dropdown            |
| `Checkbox`   | default                                                  | Checkbox                    |
| `Radio`      | default                                                  | Radio button                |
| `Switch`     | default                                                  | Toggle on/off               |
| `Badge`      | success, warning, error, info, neutral, premium          | Tag/label                   |
| `Avatar`     | sm, md, lg, xl                                           | Foto de perfil circular     |
| `Skeleton`   | text, circle, card                                       | Loading placeholder         |
| `Spinner`    | sm, md, lg                                               | Loading spinner             |
| `Tooltip`    | default                                                  | Tooltip on hover            |
| `Popover`    | default                                                  | Popup com conteúdo          |
| `Dialog`     | default, destructive                                     | Modal                       |
| `Sheet`      | left, right, top, bottom                                 | Painel lateral deslizante   |
| `Dropdown`   | default                                                  | Menu dropdown               |
| `Tabs`       | default, pills                                           | Navegação por abas          |
| `Accordion`  | default                                                  | Seções colapsáveis          |
| `Toast`      | success, error, warning, info                            | Notificação temporária      |
| `Separator`  | horizontal, vertical                                     | Linha divisória             |
| `Label`      | default                                                  | Label de form               |
| `Card`       | default, hover, interactive                              | Container com sombra        |
| `Table`      | default, striped                                         | Tabela de dados             |
| `Pagination` | default                                                  | Navegação de páginas        |
| `Breadcrumb` | default                                                  | Trilha de navegação         |
| `Slider`     | default, range                                           | Slider numérico             |
| `Calendar`   | default                                                  | Seletor de data             |
| `DatePicker` | default                                                  | Input de data com calendar  |
| `Command`    | default                                                  | Paleta de comandos (busca)  |
| `Progress`   | default, circle                                          | Barra de progresso          |
| `ScrollArea` | default                                                  | Área com scroll customizado |

### 3.2 Shared Molecules (`components/shared/`)

Composições reutilizáveis em múltiplos módulos.

| Componente         | Props principais                   | Onde usa               |
| ------------------ | ---------------------------------- | ---------------------- |
| `SearchInput`      | placeholder, onSearch, suggestions | Header, busca          |
| `PriceTag`         | amount, currency, period           | Cards, listagens       |
| `RatingStars`      | rating, count, size                | Reviews, cards         |
| `StatusBadge`      | status (active, pending, etc.)     | Anúncios, solicitações |
| `UserMiniCard`     | user, showVerified, showRating     | Perfis, reviews        |
| `PhotoGallery`     | photos, showCount                  | Anúncios               |
| `PhotoUploader`    | maxPhotos, onUpload, onRemove      | Criar/editar anúncio   |
| `EmptyState`       | icon, title, description, action   | Listas vazias          |
| `LoadingState`     | type (skeleton, spinner)           | Carregamento           |
| `ErrorState`       | message, onRetry                   | Erros                  |
| `ConfirmDialog`    | title, message, onConfirm          | Ações destrutivas      |
| `StepWizard`       | steps, currentStep, onNext, onBack | Wizard de anúncio      |
| `FilterPanel`      | filters, onApply, onReset          | Busca                  |
| `SortSelect`       | options, current, onChange         | Busca                  |
| `LanguageSelector` | currentLocale, locales             | Header                 |
| `ThemeToggle`      | —                                  | Header (light/dark)    |
| `NotificationBell` | count, onClick                     | Header auth            |
| `MessageBadge`     | count, onClick                     | Header auth            |
| `AmenityIcon`      | amenity, size                      | Detalhe anúncio        |
| `AmenityList`      | amenities, maxShow                 | Cards, detalhe         |
| `MapPin`           | listing, onClick                   | Mapa                   |
| `MapCluster`       | count, onClick                     | Mapa                   |
| `StatCard`         | label, value, change, icon         | Dashboard              |
| `InfoRow`          | icon, label, value                 | Detalhe anúncio        |
| `FileUploader`     | accept, maxSize, onUpload          | Verificação            |
| `CurrencyInput`    | currency, value, onChange          | Preço                  |
| `PhoneInput`       | countryCode, value, onChange       | Perfil                 |

### 3.3 Layout Organisms (`components/layout/`)

| Componente        | Descrição                             |
| ----------------- | ------------------------------------- |
| `PublicHeader`    | Header das páginas públicas           |
| `AuthHeader`      | Header das páginas autenticadas       |
| `AdminTopbar`     | Topbar do painel admin                |
| `PublicFooter`    | Footer completo                       |
| `AuthFooter`      | Footer simplificado                   |
| `Sidebar`         | Sidebar colapsível com itens por role |
| `AdminSidebar`    | Sidebar do admin (dark theme)         |
| `MobileBottomNav` | Navegação inferior mobile (5 itens)   |
| `BreadcrumbNav`   | Breadcrumb automático por rota        |
| `PageHeader`      | Título + descrição + ações da página  |

---

## 4. Módulos — Componentes por Domínio

Cada módulo tem seus próprios componentes, hooks e services:

```
modules/<modulo>/
├── components/         # Componentes específicos do domínio
├── hooks/              # Hooks do domínio (useListings, useInquiries)
├── services/           # API calls do domínio
└── types/              # Types do domínio
```

### Exemplo: `modules/listing/`

```
modules/listing/
├── components/
│   ├── ListingCard.tsx              # Card na busca
│   ├── ListingDetailHero.tsx        # Galeria + info do detalhe
│   ├── ListingDetailInfo.tsx        # Informações completas
│   ├── ListingDetailRules.tsx       # Regras da casa
│   ├── ListingDetailHost.tsx        # Mini perfil do anfitrião
│   ├── ListingDetailMap.tsx         # Mapa de localização
│   ├── ListingDetailSimilar.tsx     # Anúncios similares
│   ├── ListingWizardStep1.tsx       # Tipo e localização
│   ├── ListingWizardStep2.tsx       # Detalhes do quarto
│   ├── ListingWizardStep3.tsx       # Banheiro
│   ├── ListingWizardStep4.tsx       # Áreas comuns
│   ├── ListingWizardStep5.tsx       # Preço e condições
│   ├── ListingWizardStep6.tsx       # Regras da casa
│   ├── ListingWizardStep7.tsx       # Sobre a moradia
│   ├── ListingWizardStep8.tsx       # Fotos
│   ├── ListingWizardStep9.tsx       # Revisão/preview
│   ├── ListingStatusBadge.tsx       # Badge de status
│   ├── ListingActions.tsx           # Botões pausar/editar/excluir
│   └── MyListingsTable.tsx          # Tabela meus anúncios
├── hooks/
│   ├── useListings.ts               # CRUD de anúncios
│   ├── useListingDetail.ts          # Dados do detalhe
│   ├── useListingWizard.ts          # Estado do wizard
│   └── useListingPhotos.ts          # Upload/gerenciar fotos
├── services/
│   └── listing.service.ts           # API calls
└── types/
    └── listing.types.ts             # Types do domínio
```

---

## 5. Dashboard — Conteúdo por Role

### Dashboard do Inquilino

```
┌─────────────────────────────────────────────┐
│  Olá, João! 👋                              │
│  Bem-vindo ao BrasilQuartos                  │
├──────────────┬──────────────┬───────────────┤
│  📩 2        │  💬 3        │  ❤️ 12        │
│  Solicitações│  Mensagens   │  Favoritos    │
│  Pendentes   │  Não lidas   │  Salvos       │
├──────────────┴──────────────┴───────────────┤
│  Suas Solicitações Recentes                  │
│  ┌──────────────────────────────────────┐   │
│  │  Quarto em Orlando — Aceita ✅       │   │
│  │  Quarto em Newark — Pendente ⏳      │   │
│  └──────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  Quartos Recomendados para Você              │
│  [Card] [Card] [Card] [Card]                │
├─────────────────────────────────────────────┤
│  Complete seu Perfil (75%)                   │
│  [████████░░] Adicione foto · Verifique ID   │
└─────────────────────────────────────────────┘
```

### Dashboard do Anfitrião

```
┌─────────────────────────────────────────────┐
│  Olá, Maria! 👋                             │
│  Seu painel de anfitrião                     │
├──────────┬──────────┬──────────┬────────────┤
│  🏠 3    │  👁️ 245  │  📩 5    │  ⭐ 4.8    │
│  Anúncios│  Views   │  Solic.  │  Avaliação │
│  Ativos  │  Este mês│  Novas   │  Média     │
├──────────┴──────────┴──────────┴────────────┤
│  Meus Anúncios                               │
│  ┌─────────────────────────────────────┐    │
│  │ 🟢 Quarto Suite Orlando — 45 views  │    │
│  │ 🟡 Quarto em Kissimmee — Em revisão │    │
│  │ ⏸️ Quarto em Tampa — Pausado         │    │
│  └─────────────────────────────────────┘    │
├─────────────────────────────────────────────┤
│  Solicitações Pendentes                      │
│  [MiniCard inquilino] [Aceitar] [Recusar]   │
├─────────────────────────────────────────────┤
│  📊 Performance (gráfico de views/semana)    │
├─────────────────────────────────────────────┤
│  Plano: Free · 1/1 anúncio usado            │
│  [Fazer upgrade para Pro →]                  │
└─────────────────────────────────────────────┘
```

---

## 6. Padrão de Cores por Componente

### Como funciona a troca rápida

```
tokens.css (variáveis globais)
    ↓
tailwind.config.ts (mapeia tokens → classes)
    ↓
Componente usa classes Tailwind (bg-primary, text-primary)
    ↓
Troca em 1 arquivo = troca em toda a plataforma
```

### Exemplo prático

```css
/* styles/tokens.css — ÚNICO ARQUIVO para mudar cores */
:root {
  /* Mudar ESTAS variáveis muda TUDO */
  --primary: 160 84% 39%; /* verde esmeralda */
  --primary-foreground: 0 0% 100%;
  --accent: 43 96% 56%; /* dourado */
  --accent-foreground: 0 0% 0%;
  --background: 0 0% 98%;
  --foreground: 0 0% 10%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 10%;
  --border: 0 0% 90%;
  --input: 0 0% 90%;
  --ring: 160 84% 39%;
  --destructive: 0 84% 60%;
  --muted: 0 0% 96%;
  --muted-foreground: 0 0% 45%;
  --success: 142 71% 45%;
  --warning: 43 96% 56%;
  --info: 217 91% 60%;
}

.dark {
  --primary: 160 84% 55%;
  --background: 0 0% 4%;
  --foreground: 0 0% 95%;
  --card: 0 0% 7%;
  /* ... dark overrides */
}
```

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        // ... mapeamento completo
      },
    },
  },
};
```

```tsx
// Componente usa APENAS tokens — NUNCA cores hardcoded
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Buscar quartos
</button>

// ❌ PROIBIDO
<button className="bg-[#10B981] text-white">
```

---

## 7. Responsividade — Padrão Mobile-First

| Viewport    | Layout               | Sidebar              | Header           |
| ----------- | -------------------- | -------------------- | ---------------- |
| < 640px     | 1 coluna, full width | Bottom nav (5 itens) | Hamburger + logo |
| 640-767px   | 1 coluna com padding | Bottom nav           | Logo + ações     |
| 768-1023px  | 2 colunas (grid)     | Overlay (hamburger)  | Completo         |
| 1024-1279px | Sidebar + conteúdo   | Colapsada (72px)     | Completo         |
| ≥ 1280px    | Sidebar + conteúdo   | Expandida (260px)    | Completo         |

### Mobile Bottom Navigation (5 itens)

```
┌──────┬──────┬──────┬──────┬──────┐
│  🏠  │  🔍  │  ➕  │  💬  │  👤  │
│ Home │Busca │Criar │ Msgs │Perfil│
└──────┴──────┴──────┴──────┴──────┘
```

---

## 8. States Padrão (Toda Página)

Cada página/listagem DEVE implementar 4 estados:

| Estado      | Componente         | Descrição              |
| ----------- | ------------------ | ---------------------- |
| **Loading** | `<LoadingState />` | Skeleton ou spinner    |
| **Empty**   | `<EmptyState />`   | Ícone + texto + CTA    |
| **Error**   | `<ErrorState />`   | Mensagem + botão retry |
| **Success** | Conteúdo real      | Dados renderizados     |

```tsx
// Padrão obrigatório em toda listagem
function MyListingsPage() {
  const { listings, isLoading, error } = useMyListings();

  if (isLoading) return <LoadingState type="skeleton" count={3} />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;
  if (listings.length === 0)
    return (
      <EmptyState
        icon={Home}
        title="Nenhum anúncio ainda"
        description="Crie seu primeiro anúncio e comece a receber solicitações"
        action={{ label: "Criar anúncio", href: "/listings/new" }}
      />
    );

  return <MyListingsTable listings={listings} />;
}
```
