# PRD: Implementação visual da UI (design v2)

**Date:** 2026-08-10
**Status:** Draft

## Problem

O app funciona: mapa com dados reais, avaliações, favoritos, contas, moderação automática e cadastro de pin já foram construídos e testados (specs 0001 a 0013). Mas quem abre o app hoje vê botões e campos sem estilo nenhum, sem cor, sem espaçamento, com a fonte padrão do navegador. O mapa não mostra os pins dos banheiros na posição real sobre o mapa — eles aparecem como uma lista de botões separada, desconectada visualmente do mapa. O bottom sheet do detalhe não desliza nem se parece com um sheet. Nada comunica que este é o app "Banheiros" e não um formulário cru. Isso bloqueia qualquer teste real com usuário, captura de tela para divulgação, ou lançamento em Maceió.

## Background

O handoff de design de alta fidelidade (`docs/design/design_handoff_banheiros/`) já definiu layout, copy PT/EN e o design system "Organic" para as 7 telas do app. Uma iteração v2 (`docs/design/2026-08-02-design-v2-prompt.md`) já re-tematizou a paleta (verde como cor principal e secundária, laranja como accent, no lugar do terracota/sage do v1), corrigiu a tela de auth e ajustou o cadastro para username-only — e é explícita que o resto do design v1 (bottom sheet, compositor de avaliação, favoritos, filtros, legenda, fluxo de adicionar pin, navegação por abas) **não muda**. Ou seja: o visual já está validado e pronto, tela por tela, cor por cor.

O que nunca aconteceu foi portar esse CSS para o app real. Hoje `src/styles/tokens.css` só traz os tokens de design (cores, fontes, espaçamento) e um reset básico — nenhuma classe de layout ou de componente (`.dialog`, `.sheet`, `.btn`, `.chip`, `.fab`, etc.) tem estilo definido, embora os componentes React já usem exatamente esses nomes de classe (foram escritos apontando para o design desde o início). O CSS completo de layout e componentes já existe pronto em `docs/design/app.css` (217 linhas) e no design system `docs/design/_ds/`. Este PRD é sobre portar esse trabalho já feito para dentro do app real — não sobre desenhar nada novo.

## Requirements

### Must Have

- **Fundação visual**: cores, fontes, espaçamento e raios de borda do app real passam a usar os tokens do design v2 (verde principal/secundário, laranja de destaque), substituindo os tokens v1 (terracota/sage) que estão no app hoje.
- **Componentes com estilo real**: todo botão, campo de texto, chip, card, diálogo e sheet do app passa a ter a aparência do design system "Organic" — pill buttons, cantos arredondados, sombras — em vez do estilo padrão do navegador.
- **Pins no lugar certo do mapa**: cada banheiro aparece como um pin na posição geográfica real sobre o mapa (não como uma lista de botões ao lado), colorido por categoria (público vs. comercial), com badge de cifrão para pago e badge de estrela para favorito. Os pins acompanham o mapa ao arrastar ou dar zoom.
- **Mapa visível**: a área do mapa tem tamanho definido na tela (hoje o contêiner do mapa pode colapsar para altura zero por falta de CSS).
- **Bottom sheet do detalhe**: o sheet do detalhe do banheiro desliza de baixo para cima sobre um fundo escurecido, com cantos superiores arredondados e a alça de arrastar visível — os gestos de fechar (arrastar, tocar no fundo, tocar no X) já funcionam e precisam ganhar a aparência correta.
- **Barra superior do mapa e FAB**: caixa de busca, chips de filtro (Todos/Público/Comercial/Pago), botão de legenda e o FAB de adicionar banheiro seguem o estilo flutuante/pill do design.
- **Estados de interação**: hover, pressed e foco por teclado aparecem visualmente em botões, campos e toggles, usando os estados já definidos nos tokens.

### Should Have

- **Conjunto de ícones completo**: hoje faltam ícones usados no design (ex.: fechar, confirmar) que os componentes já tentam usar. Completar o conjunto para bater com o que o design pede.
- **Verificação em telas largas**: o design é mobile-first (480px), mas o app roda também em navegador desktop. Garantir que a tela não quebra nem estica de forma estranha fora do mobile.

### Out of Scope

- **Qualquer fluxo ou tela ainda não construída**: a tela de "oferecer 2FA após o primeiro login" (item novo do design v2) e o fluxo completo de 2FA fazem parte da spec 0012, com seu próprio trabalho de comportamento — aqui só entra a estilização do que já existe e funciona.
- **Fotos nos banheiros**: interface de upload/exibição de foto é da spec 0013; este PRD não cobre telas que ainda não têm lógica implementada.
- **Mudar o design**: este PRD implementa o design v2 já validado. Não é uma revisão de paleta, tipografia ou layout — decisões de design ficam fora daqui.
- **Trocar o motor do mapa ou os tiles**: o app já usa MapLibre GL com tiles reais do OpenStreetMap (melhor que o SVG ilustrado do protótipo). Só a posição e o estilo dos pins entram no escopo.

## Constraints

- **CSS puro, sem framework novo**: o app usa CSS puro hoje (sem Tailwind, sem CSS-in-JS) e o CSS do design (`docs/design/app.css`, `docs/design/_ds/`) também é CSS puro — a implementação deve seguir esse mesmo caminho, sem introduzir uma dependência de estilização nova.
- **Não mexer na lógica dos componentes**: os testes de cada tela consultam por role/label, não por classe CSS. O trabalho é essencialmente CSS mais os poucos wrappers de marcação que o design pede (ex.: um `div` de container que hoje não existe) — não deve exigir reescrever comportamento já testado.
- **Fonte da verdade é o v2, não o v1**: a paleta e os ajustes de auth/username do design v2 substituem o v1 onde há conflito; o resto do v1 (sheet, compositor, favoritos, filtros, legenda, fluxo de pin, navegação) permanece como está.

## Acceptance Criteria

### Fundação visual
- Dado que qualquer tela do app renderiza, então cores, fontes, espaçamento e raios batem com os tokens do design v2 (verde/laranja), não com os tokens v1 (terracota/sage) ainda presentes no app.
- Dado um botão, campo, chip, card, diálogo ou sheet em qualquer tela, quando renderiza, então tem a aparência do design system, não o estilo padrão do navegador.

### Mapa
- Dado que o mapa carrega os banheiros, então cada um aparece como um pin na posição geográfica correta sobre o mapa, colorido pela categoria, com os badges de pago/favorito quando aplicável.
- Dado que o usuário arrasta ou dá zoom no mapa, então os pins continuam ancorados às posições geográficas corretas.
- Dado que a tela do mapa carrega, então a área do mapa tem altura visível, preenchendo o espaço esperado da tela.
- Dado a barra de busca, os chips de filtro, o botão de legenda e o FAB, quando renderizam, então seguem o estilo flutuante/pill do design.

### Bottom sheet do detalhe
- Dado que o usuário toca num pin, quando o sheet de detalhe abre, então ele desliza de baixo para cima sobre um fundo escurecido, com cantos superiores arredondados.
- Dado o sheet aberto, quando o usuário arrasta para baixo além do limiar, toca no fundo ou toca no X, então ele fecha com a aparência correta de alça, cabeçalho e botão de fechar.

### Formulários e diálogos
- Dado a tela de auth, o compositor de avaliação, o modal de adicionar banheiro ou a tela de perfil, quando renderizam, então campos, botões e toggles seguem o estilo do design (botões pill, tags, switch).
- Dado um botão desabilitado por alguma regra de validação já existente, quando renderiza, então mostra visualmente o estado desabilitado do design.

### Transversal
- Dado qualquer elemento interativo (botão, campo, toggle), quando recebe hover, é pressionado, ou recebe foco por teclado, então mostra o estado visual correspondente definido nos tokens.
- Dado o app renderizando numa viewport de 480px de largura, então o layout segue a estrutura mobile-first do design, sem scroll horizontal ou overflow.
