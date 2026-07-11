# PRD: Jogo da Cobrinha V1

## Visao Geral

Este documento formaliza a V1 do jogo da cobrinha implementado como aplicacao estatica em navegador, usando apenas HTML, CSS e JavaScript puro. O produto deve ser executado localmente pela abertura de `index.html`, sem instalacao, sem backend e sem dependencias externas.

O foco desta versao e oferecer uma experiencia arcade simples, com inicio imediato, controles de teclado previsiveis, crescimento progressivo da cobra e aumento gradual de dificuldade conforme a pontuacao sobe.

## Problema e Objetivo

O produto existe para entregar uma versao leve e acessivel do jogo da cobrinha que possa ser aberta rapidamente em qualquer navegador desktop moderno.

Objetivo principal:

- permitir que o usuario inicie uma partida em segundos
- manter regras classicas e faceis de entender
- elevar a tensao da partida com progressao de velocidade baseada em desempenho

## Experiencia do Usuario

Ao abrir a pagina, o usuario encontra:

- titulo e breve descricao do jogo
- HUD com `Score` e `Speed`
- instrucoes de controle
- botao de reinicio
- area principal com o tabuleiro em canvas

O jogo inicia automaticamente ao carregar a pagina. A cobra comeca com 3 segmentos e se move continuamente em uma grade fixa. Cada fruta coletada aumenta a cobrinha em 1 segmento e soma 1 ponto. A cada 3 frutas coletadas, a velocidade sobe para aumentar a dificuldade. A partida termina quando a cobra colide com a parede ou com o proprio corpo. Ao perder, um overlay de game over exibe a pontuacao final e orienta o reinicio por `Enter` ou pelo botao.

## Requisitos Funcionais

### RF-01: Inicializacao

- O jogo deve iniciar automaticamente ao carregar a pagina.
- O estado inicial deve conter cobra com 3 segmentos, direcao inicial para a direita, pontuacao 0 e nivel visual 1.
- Uma fruta deve ser posicionada no tabuleiro logo no inicio da partida.

### RF-02: Movimento

- A cobra deve se mover continuamente em um grid fixo.
- O movimento deve ocorrer em passos discretos por celula.
- Os controles aceitos devem ser setas do teclado e `W`, `A`, `S`, `D`.

### RF-03: Restricao de direcao

- O jogo nao deve permitir reversao imediata de 180 graus na mesma trajetoria.
- Quando o usuario tentar inverter instantaneamente a direcao, o comando deve ser ignorado.

### RF-04: Coleta de fruta

- Quando a cabeca da cobra ocupar a mesma celula da fruta, a fruta deve ser considerada coletada.
- Cada fruta coletada deve aumentar a pontuacao em 1.
- Cada fruta coletada deve aumentar o tamanho da cobra em exatamente 1 segmento.
- Uma nova fruta deve surgir em uma celula livre do tabuleiro.

### RF-05: Progressao de dificuldade

- O jogo deve aumentar a dificuldade reduzindo o intervalo entre ticks do loop principal.
- A progressao deve ocorrer a cada 3 frutas coletadas.
- A velocidade inicial deve ser de 180 ms por tick.
- O intervalo minimo deve ser limitado a 80 ms por tick.

### RF-06: Condicoes de derrota

- O jogo deve encerrar a partida ao colidir com qualquer parede do tabuleiro.
- O jogo deve encerrar a partida ao colidir com qualquer segmento do proprio corpo.
- Ao encerrar a partida, o movimento deve parar.

### RF-07: Feedback de fim de jogo

- Ao perder, o sistema deve exibir um overlay de game over sobre a area do tabuleiro.
- O overlay deve mostrar a pontuacao final e instrucoes de reinicio.

### RF-08: Reinicio

- O usuario deve conseguir reiniciar a partida clicando no botao `Restart Game`.
- O usuario deve conseguir reiniciar a partida pressionando `Enter` apos game over.
- Ao reiniciar, o jogo deve restaurar completamente o estado inicial: cobra, direcao, pontuacao, velocidade, overlay e nova fruta.

### RF-09: Interface visivel

- A interface deve exibir os valores atuais de `Score` e `Speed`.
- O valor de `Speed` deve refletir o nivel visual derivado da progressao da partida.
- O tabuleiro deve ser renderizado em canvas com grade visivel, cobra e fruta distinguiveis visualmente.

## Requisitos Nao Funcionais

### RNF-01: Tecnologia

- A aplicacao deve usar somente `index.html`, `style.css` e `script.js`.
- A aplicacao nao deve depender de bibliotecas ou frameworks externos.

### RNF-02: Execucao

- A aplicacao deve funcionar por abertura direta do arquivo `index.html` em navegador local.
- A aplicacao nao deve exigir servidor, build ou instalacao.

### RNF-03: Compatibilidade

- A experiencia alvo e desktop-first em navegadores modernos com suporte a canvas e JavaScript.
- O layout deve se adaptar de forma basica a larguras menores, sem comprometer a leitura da interface.

### RNF-04: Performance e simplicidade

- O loop do jogo deve ser suficientemente leve para uma execucao fluida em maquinas comuns.
- O estado do jogo deve ser mantido inteiramente em memoria local da pagina.

## Fora de Escopo

Esta V1 nao inclui:

- controles touch para mobile
- persistencia de high score
- pause manual
- efeitos sonoros ou musica
- obstaculos, fases ou mapas alternativos
- multiplayer
- autenticacao, backend ou analytics

## Criterios de Aceite

### CA-01: Carga inicial

- Ao abrir `index.html`, o jogo deve iniciar sem acao adicional do usuario.
- A HUD deve mostrar `Score = 0` e `Speed = 1`.

### CA-02: Controle e movimento

- Pressionar seta ou `W`, `A`, `S`, `D` deve alterar a direcao da cobra de acordo com o eixo valido.
- Tentar inverter instantaneamente a direcao atual nao deve alterar a trajetoria.

### CA-03: Crescimento

- Ao coletar uma fruta, a pontuacao deve aumentar em 1.
- Ao coletar uma fruta, a cobra deve ficar 1 segmento maior do que estava no tick anterior.

### CA-04: Fruta valida

- Uma nova fruta nunca deve aparecer sobre qualquer segmento atual da cobra.

### CA-05: Dificuldade progressiva

- Apos 3 frutas coletadas, a HUD deve indicar aumento de `Speed`.
- O ritmo do jogo deve ficar mais rapido conforme a pontuacao cresce, respeitando o limite minimo configurado.

### CA-06: Game over

- Colidir com a parede deve interromper a partida e exibir o overlay.
- Colidir com o proprio corpo deve interromper a partida e exibir o overlay.
- O overlay deve informar a pontuacao final.

### CA-07: Reinicio consistente

- Clicar no botao de reinicio deve iniciar uma nova partida limpa.
- Pressionar `Enter` apos game over deve iniciar uma nova partida limpa.
- A nova partida deve voltar a `Score = 0`, `Speed = 1` e cobra com 3 segmentos.

## Fonte de Verdade

Para esta V1, o comportamento implementado em `script.js` e a principal fonte de verdade. Em caso de divergencia entre textos auxiliares e o comportamento real do jogo, este PRD deve refletir a implementacao vigente.
