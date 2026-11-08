# Guia de edição da interface

O frontend é um protótipo React com dados locais. As mudanças feitas na interface podem ser ajustadas nos arquivos abaixo. Após editar, rode `pnpm --filter frontend build` na raiz para conferir o TypeScript e a compilação.

| O que você quer alterar | Arquivo | Onde procurar |
| --- | --- | --- |
| Cores dos temas, escala em monitor ultra-wide e contraste | `src/index.css` | `:root`, `.dark` e `@media (min-width: 2200px)` |
| Largura máxima e espaçamento da área de trabalho | `src/components/layout/AppLayout.tsx` | `<main>` |
| Menu lateral no computador, marca tipográfica, seletor de perfil e tema | `src/components/layout/Navbar.tsx` | `<header>` e `<nav>` |
| Títulos e ícones das abas | `src/config/navigation.ts` | `NAVEGACAO` |
| Quais perfis veem cada aba | `src/config/permissions.ts` | `ACESSO` |
| Lista lateral, busca, filtros e ordenação de contatos | `src/features/contatos/ContatosView.tsx` | `listaFiltrada`, `filtros` e `<aside>` |
| Pessoa selecionada, expansão mobile e ações da ficha | `src/features/contatos/ContatosView.tsx` | `selecionado`, `expandidoId` e `ficha(v, mobile)` |
| Ficha compacta, situação e vínculos, informações para completar | `src/features/contatos/ContatosView.tsx` | `faltantes` e `detalhes` |
| Perguntas sugeridas no rodapé da ficha | `src/features/contatos/ContatosView.tsx` | seção “Sugestões para a próxima conversa”; textos variam por membresia, Connect e discipulador |
| Aniversários de hoje e destaque na ficha | `src/features/contatos/ContatosView.tsx` e `src/lib/aniversario.ts` | `aniversariantesHoje`, `selecionado`, `diasAteAniversario` |
| Botões WhatsApp, registrar e editar da ficha | `src/features/contatos/ContatosView.tsx` | `abrirWhatsApp`, `setVisitanteParaContato` e `setVisitanteParaEditar` |
| Formulário de criação e edição da pessoa | `src/features/contatos/ModalNovoVisitante.tsx` | campos e `handleSubmit` |
| Data, observação e salvamento de um contato realizado | `src/features/contatos/ModalRegistrarContato.tsx` | `handleSubmit` e campos do formulário |
| Lista de Connects, endereço e botões de convite | `src/features/connects/ConnectsView.tsx` | `connectsFiltrados` e cards |
| Data, horário e texto de prévia do WhatsApp | `src/features/connects/ModalConviteConnect.tsx` | estado do formulário e prévia |
| Modelo exato da mensagem de convite | `src/lib/convite.ts` | `gerarTextoConvite` |
| Links do WhatsApp e Maps | `src/lib/links.ts` | `linkWhatsApp` e `linkMapsConnect` |
| Lista de vínculos de discipulado e janela de indicação | `src/features/discipulado/DiscipuladoView.tsx` | `lista`, `abrir`, `salvar` e `<Modal>` |
| Lista de usuários e pessoas que cada um acompanha | `src/features/acompanhamentos/AcompanhamentosView.tsx` | `grupos` e `gruposFiltrados` |
| Perfil pessoal e resumo de atuação | `src/features/usuarios/PerfilView.tsx` | formulário e painéis de vínculos |
| Gestão de usuários, busca, filtro e edição | `src/features/usuarios/UsuariosView.tsx` | `lista`, `salvar` e `<Modal>` |
| Campos e validação dos dados de usuário | `src/features/usuarios/UsuarioForm.tsx` | `salvar` e campos do formulário |
| Posicionamento das janelas de cadastro e registro | `src/components/ui/Modal.tsx` | `createPortal` e contêiner fixo |
| Textos exibidos para perfis e categorias | `src/config/labels.ts` | tabelas de rótulos |
| Dados usados nesta demonstração | `src/data/mockData.ts` | `MOCK_USUARIOS`, `MOCK_CONNECTS`, `MOCK_VISITANTES` |
| Bloqueio de rolagem de menus e formulários | `src/lib/useBodyScrollLock.ts` | Bloqueio compartilhado; libera o fundo ao fechar o último menu ou modal |
| Adaptação entre mobile e computador | `src/lib/useMediaQuery.ts` | breakpoint de 1024 px; observa mudanças de tamanho |
| Ações locais e estado compartilhado | `src/store/appStore.tsx` | `adicionarVisitante`, `atualizarVisitante`, `registrarContato`, `adicionarUsuario`, `atualizarUsuario` |

## Fluxo atual

1. No computador, o menu fica em uma barra lateral compacta com navegação e somente o perfil no rodapé. Tema e Novo visitante ficam no canto superior direito da área de trabalho. No celular, o topo mostra MEVAM Contatos à esquerda, Novo visitante com texto e o botão de menu. A navegação, o tema e o perfil ficam em um painel lateral que abre pelo botão de menu e fecha por seleção de uma aba, pelo X, pelo fundo ou por Escape. Em Contatos, a lista e a ficha ocupam a área ao lado da barra, sem cabeçalho de página. A lista lateral tem busca e dois menus compactos para filtrar e ordenar. No computador, a página ocupa a altura do navegador; a lista e a ficha rolam separadamente com barras ocultas. Cada pessoa na lista mostra aniversário, situação, último contato e quantidade de acompanhantes. A pessoa selecionada aparece à direita, e aniversariantes de hoje vêm primeiro na lista. No celular, tocar em uma pessoa expande sua ficha imediatamente abaixo do item. Apenas uma pessoa fica expandida por vez; tocar novamente recolhe. A ficha usa a função `ficha(v, mobile)` e não há um segundo painel ao final da lista. No mobile, a página controla a rolagem vertical, inclusive sobre os contatos expandidos; `overflow-y-auto` e `overscroll-contain` ficam restritos ao computador para não prender o gesto na lista. Menus e formulários compartilham o bloqueio do fundo com `useBodyScrollLock`, liberado ao fechar o último painel. A localização aparece apenas em “Dados da pessoa”. Informações faltantes têm ícones e cores de alerta; uma faixa compacta reúne as pendências e oferece o botão Completar dados.
2. “WhatsApp” abre a conversa; essa ação não registra uma conversa realizada.
3. “Registrar” salva a data e o resumo no estado local e atualiza o histórico.
4. Na ficha, WhatsApp, Registrar contato e Editar cadastro ficam abaixo do nome e da referência, com largura conforme o texto. WhatsApp usa verde escuro, Editar cadastro usa amarelo e Registrar contato usa laranja, com destaque para as três ações. O nome e o último contato abrem a leitura; Dados da pessoa aparece antes de Situação e vínculos, observações e histórico. A lista e a ficha ficam centralizadas em uma área de até 2120 px, adaptada ao espaço disponível. A ficha aproveita a largura do próprio painel, sem uma segunda margem interna larga. Em telas grandes, os dados ficam em quatro colunas e duas linhas; vínculos e pendências usam espaçamentos menores para exibir também observações e histórico sem rolagem nas prévias de 1920×1080 e 3439×1292. Em telas menores ou com histórico extenso, a ficha permite rolagem para manter todas as informações acessíveis. “Editar cadastro” abre o formulário preenchido. No computador, a ficha tem a mesma altura da lista. O bloco Para a próxima conversa ocupa a faixa inferior com perguntas sugeridas conforme os vínculos da pessoa, sem alterar o cadastro.
5. Connects não são filtrados por dia. Ao criar um convite, a próxima data sugerida é sábado; data e horário podem ser ajustados no convite.
6. Discipulado mostra o vínculo fixo entre pessoa e discipulador. Acompanhamentos agrupa os usuários e mostra quem está associado ao acompanhamento de cada um. Uma pessoa pode aparecer em mais de uma lista.
7. “Meu perfil” está disponível para todos os perfis e permite editar nome, telefone e gênero do usuário selecionado no menu. “Usuários” fica disponível ao administrador para criar e editar cadastros, cargos e situação da conta. A própria conta do administrador não pode ter cargo nem situação alterados nessa tela.

## Notificações

O aviso de aniversários de hoje é apenas um destaque dentro da interface. Ainda não há notificações automáticas. Para recebê-las com o navegador fechado, será preciso autenticação, persistência no backend, regras de lembrete, permissão da pessoa usuária, service worker e envio de Web Push. A proposta inicial é continuar com a aplicação web e, após integrar a API, acrescentar instalação como PWA e notificações. Um aplicativo React Native só se justifica se houver necessidade de recursos específicos do celular ou distribuição pelas lojas.

## Para uso oficial

Hoje os registros alterados nesta demonstração desaparecem ao recarregar a página. A seleção de perfil no menu simula o usuário conectado. A próxima etapa é ligar os formulários e listas à API, implementar login e aplicar as permissões no servidor. No backend, a criação de usuários exige senha e há um campo administrativo separado do cargo; esses pontos precisam ser conectados ao fluxo de autenticação antes do uso oficial. A tela de login deve ser feita depois da aprovação da tela principal, como combinado.
