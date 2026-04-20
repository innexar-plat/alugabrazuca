# Checklist de Entrega por Módulo

## Antes de iniciar
- [ ] Ler `construction-method.md`
- [ ] Ler handoff do módulo anterior (se existir)
- [ ] Ler README do módulo atual em `docs/modules/<modulo>/`

## Documentação
- [ ] README do módulo atualizado com escopo, regras de negócio, campos
- [ ] API contract definido (endpoints, request/response)
- [ ] Data model documentado (entidades, relacionamentos)

## Backend
- [ ] Entidades/Entities criadas
- [ ] DTOs de entrada/saída criados com validação
- [ ] Repository implementado
- [ ] Service com lógica de negócio
- [ ] Controller com rotas REST
- [ ] Migration criada e aplicada

## Frontend
- [ ] Páginas/rotas criadas
- [ ] Componentes implementados
- [ ] Integração com API
- [ ] Responsivo (mobile-first)
- [ ] i18n aplicado (PT, EN, ES)

## Qualidade
- [ ] Testes unitários (cobertura ≥ 95%)
- [ ] Testes de integração
- [ ] Sem erros de lint/type
- [ ] Code review checklist aplicado

## Segurança
- [ ] Input validado com DTO
- [ ] Auth verificada nas rotas protegidas
- [ ] Autorização verificada no service
- [ ] Sem segredos no código
- [ ] Dados sensíveis não aparecem em logs

## Finalização
- [ ] Handoff gerado em `docs/handoffs/`
- [ ] Estado do banco documentado
- [ ] Pendências listadas
- [ ] Próximo módulo identificado
