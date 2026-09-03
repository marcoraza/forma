# The Dunes: direção sonora v3

**Data:** 30 de agosto de 2026  
**Filme:** 30 a 45 s, masterplan mediterrâneo, City of Arabia / BEYOND  
**Referência de campanha:** só Gucci Monte Carlo (`https://www.youtube.com/watch?v=F-6CdJ4GOW0`, WAV local 84,5 s)  
**Trilhas creditadas:** Fred Bongusto, *Amore Fermati* (1963); Paolo Conte, *Via con me* (1981); Bon Entendeur vs Isabelle Pierre, *Le temps est bon* (2018, original Isabelle Pierre 1971)  
**Fora:** Loro Piana SS26, pedida e depois descartada pelo Marco. Não entra na análise, na direção nem no prompt.  
**Última rodada:** Suno v5.5, Mood B Long Line (`moods/v2-b-long-line/`), takes *Suspended Lydian*. Feedback do Marco: cara de suspense, falta luxo, o gesto do brief (começar mais intenso e ir desacelerando, o mundo perdendo peso) aparece pouco.

Fonte do brief: seções 1, 2 e 4 de `CITY-OF-ARABIA-THE-DUNES-HANDOFF.md`. Prova da Gucci: créditos do filme, WAV local, espectrograma em `docs/spec-gucci-monte-carlo.png`, BPM por janela no mesmo WAV.

## 1. O que as três faixas têm em comum, e o que a última rodada não fez

As três faixas da Gucci são **discos**, não score. Cada uma tem cantor na frente, pulso que se dança ou se caminha, e o luxo vem da era, da voz e da sala de gravação. O filme da Gucci troca de canção três vezes. A curva dele **esquenta** (intimidade → swing → groove com grave). The Dunes precisa da matéria dessas faixas e da curva invertida: pulso vivo, depois o mundo perder peso.

Corte medido no WAV da Gucci:

| Bloco | Tempo no filme | Faixa | BPM aproximado |
|---|---|---|---|
| 1 | 0–28 s | Bongusto, *Amore Fermati* | ~87 |
| 2 | 28–56 s | Conte, *Via con me* | ~82 sentido / ~165 no swing |
| 3 | 56–85 s | Bon Entendeur vs Isabelle Pierre, *Le temps est bon* | ~98 |

*Amore Fermati* está em mi menor, mas o menor é de serenata, não de thriller: orquestra, crooner perto, “amore, fermati”. *Via con me* é piano, contrabaixo, snaps, voz de fumaça, “it’s wonderful”. *Le temps est bon* é yé-yé de 1971 com grave de 2018: “o tempo está bom, o céu está azul”. As três falam de parar, sair e o tempo ficar leve. O tema do filme já está no repertório. A v2-B tentou dizer a mesma ideia com ostinato de cinema e caiu em suspense.

| Eixo | Gucci (as três juntas) | v2-B Long Line |
|---|---|---|
| **Matéria** | Canção europeia com cantor. Disco de 1963, 1981 e 1971/2018. | Score cinematográfico moderno, ostinato aditivo, título *Suspended Lydian*. |
| **Instrumentação** | Voz na frente. Contrabaixo andando, snaps ou vassouras, piano ou orquestra pequena, guitarra, cordas quentes de sessão. Grave de remix só no terceiro bloco. | Violoncelo e viola em colcheias, pedal grave parado, organ sub, voz sem palavras por baixo, flauta de madeira ao fundo. Sem banda. Sem snaps. |
| **Andamento** | 87 → 82 sentido → 98. Swing humano, pode-se caminhar. A Gucci acelera um pouco no fim. | 126 BPM travado em colcheias. Take A ainda ataca em tempo até ~38 s e só então solta. Take B não solta. Energia da v2-B **sobe** no último terço. O brief pedia o contrário. |
| **Voz** | Canto de verdade, italiano e francês, perto do microfone, personalidade, letra sobre parar e o tempo bom. Isabelle Pierre é seca, um pouco áspera, na frente. | Glossolalia grave, textura, sem vibrato, “close and dark”. Não é canção. Escuta como pad vocal de filme. |
| **Harmonia** | Canção funcional: cadência, refrão, até o menor do Bongusto resolve como serenata. Sol, mar, hotel. | Ré lídio, dois acordes (Ré e Mi) sobre pedal de Ré, sem resolver. Pedal + ostinato + sem resolução = relógio de suspense. |
| **Era** | Easy listening italiano 1963, chanson-jazz 1981, yé-yé 1971 com verniz 2018. | Trilha de filme atual. |
| **Produção** | Fita, sala pequena, voz dry, orquestra ou combo no mesmo espaço, cortes secos entre faixas. Luxo de disco caro. | Reverb largo, estéreo enorme, dinâmica de swell, “organic bow noise”. Luxo de cinema. No take, isso leu thriller, não Monte Carlo. |

O que a Gucci faz e a v2-B não fez, em uma frase: põe um ser humano a cantar sobre um pulso social, em harmonia de canção, numa gravação de era, e trata o tempo como prazer. A v2-B pôs uma célula de cordas a girar sobre um chão que não anda, inchou até o pico e apagou o ostinato. Isso é gesto de filme de tensão, não de masterplan mediterrâneo.

Restrição: o terceiro bloco da Gucci (*Le temps est bon* remix) puxa filtro e grave de pista. O cliente vetou italo disco. Da Isabelle Pierre fica a voz, o sol e o “dam dam dadam”. Do remix de 2018 não fica o four-on-the-floor.

O 5% árabe do brief fica parado nesta rodada. A flauta da v2-B não deu luxo. Primeiro trava voz, pulso e era. O timbre regional, se entrar, entra depois, misturado, sem solo.

## 2. Faixas reais para o cliente

Playlist de sala, não de licença. BPM aproximado, sentido de corpo, não de detector travado em dobro.

| # | Faixa | Ano | BPM aprox. | Por que está aqui |
|---|---|---|---:|---|
| 1 | Fred Bongusto – *Amore Fermati* | 1963 | 87 | Faixa 1 da Gucci. Crooner, orquestra, “para”. O luxo que a v2-B não tinha. |
| 2 | Paolo Conte – *Via con me* | 1981 | 82 sentido (165 swing) | Faixa 2 da Gucci. Snaps, contrabaixo, piano, voz adulta. Pulso social. |
| 3 | Isabelle Pierre – *Le temps est bon* | 1971 | 82 | Original da faixa 3. Sol, voz na frente, tempo como prazer. Preferir esta à versão Bon Entendeur (~98), que puxa pista. |
| 4 | Bruno Martino – *Estate* | 1960 | 83 | Padrão italiano de verão. Jazz de salão, calor, sem folclore. |
| 5 | Nino Ferrer – *Le Sud* | 1975 | 90 | Mediterrâneo como vida, não como cartão postal. Andar, luz, sul. |
| 6 | Ornella Vanoni – *L'appuntamento* | 1970 | 112 | Pulso do começo do filme: vivo, editorial, voz de mulher, ainda canção. |
| 7 | Gino Paoli – *Sapore di sale* | 1963 | 110 | Mar e pele, pop italiano solar, mesmo ano do Bongusto. |
| 8 | Piero Umiliani – *Crepuscolo Sul Mare* | 1969 | 88 | Instrumental da mesma família. Cordas de sessão + pulso. Serve se a voz da Suno escapar para canção. |

Tocar 1, 2, 3 e 6 no mesmo bloco que a v2-B. A diferença de território fica óbvia em um minuto.

Não tocar para o cliente: Poolside, italo disco, trailer, spa, a própria v2-B como se fosse luxo.

## 3. Direção sonora

A trilha de 45 s deve parecer um disco europeu de 1963 a 1981 colocado sobre o filme, não uma trilha de cinema: voz humana dry na frente, snaps e contrabaixo andando enquanto a praça ainda corre, violão nylon, cordas pequenas e quentes, fita, sol, harmonia de canção em tom maior. O pulso entra vivo perto de 112 BPM, social, com corpo. Na segunda metade o groove perde subdivisão de verdade, o baixo alonga, o tempo sentido cai pela metade (~56), o grave sai, o arranjo fica mais leve e o mundo perde peso. Ela levita num acorde maior parado, sem grade, um sopro de voz, e o corte é seco no silêncio, sem fade e sem último hit. Matéria da Gucci, curva do brief: a Gucci aquece; The Dunes esvazia.

Mapa sobre os cinco movimentos do handoff, ainda sem corte fechado:

| Movimento | Tempo alvo no filme de 45 s | Música |
|---|---|---|
| 1. Pulso externo | 0–12 s | 112 BPM, snaps no 2 e no 4, baixo andando, motivo curto de violão, voz já na frente |
| 2. A frase muda o tempo | 12–22 s | ainda em tempo, vassouras e cordas entram, cidade continua |
| 3–4. Presença e o mundo perde peso | 22–35 s | Drop: colcheias saem, half-time ~56, notas longas, grave some, levita |
| 5. Ela levita, hard cut | 35–45 s | sem grade, um acorde maior, sopro, silêncio, corte no logo |

A célula pode ser a mesma nos quatro estados do brief (subdivisão, pulso, half-time, sem grid). O que muda é o peso, não a identidade.

## 4. Prompt Suno v5.5

Colar como está. Contadores: Style 925/1000, Exclude 553/1000.

### Style

```
1963-1981 European luxury song: Italian easy listening and French yé-yé chanson, recording style of Fred Bongusto and Paolo Conte, voice in front like Isabelle Pierre, never a cover. A sunlit Monte Carlo 45-second record, adult and expensive, not a film score. Live analog band on tape: walking double bass, nylon guitar, finger snaps, light brushes, small warm string section, dry close female croon humming with no lyrics. Opens at 112 BPM with a present social pulse, snaps on 2 and 4, bass walking in 4, short guitar motif in front. A major, I-vi-IV-V, cadences resolve. No pedal drone. No ostinato. After the midpoint the groove thins for real: brushes lose the eighths, bass notes stretch to half-time near 56 BPM, strings hold, the mix loses weight and leaves the floor. Final seconds: no grid, one hanging major chord, a breath of voice, hard stop. Close dry vocal, modest room, never cathedral reverb, never trailer.
```

### Lyrics (modo Write, sem palavras; colar só as 4 linhas)

```
[Intro - 112 BPM, finger snaps on 2 and 4, walking double bass, nylon guitar motif, dry close female hum, A major, live and social, nothing cinematic]
[Build - light brushes and small warm strings enter, voice stays human and in front, still 112 BPM, the city still moving]
[Drop - from 0:22 not an EDM drop: drums lose the eighths, bass notes double in length, felt 56 BPM half-time, strings sustain, air opens, the world loses weight, levitation starts]
[Outro - grid gone, one hanging A major chord, voice a breath, then silence, hard cut, no fade, no last hit]
```

### Exclude styles

```
italo disco, filter disco, EDM, trap, 808, four on the floor, house, techno, autotune, rap, shouted vocals, hey chants, comedic, theatrical, novelty, opera, belting, heavy vibrato, angelic choir, new age, glossolalia, cinematic trailer, braams, orchestral hits, brass fanfare, reverse cymbal, minor key, dark, sad, suspense, thriller, horror, cello ostinato, pedal drone, arabic vocals, oud, duduk, tarantella, accordion, fade out, lo-fi hip hop, music box, glockenspiel, bells, celesta, ukulele, whistling, corporate, spa, epic score, wooden flute solo
```

### Config

v5.5, Duration 0:45, Weirdness 10, Style Influence 90, Lyrics mode Write, Vocal Gender Female. 2 takes = um clique no Create. Validar contadores, sliders e Duration antes de clicar.

### Critério (4 itens)

1. Soa a disco europeu caro de 1963–1981, não a score nem a spa: voz dry na frente, snaps ou vassouras, baixo andando, cordas de sessão.
2. Pulso presente e vivo no começo (~112). Depois de ~22 s, desacelera de verdade (half-time). Depois de ~35 s, nada em tempo.
3. A voz é canção sem letra, perto, humana. Nunca glossolalia escura, nunca coro, nunca belting.
4. Tom maior, cadência de canção, sol. Sem pedal lídio, sem dois acordes girando, sem menor de suspense.

Se o take nascer com letra inteligível em italiano ou francês, serve como textura se não virar pastiche (“volare”, “amore”). Se virar canção óbvia, descarta. O corte seco do logo é edição, não o Suno.
