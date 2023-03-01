/*
  20230104, Alberto Rigato
  decente simulazione del SAP-1, Simple As Possible computer
  descritto in Malvino, Brown: Digital Computer Electronics
  la generazione delle parole di controllo via ROM non è implementata: al momento "somiglia" più alla logica della matrice di controllo.
  Essendo il program_counter di 4 bit, le parole di memoria indirizzabili sono 16. "programmi" più lunghi si romperanno.
*/

flag_disposizione_per_stampa_su_lastra_cartacea = true;
flag_disposizione_per_stampa_su_lastra_cartacea = false;

empty_program       = ['00000000','00000000','00000000','00000000','00000000','00000000','00000000','00000000','00000000','00000000','00000000','00000000','00000000','00000000','00000000','00000000'];
very_empty_program  = ['','','','','','','','','','','','','','','',''];
programma_leggi_F_e_mostralo   = 
'00001111 1110xxxx 1111xxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx xxxxxxxx 10011001'.split(' ')
programma_pag_146   = 
'00001001 00011010 00011011 00101100 1110xxxx 1111xxxx xxxxxxxx xxxxxxxx xxxxxxxx 00010000 00010100 00011000 00100000 xxxxxxxx xxxxxxxx xxxxxxxx'.split(' ')

function SAP_1(RAM_contents){
  
  var myself = this;

  this.ring_word_length = 6;

  // cs -> segnali di controllo. 
  this.cs              = ['Cp', 'Ep', 'Lm_', 'CE_', 'Li_', 'Ei_', 'La_', 'Ea',  'Su',  'Eu',  'Lb_', 'Lo_']; 
  this.active_cs       = [ 1,    1,    0,     0,     0,     0,     0,     1,     1,     1,     0,     0   ]; // i rispettivi valori di attivazione dei segnali di controllo, vanno enumerati giacché non sono tutti normalmente-bassi
  this.control_signals = invert_dictionary(this.cs); // questo mi serve per mappare la posizione dei segnali dentro alla parola di controllo

  this.opcodes = {
    LDA : '0000',
    ADD : '0001',
    SUB : '0010',
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

  this.nop = '001111100011'; // cw per la no operation. tutti i bit sono inattivi
  this.cw_matrix = {
    'Fetch' : { '000001': '010111100011', '000010': '101111100011', '000100': '001001100011'},
    'LDA'   : { '001000': '000110100011', '010000': '001011000011', '100000': this.nop},
    'ADD'   : { '001000': '000110100011', '010000': '001011100001', '100000': '001111000111'},
    'SUB'   : { '001000': '000110100011', '010000': '001011100001', '100000': '001111001111'},
    'OUT'   : { '001000': '001111110010', '010000': this.nop,       '100000': this.nop},
    'HLT'   : { '001000': this.nop,       '010000': this.nop,       '100000': this.nop}};
    
  
  this.reset = function(){
    myself.program_counter                  = '0000';
    myself.MAR_register                     = '0000';
    myself.instruction_register             = '00000000';
    myself.accumulator                      = '00000000';
    myself.b_register                       = '00000000';
    myself.output_register                  = '00000000';
    myself.W_bus                            = '00000000';
    myself.ring_word                        = '1'.padStart(myself.ring_word_length, '0');
    myself.cw                               = this.nop;
    myself.RAM                              = RAM_contents; };

  this.reset_per_stampa = function(){
    myself.program_counter                  = '0000';
    myself.MAR_register                     = '    ';
    myself.instruction_register             = '        ';
    myself.accumulator                      = '        ';
    myself.b_register                       = '        ';
    myself.output_register                  = '        ';
    myself.W_bus                            = '        ';
    myself.ring_word                        = '1'.padStart(myself.ring_word_length, '0');
    myself.cw                               = this.nop;
    myself.RAM                              = RAM_contents; };
    
   
  
  this.clock = function(esecuzione_verbosa = 0){
    log_console = (esecuzione_verbosa ? console.log : x => 0);
    
    if (read_upper_nibble(myself.instruction_register) == myself.opcodes['HLT']){
      console.log('HLT : Esecuzione terminata.')
      console.log('Ti decodifico il registro output : ' + b2d(myself.output_register))
      return 0;}

    decode_t_state_and_instruction(myself);
    log_console('il controller_sequencer genera la sua control_word');
    myself.cw = controller_sequencer(myself);
    log_console(get_control_signals(myself));
      
    if (is_signal_active(myself, 'Ep')){ 
      log_console('Ep : il program_counter invia il suo valore sul nibble basso del bus');
      myself.W_bus                 = update_lower_nibble(myself.W_bus, myself.program_counter); }
      
    if (is_signal_active(myself, 'Lm_')){ 
      log_console('Lm_: il MAR legge dal bus il nibble basso');
      myself.MAR_register         = read_lower_nibble(myself.W_bus); }
    
    if (is_signal_active(myself, 'Cp')){ 
      log_console('Cp : s\'incrementa il program_counter');
      myself.program_counter       = inc(myself.program_counter); }
    
    if (is_signal_active(myself, 'CE_')){ 
      log_console('CE_: la RAM scrive sul bus il valore della cella indirizzata dal MAR');
      myself.W_bus                 = myself.RAM[b2d(myself.MAR_register)]; }
      
    if (is_signal_active(myself, 'Li_')){ 
      log_console('Li_: l\'instruction register prende il valore leggendolo dal bus;');
      myself.instruction_register  = myself.W_bus; }
      
    if (is_signal_active(myself, 'Ei_')){ 
      log_console('Ei_: l\'instruction register pone il suo nibble basso sul nibble basso del bus');
      myself.W_bus                 = update_lower_nibble(myself.W_bus, read_lower_nibble(myself.instruction_register));}
    
    if (is_signal_active(myself, 'Ea')){ 
      log_console('Ea : l\'accumulatore pone il suo valore sul bus');
      myself.W_bus                 = myself.accumulator; }
      
    if (is_signal_active(myself, 'Eu')){ 
      log_console('Eu : l\'Unità Aritmetica è abilitata a scrivere il suo risultato sul bus');
        
      if (is_signal_active(myself, 'Su')){ 
        log_console('Su attivo: Si sottrae');
        myself.W_bus               = b_sum(myself.accumulator, c2_8b(myself.b_register)); }
      else{ 
        log_console('Su inattivo: Si somma');
        myself.W_bus               = b_sum(myself.accumulator, myself.b_register); } }
    
    if (is_signal_active(myself, 'La_')){ 
      log_console('La_: l\'accumulatore prende il suo valore dal bus');
      myself.accumulator           = myself.W_bus; }
      
    if (is_signal_active(myself, 'Lb_')){ 
      log_console('Lb_: il registro b prende il suo valore dal bus');
      myself.b_register            = myself.W_bus; }
      
    if (is_signal_active(myself, 'Lo_')){ 
      log_console('Lo_: il registro output prende il suo valore dall\'accumulatore');
      myself.output_register       = myself.W_bus; }
      
    myself.show_state(); 
    return 1;};
  
  this.show_state = function(){
    log_console('>>> SAP_1 computer <<<'.padEnd(30));
    log_console('program_counter'.padEnd(30) + ': ' + myself.program_counter);
    log_console('MAR_register'.padEnd(30) + ': ' + myself.MAR_register);
    log_console('instruction_register'.padEnd(30) + ': ' + myself.instruction_register);
    log_console('accumulator'.padEnd(30) + ': ' + myself.accumulator);
    log_console('b_register'.padEnd(30) + ': ' + myself.b_register);
    log_console('output_register'.padEnd(30) + ': ' + myself.output_register);
    log_console('===== BUS ===== '.padEnd(30) + ': ' + myself.W_bus);
    show_complete_small_RAM(myself);  };  }

if (flag_disposizione_per_stampa_su_lastra_cartacea){
  calcolatore = new SAP_1(very_empty_program);
  calcolatore.reset_per_stampa();}
else{
  // calcolatore = new SAP_1(empty_program); 
  // calcolatore = new SAP_1(programma_pag_146);
  calcolatore = new SAP_1(programma_leggi_F_e_mostralo);
  calcolatore.reset();}


// do {} while (calcolatore.clock());