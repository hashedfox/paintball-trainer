export interface KpiInfo {
  emoji: string
  name: { en: string; pt: string; es: string }
  what: { en: string; pt: string; es: string }
  why: { en: string; pt: string; es: string }
  good: { en: string; pt: string; es: string }
  tip: { en: string; pt: string; es: string }
}

type Lang = 'en' | 'pt' | 'es'

export function getKpiField(kpi: KpiInfo, field: 'name' | 'what' | 'why' | 'good' | 'tip', lang: Lang): string {
  return kpi[field][lang] || kpi[field].en
}

export const PLAYER_KPIS: Record<string, KpiInfo> = {
  sur: {
    emoji: '🛡️',
    name: { en: 'Survived (SUR)', pt: 'Sobreviveu (SOB)', es: 'Sobrevivió (SOB)' },
    what: { en: 'Mark Y if the player was alive when the point ended.', pt: 'Marque S se o jogador estava vivo quando o ponto terminou.', es: 'Marca S si el jugador estaba vivo cuando terminó el punto.' },
    why: { en: 'Players who survive contribute to body count advantage. More bodies alive = more lanes controlled = higher chance of winning the point.', pt: 'Jogadores que sobrevivem contribuem para vantagem de corpos. Mais corpos vivos = mais raias controladas = mais chance de ganhar.', es: 'Los jugadores que sobreviven contribuyen a la ventaja de cuerpos. Más cuerpos vivos = más carriles controlados = más posibilidades de ganar.' },
    good: { en: 'Survival rate should be 50%+ across all points. Pro teams average 65-75%.', pt: 'Taxa de sobrevivência deve ser 50%+ em todos os pontos. Times pro têm média de 65-75%.', es: 'La tasa de supervivencia debe ser 50%+ en todos los puntos. Equipos pro promedian 65-75%.' },
    tip: { en: 'If a player\'s survival drops below 40%, review their bunker positioning. They may be overexposing to lanes or not reading opponent setups.', pt: 'Se a sobrevivência cair abaixo de 40%, revise o posicionamento. Pode estar se expondo demais às raias.', es: 'Si la supervivencia baja de 40%, revisa su posicionamiento. Puede estar sobreexponiéndose a los carriles.' },
  },
  otbs: {
    emoji: '🏃',
    name: { en: 'OTB Survived (OTBS)', pt: 'Sobreviveu OTB (OTBS)', es: 'Sobrevivió OTB (OTBS)' },
    what: { en: 'Mark Y if they made it to their primary bunker alive off the break, N if shot running.', pt: 'Marque S se chegou vivo ao bunker primário na saída, N se tomou tiro correndo.', es: 'Marca S si llegó vivo a su bunker primario en la salida, N si fue eliminado corriendo.' },
    why: { en: 'Dying off the break means your team is immediately down a body before the point even starts. OTB survival is the foundation of competitive paintball.', pt: 'Morrer na saída significa que seu time já começa o ponto com desvantagem de corpo.', es: 'Morir en la salida significa que tu equipo empieza el punto con desventaja de cuerpos.' },
    good: { en: 'OTB survival should be 85%+ for experienced players. Below 75% means their slide technique or breakout timing needs work.', pt: 'Sobrevivência OTB deve ser 85%+ para jogadores experientes. Abaixo de 75% indica técnica de slide precisa melhorar.', es: 'La supervivencia OTB debe ser 85%+ para jugadores experimentados. Por debajo de 75% indica que la técnica de deslizamiento necesita trabajo.' },
    tip: { en: 'Film your breakouts and watch the opponent\'s laning patterns. If a player dies OTB repeatedly, their lane may be predictable — change the breakout timing or add a shooter to suppress that lane.', pt: 'Filme suas saídas e observe os padrões de raia do oponente. Se morre repetidamente, mude o timing ou adicione um atirador para suprimir a raia.', es: 'Filma tus salidas y observa los patrones de carril del oponente. Si muere repetidamente, cambia el timing o agrega un tirador para suprimir ese carril.' },
  },
  bd: {
    emoji: '💀',
    name: { en: 'Bunker Died (BD)', pt: 'Bunker da Morte (BD)', es: 'Bunker de Muerte (BD)' },
    what: { en: 'Which bunker was the player at when eliminated. Use standard bunker names (S1, D2, 50, etc.).', pt: 'Em qual bunker o jogador estava quando foi eliminado. Use nomes padrão (S1, D2, 50, etc.).', es: 'En qué bunker estaba el jugador cuando fue eliminado. Usa nombres estándar (S1, D2, 50, etc.).' },
    why: { en: 'Tracking where players die reveals dangerous positions on the field. If everyone dies at the same bunker, that position may have a lane exposure problem.', pt: 'Rastrear onde jogadores morrem revela posições perigosas no campo.', es: 'Rastrear dónde mueren los jugadores revela posiciones peligrosas en el campo.' },
    good: { en: 'No single bunker should account for more than 30% of deaths. Spread across positions indicates good field movement.', pt: 'Nenhum bunker deve ter mais de 30% das mortes. Distribuição indica bom movimento de campo.', es: 'Ningún bunker debe tener más del 30% de las muertes. Distribución indica buen movimiento de campo.' },
    tip: { en: 'If a player dies at D2 every time you run "Stack Right," that play might be leaving the position exposed. Adjust the play or add lane support.', pt: 'Se um jogador morre no D2 toda vez que roda "Stack Right", a jogada pode estar deixando a posição exposta.', es: 'Si un jugador muere en D2 cada vez que ejecutas "Stack Right", la jugada podría estar dejando la posición expuesta.' },
  },
  g1: {
    emoji: '🎯',
    name: { en: 'Breakout Kill (G1)', pt: 'Eliminação na Saída (G1)', es: 'Eliminación en Salida (G1)' },
    what: { en: 'Number of kills the player got during the initial breakout — the first 5-10 seconds of the point.', pt: 'Número de eliminações na saída inicial — os primeiros 5-10 segundos do ponto.', es: 'Número de eliminaciones en la salida inicial — los primeros 5-10 segundos del punto.' },
    why: { en: 'G1 kills create immediate body advantage. Getting a kill off the break is the single highest-impact play in competitive paintball.', pt: 'Eliminações G1 criam vantagem de corpos imediata. É a jogada de maior impacto no paintball competitivo.', es: 'Las eliminaciones G1 crean ventaja de cuerpos inmediata. Es la jugada de mayor impacto en el paintball competitivo.' },
    good: { en: 'Pro players average 0.3-0.5 G1 kills per point. At D3-D4, aim for 0.15-0.25.', pt: 'Jogadores pro têm média de 0.3-0.5 G1 por ponto. No D3-D4, mire 0.15-0.25.', es: 'Jugadores pro promedian 0.3-0.5 G1 por punto. En D3-D4, apunta a 0.15-0.25.' },
    tip: { en: 'Drill snap shooting from your breakout position. The first shot off the break should be aimed at the opponent\'s most predictable lane.', pt: 'Treine snap shooting da sua posição de saída. O primeiro tiro deve mirar a raia mais previsível do oponente.', es: 'Practica snap shooting desde tu posición de salida. El primer tiro debe apuntar al carril más predecible del oponente.' },
  },
  kill: {
    emoji: '⚔️',
    name: { en: 'Total Kills (KILL)', pt: 'Eliminações Totais (ELIM)', es: 'Eliminaciones Totales (ELIM)' },
    what: { en: 'Total number of opponents this player eliminated during the entire point.', pt: 'Número total de oponentes eliminados durante todo o ponto.', es: 'Número total de oponentes eliminados durante todo el punto.' },
    why: { en: 'More kills = fewer opponents on field = easier for your team to take ground and close the point.', pt: 'Mais eliminações = menos oponentes em campo = mais fácil avançar e fechar o ponto.', es: 'Más eliminaciones = menos oponentes en campo = más fácil avanzar y cerrar el punto.' },
    good: { en: 'Average kills per point per player should be 0.6-1.2 depending on position and level.', pt: 'Média de eliminações por ponto por jogador deve ser 0.6-1.2 dependendo da posição.', es: 'Promedio de eliminaciones por punto por jugador debe ser 0.6-1.2 dependiendo de la posición.' },
    tip: { en: 'Track kills by bunker position. If a player racks up kills from one spot, that\'s their "money bunker" — build plays to get them there.', pt: 'Rastreie eliminações por posição de bunker. Se um jogador acumula eliminações de um ponto, esse é o "bunker de ouro" — monte jogadas para colocá-lo lá.', es: 'Rastrea eliminaciones por posición de bunker. Si un jugador acumula eliminaciones desde un punto, ese es su "bunker de oro" — diseña jugadas para llevarlo ahí.' },
  },
  bk: {
    emoji: '📍',
    name: { en: 'Bunker Kills (BK)', pt: 'Bunker das Eliminações (BK)', es: 'Bunker de Eliminaciones (BK)' },
    what: { en: 'Which bunker the player was at when they made their kills.', pt: 'Em qual bunker o jogador estava quando fez suas eliminações.', es: 'En qué bunker estaba el jugador cuando hizo sus eliminaciones.' },
    why: { en: 'Shows which positions on the field are most productive for each player — their power positions.', pt: 'Mostra quais posições do campo são mais produtivas para cada jogador.', es: 'Muestra qué posiciones del campo son más productivas para cada jugador.' },
    good: { en: 'Players should have kills from multiple bunkers, showing adaptability. One-trick ponies are predictable.', pt: 'Jogadores devem ter eliminações de múltiplos bunkers, mostrando adaptabilidade.', es: 'Los jugadores deben tener eliminaciones desde múltiples bunkers, mostrando adaptabilidad.' },
    tip: { en: 'Cross-reference BK with BD data. If a player gets kills at S2 but also dies there often, they\'re taking high-risk/high-reward positions.', pt: 'Compare BK com dados de BD. Se elimina em S2 mas também morre lá, está tomando posições de alto risco/alta recompensa.', es: 'Compara BK con datos de BD. Si elimina en S2 pero también muere ahí, está tomando posiciones de alto riesgo/alta recompensa.' },
  },
  pen: {
    emoji: '🟡',
    name: { en: 'Penalties (PEN)', pt: 'Penalidades (PEN)', es: 'Penalidades (PEN)' },
    what: { en: 'Number of penalties the player received this point (playing on, overshooting, wiping, etc.).', pt: 'Número de penalidades recebidas neste ponto (jogar com hit, atirar demais, limpar, etc.).', es: 'Número de penalidades recibidas en este punto (jugar con hit, disparar de más, limpiar, etc.).' },
    why: { en: 'Penalties are devastating — a single major penalty can cost you the point or the match. They also indicate poor discipline.', pt: 'Penalidades são devastadoras — uma penalidade maior pode custar o ponto ou o jogo.', es: 'Las penalidades son devastadoras — una penalidad mayor puede costar el punto o el partido.' },
    good: { en: 'Pro teams average under 0.5 penalties per match. More than 1 per match at any level is a coaching issue.', pt: 'Times pro têm média abaixo de 0.5 por jogo. Mais de 1 por jogo é um problema de coaching.', es: 'Equipos pro promedian menos de 0.5 por partido. Más de 1 por partido es un problema de coaching.' },
    tip: { en: 'Track which types of penalties each player gets. "Playing on" penalties often mean the player doesn\'t feel their hits — drill hit-check routines.', pt: 'Rastreie que tipos de penalidades cada jogador recebe. "Jogar com hit" geralmente significa que não sente os hits.', es: 'Rastrea qué tipos de penalidades recibe cada jugador. "Jugar con hit" usualmente significa que no siente los impactos.' },
  },
  trd: {
    emoji: '🔄',
    name: { en: '1v1 Trades (TRD)', pt: 'Trocas 1v1 (TRD)', es: 'Intercambios 1v1 (TRD)' },
    what: { en: 'Number of 1v1 trade situations — where the player and an opponent eliminated each other.', pt: 'Número de situações de troca 1v1 — onde o jogador e um oponente se eliminaram mutuamente.', es: 'Número de situaciones de intercambio 1v1 — donde el jugador y un oponente se eliminaron mutuamente.' },
    why: { en: 'Trades keep the body count even. Winning trades (killing after being hit) is a skill. Losing trades consistently means poor reaction time.', pt: 'Trocas mantêm a contagem de corpos igual. Ganhar trocas é uma habilidade.', es: 'Los intercambios mantienen la cuenta de cuerpos igual. Ganar intercambios es una habilidad.' },
    good: { en: 'Trades should be neutral overall. If a player trades frequently but your team wins those points, the trades are strategic.', pt: 'Trocas devem ser neutras no geral. Se seu time ganha esses pontos, as trocas são estratégicas.', es: 'Los intercambios deben ser neutrales en general. Si tu equipo gana esos puntos, los intercambios son estratégicos.' },
    tip: { en: 'Practice bunkering drills — running into a bunker and eliminating the opponent before they can react. This turns trades into pure kills.', pt: 'Pratique drills de bunkering — correr até um bunker e eliminar antes que reajam.', es: 'Practica drills de bunkering — correr hacia un bunker y eliminar antes de que reaccionen.' },
  },
  com: {
    emoji: '📢',
    name: { en: 'Comms Rating (COM)', pt: 'Nota de Comunicação (COM)', es: 'Calificación de Comms (COM)' },
    what: { en: 'Rate the player\'s communication quality from 1 (silent) to 5 (constant, accurate calls).', pt: 'Avalie a comunicação do jogador de 1 (silencioso) a 5 (chamadas constantes e precisas).', es: 'Califica la comunicación del jugador de 1 (silencioso) a 5 (llamadas constantes y precisas).' },
    why: { en: 'Communication is the most underrated skill in paintball. Teams that communicate well make faster decisions and control the field better.', pt: 'Comunicação é a habilidade mais subestimada no paintball. Times que se comunicam bem tomam decisões mais rápidas.', es: 'La comunicación es la habilidad más subestimada en el paintball. Equipos que se comunican bien toman decisiones más rápidas.' },
    good: { en: 'Average comms should be 3.5+ across the team. Pro teams are 4.0+. Below 3.0 means players are playing individually, not as a team.', pt: 'Comms médias devem ser 3.5+ para o time. Pro times são 4.0+. Abaixo de 3.0 significa que jogam individualmente.', es: 'Comms promedio deben ser 3.5+ para el equipo. Equipos pro son 4.0+. Debajo de 3.0 significa que juegan individualmente.' },
    tip: { en: 'Assign specific comms roles: one player calls opponent positions, another calls movement opportunities. Structured comms > everyone yelling.', pt: 'Atribua funções de comunicação específicas: um chama posições, outro chama oportunidades de movimento.', es: 'Asigna roles de comunicación específicos: uno llama posiciones, otro llama oportunidades de movimiento.' },
  },
}

export const TEAM_KPIS: Record<string, KpiInfo> = {
  result: {
    emoji: '🏆',
    name: { en: 'Win/Loss (W/L)', pt: 'Vitória/Derrota (V/D)', es: 'Victoria/Derrota (V/D)' },
    what: { en: 'Did your team win or lose this point?', pt: 'Seu time ganhou ou perdeu este ponto?', es: '¿Tu equipo ganó o perdió este punto?' },
    why: { en: 'The fundamental outcome metric. Everything else is in service of this.', pt: 'A métrica fundamental de resultado.', es: 'La métrica fundamental de resultado.' },
    good: { en: 'Win rate above 55% puts you in contention. Pro teams aim for 65%+.', pt: 'Taxa de vitória acima de 55% te coloca na disputa. Times pro miram 65%+.', es: 'Tasa de victoria arriba de 55% te pone en contención. Equipos pro apuntan a 65%+.' },
    tip: { en: 'Look at win rate by play used — some plays may have significantly higher win rates than others.', pt: 'Veja taxa de vitória por jogada — algumas podem ter taxas significativamente maiores.', es: 'Mira la tasa de victoria por jugada — algunas pueden tener tasas significativamente más altas.' },
  },
  upDownBodies: {
    emoji: '⚖️',
    name: { en: 'Up/Down Bodies (U/D B)', pt: 'Saldo de Corpos (U/D B)', es: 'Saldo de Cuerpos (U/D B)' },
    what: { en: 'Body count difference at the end of the point. Positive = your team had more alive.', pt: 'Diferença de corpos vivos no fim do ponto. Positivo = seu time tinha mais vivos.', es: 'Diferencia de cuerpos vivos al final del punto. Positivo = tu equipo tenía más vivos.' },
    why: { en: 'Body count advantage is the strongest predictor of point outcome. Teams up 2+ bodies win 85%+ of the time.', pt: 'Vantagem de corpos é o maior preditor de resultado. Times com 2+ corpos a mais ganham 85%+ das vezes.', es: 'Ventaja de cuerpos es el mayor predictor de resultado. Equipos con 2+ cuerpos de más ganan 85%+ de las veces.' },
    good: { en: 'Average +1 or better per point is strong. Negative average means your team is consistently outgunned.', pt: 'Média de +1 ou melhor por ponto é forte. Média negativa indica que seu time está em desvantagem.', es: 'Promedio de +1 o mejor por punto es fuerte. Promedio negativo indica que tu equipo está en desventaja.' },
    tip: { en: 'Track when body advantage flips during a point. If you start up but end down, your mid-game positioning needs work.', pt: 'Rastreie quando a vantagem de corpos muda durante o ponto.', es: 'Rastrea cuándo la ventaja de cuerpos cambia durante el punto.' },
  },
  otbCount: {
    emoji: '💥',
    name: { en: 'OTB Body Count', pt: 'Corpos OTB', es: 'Cuerpos OTB' },
    what: { en: 'How many opponents were eliminated during the breakout (first 5-10 seconds).', pt: 'Quantos oponentes foram eliminados durante a saída (primeiros 5-10 segundos).', es: 'Cuántos oponentes fueron eliminados durante la salida (primeros 5-10 segundos).' },
    why: { en: 'OTB kills set the tone. Getting 2+ kills off the break almost guarantees the point.', pt: 'Eliminações OTB definem o tom. 2+ kills na saída praticamente garante o ponto.', es: 'Las eliminaciones OTB definen el tono. 2+ kills en la salida prácticamente garantizan el punto.' },
    good: { en: 'Average 1+ OTB body per point at divisional level, 1.5+ at pro.', pt: 'Média de 1+ corpo OTB por ponto no divisional, 1.5+ no pro.', es: 'Promedio de 1+ cuerpo OTB por punto en divisional, 1.5+ en pro.' },
    tip: { en: 'Analyze which of your breakout plays generate the most OTB kills. Double down on those patterns.', pt: 'Analise quais jogadas de saída geram mais eliminações OTB. Reforce esses padrões.', es: 'Analiza cuáles jugadas de salida generan más eliminaciones OTB. Refuerza esos patrones.' },
  },
  playUsed: {
    emoji: '📋',
    name: { en: 'Play Used', pt: 'Jogada Usada', es: 'Jugada Usada' },
    what: { en: 'Which breakout play your team ran this point (e.g., "Stack Left", "Spread", "Snake Push").', pt: 'Qual jogada de saída seu time executou (ex: "Stack Left", "Spread", "Snake Push").', es: 'Qué jugada de salida ejecutó tu equipo (ej: "Stack Left", "Spread", "Snake Push").' },
    why: { en: 'Tracking plays lets you analyze win rate per play. Some plays work better against certain opponents or on certain layouts.', pt: 'Rastrear jogadas permite analisar taxa de vitória por jogada.', es: 'Rastrear jugadas permite analizar tasa de victoria por jugada.' },
    good: { en: 'Have at least 3-4 distinct plays in your repertoire. Running the same play every time makes you predictable.', pt: 'Tenha pelo menos 3-4 jogadas distintas. A mesma jogada toda vez te torna previsível.', es: 'Ten al menos 3-4 jugadas distintas. La misma jugada cada vez te hace predecible.' },
    tip: { en: 'After 3-4 matches, sort points by play used and compare win rates. Cut plays below 40% win rate and drill alternatives.', pt: 'Após 3-4 jogos, ordene pontos por jogada e compare taxas de vitória.', es: 'Después de 3-4 partidos, ordena puntos por jugada y compara tasas de victoria.' },
  },
}
