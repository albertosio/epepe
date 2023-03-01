/*
  20230104, Alberto Rigato
  estensione della simulazione del SAP-1, Simple As Possible computer
  descritto in Malvino, Brown: Digital Computer Electronics
  con elementi del SAP-2, ma forse non tutti e forse anche dell'altro
  
  il ciclo macchina variabile (già descritto in SAP-1) è implementato, mentre la generazione delle parole di controllo via ROM no: al momento "somiglia" più alla logica della matrice di controllo.
  [[[ not yet  - Il program_counter ha 16 bit, le parole di memoria indirizzabili sono 65536. ]]]
  Per implementare le istruzioni aggiuntive rispetto a SAP-1 ho dovuto aggiungere anche dei segnali aggiuntivi, che estendono la lunghezza delle control word.
  Lp per far leggere al program counter il nibble basso del bus, necessario per JMP. 
  Introduco il flag Z Zero sulle operazioni della ALU con cui potrò implementare JZ e JNZ,
  posto che abbia anche i segnali Lpz e Lpnz, che ipoteticamente vanno in OR all'ingresso del Program_coutner e lo abilitano quando il flag Zero è rispettivamente 1 e 0.
  Per avere INR B e DCR B e altro metto i segnali Tu e Uu da usare in concerto con Su, che determineranno l'operazione per la ALU.
*/

/*
  programma che somma i numeri da 1 a n (n scritto all' indirizzo Ah)
  LDA Ah
  
  
  
*/

empty_program       = ['00000000','00000000','00000000','00000000','00000000','00000000','00000000','00000000','00000000','00000000','00000000','00000000','00000000','00000000','00000000','00000000'];
programma_pag_146   = 
'00001001 00011010 00011011 00101100 1110xxxx 1111xxxx xxxxxxxx xxxxxxxx xxxxxxxx 00010000 00010100 00011000 00100000'.split(' ');
programma_pag_146_rivoltato_con_JMP   =  // necessita di iniziare con program_counter = '0011';
'xxxxxxxx 1110xxxx 1111xxxx 00001001 00011010 00011011 00101100 00110001 xxxxxxxx 00010000 00010100 00011000 00100000 xxxxxxxx xxxxxxxx xxxxxxxx'.split(' ');


function SAP_1_plus(RAM_contents){
  
  var myself = this;
  
  this.ring_word_length = 6;

  this.flags           = { Z: 0};
  // cs -> segnali di controllo. 
  this.cs              = ['Lpnz','Lpz','Lp', 'Cp', 'Ep', 'Lm_', 'CE_', 'Li_', 'Ei_', 'La_', 'Ea',  'Su',  'Tu',  'Uu',  'Eu',  'Lb_', 'Lo_']; 
  this.active_cs       = [ 1,     1,    1,    1,    1,    0,     0,     0,     0,     0,     1,    'x',   'x',   'x',    1,     0,     0   ]; // i rispettivi valori di attivazione dei segnali di controllo, vanno enumerati giacché non sono tutti normalmente-bassi
  this.control_signals = invert_dictionary(this.cs); // questo mi serve per mappare la posizione dei segnali dentro alla parola di controllo

  this.opcodes = {
    LDA : '0000',
    ADD : '0001',
    SUB : '0010',
    JMP : '0011',
    JZ  : '0100',
    JNZ : '0101',
    INR : '0110',
    DCR : '0111',
    OUT : '1110',
    HLT : '1111' };
  this.mnemonics = invert_dictionary(this.opcodes);

  this.t_states = {
    '000001' : [1, 'Fetch   T1 : address state'],
    '000010' : [2, 'Fetch   T2 : increment state'],
    '000100' : [3, 'Fetch   T3 : memory state'],
    '001000' : [4, 'Execute T4 : '],
    '010000' : [5, 'Execute T5 : '],
    '100000' : [6, 'Execute T6 : '] };

  this.nop = '00000111110000011'; // no operation. tutti i bit sono inattivi
  this.cw_matrix = {
    'Fetch' : { '000001': '00001011110000011', '000010': '00010111110000011', '000100': '00000100110000011'},
    'LDA'   : { '001000': '00000011010000011', '010000': '00000101100000011', '100000': this.nop},
    'ADD'   : { '001000': '00000011010000011', '010000': '00000101110000001', '100000': '00000111100000111'},
    'SUB'   : { '001000': '00000011010000011', '010000': '00000101110000001', '100000': '00000111100001111'},
    'JMP'   : { '001000': '00000111010000011', '010000': '00100111110000011', '100000': this.nop},
    'JZ'    : { '001000': '00000111010000011', '010000': '01000111110000011', '100000': this.nop},
    'JNZ'   : { '001000': '00000111010000011', '010000': '10000111110000011', '100000': this.nop},
    'INR'   : { '001000': '00000111010000011', '010000': '00100111110000011', '100000': this.nop},
    'DCR'   : { '001000': '00000111010000011', '010000': '00100111110000011', '100000': this.nop},
    'OUT'   : { '001000': '00000111111000010', '010000': this.nop,            '100000': this.nop},
    'HLT'   : { '001000': this.nop,            '010000': this.nop,            '100000': this.nop}};
    
  this.reset = function(){
    myself.program_counter                  = '0011';
    myself.MAR_register                     = '0000';
    myself.instruction_register             = '00000000';
    myself.accumulator                      = '00000000';
    myself.tmp_register                     = '00000000';
    myself.output_register                  = '00000000';
    myself.W_bus                            = '00000000';
    myself.ring_word                        = '1'.padStart(myself.ring_word_length, '0');
    myself.RAM                              = RAM_contents; };
    
  this.clock = function(esecuzione_verbosa = 0){
    log_console = (esecuzione_verbosa ? console.log : x => 0);
    
    if (read_upper_nibble(myself.instruction_register) == myself.opcodes['HLT']){
      console.log('HLT : Esecuzione terminata.')
      console.log('Ti decodifico il registro output : ' + b2d(myself.output_register))
      return 0;}

    decode_t_state_and_instruction(myself);
    log_console('il controller_sequencer genera la sua control_word');
    var cw = controller_sequencer(myself, read_upper_nibble(myself.instruction_register), 1)
      .split(''); // converto in array la cw così posso indirizzare comodamente i singoli bit 
    if (cw.length == 0){ // è il caso nop, che gestisco terminando questa esecuzione di clock() // // e re invocandone subito un'altra.
      log_console('è una nop, resetto il ciclo macchina');
      // setTimeout(myself.clock, 1000); // ma mediante la setTimeout per lasciare che questa funzione termini senza annidare chiamate.  //// commento perché la setTimeout non vuol saperne di andare.
      return 1;}
    log_console(get_control_signals(myself, cw));
    
      
    if (   (cw[myself.control_signals.Lp]   == myself.active_cs[myself.control_signals.Lp])
        || (cw[myself.control_signals.Lpz]  == myself.active_cs[myself.control_signals.Lpz]  &&  myself.flags.Z)
        || (cw[myself.control_signals.Lpnz] == myself.active_cs[myself.control_signals.Lpnz] && !myself.flags.Z)){
      log_console('Cp : il program_counter prende il valore sul nibble basso del bus');
      myself.program_counter       = read_lower_nibble(myself.W_bus);  }
      
    if (cw[myself.control_signals.Ep]  == myself.active_cs[myself.control_signals.Ep]){ 
      log_console('Ep : il program_counter invia il suo valore sul nibble basso del bus');
      myself.W_bus                 = update_lower_nibble(myself.W_bus, myself.program_counter); }
      
    if (cw[myself.control_signals.Lm_] == myself.active_cs[myself.control_signals.Lm_] ){ 
      log_console('Lm_: il MAR legge dal bus il nibble basso');
      myself.MAR_register         = read_lower_nibble(myself.W_bus); }
    
    if (cw[myself.control_signals.Cp]  == myself.active_cs[myself.control_signals.Cp]){
      log_console('Cp : s\'incrementa il program_counter');
      myself.program_counter       = inc(myself.program_counter); }
    
    if (cw[myself.control_signals.CE_] == myself.active_cs[myself.control_signals.CE_]){ 
      log_console('CE_: la RAM scrive sul bus il valore della cella indirizzata dal MAR');
      myself.W_bus                 = myself.RAM[b2d(myself.MAR_register)]; }
      
    if (cw[myself.control_signals.Li_] == myself.active_cs[myself.control_signals.Li_]){ 
      log_console('Li_: l\'instruction register prende il valore leggendolo dal bus;');
      myself.instruction_register  = myself.W_bus; }
      
    if (cw[myself.control_signals.Ei_] == myself.active_cs[myself.control_signals.Ei_]){ 
      log_console('Ei_: l\'instruction register pone il suo nibble basso sul nibble basso del bus');
      myself.W_bus                 = update_lower_nibble(myself.W_bus, read_lower_nibble(myself.instruction_register));}
    
    if (cw[myself.control_signals.Ea]  == myself.active_cs[myself.control_signals.Ea] ){ 
      log_console('Ea : l\'accumulatore pone il suo valore sul bus');
      myself.W_bus                 = myself.accumulator; }
      
    if (cw[myself.control_signals.Eu]  == myself.active_cs[myself.control_signals.Eu] ){ 
      log_console('Eu : l\'Unità Aritmetica è abilitata a scrivere il suo risultato sul bus');
      var segnale_ALU_composito = cw[myself.control_signals.Su] + cw[myself.control_signals.Tu] + cw[myself.control_signals.Uu];
      if (segnale_ALU_composito == '000' ){ 
        log_console('Su == 00: Si somma');
        calcolo                    = b_sum(myself.accumulator, myself.tmp_register); }
        
      if (segnale_ALU_composito == '001' ){ 
        log_console('Su == 01: Si sottrae');
        calcolo                    = b_sum(myself.accumulator, c2_8b(myself.tmp_register)); }
        
      // if (segnale_ALU_composito == '010' ){
        // log_console('Su == 10: Si incrementa il registro B');
        // calcolo                    = inc(myself.tmp_register); }

      // if (segnale_ALU_composito == '011' ){
        // log_console('Su == 10: Si decrementa il registro B');
        // calcolo                    = dec(myself.tmp_register); }
      
      myself.flags.Z                      = calcolo == '0000000';
      myself.W_bus                 = calcolo; }
    
    if (cw[myself.control_signals.La_] == myself.active_cs[myself.control_signals.La_] ){ 
      log_console('La_: l\'accumulatore prende il suo valore dal bus');
      myself.accumulator           = myself.W_bus; }
      
    if (cw[myself.control_signals.Lb_] == myself.active_cs[myself.control_signals.Lb_] ){ 
      log_console('Lb_: il registro b prende il suo valore dal bus');
      myself.tmp_register            = myself.W_bus; }
      
    if (cw[myself.control_signals.Lo_] == myself.active_cs[myself.control_signals.Lo_]){ 
      log_console('Lo_: il registro output prende il suo valore dall\'accumulatore');
      myself.output_register       = myself.W_bus; }
      
    myself.show_state(); 
    return 1;};

  
  this.show_state = function(){
    log_console('>>> SAP_1_plus computer <<<'.padEnd(30));
    log_console('program_counter'.padEnd(30) + ': ' + myself.program_counter);
    log_console('MAR_register'.padEnd(30) + ': ' + myself.MAR_register);
    log_console('instruction_register'.padEnd(30) + ': ' + myself.instruction_register);
    log_console('accumulator'.padEnd(30) + ': ' + myself.accumulator);
    log_console('tmp_register'.padEnd(30) + ': ' + myself.tmp_register);
    log_console('output_register'.padEnd(30) + ': ' + myself.output_register);
    log_console('===== BUS ====='.padEnd(30) + ': ' + myself.W_bus);
    show_complete_small_RAM(myself);  };  }


const calcolatore_SAP_1_plus = new SAP_1_plus(programma_pag_146_rivoltato_con_JMP);

calcolatore_SAP_1_plus.reset();
// do {} while (calcolatore_SAP_1_plus.clock());