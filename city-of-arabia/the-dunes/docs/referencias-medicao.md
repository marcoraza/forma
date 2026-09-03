# Referência Gucci Monte Carlo: medição e comparação com as takes v2

Data: 2026-08-30. Nada foi gerado nesta tarefa. A referência Loro Piana SS26 foi descartada por ordem do Marco; só a Gucci entra aqui.

Pipeline: ffmpeg EBUR128, envelope RMS, detecção de ataques (limiar adaptativo, refratário 120 ms), autocorrelação do fluxo espectral para BPM, energia < 250 Hz por FFT, centroide espectral, detecção de seção por salto de RMS (≥ 4 dB) ou de centroide (≥ 35 %) entre janelas de 1 s. Nenhum arquivo foi escutado; tudo abaixo é medição e leitura de espectrograma.

Arquivos:

| Nome | Fonte | Duração | Formato |
|---|---|---|---|
| gucci-monte-carlo.wav | Gucci Monte Carlo. Trilha: Fred Bongusto "Amore Fermati" 1963, Paolo Conte "Via con me" 1981, Bon Entendeur "Le temps est bon" 2018 | 84,5 s | 48 kHz estéreo |
| v2-a takeA-f11632bb.mp3 | Mood A Saudade Solar, Suno | 45,0 s | MP3 |
| v2-a takeB-0fa1edfc.mp3 | Mood A Saudade Solar, Suno | 44,9 s | MP3 |
| v2-b takeA-42bcd626.m4a | Mood B Long Line, Suno | 43,1 s | M4A |
| v2-b takeB-f907b609.m4a | Mood B Long Line, Suno | 45,1 s | M4A |

Espectrograma da referência: `spec-gucci-monte-carlo.png` nesta pasta.

## 1. Gucci Monte Carlo

Três músicas coladas na edição. A medição enxerga as três costuras.

| Métrica | Valor |
|---|---|
| LUFS integrado / LRA / true peak | −15,0 / 7,5 / −0,6 dBTP |
| Grave < 250 Hz por terço | 17,3 % / 14,6 % / 19,9 % |
| Centroide espectral por terço | 2129 / 2159 / 2000 Hz |
| Primeiros 10 s vs bloco mais alto | −7,5 dB |
| Ataques/s 1º quarto vs 4º quarto | 2,60 / 2,93 |
| Último ataque forte | 83,8 s (pulsa até o fim) |
| Silêncio final | 0,0 s (corte seco no frame) |

BPM por janela de 10 s (confiança entre parênteses):

| 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 |
|---|---|---|---|---|---|---|---|---|
| 90 (0,13) | 196 (0,28) | 164 (0,45) | 164 (0,44) | 164 (0,49) | 164 (0,43) | 196 (0,51) | 97 (0,61) | 196 (0,57) |

Leitura: abertura **sem grade** (confiança 0,13, é o Bongusto rubato), miolo em ~164 (ou 82 em meio-tempo, o Conte), trecho final em ~97 (ou 195 em dobro, o Bon Entendeur). São três andamentos, um por música. A mudança de andamento vem da **edição**, não do arranjo.

RMS por 10 s (dB): −19,9 / −15,5 / −13,3 / −16,4 / −12,5 / −16,1 / −14,7 / −12,7 / −13,8
Ataques/s por 10 s: 2,70 / 2,30 / 2,90 / 3,10 / 2,70 / 3,30 / 3,50 / 2,50 / 2,65

Mudanças de seção detectadas (16 eventos em 85 s, uma a cada ~5 s):

| s | Evento | Leitura |
|---|---|---|
| 8 | fecha agudo | fim da abertura |
| 12 | cai −5 dB | respiro |
| 18 | fecha agudo | transição |
| 21 | cai −5 dB | **costura 1**: vão vertical no espectrograma em ~19,5 s |
| 25 | sobe +5 dB | segunda música instala |
| 33 | abre agudo | |
| 38 | cai −7 dB | **costura 2**: vão em ~35,5 s |
| 41 | cai −5 dB | |
| 44 | abre agudo | |
| 51 | fecha agudo | |
| 66 | sobe +4 dB | |
| 70 | cai −7 dB | **costura 3**: vão em ~66 s, terceira música entra |
| 73 | sobe +6 dB | |
| 76 / 79 | fecha / abre agudo | |
| 83 | cai −4 dB e abre agudo | último gesto, corte seco |

O que o espectrograma mostra: agudo aberto até ~16 kHz o tempo inteiro, bandas bem separadas, e **três silêncios verticais** (19,5 s, 35,5 s, 66 s) que são a edição trocando de música. Grave baixo e constante (14 a 20 %). Peça leve, aguda, quase sem sub. Centroide em ~2100 Hz, o mais brilhante de tudo que foi medido nesta sessão.

## 2. As takes v2 com as mesmas métricas

| Métrica | v2-a A | v2-a B | v2-b A | v2-b B |
|---|---|---|---|---|
| LUFS / LRA / peak | −13,0 / 6,0 / −0,4 | −14,2 / 5,4 / −2,0 | −13,7 / 6,7 / −1,0 | −11,2 / 7,5 / −0,3 |
| BPM por 10 s | 83 / 83 / 83 / 83 / 61 | 83 / 82 / 83 / 82 / 83 | 128 / 128 / 85 / 125 / 196 | 83 / 85 / 196 / 125 / 125 |
| Confiança BPM (faixa) | 0,12 a 0,58 | 0,31 a 0,43 | 0,43 a 0,53 | 0,47 a 0,62 |
| RMS por 10 s (dB) | −12,2 / −13,1 / −11,8 / −12,1 / −14,9 | −16,6 / −14,1 / −14,6 / −13,6 / −12,0 | −14,7 / −13,8 / −14,4 / −11,2 / −14,3 | −15,4 / −12,3 / −9,3 / −8,9 / −7,8 |
| Ataques/s por 10 s | 1,3 / 2,2 / 2,8 / 3,1 / 4,8 | 1,9 / 2,1 / 2,1 / 2,5 / 1,8 | 2,0 / 3,0 / 2,8 / 2,7 / 3,5 | 2,4 / 2,7 / 2,8 / 4,0 / 2,9 |
| Grave < 250 Hz por terço | 49 / 65 / 46 % | 70 / 50 / 46 % | 36 / 26 / 32 % | 37 / 47 / 30 % |
| Centroide por terço (Hz) | 504 / 880 / 1138 | 528 / 1058 / 1074 | 1023 / 1104 / 1473 | 1069 / 846 / 1354 |
| Primeiros 10 s vs máximo | −0,4 dB | −4,6 dB | −3,5 dB | −7,6 dB |
| Mudanças de seção | 11 em 45 s | 10 em 45 s | 6 em 43 s | 11 em 45 s |
| Último ataque forte | 37,3 s | 41,7 s | 38,2 s | 44,8 s |
| Silêncio final | 0,02 s | 0,02 s | 0,01 s | 0,00 s |

## 3. O que a Gucci tem que as takes não têm

| Dimensão | Gucci | Takes v2 (as 4) | Diferença |
|---|---|---|---|
| **Abertura pequena** | −7,5 dB abaixo do pico, RMS −19,9 nos primeiros 10 s | −0,4 a −7,6 dB; a v2-a A abre já no volume final | A Gucci entra pequena e cresce. Três das quatro takes nascem cheias. A única que abre em −7,6 (v2-b B) cresce sem parar até −7,8 dB no fim, o oposto do arco. |
| **Andamento que muda** | 3 andamentos (rubato → ~82/164 → ~97), cada um de uma música | 1 andamento fixo por take (83 ou 125 a 128), confiança nunca abaixo de 0,3 | A Gucci troca de andamento porque troca de música na edição. O Suno trava um andamento por geração. A saída para The Dunes é a mesma da Gucci: **cortar, não gerar**. |
| **Abertura sem grade** | confiança de BPM 0,13 nos primeiros 10 s | 0,27 a 0,47 nos primeiros 10 s | O Bongusto abre rubato, sem pulso. Nenhuma take abre sem pulso. |
| **Vales que ficam caídos** | 3 costuras com vão vertical (19,5 / 35,5 / 66 s) e quedas de −5 a −7 dB que duram até a música seguinte entrar | quedas de −4 a −11 dB que se recuperam no compasso seguinte | A Gucci cai e fica caída por 2 a 4 s. As takes caem e sobem em 1 s. |
| **Peso de grave** | 15 a 20 % | **26 a 70 %** | As takes têm o dobro a o quádruplo de energia grave. O "pedal profundo" e o "sub suave" do prompt saíram como peso. A Gucci é quase sem sub: é música de época, gravação leve. |
| **Brilho** | centroide ~2100 Hz constante | 500 a 1500 Hz, clareando ao longo da peça | A Gucci é aguda o tempo todo (vintage, cordas e voz no médio-agudo). As takes começam escuras demais (504 e 528 Hz na v2-a) e só clareiam no fim. |
| **Tipo de mudança** | 16 mudanças em 85 s, a maioria de **volume** (±5 a 7 dB) | 6 a 11 em ~45 s, a maioria de **timbre** (abre e fecha agudo) com o volume quase parado | Mesma frequência de eventos. Tipo diferente: a Gucci respira em volume; as takes trocam cor mantendo o nível. |
| **Ataques/s** | 2,3 a 3,5, estável | 1,3 a 4,8, com tendência a crescer | A Gucci mantém densidade constante e muda o volume. As takes mantêm o volume e mudam a densidade. É a lógica oposta. |
| **Loudness** | −15,0 LUFS, peak −0,6 | −11,2 a −14,2 LUFS, peak −0,3 a −2,0 | Todas as takes estão de 1 a 4 LU mais altas que a referência. |
| **Corte final** | seco, 0,0 s de silêncio, pulsando até o fim | seco, 0,00 a 0,02 s | Igual. As takes já terminam sem fade, como pedido. |

## 4. O que isso diz sobre o caminho

A Gucci não desacelera por arranjo. Ela **troca de música três vezes** e cada música tem seu andamento; a sensação de mudança de tempo vem do corte, com um vão vertical de silêncio na costura. É a mesma técnica que o brief de The Dunes pede ("hard cut no frame") aplicada três vezes em 85 s.

Quatro coisas que a Gucci tem e nenhuma das 40+ gerações desta sessão teve:

1. **Trecho sem grade** (confiança de BPM 0,13). O Suno nunca desceu de 0,27.
2. **Andamento que muda** de verdade. O Suno trava um por geração. Para mudar, é preciso gerar duas peças e cortar, como a Gucci faz.
3. **Grave leve** (15 a 20 %). As takes carregam de 26 a 70 %. É prompt: "deep pedal", "sub", "low strings" viram peso. A Gucci prova que uma peça pode soar cara sem sub.
4. **Brilho alto e estável** (~2100 Hz). As takes ficam entre 500 e 1500 Hz. É prompt e é master: o Suno escurece.

Os itens 1 e 2 são de estrutura e a solução é a da própria Gucci: gerar cada movimento como peça separada (45 s, uma tarefa por peça) e montar na edição com o vão de silêncio na costura. Os itens 3 e 4 são de prompt e de master: tirar "sub", "deep" e "low" do Style, pedir registro médio-agudo, e cortar abaixo de 60 Hz na edição.

A loudness (−15 LUFS, LRA 7,5) das takes já está no mesmo campo da Gucci. Isso não é o problema.
