# Design v2 — prompt de iteração sobre o handoff v1

**Date:** 2026-08-02
**Status:** Pronto para rodar na ferramenta de design

Prompt abaixo. Cole junto com o handoff v1 (`design_handoff_banheiros/`) como contexto.

---

Itere sobre o handoff v1 do app Banheiros. Mantenha as telas, os fluxos, a copy PT/EN, a estrutura de chaves i18n e a tipografia (Caprasimo para títulos, Figtree para corpo) exatamente como estão, exceto pelas mudanças listadas. Entregue no mesmo formato do v1: protótipo clicável + README de handoff.

## 1. Re-tema de cores (afeta todas as telas)

Substitua a paleta atual (terracota como accent principal, sage como accent-2) por:

- **Principal: verde** e **secundário: um segundo verde**, com contraste elegante entre os dois (não apenas claro/escuro do mesmo tom; pense num verde profundo e num verde mais claro/acinzentado que convivam bem).
- **Accent: laranja**, reservado para destaques e ações de ênfase.
- Gere as ramps 100→900 dos três, harmonizadas entre si e com o fundo, e re-derive as cores de água do mapa para não brigar com os verdes.
- Re-mapeie os usos: decida o que fica com cada verde e onde o laranja entra (CTAs, FAB, badges de pago/favorito, pins por categoria). Pins de banheiro público e comercial precisam continuar distinguíveis entre si à primeira vista, e nenhum pode ser confundível com o círculo verde de localização do usuário (item 5).
- Verifique contraste AA de texto sobre as novas cores.

## 2. Correções na tela de Auth (login e cadastro)

- O botão de olho (mostrar/ocultar senha) está desalinhado verticalmente dentro do campo, tanto no login quanto no cadastro. Centralize-o em relação ao input.
- O ritmo vertical entre o botão "Entrar", o divisor "ou" e o botão "Continuar com Google" está ruim. Redefina com espaçamento consistente da escala de space tokens, com o divisor respirando igualmente para os dois lados.
- Remova a nota sobre verificação em duas etapas das telas de login e cadastro. 2FA não aparece mais na auth (ver item 4).

## 3. Cadastro: sem nome, username sugerido

- Remova o campo "Nome". A identidade da conta é só o username.
- Ordem dos campos: email → username → senha → confirmar senha → termos.
- O campo de username vem pré-preenchido com uma sugestão derivada do email: raul@gmail.com sugere "raul"; se ocupado, "raul1", e assim por diante. Sempre editável. Desenhe os estados: sugestão aceita, usuário digitando, username indisponível (mensagem + nova sugestão).
- Atualize o helper text do username: ele agora é obrigatório, e a escolha de exibi-lo nas avaliações continua sendo do usuário.
- Ajuste o Perfil em cascata: avatar usa a inicial do username, e a linha de identificação mostra @username + email (não existe mais nome).

## 4. Nova tela: oferta de 2FA pós-primeiro-login

- Após o primeiro login com conta confirmada, uma tela opcional oferece ativar a verificação em duas etapas: explicação curta do benefício, CTA para ativar e um "Pular por enquanto" proeminente.
- Ativar leva ao fluxo de enrollment (QR + código de 6 dígitos); pular vai direto ao mapa. A tela não reaparece; o 2FA continua acessível no Perfil.

## 5. Mapa: localização do usuário

- Ao entrar, o mapa centra na melhor informação de localização disponível: posição precisa, senão região aproximada, senão a região padrão de cobertura.
- Com localização ativa, a posição do usuário aparece como um **círculo verde** (dot com halo, estilo "você está aqui"), visualmente distinto dos pins de banheiro em forma e cor.

## Fora do escopo desta iteração

Não mude: bottom sheet e seus gestos, compositor de avaliação, favoritos, filtros e legenda, fluxo de adicionar pin, estrutura de navegação por abas.
