# PRD: Acabamento visual e responsividade completa

**Date:** 2026-08-11
**Status:** Draft

## Problem

O app já tem a identidade visual do design (Organic) portada para mobile em 480px — mapa, sheet de detalhe, avaliação, favoritos e perfil estão todos estilizados e batendo com o handoff. Mas quatro telas de fluxo continuam com HTML puro, sem nenhuma classe: recuperação de senha, termos, privacidade e escolha de username. São momentos em que o usuário já confia no app (está recuperando acesso à conta, lendo um documento legal, ou terminando o cadastro) e cai numa tela que parece quebrada ou abandonada. Fora do mobile, o app também não foi verificado: rodar num navegador de tablet ou desktop hoje é território não mapeado.

## Background

As specs 0015 (fundação visual) e 0016 (pins reais no mapa) fecharam a portabilidade do design system para as telas principais. A verificação dessas specs foi sempre visual, rodando o dev server em 480px, porque o handoff (`docs/design/design_handoff_banheiros/`) é mobile-only — não existe um segundo breakpoint desenhado. Um scout no código confirmou que a lacuna real não é "faltam classes" nas telas principais (essas já estão prontas), e sim duas coisas específicas: as quatro telas de fluxo secundário nunca entraram no escopo de nenhuma spec anterior, e ninguém verificou o comportamento do app fora da largura de 480px — nem em tablet/desktop, nem em paisagem no celular.

Decisão do usuário para este ciclo: adotar Tailwind CSS para construir a parte responsiva mais rápido, em vez de escrever media queries manuais tela por tela.

## Requirements

### Must Have

- Estilizar as quatro telas que hoje renderizam HTML puro, reaproveitando os componentes visuais já existentes (campo, botão, cartão, nota de erro): tela de redefinir senha, tela de termos, tela de privacidade, tela de escolha de nome de usuário.
- Garantir que o app funciona e parece cuidado em larguras além do celular (tablet e desktop): sem quebra de layout, sem área morta sem estilo, com os elementos interativos continuando alcançáveis e no tamanho certo.
- Adotar Tailwind CSS para as regras responsivas novas, configurado para ler os tokens de cor/espaçamento/raio já existentes — a ideia é ganhar velocidade nas regras de breakpoint, não reconstruir do zero o que já bate com o design.
- Os elementos flutuantes do mapa (barra de busca, chips de filtro, legenda, botão de adicionar pin) se reposicionam sem sobrepor uns aos outros ou vazar para fora da tela em larguras maiores ou orientação paisagem.

### Should Have

- Comportamento correto do bottom sheet e diálogos quando o celular está em paisagem (conteúdo não corta, continua rolável e fechável).
- Conjunto mais completo de ícones do PWA (hoje só 192x192 e 512x512) para cobertura melhor em diferentes sistemas/navegadores.

### Out of Scope

- Um layout desktop desenhado do zero — o produto continua mobile-first; fora do celular o objetivo é escalar bem, não virar uma experiência diferente.
- Infraestrutura de teste visual (Storybook, captura de screenshot, comparação automática) — segue fora do escopo, como já decidido na PRD anterior.
- Telas de 2FA, upload de foto e seletor de idioma na tela de login — já têm specs próprias (0012, 0013, 0011) e não fazem parte deste ciclo.

## Constraints

- O handoff de design (`docs/design/design_handoff_banheiros/`) não define um segundo breakpoint — qualquer regra de tablet/desktop exige julgamento de implementação (escala fluida, limites sensatos) e não tem mockup de alta fidelidade para conferir pixel a pixel.
- Os tokens já portados (`src/styles/tokens.css`, `components.css`, `app.css`) são a fonte da verdade da aparência aprovada. A configuração do Tailwind precisa apontar para esses valores em vez de introduzir uma paleta ou escala paralela — a portabilidade da 0015 não pode regredir.
- Segue o fluxo já estabelecido do projeto: esta PRD gera spec(s) em `docs/specs/`, que só então viram código via `/dev`.

## Acceptance Criteria

### Telas de fluxo sem estilo
- Dado um usuário pedindo redefinição de senha, quando ele chega na tela de nova senha, então os campos, o botão e as mensagens de sucesso/erro usam os mesmos componentes visuais do resto do app.
- Dado um usuário abrindo o link de Termos ou Privacidade, então a página aparece dentro do visual do app (não HTML cru), legível, com uma ação de voltar consistente com o padrão já usado nas outras telas.
- Dado um usuário novo terminando o cadastro, quando ele chega na tela de escolher nome de usuário, então o formulário segue o mesmo padrão visual da tela de login/cadastro.

### Responsividade
- Dado o app aberto num navegador mais largo que o celular (tablet ou desktop), quando o usuário navega entre Mapa, Favoritos e Perfil, então nada quebra visualmente, não sobra espaço morto sem estilo além da moldura central pretendida, e todo elemento clicável continua acessível e do tamanho certo.
- Dado o app aberto num celular em paisagem, quando a folha de detalhe ou um diálogo está aberto, então o conteúdo não é cortado e continua rolável/fechável.
- Dado o MapScreen aberto em qualquer largura suportada, quando a legenda, os chips de filtro ou o botão de adicionar pin estão visíveis, então nenhum deles se sobrepõe a outro elemento nem vaza para fora da tela.

### Tailwind
- Dado o arquivo de configuração do Tailwind, quando um componente usa uma classe de cor, espaçamento ou raio de borda, então o valor renderizado é idêntico ao token já existente — nenhuma tela já pronta muda de aparência por causa da migração.
