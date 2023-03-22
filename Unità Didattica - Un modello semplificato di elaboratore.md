# *Un modello semplificato di elaboratore*

### Alberto Rigato, 2023

## Unità didattica per una Terza Superiore Tecnica, indirizzo Informatico, laboratorio di Sistemi e Reti

N° ore necessarie: da esplorare

#### Introduzione
 Con questa unità didattica voglio descrivere con un buon grado di approfondimento l'architettura di un calcolatore rudimentale all'estremo, descritto in [Malvino 1993] [^mv] come SAP-1, Simple As Possible (Computer). Le gravi limitazioni tecniche di questo calcolatore lo rendono, nella sua semplicità, un soggetto ideale per una trattazione scolastica.
 
 [^mv]: Malvino, Brown. Digital Computer Electronics, Terza edizione 1993, Glencoe/McGraw Hill
 
  

####  Caratteristiche di SAP-1

| | |
|:---                              |---:  |
| bus                |               8 bit|
| RAM                |            16 byte |
| Registri |                              |
| MAR e Program Counter           | 4 bit |
| Accumulator, B, IR, Output      | 8 bit |
| Unità Aritmetica      | somma e sottrae |
| Istruzioni :                      | LDA |
|                                   | ADD |
|                                   | SUB |
|                                   | OUT |
|                                   | HLT |

Le istruzioni sono da 1 byte ciascuna: 4 bit per l'opcode e 4 bit per l'eventuale operando. L'input viene fornito scrivendo direttamente la RAM, tramite 2 dip switch: uno da 4 leve per indirizzarla, uno da 8 per fornirle il contenuto del byte. Quando entrambi sono impostati, la pressione di un pulsante abilita la scrittura di *quel* byte a *quell*'indirizzo.
Quando il programma è tutto in memoria, con un pulsante è possibile passare all'esecuzione, automatica o passo-passo.
L'output viene scritto in un registro e reso visibile da 8 LED, collegati a ciascuno dei suoi bit.

Le cinque istruzioni disponibili permettono appena di leggere un byte dalla memoria, sommare due operandi, farne la differenza, scrivere sul registro di output e terminare.
Il funzionamento è governato dall'Unità di Controllo, che a ogni impulso di clock emette la *parola di controllo*, ovvero i segnali con cui abilitare i giusti componenti a leggere e a scrivere sul bus, determinati in base allo stato del contatore ad anello, per la fase di fetch, e anche dall'istruzione corrente, nella fase di esecuzione.

#### I momenti dell'azione didattica:
- Frontale
- Pratico
- Riscontro
- Verifica

#### Momento frontale
esso comprenderà:
- l'esibizione di uno schema logico del calcolatore
- la descrizione dei componenti e del loro ruolo
- la descrizione della sequenza di passi che porta a eseguire il fetch
- la descrizione della sequenza di passi che porta a eseguire ognuna delle 5 istruzioni
- la corrispondenza tra il nome mnemonico delle istruzioni e il corrispondente opcode a 4 bit
- un'osservazione sul fatto che, per quanto distante dalla loro idea di computer, questa macchina è *programmabile*, quindi il suo comportamento non è determinato dal produttore ma è impostabile dall'utente.


Eventualmente, tempo e ricettività dei ragazzi permettendo, mi piacerebbe anche aggiungere, magari in collaborazione con il collega di telecomunicazioni:
- cenni ai componenti elettronici che rendono possibile la realizzazione hardware del sistema
- cenni alle porte logiche, e a come queste rappresentino tabelle di verità
- cenni al fatto che, con il semplice cablaggio opportuno di porte logiche, è possibile realizzare circuiti digitali che implementano funzioni binarie *arbitrarie*
- descrizione della generazione delle parole di controllo (via rete logica)
- dandone poi un'interpretazione in termini di *microistruzioni*
- un approccio alternativo alla generazione delle microistruzioni con lettura da ROM
- descrizione della reazione dei componenti ai segnali della parola di controllo
- permettendo così anche di spiegare come, aggiungendo componenti e segnali, sia possibile implementare nuove istruzioni che amplino le possibilità del calcolatore (o che ne riducano le limitazioni, in questo caso)

Ausilio didattico:
Un glossario dei termini e dei concetti rilevanti incontrati nel corso della trattazione.


#### Momento pratico
Dopo la lezione frontale prevedo una fase di programmazione del calcolatore, che intendo contrabbandare come gioco a gruppi.
Il gioco comprende:

- un tabellone, nello stile dei giochi da tavolo, con lo schema logico dei componenti, su foglio A4 o meglio A3.
- un foglio di istruzioni, in cui sono dettagliati tutti i passi esecutivi delle istruzioni già visti in precedenza, nonché gli opcode binari delle istruzioni.
- un obiettivo (diverso per ogni gruppo): la realizzazione di un programma, da assemblare a mano, che esegua una sequenza di somme e sottrazioni, facendo riferimento a tabellone e istruzioni.

Una volta che i gruppi abbiano prodotto il loro programma, farò scambiare ai gruppi tra loro obiettivo e programma, così che ogni gruppo *verifichi* il programma scritto da un altro, decodificandone ed eseguendone le istruzioni passo per passo e riportando sul tabellone l'evoluzione dello stato di registri, bus e RAM. Magari calcolando somme e sottrazioni direttamente in binario, per imitare *davvero* il computer.

Non disponendo (ancora) di un modello fisico funzionante del SAP-1, ne ho scritto un simulatore software. Pertanto, dopo eventuali osservazioni e correzioni dei gruppi sui programmi altrui, sarà possibile verificarli dandoli in input al simulatore, che ne sancirà o meno la correttezza in modo oggettivo.


#### Fase di riscontro 
riflessioni indirizzate dal docente:
- sull'emersione di un comportamento complesso dalla connessione di componenti più semplici
- sulla indistinguibilità tra un byte di istruzione/operando e uno di dati
- sul bus come soluzione comunicativa tra i componenti
- sulla utilità di ulteriori registri
  + e di ulteriori calcoli disponibili alla ALU
  + e di nuove istruzioni, come i salti, che aprano alla possibilità di riciclare istruzioni tramite subroutine
- sulla necessità di avere periferiche di input e di output più umane, e ipotesi su come realizzarle
- sulla distanza concettuale tra i linguaggi di programmazione che i ragazzi già conoscono rispetto all'unico linguaggio che la macchina intende
- sulla scomodità di scrivere il linguaggio macchina, che palesa l'utilità di un programma intermedio che assembli da sé le istruzioni mnemoniche
- sulla assenza, in questo calcolatore, di un sistema operativo, e sui vantaggi dati dall'averne uno


#### Fase di verifica
 - da osservazione diretta dello svolgimento del "gioco" 
 - eventuale verifica-lampo (possibilmente orale) sull'acquisizione dei termini del glossario
 - eventuale redazione di una relazione sull'attività svolta
 


Conoscenze/competenze auspicabili:
- il concetto di processore come esecutore sequenziale 
- il concetto di registro
- il concetto di bus
- il concetto di istruzione
- il concetto di fetch ed esecuzione
- la capacità di definire la sequenza di istruzioni SAP-1 necessarie a eseguire un calcolo assegnato
- la capacità di assemblare a mano un programma mnemonico per SAP-1
- la capacità di prevedere i passi esecutivi di SAP-1, dato un programma


#### Osservazioni a posteriori
L'attività è stata svolta in circa 7 ore.
La parte frontale ha richiesto circa 3 ore, quella pratica 2.

L'attività pratica è stata svolta in modo globalmente positivo, con diversi gruppi che hanno prodotto su carta programmi poi rivelatisi funzionanti sul simulatore. Anche la correzione dei programmi, svolta da ciascun gruppo su un elaborato di altri, ha evidenziato una buona capacità di osservazione, e ha portato alla effettiva rilevazione degli errori commessi.

Subito prima della verifica, visto che materialmente era passata una settimana, ho riservato del tempo al chiarimento di dubbi e a un riepilogo dei concetti chiave della trattazione.

La verifica consisteva in un modulo Google con 14 domande a risposta aperta breve.

Al netto di varie imprecisioni linguistiche, la verifica ha evidenziato una comprensione mediamente accettabile, con una distribuzione vagamente simile alla normale. Una domanda sull'Unità di Controllo mi ha evidenziato l'ambiguità del termine "controllo", che in effetti nella lingua corrente ha due significati quasi in opposizione tra loro, riscontrabili nelle frasi 
 - "L'imputato aveva il pieno controllo di sé" (controllo come "manifestazione di arbitrio") 
 - "Sto controllando il meteo" (controllo come "acquisizione di conoscenza circa un fenomeno")
Questa ambiguità non mi era evidente, e siccome solo il primo dei significati è quello appropriato al contesto, in futuro ne dovrò tenere conto sottolineandolo.

Ritengo che, a seguito dell'attività pratica, della verifica e ancor più della successiva correzione, le conoscenze/competenze auspicabili siano state conseguite dalla maggioranza della classe.

Non ho fornito il glossario, ma tra i materiali ho reso disponibile il pdf del libro in nota. Nonostante sia in inglese e di livello universitario, alcuni lo hanno effettivamente usato come riferimento per lo studio.
Sono convinto che, se avessi fornito il glossario, la verifica sarebbe avuto esito mediamente migliore.

Dallo svolgimento dell'attività pratica ho tuttavia notato di non essere riuscito a trasmettere in profondità il fatto che l'esecuzione di un'istruzione-macchina emerga dalla reazione dei componenti ai segnali emessi in sequenza dall'Unità di Controllo.
Questo probabilmente perché ho descritto le istruzioni associandole fin da subito alla rispettiva mnemonica assembly e al suo significato in termini di effetti sullo stato dei registri e della memoria, senza sufficiente enfasi sul fatto che quegli effetti erano a loro volta conseguenza dei segnali di controllo. Dovrò in futuro porre questa enfasi.