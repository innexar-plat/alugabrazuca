# Módulo 4 — Landing Page & SEO (`landing`)

## Visão Geral

Página inicial pública com proposta de valor, CTA de cadastro, quartos em destaque, cidades populares e conteúdo otimizado para SEO.

---

## 4.1 Seções da Landing Page

### Hero Section

- Título principal: "Encontre seu quarto nos EUA e Europa"
- Subtítulo: "Plataforma feita por brasileiros, para brasileiros no exterior"
- Barra de busca rápida (cidade + país)
- Background: imagem/vídeo de cidades (Orlando, Lisboa, Dublin)
- CTA: "Buscar quartos" e "Anunciar meu quarto"

### Como Funciona

- 3 passos com ícones:
  1. "Busque por cidade" — filtro por localização e preço
  2. "Encontre o quarto ideal" — veja fotos, detalhes e avaliações
  3. "Entre em contato" — fale direto com o anfitrião

### Quartos em Destaque

- Carrossel com 6-8 anúncios featured
- Cards com foto, preço, cidade, tipo

### Cidades Populares

- Grid de cidades com foto + contagem de quartos
- Orlando, Newark, Miami, Boston, Lisboa, Dublin, Londres, Madrid

### Números da Plataforma

- Contadores animados: quartos ativos, cidades, usuários, avaliações

### Depoimentos

- Carrossel de reviews de usuários reais
- Foto, nome, cidade, texto

### Para Anfitriões

- Seção dedicada a quem quer anunciar
- Benefícios: "Anuncie grátis", "Alcance brasileiros verificados", "Receba solicitações"
- CTA: "Começar a anunciar"

### Blog / Dicas (pós-MVP)

- 3 artigos recentes
- Link para página do blog

### Footer

- Links: Sobre, Termos, Privacidade, Contato, FAQ
- Redes sociais
- Seletor de idioma (PT/EN/ES)
- Copyright

---

## 4.2 Páginas Estáticas

| Rota       | Página                  |
| ---------- | ----------------------- |
| `/`        | Landing page            |
| `/about`   | Sobre a plataforma      |
| `/terms`   | Termos de uso           |
| `/privacy` | Política de privacidade |
| `/faq`     | Perguntas frequentes    |
| `/contact` | Contato                 |
| `/host`    | Landing para anfitriões |

---

## 4.3 SEO Técnico

- SSR/SSG para todas as páginas públicas
- Meta tags dinâmicas por página
- Open Graph + Twitter Cards
- Schema.org: Organization, WebSite, FAQPage
- Sitemap XML
- Robots.txt
- Canonical URLs
- Hreflang tags (pt, en, es)
- Core Web Vitals otimizados (LCP < 2.5s, CLS < 0.1)

---

## 4.4 i18n

- Detecção automática do idioma do navegador no primeiro acesso
- Botão de troca de idioma visível em todas as páginas
- URLs: `/pt/rooms`, `/en/rooms`, `/es/rooms`
- Conteúdo traduzido: UI, meta tags, FAQs
- Anúncios mantêm idioma original do anfitrião

---

## 4.5 Endpoints

| Método | Rota                           | Descrição                    | Auth |
| ------ | ------------------------------ | ---------------------------- | ---- |
| GET    | `/api/v1/landing/featured`     | Anúncios em destaque         | ❌   |
| GET    | `/api/v1/landing/cities`       | Cidades populares + contagem | ❌   |
| GET    | `/api/v1/landing/stats`        | Números da plataforma        | ❌   |
| GET    | `/api/v1/landing/testimonials` | Depoimentos                  | ❌   |
