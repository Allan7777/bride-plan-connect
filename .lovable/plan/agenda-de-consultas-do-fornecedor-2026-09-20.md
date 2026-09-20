# Agenda de consultas do fornecedor

## Objetivo
Adicionar ao painel do fornecedor uma agenda conectada aos leads atuais, sem remover ou alterar os fluxos existentes.

## O que será construído
- Uma nova página **Agenda** na navegação do fornecedor, com visão mensal e lista cronológica.
- Cada lead poderá registrar uma data e horário de consulta de orçamento e manter a data do casamento.
- O fornecedor poderá acompanhar e atualizar as etapas em linguagem simples: **Novo**, **Respondido**, **Em negociação**, **Contratado** e **Perdido**.
- Os próximos compromissos também aparecerão resumidos no painel principal.
- Edição rápida dos dados do lead, com confirmação visual de salvamento e estados vazios claros.

## Dados e segurança
- Adicionar campos opcionais ao lead para data/hora da consulta e observações do fornecedor.
- Manter os dados protegidos pelas permissões existentes: somente o fornecedor dono do lead e administradores poderão visualizar ou editar.
- Preservar o histórico e os estados já existentes, apenas apresentando nomes mais adequados na interface.

## Detalhes técnicos
- Mudança aditiva no banco, sem apagar ou renomear campos existentes.
- A agenda será derivada dos leads do fornecedor, combinando consultas agendadas e datas de casamento.
- A página será responsiva, com calendário no computador e navegação compacta no celular.
- Metadados próprios serão adicionados à nova página.

## Validação
- Confirmar criação e edição de consulta, alteração de etapa e persistência dos dados.
- Verificar agenda e painel em computador e celular.
- Confirmar compilação, ausência de erros e proteção entre fornecedores.
