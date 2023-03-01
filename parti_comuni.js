invert_dictionary = function(dictionary){ // dato un dizionario o un array, ritorna un dizionario invertendo chiavi e valori 
  var inverted = {}
  for (k in dictionary){
    if (dictionary.hasOwnProperty(k))
      inverted[dictionary[k]] = k;}
  return inverted;}
    
b2d = function(binary_string){
  var num = 0, potenza = 1;
  for (var i=binary_string.length-1; i >= 0 ; i--){
    num+=binary_string.charAt(i) * potenza;
    potenza*=2; }
  return num; }

function estrai_bit_da_sequenza_checkbox(vettuore){
  // return b2d(vettuore.map(v => v.checked ? '1' : '0').join(''))     // con paper.js non posso usare la sintassi compatta per le funzioni
  return vettuore.map(function(v){return v.checked ? '1' : '0'}).join('')
  }
  
b_sum = function(op1, op2){ // sommo due stringhe che rappresentano numeri binari; op2 può essere più breve, in caso xonto zeri
  op1 = op1.split('');
  op2 = op2.padStart(op1.length, '0').split('');
  riporto = 0;
  for (var i = op1.length-1; i >= 0; i--){
    op1[i] -= -op2[i] - riporto;
    riporto = 0;
    if (op1[i] > 1){
      op1[i]    %= 2;
      riporto   =  1; } }
  return op1.join(''); }

c2 = function(n_bit){   // chiusura per generare complementatori a 2 con la lunghezza in bit desiderata
  return function(operando){
    operando = operando.padStart(n_bit, '0').split('');
    for (var i = operando.length-1; i >= 0; i--){
      operando[i] = 1 - operando[i]; }
    return inc(operando.join('')); } }    
c2_8b = c2(8);  // complementatore a 2 su 8 bit

inc   = (operando) => b_sum(operando, '1');  // incremento 
dec   = (operando) => b_sum(operando, c2(operando.length)('1'));  // decremento 


xtr_instr = (instruction, opcode_or_address) => opcode_or_address == 'op'  // estraggo o il primo o il secondo nibble dall'istruzione
  ? instruction.substring(0,4) 
  : instruction.substring(4, 8);


update_ring_word    = (calcolatore, ring_word) => ring_word.substring(1, calcolatore.ring_word_length) + ring_word.charAt(0);

separa_nibbles = (byte_str) => byte_str.substr(0,4) + ' ' + byte_str.substr(4, 4) + ' ' + byte_str.substr(8, 4) + ' ' + byte_str.substr(12, 4);

is_signal_active = (calcolatore, signal_name) => calcolatore.cw[calcolatore.control_signals[signal_name]]  == calcolatore.active_cs[calcolatore.control_signals[signal_name]];

// update_upper_nibble = (a_byte, new_upper_nibble) => new_upper_nibble + a_byte.substring(4, 8);
update_lower_nibble = (a_byte, new_lower_nibble) => a_byte.substring(0, 4) + new_lower_nibble;
read_lower_nibble   = (a_byte)                   => a_byte.substring(4, 8);
read_upper_nibble   = (a_byte)                   => a_byte.substring(0, 4);

// queste son pronte per un eventuale passaggio a bus da 16 bit
// update_upper_byte = (a_word, new_upper_byte) => new_upper_byte + a_word.substring(8, 16);
update_lower_byte = (a_word, new_lower_byte) => a_word.substring(0, 8) + new_lower_byte;
read_lower_byte   = (a_word)                 => a_word.substring(8, 16);
read_upper_byte   = (a_word)                 => a_word.substring(0, 8);


decode_t_state_and_instruction = function(calcolatore){
  log_console('è il tempo ' + calcolatore.ring_word);
  console.log(calcolatore.t_states[calcolatore.ring_word][1] 
  + (calcolatore.t_states[calcolatore.ring_word][0] > 3 // se lo stato è T4 T5 o T6, specifico quale opcode sto eseguendo
    ? calcolatore.mnemonics[read_upper_nibble(calcolatore.instruction_register)]
    : '')); };
    
    
controller_sequencer = function(calcolatore, vmc_enabled=0){
  var current_ring_word = calcolatore.ring_word;
  calcolatore.ring_word  = update_ring_word(calcolatore, current_ring_word);

  // i primi 3 stati T eseguono il fetch e sono indipendenti dall'istruzione - non la conoscono ancora
  if (calcolatore.t_states[current_ring_word][0] < 4) 
    return calcolatore.cw_matrix['Fetch'][current_ring_word];
    
  var opcode               = xtr_instr(read_upper_nibble(calcolatore.instruction_register), 'op');
  var cw = calcolatore.cw_matrix[calcolatore.mnemonics[opcode]][current_ring_word];
  if (vmc_enabled && cw == calcolatore.nop){  // vmc è il ciclo macchina variabile: in presenza di una nop, resetta la ring_word, simulando l'effetto del segnale NOP_ che termina anzitempo il ciclo macchina quando serve (pag. 163)...
    calcolatore.ring_word = '1'.padStart(calcolatore.ring_word_length, '0'); // ...resettando la ring_word
    return '';} // e ritornando vuoto alla clock chiamante, che farò in questo caso abortire
  else
    return cw;  };
  
show_complete_small_RAM = function(calcolatore){
  log_console("  ------------------------------- \n       RAM       \n  ------------------------------- " );
  b_counter = '0000';
  for (var i = 0; i < calcolatore.RAM.length; i++ ){
    log_console( 
        (calcolatore.program_counter == b_counter ? ' PC  --> ' : '         ')
      + (i+' ').padEnd(3) + b_counter + ' - ' +calcolatore.RAM[i] 
      + (calcolatore.MAR_register   == b_counter ? ' <-- MAR'  : ''));
    b_counter = inc(b_counter);}};
    
show_control_signals = function(calcolatore, control_word){
  log_console(control_word.join('       ')); // scrive una riga con la parola di controllo
  log_console(calcolatore.cs.map(v => v.padEnd(8)).join('')); // scrive una riga coi valori di attivazione dei segnali di controllo
  log_console(calcolatore.active_cs.map((v, k) => (v == control_word[k] ? '*' : ' ').padEnd(8)).join(''));} // scrive una riga con un asterisco in corispondenza dei segnali attivi

get_control_signals = function(calcolatore){
  var control_word = calcolatore.cw.split(''); // converto in array la cw così posso indirizzare comodamente i singoli bit 
  var str = control_word.join('       '); // scrive una riga con la parola di controllo
  str += '\n' + calcolatore.cs.map(v => v.padEnd(8)).join(''); // scrive una riga coi valori di attivazione dei segnali di controllo
  str += '\n' + calcolatore.active_cs.map((v, k) => (v == control_word[k] ? '*' : ' ').padEnd(8)).join(''); // scrive una riga con un asterisco in corispondenza dei segnali attivi
  return str;}
  
get_active_signals_name = function(calcolatore){
  var control_word = calcolatore.cw.split(''); // converto in array la cw così posso indirizzare comodamente i singoli bit 
  str = calcolatore.active_cs.map((v, k) => (v == control_word[k] ? calcolatore.cs[k] : '')).filter(v => v!='').join(', '); // scrive i nomi dei segnali attivi ora
  return str;}
  
  