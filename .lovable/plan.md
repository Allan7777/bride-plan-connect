# Vitrine profissional do fornecedor

## Objetivo
Transformar o perfil público existente em uma vitrine profissional, preservando autenticação, marketplace, planejamento, leads, assinaturas e administração.

## O que será entregue

### 1. Portfólio seguro
- Reaproveitar `vendor_photos`, adicionando descrição, data e indicação de capa.
- Criar armazenamento público exclusivo para imagens de portfólio, com limite inicial configurável de 20 imagens por fornecedor.
- Aceitar apenas JPG, JPEG, PNG e WEBP, com validação de tamanho e propriedade.
- Permitir upload múltiplo com prévia, exclusão, definição de capa e reordenação.
- Usar a primeira imagem como capa automática quando nenhuma estiver marcada.

### 2. Edição do perfil profissional
- Adicionar ao painel “Meu Portfólio”, “Sobre meu trabalho”, “Mensagem do WhatsApp” e “WhatsApp para receber orçamentos”.
- Oferecer editor simples com parágrafos, negrito e listas, armazenando conteúdo estruturado e renderizado com segurança.
- Validar e normalizar o WhatsApp brasileiro antes de salvar.
- Manter os campos e recursos profissionais existentes.

### 3. Perfil público visual
- Reorganizar a página pública com capa, identidade, avaliação, localização e CTA principal no topo.
- Exibir “Sobre o fornecedor”, “Sobre meu trabalho”, galeria responsiva, serviços, faixa de preço e localização.
- Criar lightbox com navegação anterior/próxima, teclado e fechamento acessível.
- Repetir “Consultar valores” após a galeria e no final; no celular, mostrar CTA fixo inferior.
- Carregar imagens de forma responsiva e progressiva.

### 4. Consulta por WhatsApp
- Abrir uma confirmação antes do redirecionamento.
- Montar a mensagem padrão ou personalizada, identificando o NoivaHub.
- Incluir nome, data e cidade da noiva somente quando cadastrados.
- Registrar consulta, clique e lead antes de abrir o WhatsApp, sem integração com a API do WhatsApp.

### 5. Métricas e painel
- Criar uma tabela única de eventos vinculados ao fornecedor para `profile_view`, `favorite`, `budget_request`, `whatsapp_click` e `lead_created`.
- Registrar visualizações públicas sem expor dados pessoais; ações autenticadas guardam a noiva quando aplicável.
- Mostrar no painel “Seu perfil”, “Seu portfólio” e “Desempenho do seu perfil”.
- Exibir visualizações, favoritos, consultas, cliques e leads, com gráfico simples por período.
- Integrar favoritos e geração de leads existentes ao novo rastreamento, evitando contagem duplicada na mesma ação.

### 6. Segurança e moderação
- Aplicar permissões para somente o proprietário editar fotos e dados; administradores poderão visualizar e remover imagens.
- Impedir edição por noivas e exposição pública de fornecedores suspensos.
- Validar arquivos no navegador e nas regras de armazenamento; validar todos os textos e ações no servidor/banco.
- Adicionar no painel administrativo a visualização do portfólio e remoção moderada de imagens.

### 7. SEO e validação
- Gerar título e descrição com fornecedor, categoria, cidade e resumo do trabalho.
- Manter a URL pública atual `/fornecedor/{slug}`.
- Validar os fluxos de upload, ordenação, capa, lightbox, confirmação e WhatsApp em desktop e celular.
- Conferir permissões, erros de execução e compilação antes da entrega.

## Detalhes técnicos
- Mudanças de banco serão aditivas: novos campos em `vendors` e `vendor_photos`, tabela de eventos e funções seguras para contadores.
- O limite de portfólio ficará em configuração da aplicação, começando em 20.
- URLs das imagens ficam no banco; os arquivos ficam no armazenamento do projeto.
- A capa existente continuará compatível com fornecedores fictícios e perfis sem upload.
- A cobrança real continuará desativada, conforme a decisão anterior.
