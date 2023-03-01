// pigiando SHIFT - P si esporta in svg pro stampa su lastra di carta

// `

// DAFAR
// scrivere il glossario
// implementare i dip switch per scrivere la ram e il pulsante per eseguire co anche il flag passo-passo


var n_bit_bus                   = 8,
    n_bit_indirizzamento        = 4,
    coordinata_filo             = [],
    registro_box_w              = 160,
    registro_box_h              =  70,
    additivo_direzionale_x_fili = {sx: 0, dx: registro_box_w, su: 40, giu: 40},
    additivo_direzionale_y_fili = {sx: -2, dx: 0, su: 40, giu: registro_box_h},
    freccina_palesante_indirizzamento = {},
    caratteristiche_peculiari_freccine_palesanti = {
      MAR_register :   {colore: 'green', pos_x_relativa:  0, pos_y_relativa: 11}, 
      program_counter: {colore: 'red',   pos_x_relativa: 12, pos_y_relativa: 11}};
      
    bus_e_alberino_presenti = 0;
    
for (filo = 0; filo < n_bit_bus; filo++)
  coordinata_filo[filo] = 10 + 8 * filo;

  var misure_RAM = {
      h_cella             :  40, 
      w_cella             : 150,
      sfrp                :   5,  //sfalsamento del rettangolone perimetrale che dà lustro alla RAM
      sfy                 :  12, // sfalsamento y da etichetta
      sfx_cell_content    :  30,
      sfy_cell_content    :  40 * 0.7,  // h_cella * 0.7, empirico
      larghezza_y_livello :  40,
      pos_x               :   0,
      pos_y               :   0 };
  
function set_prop(obj, dict_prop){
  obj.fillColor = 'black';
  obj.fontSize  = '12pt';
  obj.fontFamily  = 'impact';
  for (p in dict_prop)if (dict_prop.hasOwnProperty(p)){
    obj[p] = dict_prop[p];}
}

function display_bus(){
  var  larghezza_bus = view.size.width ,  // coeff empirico per tentativo di stampa che riempia un A4
         altezza_bus = view.size.height; 
    
  for (filo = 0; filo < n_bit_bus; filo++)
    var path = new Path.Rectangle({
      from:[coordinata_filo[filo], coordinata_filo[filo]], 
      to:  [larghezza_bus - coordinata_filo[filo], altezza_bus - coordinata_filo[filo]], 
      radius: [72 - coordinata_filo[filo], 72 - coordinata_filo[filo]],
      strokeColor: 'black'});
}

function fili_collegamento(direzione, coord_partenza_x, coord_partenza_y, coordinata_arrivante, quanti_fili){
  console.log(direzione+' '+coord_partenza_x+' '+coord_partenza_y+' '+quanti_fili);
  // coordinata_arrivante è 0 se mi voglio attaccare al bus, altro d'acconcio altrimenti 
  if (direzione == 'sx'){
    for (filo = 0; filo < quanti_fili; filo++){
      new Path({segments: [
        [coord_partenza_x, coord_partenza_y + coordinata_filo[filo]],
        [coordinata_arrivante + coordinata_filo[filo], coord_partenza_y + coordinata_filo[filo]]], 
        strokeColor : 'black'}).smooth();
      new Path.Circle({
        center: [coordinata_arrivante + coordinata_filo[filo], coord_partenza_y + coordinata_filo[filo]],
        radius: 2, strokeColor: 'black',fillColor: 'black'}); } }
  if (direzione == 'dx'){
    for (filo = 0; filo < quanti_fili; filo++){
      new Path({segments: [
        [coord_partenza_x, coord_partenza_y + coordinata_filo[filo]],
        [view.size.width - coordinata_arrivante - coordinata_filo[filo], coord_partenza_y + coordinata_filo[filo]]], 
        strokeColor : 'black'}).smooth();
      new Path.Circle({
        center: [view.size.width - coordinata_arrivante - coordinata_filo[filo], coord_partenza_y + coordinata_filo[filo]],
        radius: 2, strokeColor: 'black',fillColor: 'black'}); } }
  if (direzione == 'su'){
    for (filo = 0; filo < quanti_fili; filo++){
      new Path({segments: [
        [coord_partenza_x  + coordinata_filo[filo], coord_partenza_y],
        [coord_partenza_x  + coordinata_filo[filo], coordinata_arrivante + coordinata_filo[filo]]], 
        strokeColor : 'black'}).smooth();
      new Path.Circle({
        center: [coord_partenza_x  + coordinata_filo[filo], coordinata_arrivante + coordinata_filo[filo]],
        radius: 2, strokeColor: 'black',fillColor: 'black'}); } } 
  if (direzione == 'giu'){
    for (filo = 0; filo < quanti_fili; filo++){
      new Path({segments: [
        [coord_partenza_x  + coordinata_filo[filo], coord_partenza_y],
        [coord_partenza_x  + coordinata_filo[filo], view.size.height - coordinata_arrivante - coordinata_filo[filo]]], 
        strokeColor : 'black'}).smooth();
      new Path.Circle({
        center: [coord_partenza_x  + coordinata_filo[filo], view.size.height - coordinata_arrivante - coordinata_filo[filo]],
        radius: 2, strokeColor: 'black',fillColor: 'black'}); } } } 

function display_registro(nome, pos_x, pos_y, contenuto, direzione_dei_fili_al_bus, segnali){
  var sfy  =   8; // sfalsamento_y_da_etichetta
      
  fili_collegamento(
    direzione_dei_fili_al_bus, 
    pos_x + additivo_direzionale_x_fili[direzione_dei_fili_al_bus], 
    pos_y + additivo_direzionale_y_fili[direzione_dei_fili_al_bus],
    0,
    ((nome == 'Program counter' || nome == 'MAR') ? n_bit_indirizzamento : n_bit_bus) );

      
  text_label    = new PointText({
    point      : [pos_x, pos_y + (direzione_dei_fili_al_bus!='su' ? - sfy : registro_box_h + sfy + 16 /* 16 è per compensare l'altezza del font */) ],
    content    : nome,
    fontSize   : '16pt',
    fontFamily : 'impact' } );
  
  new Path.Rectangle({
    point: [pos_x - 4, pos_y - 4],
    size:  [registro_box_w + 8, registro_box_h + 8],
    strokeColor: 'black', fillColor:'white'})
    
  var retangolo = new Path.Rectangle(new Point(pos_x, pos_y), new Size(registro_box_w, registro_box_h));
  set_prop(retangolo, {strokeColor: 'black', fillColor:'white'});
  
  if (nome == 'Program counter'){  // metto un gingillino colorato gemello dell'indicatore di palesa_cella_RAM_indirizzata_da
    new Path.Rectangle({  point: [pos_x + 1, pos_y + 1], size: [12, registro_box_h - 2],
    strokeColor: caratteristiche_peculiari_freccine_palesanti['program_counter'].colore,
    fillColor:   caratteristiche_peculiari_freccine_palesanti['program_counter'].colore});}
  if (nome == 'MAR'){
    new Path.Rectangle({  point: [pos_x + 1, pos_y + 1], size: [12, registro_box_h - 2],
      strokeColor: caratteristiche_peculiari_freccine_palesanti['MAR_register'].colore,
      fillColor:   caratteristiche_peculiari_freccine_palesanti['MAR_register'].colore});}

  if (segnali){
    if (segnali[0]){
      new PointText({
        point      : [pos_x + (registro_box_w - 32), pos_y + 18], 
        content    : segnali[0],
        fontSize   : '12pt'});}
    if (segnali[1]){
      new PointText({
        point      : [pos_x + (registro_box_w - 32), pos_y + registro_box_h - 6], 
        content    : segnali[1],
        fontSize   : '12pt'});}}
    
  var text_content = new PointText({
    point      : [pos_x + (registro_box_w - contenuto.length*12)/2, pos_y + (registro_box_h - 16)/2 + 15], 
    content    : contenuto.length == calcolatore.ring_word_length ? contenuto : separa_nibbles(contenuto),
    fontSize   : '16pt'});

  // console.log(nome);
  // console.log(((nome == 'Program counter' || nome == 'MAR') ? n_bit_indirizzamento : n_bit_bus));

  return {bordo: retangolo, testo: text_content, pos_x: pos_x, pos_y: pos_y};
}


function display_ram(pos_x, pos_y, contenuto, segnali){
  misure_RAM.pos_x = pos_x;
  misure_RAM.pos_y = pos_y;
  
  function display_alberino(){
    
    var n_livelli_alberino  = Math.ceil(Math.log(contenuto.length) / Math.log(2));
    
    function arco_e_circolino(livello, n_cella){
      var coeff_divisorio = Math.pow(2, n_livelli_alberino - livello);
          x1        = pos_x - (n_livelli_alberino - livello) * misure_RAM.larghezza_y_livello,
          y1        = misure_RAM.sfy + pos_y + (Math.floor(n_cella/coeff_divisorio)) * coeff_divisorio * misure_RAM.h_cella + (coeff_divisorio/2) * misure_RAM.h_cella,
          x2        = pos_x - (n_livelli_alberino - livello + 1) * misure_RAM.larghezza_y_livello,
          y2        = misure_RAM.sfy + pos_y + (Math.floor(n_cella/(2 * coeff_divisorio))) * (2 * coeff_divisorio) * misure_RAM.h_cella + coeff_divisorio * misure_RAM.h_cella,
          correzione_indicatore_bit_x = [0, 8 , 9, 8, 8],
          correzione_indicatore_bit_y = [0, 10, 8, 15, 10];
      // new Path.Circle({center: new Point(x2, y2), radius: 4, strokeColor: 'black',fillColor: 'black'});
      new Path.Rectangle({point: [x2-3, y2-3], size: [6, 6], strokeColor: 'black',fillColor: 'black'});
      new Path({segments: [[x1, y1], [x2, y2]], strokeColor : 'black'}).smooth();
      var zero_o_uno = ((n_cella / Math.pow(2, n_livelli_alberino - livello) % 2));
      new PointText({point: [x2 + correzione_indicatore_bit_x[livello], y2 + zero_o_uno * 8 + (zero_o_uno ? correzione_indicatore_bit_y[livello] : -correzione_indicatore_bit_y[livello])], content: zero_o_uno });
      // new Path.Rectangle({point: [x2 + correzione_indicatore_bit_x[livello], y2 + zero_o_uno * 8 + (zero_o_uno ? correzione_indicatore_bit_y[livello] : -correzione_indicatore_bit_y[livello])], size:[1,1], strokeColor: 'black' });
      }

    for (n_cella = 0; n_cella < contenuto.length; n_cella++){
      for (livello_di_archetto_arboreo_tracciando = 0; livello_di_archetto_arboreo_tracciando < n_livelli_alberino; livello_di_archetto_arboreo_tracciando++){
        if (! (n_cella % Math.pow(2, livello_di_archetto_arboreo_tracciando))){
          arco_e_circolino(n_livelli_alberino - livello_di_archetto_arboreo_tracciando, n_cella); } } } }
          
  if (!bus_e_alberino_presenti){
    bus_e_alberino_presenti = 1;
    display_alberino();
    var text_label  = new PointText(new Point(pos_x, pos_y));
    set_prop(text_label, {content : 'RAM', fontSize : '16pt'});
    
    fili_collegamento('dx', pos_x + misure_RAM.w_cella, pos_y + (misure_RAM.h_cella*contenuto.length - 20)/2, 0, n_bit_bus);
    var retangolone_perimetrale = new Path.Rectangle({
      point: [pos_x - misure_RAM.sfrp, pos_y + misure_RAM.sfy - misure_RAM.sfrp],
      size:  [misure_RAM.w_cella + 2 * misure_RAM.sfrp, misure_RAM.h_cella * contenuto.length + 2 * misure_RAM.sfrp]});
    set_prop(retangolone_perimetrale, {strokeColor: 'black', fillColor:'white'});}
    
  var retangolo = [],
  text_contenuto = [];
  for (n_cella = 0; n_cella < contenuto.length; n_cella++){
    retangolo[n_cella] = new Path.Rectangle({
        point: [pos_x, pos_y + n_cella * misure_RAM.h_cella + misure_RAM.sfy], 
        size: [misure_RAM.w_cella, misure_RAM.h_cella],
        strokeColor: 'black', fillColor:'white'});    
    text_contenuto[n_cella] = new PointText(new Point(pos_x + misure_RAM.sfx_cell_content + (misure_RAM.w_cella - contenuto.length*8)/2, misure_RAM.sfy + pos_y + n_cella * misure_RAM.h_cella + misure_RAM.sfy_cell_content));
    set_prop(text_contenuto[n_cella], {content : separa_nibbles(contenuto[n_cella])}); }
  
  if (segnali){
    if (segnali[0]){
      new PointText({
        point      : [pos_x + (misure_RAM.w_cella - 32), pos_y + 28], 
        content    : segnali[0],
        fontSize   : '10pt'});} }
    
  return {bordo: retangolo, testo: text_contenuto};
}

function palesa_cella_RAM_indirizzata_da(che_registro){
  freccina_palesante_indirizzamento[che_registro] =  // new PointText({
    new Path.Rectangle({
    point: [
      misure_RAM.pos_x + caratteristiche_peculiari_freccine_palesanti[che_registro].pos_x_relativa, 
      misure_RAM.pos_y + b2d(calcolatore[che_registro]) * misure_RAM.h_cella + caratteristiche_peculiari_freccine_palesanti[che_registro].pos_y_relativa],
      size: [12, misure_RAM.h_cella - 1 ],
    // content: '###',
    fillColor : caratteristiche_peculiari_freccine_palesanti[che_registro].colore,
    strokeColor: caratteristiche_peculiari_freccine_palesanti[che_registro].colore }); }

function adegua_palesamento_cella_RAM_indirizzata_da(che_registro){
  freccina_palesante_indirizzamento[che_registro].position =    // il 6 e il 20 sono la metà delle dimensioni del rettangolino, e servono perché non ho capito come re-impostare la coordinata top-left (data alla creazione), bensì riesco a manipolare la position, che nasce con le coordinate del centro del rettangolo, quindi è tutto spostato di tanto
    [ 6                          + misure_RAM.pos_x  +  caratteristiche_peculiari_freccine_palesanti[che_registro].pos_x_relativa, 
      21     + misure_RAM.pos_y  + b2d(calcolatore[che_registro]) * misure_RAM.h_cella + caratteristiche_peculiari_freccine_palesanti[che_registro].pos_y_relativa]; }

// Select the path, so we can see its handles:
// path.fullySelected = true;
SAP_grafico = {};
function disponi_graficamente_stato_SAP(calcolatore){
  SAP_grafico.bus                   = display_bus();
  fili_collegamento('sx', 940, 340-4, 450 + registro_box_w, n_bit_bus);  // sono i fili dall'accumulatore all'ALU. Baro, vedi fili MAR -> RAM (in particolare il 450 è un numero empirico (dev'essere più di ... ma non troppo ))
  fili_collegamento('dx', 200 + registro_box_w, 340-4, 1250, n_bit_bus);  // sono i fili dal registro B all'ALU, vedi riga supra. anche 1250 è empirico, e bada che è contato dal lato DESTRO della view
  fili_collegamento('dx', 200 + registro_box_w, 150-4, 1250, n_bit_bus);  //  fili dal registro istruzione all'Unità di Controllo, vedi
  fili_collegamento('sx', 790 , 150, 600, n_bit_bus);  // fili dal contatore circolare all'Unità di Controllo, vedi [600 empirico]
  SAP_grafico.instruction_register  = display_registro('Registro Istruzione', 200, 150, calcolatore.instruction_register, 'sx', ['Li_', 'Ei_']);
  SAP_grafico.ring_counter          = display_registro('Contatore circolare', 790, 150, calcolatore.ring_word, '');
  SAP_grafico.accumulator           = display_registro('Accumulatore', 940, 340, calcolatore.accumulator, 'su', ['La_', 'Ea']);
  SAP_grafico.ALU                   = display_registro('ALU', 550, 340, b_sum(calcolatore.accumulator, calcolatore.b_register), 'giu', ['Su', 'Eu']);
  SAP_grafico.b_register            = display_registro('Registro B', 200, 340, calcolatore.b_register, 'sx', ['Lb_']);
  SAP_grafico.output_register       = display_registro('Registro Output', 200, 600, calcolatore.output_register, 'sx', ['Lo_']);
  SAP_grafico.program_counter       = display_registro('Program counter', 1600, 630, calcolatore.program_counter, 'dx', ['Cp', 'Ep']);
  fili_collegamento('sx', 1600, 245, 1400, n_bit_indirizzamento);  // sono i fili dal MAR alla RAM. Baro, perché non arrivano alle coordinate giuste, ma disegnando la RAM *dopo*, essa copre i finali dei fili e li taglia al punto giusto.
  SAP_grafico.MAR_register          = display_registro('MAR', 1600, 220, calcolatore.MAR_register, 'dx', ['Lm_']);
  SAP_grafico.RAM                   = display_ram(1300, 100, calcolatore.RAM, ['CE_']);
  SAP_grafico.CU                    = display_registro('Unità di Controllo', 550, 150, get_active_signals_name(calcolatore));

  if (!flag_disposizione_per_stampa_su_lastra_cartacea){
    dip_switch_input();
    palesa_cella_RAM_indirizzata_da('MAR_register');
    palesa_cella_RAM_indirizzata_da('program_counter');}
  }

function aggiorna_graficamente_stato_SAP(calcolatore){
  SAP_grafico.ring_counter.testo.content          = calcolatore.ring_word;
  SAP_grafico.accumulator.testo.content           = separa_nibbles(calcolatore.accumulator);
  SAP_grafico.ALU.testo.content                   = separa_nibbles(calcolatore.accumulator);
  SAP_grafico.b_register.testo.content            = separa_nibbles(calcolatore.b_register);
  SAP_grafico.program_counter.testo.content       = separa_nibbles(calcolatore.program_counter);
  SAP_grafico.MAR_register.testo.content          = separa_nibbles(calcolatore.MAR_register);
  SAP_grafico.instruction_register.testo.content  = separa_nibbles(calcolatore.instruction_register);
  SAP_grafico.output_register.testo.content       = separa_nibbles(calcolatore.output_register);
  SAP_grafico.CU.testo.content                    = get_active_signals_name(calcolatore);
  SAP_grafico.CU.testo.point                      = [SAP_grafico.CU.pos_x + (registro_box_w - SAP_grafico.CU.testo.content.length*12)/2, SAP_grafico.CU.pos_y + (registro_box_h - 16)/2 + 15]; // riposiziono il testo circa centrato
  adegua_palesamento_cella_RAM_indirizzata_da('MAR_register');
  adegua_palesamento_cella_RAM_indirizzata_da('program_counter');

}

function dip_switch_input(){
    contenuto_cella_ram = [],
      indirizzo_cella_ram = [];
      
      var sg = document.createElement('label');
      document.body.appendChild(sg);
      sg.textContent = 'Contenuto';
      sg.style = 'font-family:Impact;font-size:16pt;position:absolute;top:575px;left:835px;';
      for (i=0; i<8; i++){
        contenuto_cella_ram[i] = document.createElement('input');
        contenuto_cella_ram[i].type = 'checkbox';
        contenuto_cella_ram[i].style = 'position:absolute;top:600px;left:'+(800+i*20)+'px;';
        document.body.appendChild(contenuto_cella_ram[i]);}
      
      sg = document.createElement('label');
      document.body.appendChild(sg);
      sg.textContent = 'Indirizzo';
      sg.style = 'font-family:Impact;font-size:16pt;position:absolute;top:625px;left:845px;';
      
      for (i=0; i<4; i++){
        indirizzo_cella_ram[i] = document.createElement('input');
        indirizzo_cella_ram[i].type = 'checkbox';
        indirizzo_cella_ram[i].style = 'position:absolute;top:650px;left:'+(840+i*20)+'px;';
        document.body.appendChild(indirizzo_cella_ram[i]);}
        
      sg = document.createElement('input');
      document.body.appendChild(sg);
      sg.type = 'button';
      sg.value = 'Imposta cella';
      sg.style = 'font-family:Impact;font-size:16pt;position:absolute;top:675px;left:815px;';
      sg.addEventListener("click",function(e){
          calcolatore.RAM[b2d(estrai_bit_da_sequenza_checkbox(indirizzo_cella_ram))] = estrai_bit_da_sequenza_checkbox(contenuto_cella_ram);
          display_ram(1300, 100, calcolatore.RAM, ['CE_']);
          palesa_cella_RAM_indirizzata_da('MAR_register');
          palesa_cella_RAM_indirizzata_da('program_counter');
      },false);
      
      
      sg = document.createElement('input');
      document.body.appendChild(sg);
      sg.type = 'button';
      sg.value = 'Clock!';
      sg.style = 'font-family:Impact;font-size:16pt;position:absolute;top:500px;left:845px;';
      sg.addEventListener("click",function(e){
        if (calcolatore.clock(1))
          aggiorna_graficamente_stato_SAP(calcolatore);
      },false); 

      sg = document.createElement('input');
      document.body.appendChild(sg);
      sg.type = 'button';
      sg.value = 'Esegui programma';
      sg.style = 'font-family:Impact;font-size:16pt;position:absolute;top:500px;left:200px;';
      sg.addEventListener("click",function(e){
        do {} while (calcolatore.clock());
        aggiorna_graficamente_stato_SAP(calcolatore);
      },false);
}
  

// do {
  // mostra_graficamente_stato_SAP(calcolatore);
  // confirm('?');
// } while (calcolatore.clock());
disponi_graficamente_stato_SAP(calcolatore);
sg = function(){
  if (calcolatore.clock())
    setTimeout(sg, 1000); 
  aggiorna_graficamente_stato_SAP(calcolatore); }
// sg();

function onKeyDown(event){
  if (event.key =='space')
    if (calcolatore.clock(1))
      // aggiorna_graficamente_stato_SAP(calcolatore_SAP_1_plus); 
      aggiorna_graficamente_stato_SAP(calcolatore);
  if (event.character == "P"){
         downloadAsSVG("tabellone_SAP");}
}

var downloadAsSVG = function (fileName){   
   if(!fileName) {
       fileName = "paperjs_example.svg"}
   var url = "data:image/svg+xml;utf8," + encodeURIComponent(paper.project.exportSVG({asString:true}));   
   var link = document.createElement("a");
   link.download = fileName;
   link.href = url;
   link.click();}