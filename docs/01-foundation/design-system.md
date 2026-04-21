# BrasilQuartos — Design System & Brand Guide

## 1. Identidade da Marca

### Nome

- **BrasilQuartos** — plataforma de aluguel de quartos para brasileiros no exterior

### Personalidade

- Confiável e seguro (brasileiros no exterior precisam de confiança)
- Acolhedor e familiar (sensação de casa)
- Moderno e profissional (não é grupo de Facebook)
- Brasileiro com alcance global (orgulho + internacionalização)

### Tagline

- PT: "Seu quarto no exterior começa aqui"
- EN: "Your room abroad starts here"
- ES: "Tu habitación en el exterior empieza aquí"

---

## 2. Paleta de Cores

### Filosofia

Inspiração nas cores do Brasil (verde, amarelo, azul) mas em tons **modernos e sofisticados**, sem parecer "site de governo". Tons quentes para acolhimento, tons frios para confiança.

### Cores Primárias

| Token                 | Hex       | Uso                                          |
| --------------------- | --------- | -------------------------------------------- |
| `--color-primary-50`  | `#ECFDF5` | Background sutil                             |
| `--color-primary-100` | `#D1FAE5` | Background hover                             |
| `--color-primary-200` | `#A7F3D0` | Borders, badges                              |
| `--color-primary-300` | `#6EE7B7` | Icons secundários                            |
| `--color-primary-400` | `#34D399` | Links hover                                  |
| `--color-primary-500` | `#10B981` | **COR PRINCIPAL** — botões, links, destaques |
| `--color-primary-600` | `#059669` | Botão hover                                  |
| `--color-primary-700` | `#047857` | Botão active/pressed                         |
| `--color-primary-800` | `#065F46` | Texto sobre background claro                 |
| `--color-primary-900` | `#064E3B` | Texto forte                                  |
| `--color-primary-950` | `#022C22` | Background escuro                            |

> **Verde esmeralda** — transmite confiança, crescimento e segurança. Diferente do verde bandeira (muito saturado), este é moderno e elegante.

### Cores Secundárias (Accent)

| Token                | Hex       | Uso                                                |
| -------------------- | --------- | -------------------------------------------------- |
| `--color-accent-50`  | `#FFFBEB` | Background sutil                                   |
| `--color-accent-100` | `#FEF3C7` | Background hover                                   |
| `--color-accent-200` | `#FDE68A` | Badges, tags                                       |
| `--color-accent-300` | `#FCD34D` | Icons                                              |
| `--color-accent-400` | `#FBBF24` | **ACCENT PRINCIPAL** — destaques, CTAs secundários |
| `--color-accent-500` | `#F59E0B` | Botão accent                                       |
| `--color-accent-600` | `#D97706` | Hover                                              |
| `--color-accent-700` | `#B45309` | Active                                             |

> **Dourado/Amber** — remete ao amarelo brasileiro, usado para destaques, badges premium, e CTAs de conversão.

### Cores Neutras

| Token                 | Hex       | Uso                    |
| --------------------- | --------- | ---------------------- |
| `--color-neutral-50`  | `#FAFAFA` | Background da página   |
| `--color-neutral-100` | `#F5F5F5` | Background de cards    |
| `--color-neutral-200` | `#E5E5E5` | Borders                |
| `--color-neutral-300` | `#D4D4D4` | Borders desabilitado   |
| `--color-neutral-400` | `#A3A3A3` | Placeholder text       |
| `--color-neutral-500` | `#737373` | Texto secundário       |
| `--color-neutral-600` | `#525252` | Texto body             |
| `--color-neutral-700` | `#404040` | Texto strong           |
| `--color-neutral-800` | `#262626` | Títulos                |
| `--color-neutral-900` | `#171717` | Texto máximo contraste |
| `--color-neutral-950` | `#0A0A0A` | Background dark mode   |

### Cores Semânticas (Feedback)

| Token                 | Hex       | Uso                        |
| --------------------- | --------- | -------------------------- |
| `--color-success-500` | `#22C55E` | Sucesso, verificado, ativo |
| `--color-success-50`  | `#F0FDF4` | Background sucesso         |
| `--color-warning-500` | `#F59E0B` | Atenção, pendente          |
| `--color-warning-50`  | `#FFFBEB` | Background warning         |
| `--color-error-500`   | `#EF4444` | Erro, rejeitado, banido    |
| `--color-error-50`    | `#FEF2F2` | Background erro            |
| `--color-info-500`    | `#3B82F6` | Informação, dica           |
| `--color-info-50`     | `#EFF6FF` | Background info            |

### Dark Mode

| Elemento          | Light         | Dark          |
| ----------------- | ------------- | ------------- |
| Background página | `neutral-50`  | `neutral-950` |
| Background card   | `white`       | `neutral-900` |
| Texto principal   | `neutral-800` | `neutral-100` |
| Texto secundário  | `neutral-500` | `neutral-400` |
| Border            | `neutral-200` | `neutral-800` |
| Primary           | `primary-500` | `primary-400` |

---

## 3. Tipografia

### Font Family

| Uso         | Fonte                | Fallback              |
| ----------- | -------------------- | --------------------- |
| Headings    | **Inter** (700, 600) | system-ui, sans-serif |
| Body        | **Inter** (400, 500) | system-ui, sans-serif |
| Mono (code) | **JetBrains Mono**   | monospace             |

> Inter: fonte moderna, legível em todos os tamanhos, ótimo suporte multilíngue (PT/EN/ES).

### Escala Tipográfica

| Token       | Size | Line Height | Uso                      |
| ----------- | ---- | ----------- | ------------------------ |
| `text-xs`   | 12px | 16px        | Labels, captions         |
| `text-sm`   | 14px | 20px        | Texto auxiliar, metadata |
| `text-base` | 16px | 24px        | **Corpo padrão**         |
| `text-lg`   | 18px | 28px        | Subtítulos, destaque     |
| `text-xl`   | 20px | 28px        | Títulos de card          |
| `text-2xl`  | 24px | 32px        | Títulos de seção         |
| `text-3xl`  | 30px | 36px        | Títulos de página        |
| `text-4xl`  | 36px | 40px        | Hero heading             |
| `text-5xl`  | 48px | 48px        | Landing hero             |

---

## 4. Espaçamento

Escala baseada em **4px** (Tailwind padrão):

| Token      | Valor | Uso comum                      |
| ---------- | ----- | ------------------------------ |
| `space-1`  | 4px   | Micro gaps                     |
| `space-2`  | 8px   | Entre ícone e texto            |
| `space-3`  | 12px  | Padding interno tight          |
| `space-4`  | 16px  | **Padding padrão**             |
| `space-5`  | 20px  | Gap entre cards                |
| `space-6`  | 24px  | Padding de seções              |
| `space-8`  | 32px  | Gap entre seções               |
| `space-10` | 40px  | Margens largas                 |
| `space-12` | 48px  | Separadores de bloco           |
| `space-16` | 64px  | Padding de hero/seções grandes |

---

## 5. Border Radius

| Token          | Valor  | Uso                         |
| -------------- | ------ | --------------------------- |
| `rounded-sm`   | 4px    | Inputs, badges              |
| `rounded-md`   | 6px    | Botões                      |
| `rounded-lg`   | 8px    | **Cards padrão**            |
| `rounded-xl`   | 12px   | Cards destaque, modals      |
| `rounded-2xl`  | 16px   | Imagens, avatares grandes   |
| `rounded-full` | 9999px | Avatares, badges circulares |

---

## 6. Sombras

| Token       | Valor                         | Uso                 |
| ----------- | ----------------------------- | ------------------- |
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)`  | Cards sutis         |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.07)`  | **Cards padrão**    |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Dropdowns, popovers |
| `shadow-xl` | `0 20px 25px rgba(0,0,0,0.1)` | Modals, overlays    |

---

## 7. Breakpoints (Mobile-First)

| Token | Min-width | Dispositivo      |
| ----- | --------- | ---------------- |
| `sm`  | 640px     | Mobile landscape |
| `md`  | 768px     | Tablet           |
| `lg`  | 1024px    | Desktop          |
| `xl`  | 1280px    | Desktop wide     |
| `2xl` | 1536px    | Ultra wide       |

---

## 8. Ícones

- **Biblioteca**: Lucide React (consistente, leve, tree-shakable)
- **Tamanhos**: 16px (inline), 20px (padrão), 24px (destaque)
- **Cor**: herda cor do texto (`currentColor`)

---

## 9. Animações e Transições

| Tipo                | Valor              | Uso                    |
| ------------------- | ------------------ | ---------------------- |
| `transition-fast`   | 150ms ease         | Hover de botão, toggle |
| `transition-base`   | 200ms ease         | Dropdown, accordion    |
| `transition-slow`   | 300ms ease         | Modal enter/leave      |
| `transition-spring` | 500ms cubic-bezier | Page transitions       |

### Animações globais

- Hover em cards: scale(1.02) + shadow-lg
- Hover em botões: brightness(1.05) ou shade mais escuro
- Skeleton loading: pulse animation para carregamento
- Page transition: fade-in sutil (150ms)
- Toast: slide-in-from-right + fade

---

## 10. Componentes — Variantes de Cor

### Padrão de variantes por componente

Cada componente aceita variantes de cor via prop `variant`:

```tsx
// Botão
<Button variant="primary" />   // verde esmeralda
<Button variant="secondary" /> // neutral/outline
<Button variant="accent" />    // dourado (CTA)
<Button variant="danger" />    // vermelho
<Button variant="ghost" />     // transparente

// Badge
<Badge variant="success" />    // verde
<Badge variant="warning" />    // amarelo
<Badge variant="error" />      // vermelho
<Badge variant="info" />       // azul
<Badge variant="neutral" />    // cinza

// Alert
<Alert variant="success" />
<Alert variant="warning" />
<Alert variant="error" />
<Alert variant="info" />
```

### Configuração centralizada

Todas as cores são tokens CSS custom properties definidos em:

- `apps/web/styles/tokens.css` — variáveis globais
- `tailwind.config.ts` — mapeia tokens para classes Tailwind

**Para mudar a cor da plataforma inteira, basta alterar `tokens.css`.**

```css
/* apps/web/styles/tokens.css */
:root {
  --color-primary: var(--color-primary-500);
  --color-primary-hover: var(--color-primary-600);
  --color-primary-active: var(--color-primary-700);
  --color-accent: var(--color-accent-400);
  --color-accent-hover: var(--color-accent-500);
  /* ... todas as variáveis semânticas */
}

[data-theme="dark"] {
  --color-primary: var(--color-primary-400);
  /* ... dark mode overrides */
}
```

---

## 11. Logo

### Conceito

- Ícone: casa + bandeira brasileira estilizada (minimalista)
- Texto: "BrasilQuartos" em Inter Bold
- Variações: horizontal (header), ícone só (favicon, mobile), vertical (marketing)

### Tamanhos

| Contexto       | Tamanho       |
| -------------- | ------------- |
| Favicon        | 32x32px       |
| Mobile header  | 32px height   |
| Desktop header | 40px height   |
| Footer         | 48px height   |
| Marketing      | SVG escalável |

---

## 12. Regra de Ouro do Design System

> **Nenhuma cor, tamanho ou espaçamento hardcoded no código.**
> Tudo via tokens CSS / classes Tailwind.
> Para mudar o visual da plataforma inteira, altere apenas `tokens.css`.
