/* Drumul spre Romana — Lesson definitions: the staged structure of each lesson.
 *
 * Pure data. Extracted verbatim from index.html; no logic, no dependencies,
 * nothing here references anything else. Loaded as a classic script before the
 * application, so each name below is a global.
 *
 * These files are split by DOCUMENT ORDER, not by theme, and must stay in that
 * order: tools/_sources.py concatenates them to rebuild the original text so
 * the region markers in check_content.py, check_reuse.py, extract_strings.py
 * and verify_verbs.py keep slicing the same spans. Reordering them, or moving a
 * dataset between files, will silently change what those tools scan.
 */
"use strict";

/* ===================== LESSONS =====================
   A lesson is an ordered list of sections. Section types map 1:1 onto the
   pedagogical stages: context → input → vocab → grammar → practice →
   listening → reading → production → review.  */
var LESSONS = [
{id:"l_u1l1", unitId:"a1_1_u1", levelId:"a1_1", order:1, title:"Salutări", titleEn:"Greetings",
 objective:"Greet people at any time of day, say please and thank you, and choose between formal and informal address.",
 sections:[
  {type:"context", dialogueId:"d_u1l1", note:"Read and listen first. Don't worry about understanding every word — notice how Mihai and Ana open and close the conversation."},
  {type:"grammar", topicId:"g_alphabet", intro:"Romanian spelling is highly regular: once you know the five extra letters, you can pronounce almost any word on sight."},
  {type:"vocab", vocabIds:["w_buna","w_salut","w_bunadim","w_bunaziua","w_bunaseara","w_noapte","w_larevedere","w_pecurand","w_cemaifaci","w_bine","w_terog","w_multumesc","w_cuplacere","w_scuze"]},
  {type:"culture", title:"tu or dumneavoastră?", body:"Romanian distinguishes two levels of address, and choosing wrong is the most common social slip a foreigner makes. Use <b>tu</b> (and greetings like <i>salut, bună</i>) with friends, classmates, children and family. Use <b>dumneavoastră</b> (with <i>bună ziua, vă rog, scuzați-mă</i>) with strangers, older people, officials, shopkeepers and anyone in a professional setting. When in doubt, start with <i>dumneavoastră</i> — Romanians will invite you to switch with the phrase <i>Putem să ne tutuim</i> ('we can use tu'). Note that <i>dumneavoastră</i> always takes plural (voi) verb forms, even for one person."},
  {type:"practice", exerciseIds:["e101","e102","e103"]},
  {type:"listening", exerciseIds:["e104"]},
  {type:"pronunciation", exerciseIds:["e105"]},
  {type:"review", exerciseIds:["e101","e104"]}
 ]},
{id:"l_u1l2", unitId:"a1_1_u1", levelId:"a1_1", order:2, title:"Cine ești? — verbul a fi", titleEn:"Who are you? — the verb a fi",
 objective:"Introduce yourself, say your name and occupation, and use all six present-tense forms of a fi.",
 sections:[
  {type:"context", dialogueId:"d_u1l2", note:"Sarah checks in somewhere. Notice that the receptionist uses the formal 'you' throughout."},
  {type:"grammar", topicId:"g_irregular_verbs", intro:"a fi ('to be') is the single most useful verb in Romanian, and it is completely irregular. Learn all six forms as a block."},
  {type:"grammar", topicId:"g_pronouns_subj", intro:"Once you know the verb endings, you can usually drop the pronoun entirely — and Romanians normally do."},
  {type:"vocab", vocabIds:["w_nume","w_student","w_profesor","w_tara","w_limba","w_avorbi"]},
  {type:"practice", exerciseIds:["e111","e112","e113"]},
  {type:"production", exerciseIds:["e114","e115"]},
  {type:"review", exerciseIds:["e111","e103"]}
 ]},
{id:"l_u1l3", unitId:"a1_1_u1", levelId:"a1_1", order:3, title:"De unde ești?", titleEn:"Where are you from?",
 objective:"Say where you are from and where you live, name nationalities with the right gender, and ask simple questions.",
 sections:[
  {type:"context", dialogueId:"d_u1l3", note:"Three people meet. Listen for how each one states their nationality."},
  {type:"vocab", vocabIds:["w_america","w_romania","w_anglia","w_franta","w_german","w_american","w_englez","w_roman_adj","w_unde","w_cine"]},
  {type:"grammar", topicId:"g_questions", intro:"Romanian has no equivalent of English 'do' in questions — this makes questions simpler than you expect."},
  {type:"practice", exerciseIds:["e121","e122","e123"]},
  {type:"listening", exerciseIds:["e124"]},
  {type:"reading", readingId:"r_u1"},
  {type:"review", exerciseIds:["e112","e121"]}
 ]},
{id:"l_u1l4", unitId:"a1_1_u1", levelId:"a1_1", order:4, title:"Expresii uzuale", titleEn:"Everyday expressions",
 objective:"Use the fixed social formulas Romanians say constantly, and choose the right register for who you're speaking to.",
 sections:[
  {type:"culture", title:"Phrases you cannot build from grammar", body:"Every language has formulas that must be learned whole, and Romanian leans on them heavily. Two are worth singling out. <b>Bine ai venit! → Bine te-am găsit!</b> is a fixed exchange: the welcome always gets that specific reply, and there is no English equivalent. <b>Noroc!</b> does triple duty — 'cheers' when raising a glass, 'good luck' before something difficult, and what you say when someone sneezes. Note also that almost every one of these has a <i>tu</i> and a <i>dumneavoastră</i> form, and the endings tell you which: <b>-ți</b> and <b>vă</b> mark the formal one (<i>scuzați-mă, vă rog</i>, <i>luați loc</i>)."},
  {type:"vocab", vocabIds:["x_pa","x_ozibuna","x_pemaine","x_pediseara","x_pemaitarziu","x_mersi","x_multfrumos"]},
  {type:"vocab", vocabIds:["x_niciopb","x_nufacenimic","x_imiparerau","x_scuzama","x_bineaivenit","x_bineteamgasit","x_ialoc"]},
  {type:"practice", exerciseIds:["e151","e152","e154"]},
  {type:"vocab", vocabIds:["x_noroc","x_succes","x_lamultiani","x_felicitari","x_weekendplacut","x_calatorie"]},
  {type:"practice", exerciseIds:["e153","e155"]},
  {type:"listening", exerciseIds:["e156"]},
  {type:"review", exerciseIds:["e102","e103"]}
 ]},
{id:"l_u2l1", unitId:"a1_1_u2", levelId:"a1_1", order:1, title:"Familia mea — verbul a avea", titleEn:"My family — the verb a avea",
 objective:"Name family members, state ages using a avea, and use possessives correctly.",
 sections:[
  {type:"context", dialogueId:"d_u2l1", note:"Ioana shows Radu a family photo. Notice how ages are expressed."},
  {type:"vocab", vocabIds:["w_familie","w_mama","w_tata","w_sora","w_frate","w_sot","w_bunic","w_copil","w_baiat","w_fata","w_aavea"]},
  {type:"grammar", topicId:"g_gender", intro:"Every Romanian noun carries a gender, and it decides the shape of the words around it."},
  {type:"grammar", topicId:"g_possessives", intro:"Possessives agree with the thing owned, not the owner — the opposite of what English speakers expect."},
  {type:"practice", exerciseIds:["e201","e202","e204"]},
  {type:"grammar", topicId:"g_plural", intro:"Plurals depend on gender and on the noun's final sound."},
  {type:"practice", exerciseIds:["e203"]},
  {type:"reading", readingId:"r_u2"},
  {type:"production", exerciseIds:["e205"]},
  {type:"review", exerciseIds:["e202","e113"]}
 ]},
{id:"l_u2l2", unitId:"a1_1_u2", levelId:"a1_1", order:2, title:"Cum arată? — adjective", titleEn:"What do they look like? — adjectives",
 objective:"Describe people's appearance and character, with adjectives that agree in gender and number.",
 sections:[
  {type:"context", dialogueId:"d_u2l2", note:"Diana describes a new colleague. Listen for the adjective endings."},
  {type:"vocab", vocabIds:["w_inalt","w_scund","w_tanar","w_batran","w_frumos","w_simpatic","w_vesel","w_blond","w_ochi","w_par"]},
  {type:"grammar", topicId:"g_adj_agreement", intro:"Romanian adjectives come in two families: those with four forms and those with two."},
  {type:"practice", exerciseIds:["e211","e212","e213"]},
  {type:"listening", exerciseIds:["e214"]},
  {type:"review", exerciseIds:["e203","e211"]}
 ]},
{id:"l_u3l1", unitId:"a1_1_u3", levelId:"a1_1", order:1, title:"Cât e ceasul?", titleEn:"What time is it?",
 objective:"Tell the time, name the days of the week, and use la for clock times.",
 sections:[
  {type:"context", dialogueId:"d_u3l1", note:"A short exchange about the time before a film."},
  {type:"vocab", vocabIds:["w_ora","w_zi","w_saptamana","w_luna","w_azi","w_maine","w_ieri","w_luni","w_duminica"]},
  {type:"grammar", topicId:"g_numbers", intro:"Romanian numbers are regular, but two things catch learners out: the gendered doi/două, and the de required from twenty upward."},
  {type:"practice", exerciseIds:["e301","e302"]},
  {type:"review", exerciseIds:["e202","e301"]}
 ]},
{id:"l_u3l2", unitId:"a1_1_u3", levelId:"a1_1", order:2, title:"O zi obișnuită", titleEn:"An ordinary day",
 objective:"Describe your daily routine, including reflexive verbs and means of transport.",
 sections:[
  {type:"context", dialogueId:"d_u3l2", note:"Laura describes her typical day. Notice mă trezesc — the pronoun is part of the verb."},
  {type:"vocab", vocabIds:["w_dimineata","w_seara_n","w_serviciu","w_scoala","w_atrezi","w_amanca","w_alucra","w_adormi"]},
  {type:"grammar", topicId:"g_reflexive", intro:"Many everyday Romanian verbs are reflexive where their English equivalents are not."},
  {type:"practice", exerciseIds:["e303","e304","e305"]},
  {type:"reading", readingId:"r_u3"},
  {type:"production", exerciseIds:["e307"]},
  {type:"review", exerciseIds:["e306","e303"]}
 ]},
{id:"l_u4l1", unitId:"a1_1_u4", levelId:"a1_1", order:1, title:"La cafenea — a comanda", titleEn:"At the café — ordering",
 objective:"Order food and drink politely, and say what you like using the dative construction îmi place.",
 sections:[
  {type:"context", dialogueId:"d_u4l1", note:"A short café exchange. Notice how the customer softens every request — Romanian service language leans heavily on <i>aș dori</i> and <i>vă rog</i>."},
  {type:"vocab", vocabIds:["w_cafea","w_ceai","w_apa","w_lapte","w_paine","w_asdori","w_meniu","w_chelner","w_abea"]},
  {type:"grammar", topicId:"g_imi_place", intro:"This is the structure English speakers get backwards most often. Romanian makes the thing you like the subject of the sentence, and puts you in the dative."},
  {type:"practice", exerciseIds:["e601","e602","e603"]},
  {type:"production", exerciseIds:["e604"]},
  {type:"vocab", vocabIds:["w_supa","w_ciorba","w_salata","w_carne","w_peste","w_branza","w_legume","w_fructe","w_mar"]},
  {type:"practice", exerciseIds:["e605"]},
  {type:"listening", exerciseIds:["e606"]},
  {type:"review", exerciseIds:["e602","e301"]}
 ]},
{id:"l_u4l2", unitId:"a1_1_u4", levelId:"a1_1", order:2, title:"La restaurant", titleEn:"At the restaurant",
 objective:"Handle a full restaurant visit: read a menu, order a meal, and ask for the bill.",
 sections:[
  {type:"context", dialogueId:"d_u4l2", note:"Two people order dinner. Listen for how each states a preference before choosing."},
  {type:"vocab", vocabIds:["w_micdejun","w_pranz","w_cina","w_nota","w_bere","w_vin","w_delicios","w_imiplace"]},
  {type:"culture", title:"Eating out in Romania", body:"A Romanian menu usually opens with <b>ciorbă</b> — a sour soup, soured with <i>borș</i> (fermented wheat bran) or lemon, and quite distinct from a clear <b>supă</b>. The two most emblematic dishes are <b>sarmale</b> (cabbage rolls stuffed with minced meat and rice) and <b>mămăligă</b> (polenta), often served with <i>smântână</i> (sour cream) and <i>brânză</i>. Tipping is normal but modest — around 10% — and is usually left in cash even when you pay by card. Asking for <b>nota</b> is standard; staff will rarely bring the bill unprompted, since hurrying diners is considered rude."},
  {type:"reading", readingId:"r_u4"},
  {type:"practice", exerciseIds:["e607","e608","e609"]},
  {type:"production", exerciseIds:["e610"]},
  {type:"review", exerciseIds:["e603","e605"]}
 ]},
{id:"l_u5l1", unitId:"a1_1_u5", levelId:"a1_1", order:1, title:"Cât costă? — prețuri", titleEn:"How much is it? — prices",
 objective:"Ask prices, understand numbers up to several hundred, and use demonstratives to point things out.",
 sections:[
  {type:"context", dialogueId:"d_u5l1", note:"A shop exchange. Notice that the customer never says a bare 'no' — <i>este cam scumpă</i> softens the refusal."},
  {type:"vocab", vocabIds:["w_magazin","w_piata","w_pret","w_catcosta","w_scump","w_ieftin","w_lei","w_bani"]},
  {type:"grammar", topicId:"g_numbers", intro:"Two things trip learners up here: doi/două changing for gender, and the de required from twenty upward."},
  {type:"practice", exerciseIds:["e621","e622"]},
  {type:"grammar", topicId:"g_demonstratives", intro:"To point at something in a shop you need a demonstrative that agrees with the noun."},
  {type:"practice", exerciseIds:["e623","e624"]},
  {type:"listening", exerciseIds:["e625"]},
  {type:"review", exerciseIds:["e202","e622"]}
 ]},
{id:"l_u5l2", unitId:"a1_1_u5", levelId:"a1_1", order:2, title:"Haine și mărimi", titleEn:"Clothes and sizes",
 objective:"Shop for clothes: name garments, give your size, and ask to try something on.",
 sections:[
  {type:"vocab", vocabIds:["w_camasa","w_pantaloni","w_rochie","w_pantofi","w_marime","w_aproba","w_aplati","w_acauta"]},
  {type:"practice", exerciseIds:["e626","e628"]},
  {type:"reading", readingId:"r_u5"},
  {type:"practice", exerciseIds:["e627"]},
  {type:"review", exerciseIds:["e623","e624"]}
 ]},
{id:"l_u6l1", unitId:"a1_1_u6", levelId:"a1_1", order:1, title:"Unde este...? — a cere indicații", titleEn:"Where is...? — asking directions",
 objective:"Name places in a town, ask where something is, and follow directions given to you.",
 sections:[
  {type:"context", dialogueId:"d_u6l1", note:"A tourist asks for the station. Notice the polite <i>Scuzați-mă</i> opening and the voi-form verbs in the reply."},
  {type:"vocab", vocabIds:["w_oras_n","w_strada","w_gara","w_farmacie","w_banca","w_parc","w_muzeu","w_biserica","w_piata"]},
  {type:"grammar", topicId:"g_place_prepositions", intro:"A handful of prepositions covers almost everything you need — but several of them insist on a following de."},
  {type:"practice", exerciseIds:["e641","e642","e643"]},
  {type:"listening", exerciseIds:["e644"]},
  {type:"review", exerciseIds:["e123","e642"]}
 ]},
{id:"l_u6l2", unitId:"a1_1_u6", levelId:"a1_1", order:2, title:"Transport în oraș", titleEn:"Getting around town",
 objective:"Use public transport: name the options, buy a ticket, and say how you travel.",
 sections:[
  {type:"context", dialogueId:"d_u6l2", note:"Choosing between bus and metro. Listen for <i>a lua</i> — the verb Romanians use for taking transport."},
  {type:"vocab", vocabIds:["w_autobuz","w_tramvai","w_metrou","w_bilet","w_alua","w_stanga","w_dreapta","w_drept","w_aproape","w_departe","w_vizavi","w_langa"]},
  {type:"practice", exerciseIds:["e645","e646"]},
  {type:"reading", readingId:"r_u6"},
  {type:"practice", exerciseIds:["e647"]},
  {type:"production", exerciseIds:["e648"]},
  {type:"review", exerciseIds:["e305","e643"]}
 ]},
{id:"l_u7l1", unitId:"a1_1_u7", levelId:"a1_1", order:1, title:"Camerele casei", titleEn:"Rooms of the house",
 objective:"Name the rooms and furniture of a home, and say where things are.",
 sections:[
  {type:"context", dialogueId:"d_u7l1", note:"A viewing. Notice how the agent locates each room relative to another."},
  {type:"vocab", vocabIds:["w_casa_n","w_apartament","w_camera","w_bucatarie","w_baie","w_dormitor","w_sufragerie","w_balcon"]},
  {type:"practice", exerciseIds:["e861"]},
  {type:"vocab", vocabIds:["w_usa","w_fereastra","w_masa_n","w_scaun","w_pat","w_canapea","w_dulap","w_frigider"]},
  {type:"grammar", topicId:"g_place_prepositions", intro:"You met these for directions in town. Inside a home they do the same job at closer range."},
  {type:"practice", exerciseIds:["e862","e863"]},
  {type:"review", exerciseIds:["e642","e213"]}
 ]},
{id:"l_u7l2", unitId:"a1_1_u7", levelId:"a1_1", order:2, title:"De închiriat", titleEn:"For rent",
 objective:"Read a property listing and describe your own home in writing.",
 sections:[
  {type:"vocab", vocabIds:["w_etaj","w_chirie","w_asta"]},
  {type:"listening", exerciseIds:["e864"]},
  {type:"reading", readingId:"r_u7"},
  {type:"practice", exerciseIds:["e865"]},
  {type:"production", exerciseIds:["e866"]},
  {type:"review", exerciseIds:["e862","e622"]}
 ]},
{id:"l_u8l1", unitId:"a1_1_u8", levelId:"a1_1", order:1, title:"Cum e vremea?", titleEn:"What's the weather like?",
 objective:"Describe the weather using impersonal verbs, and name the four seasons.",
 sections:[
  {type:"context", dialogueId:"d_u8l1", note:"A short weather exchange. Notice that <i>plouă</i> has no subject at all."},
  {type:"grammar", topicId:"g_impersonal", intro:"English needs a dummy 'it' for weather. Romanian needs nothing — and adding a pronoun is a clear error."},
  {type:"vocab", vocabIds:["w_vreme","w_soare","w_ploaie","w_zapada","w_vant","w_aploua","w_aninge","w_cald_adj","w_frig"]},
  {type:"practice", exerciseIds:["e881","e882"]},
  {type:"vocab", vocabIds:["w_anotimp","w_primavara","w_vara_n","w_toamna","w_iarna_n"]},
  {type:"practice", exerciseIds:["e883"]},
  {type:"review", exerciseIds:["e303","e861"]}
 ]},
{id:"l_u8l2", unitId:"a1_1_u8", levelId:"a1_1", order:2, title:"Prognoza meteo", titleEn:"The weather forecast",
 objective:"Follow a spoken and written forecast, including temperatures and day-by-day changes.",
 sections:[
  {type:"vocab", vocabIds:["w_grad","w_umbrela"]},
  {type:"listening", exerciseIds:["e884"]},
  {type:"reading", readingId:"r_u8"},
  {type:"practice", exerciseIds:["e885"]},
  {type:"production", exerciseIds:["e886"]},
  {type:"review", exerciseIds:["e881","e301"]}
 ]},
{id:"l_a12u1l1", unitId:"a1_2_u1", levelId:"a1_2", order:1, title:"Cu ce te ocupi?", titleEn:"What do you do?",
 objective:"Name occupations without an article, and say how often you do things using frequency adverbs.",
 sections:[
  {type:"context", dialogueId:"d_a12u1", note:"Two people compare jobs and schedules. Count how many frequency words you can spot — there are five."},
  {type:"vocab", vocabIds:["w_meserie","w_medic","w_inginer","w_avocat","w_bucatar","w_sofer","w_programator","w_firma","w_birou","w_coleg"]},
  {type:"practice", exerciseIds:["e701"]},
  {type:"grammar", topicId:"g_frequency", intro:"Romanian marks frequency with a small set of adverbs — and one of them, niciodată, changes the shape of the sentence around it."},
  {type:"vocab", vocabIds:["w_intotdeauna","w_deobicei","w_uneori","w_rar","w_niciodata"]},
  {type:"practice", exerciseIds:["e704","e702","e703"]},
  {type:"review", exerciseIds:["e303","e701"]}
 ]},
{id:"l_a12u1l2", unitId:"a1_2_u1", levelId:"a1_2", order:2, title:"Programul meu de lucru", titleEn:"My working day",
 objective:"Describe a working day from start to finish, combining reflexive verbs with frequency expressions.",
 sections:[
  {type:"vocab", vocabIds:["w_program","w_aincepe","w_atermina","w_aimbraca","w_afacedus"]},
  {type:"practice", exerciseIds:["e705","e706"]},
  {type:"reading", readingId:"r_a12u1"},
  {type:"practice", exerciseIds:["e707"]},
  {type:"production", exerciseIds:["e708"]},
  {type:"review", exerciseIds:["e702","e304"]}
 ]},
{id:"l_a12u2l1", unitId:"a1_2_u2", levelId:"a1_2", order:1, title:"Îmi place să...", titleEn:"I like to...",
 objective:"Talk about hobbies, and say what you like doing using îmi place să + subjunctive.",
 sections:[
  {type:"context", dialogueId:"d_a12u2", note:"Maria and Radu compare hobbies. Notice the difference between <i>îmi place să citesc</i> and <i>îmi plac comediile</i>."},
  {type:"vocab", vocabIds:["w_timpliber","w_aciti","w_aasculta","w_muzica","w_film","w_ateuita","w_carte"]},
  {type:"grammar", topicId:"g_imi_place", intro:"You met this with nouns. Liking an activity works the same way, but always with singular place and a să-clause."},
  {type:"practice", exerciseIds:["e721","e722","e723"]},
  {type:"review", exerciseIds:["e602","e603"]}
 ]},
{id:"l_a12u2l2", unitId:"a1_2_u2", levelId:"a1_2", order:2, title:"Sport și mișcare", titleEn:"Sport and exercise",
 objective:"Talk about sport and exercise, and say how often you do each activity.",
 sections:[
  {type:"vocab", vocabIds:["w_sport","w_ajuca","w_fotbal","w_ainota","w_aalerga","w_agati","w_plimbare"]},
  {type:"practice", exerciseIds:["e724"]},
  {type:"listening", exerciseIds:["e725"]},
  {type:"production", exerciseIds:["e726"]},
  {type:"review", exerciseIds:["e721","e704"]}
 ]},
{id:"l_a12u3l1", unitId:"a1_2_u3", levelId:"a1_2", order:1, title:"La telefon", titleEn:"On the phone",
 objective:"Handle a phone call and give dates correctly, including the irregular first of the month.",
 sections:[
  {type:"context", dialogueId:"d_a12u3", note:"Booking a doctor's appointment by phone. Listen for how the date is said at the end."},
  {type:"vocab", vocabIds:["w_telefon","w_alo","w_asuna","w_araspunde","w_mesaj","w_liber_adj","w_ocupat"]},
  {type:"practice", exerciseIds:["e741"]},
  {type:"grammar", topicId:"g_dates", intro:"Months are lowercase, dates are plain cardinal numbers — with exactly one exception."},
  {type:"vocab", vocabIds:["w_data","w_ianuarie","w_martie","w_iulie","w_septembrie","w_decembrie"]},
  {type:"practice", exerciseIds:["e742","e743"]},
  {type:"review", exerciseIds:["e622","e301"]}
 ]},
{id:"l_a12u3l2", unitId:"a1_2_u3", levelId:"a1_2", order:2, title:"Fac o programare", titleEn:"Making an appointment",
 objective:"Book an appointment, state when you are free or busy, and confirm the arrangement.",
 sections:[
  {type:"vocab", vocabIds:["w_programare","w_asuna","w_liber_adj","w_ocupat"]},
  {type:"practice", exerciseIds:["e744"]},
  {type:"listening", exerciseIds:["e745"]},
  {type:"reading", readingId:"r_a12u3"},
  {type:"practice", exerciseIds:["e746"]},
  {type:"review", exerciseIds:["e742","e743"]}
 ]},
{id:"l_a12u4l1", unitId:"a1_2_u4", levelId:"a1_2", order:1, title:"Ce te doare?", titleEn:"What hurts?",
 objective:"Name parts of the body and describe symptoms using the mă doare construction.",
 sections:[
  {type:"context", dialogueId:"d_a12u4", note:"A pharmacy visit. Notice that the customer never says 'my throat' — Romanian doesn't need the possessive here."},
  {type:"vocab", vocabIds:["w_corp","w_cap","w_gat","w_stomac","w_spate","w_mana","w_picior"]},
  {type:"grammar", topicId:"g_ma_doare", intro:"The same inversion you met with îmi place: the body part is the subject, and you are the object."},
  {type:"practice", exerciseIds:["e761","e762","e764"]},
  {type:"production", exerciseIds:["e763"]},
  {type:"review", exerciseIds:["e602","e722"]}
 ]},
{id:"l_a12u4l2", unitId:"a1_2_u4", levelId:"a1_2", order:2, title:"La farmacie", titleEn:"At the pharmacy",
 objective:"Describe an illness at a pharmacy, ask for medicine, and answer questions about how you feel.",
 sections:[
  {type:"vocab", vocabIds:["w_adurea","w_durere","w_febra","w_raceala","w_medicament","w_reteta","w_asesimti","w_bolnav","w_sanatos"]},
  {type:"practice", exerciseIds:["e766"]},
  {type:"listening", exerciseIds:["e765"]},
  {type:"culture", title:"Pharmacies in Romania", body:"Romanian pharmacies (<b>farmacii</b>) are far more central to everyday healthcare than in many countries. Pharmacists routinely advise on minor complaints and can dispense a good deal without a prescription, so <i>Mă doare gâtul, aveți ceva?</i> is a completely normal opening. Many are open late or non-stop (<b>non-stop</b>), and a green cross marks them. For anything requiring a <b>rețetă</b> you will need to see a <b>medic de familie</b> (family doctor) first — that is the gateway to the public system. Note that <i>farmacie</i> means pharmacy only; a shop selling cosmetics is a <i>drogherie</i>."},
  {type:"production", exerciseIds:["e767"]},
  {type:"review", exerciseIds:["e761","e703"]}
 ]},
{id:"l_a12u5l1", unitId:"a1_2_u5", levelId:"a1_2", order:1, title:"Un bilet, vă rog", titleEn:"One ticket, please",
 objective:"Buy a train ticket, specify one-way or return, and understand platform and time information.",
 sections:[
  {type:"context", dialogueId:"d_a12u5", note:"Buying a ticket. Listen for the platform number and the delay at the end."},
  {type:"vocab", vocabIds:["w_tren","w_peron","w_bilet","w_dusintors","w_loc","w_arezerva","w_bagaj"]},
  {type:"practice", exerciseIds:["e781","e782"]},
  {type:"grammar", topicId:"g_future", intro:"Romanian has a formal future and a colloquial one — and in speech the colloquial form wins overwhelmingly."},
  {type:"practice", exerciseIds:["e783"]},
  {type:"review", exerciseIds:["e646","e305"]}
 ]},
{id:"l_a12u5l2", unitId:"a1_2_u5", levelId:"a1_2", order:2, title:"Anunțuri și întârzieri", titleEn:"Announcements and delays",
 objective:"Understand spoken station announcements, including times, platforms and delays.",
 sections:[
  {type:"vocab", vocabIds:["w_apleca","w_asosi","w_intarziere"]},
  {type:"listening", exerciseIds:["e784"]},
  {type:"reading", readingId:"r_a12u5"},
  {type:"practice", exerciseIds:["e785"]},
  {type:"review", exerciseIds:["e782","e745"]}
 ]},
{id:"l_a12u6l1", unitId:"a1_2_u6", levelId:"a1_2", order:1, title:"Te invit!", titleEn:"You're invited!",
 objective:"Invite someone, accept or decline politely, and arrange a time and place.",
 sections:[
  {type:"context", dialogueId:"d_a12u6", note:"An invitation and a polite refusal on someone else's behalf. Notice <i>din păcate</i>."},
  {type:"vocab", vocabIds:["w_ainvita","w_petrecere","w_dinpacate","w_zidenastere","w_cadou_v"]},
  {type:"practice", exerciseIds:["e801","e802"]},
  {type:"review", exerciseIds:["e744","e741"]}
 ]},
{id:"l_a12u6l2", unitId:"a1_2_u6", levelId:"a1_2", order:2, title:"După petrecere", titleEn:"After the party",
 objective:"Talk about a social event afterwards, using reflexive verbs in the past.",
 sections:[
  {type:"vocab", vocabIds:["w_asedistra","w_asarbatori"]},
  {type:"practice", exerciseIds:["e803"]},
  {type:"production", exerciseIds:["e804"]},
  {type:"review", exerciseIds:["e404","e801"]}
 ]},
{id:"l_a12u7l1", unitId:"a1_2_u7", levelId:"a1_2", order:1, title:"Mai bun, mai ieftin", titleEn:"Better, cheaper",
 objective:"Compare two things directly and pick out the best of a set.",
 sections:[
  {type:"grammar", topicId:"g_comparative_a1", intro:"Romanian builds comparisons with separate words rather than adjective endings — which makes it simpler than English, once you learn which word goes where."},
  {type:"vocab", vocabIds:["w_maidecat","w_celmai","w_lafelde","w_calitate","w_culoare","w_aalege"]},
  {type:"practice", exerciseIds:["e821","e822","e823"]},
  {type:"review", exerciseIds:["e626","e624"]}
 ]},
{id:"l_a12u7l2", unitId:"a1_2_u7", levelId:"a1_2", order:2, title:"Ce aleg?", titleEn:"Which one do I choose?",
 objective:"Read and compare offers, then justify a choice in writing.",
 sections:[
  {type:"reading", readingId:"r_a12u7"},
  {type:"practice", exerciseIds:["e824"]},
  {type:"production", exerciseIds:["e825"]},
  {type:"review", exerciseIds:["e821","e622"]}
 ]},
/* ---- CIVIC TRACK LESSONS ---- */
{id:"l_civ_u1l1", unitId:"civ_u1", levelId:"civic", order:1, title:"Textul jurământului", titleEn:"The text of the oath",
 objective:"Understand the oath clause by clause, and know what every word in it means.",
 sections:[
  {type:"culture", title:"Before you start", body:"This track prepares you for the <b>language and civic-knowledge side</b> of a Romanian citizenship application — most often <i>redobândirea cetățeniei</i>, restoration by descent. It is a study aid, not legal advice. Eligibility, the documents required, where the oath is administered and the exact form of the interview are set by law and by the authority handling your file, and they change. Always confirm the current requirements with the <b>Autoritatea Națională pentru Cetățenie (ANC)</b> or the Romanian consulate handling your case. The oath text itself is fixed in the citizenship law and is reproduced here as it is administered."},
  {type:"reading", readingId:"r_civ_oath"},
  {type:"vocab", vocabIds:["c_juramant","c_ajura","c_credinta","c_devotat","c_patrie","c_popor"]},
  {type:"practice", exerciseIds:["cv101"]},
  {type:"vocab", vocabIds:["c_aapara","c_drept","c_interes","c_arespecta","c_constitutie","c_lege"]},
  {type:"practice", exerciseIds:["cv102","cv103"]},
  {type:"review", exerciseIds:["cv101","cv103"]}
 ]},
{id:"l_civ_u1l2", unitId:"civ_u1", levelId:"civic", order:2, title:"Jurământul din memorie", titleEn:"The oath from memory",
 objective:"Deliver the full oath from memory, at normal speaking pace and with correct pronunciation.",
 sections:[
  {type:"culture", title:"How the oath is delivered", body:"The oath is spoken aloud, standing, at a formal session — at an ANC office in Romania or at a consulate abroad. You will normally repeat it after an official or read it, but being able to say it unaided removes the main source of nerves. Practice it in three breaths, one per <b>să</b>-clause: <i>Jur să fiu devotat… / să apăr… / să respect…</i>. Aim for clear, unhurried delivery rather than speed — the diacritics matter, especially <b>apăr</b> (not <i>apar</i>) and <b>Constituția</b>."},
  {type:"listening", exerciseIds:["cv104"]},
  {type:"production", exerciseIds:["cv105"]},
  {type:"review", exerciseIds:["cv102","cv104"]}
 ]},
{id:"l_civ_u2l1", unitId:"civ_u2", levelId:"civic", order:1, title:"Imnul: strofa întâi", titleEn:"The anthem: first stanza",
 objective:"Recognize the anthem, know its title and author, and follow the first stanza.",
 sections:[
  {type:"vocab", vocabIds:["c_imn"]},
  {type:"practice", exerciseIds:["cv121","cv122"]},
  {type:"reading", readingId:"r_civ_imn"},
  {type:"review", exerciseIds:["cv121"]}
 ]},
{id:"l_civ_u2l2", unitId:"civ_u2", levelId:"civic", order:2, title:"Strofele oficiale", titleEn:"The official stanzas",
 objective:"Follow all four official stanzas and understand who and what they refer to.",
 sections:[
  {type:"culture", title:"Which stanzas are official", body:"<i>Deșteaptă-te, române!</i> was written by <b>Andrei Mureșanu</b> during the 1848 revolution and set to an existing melody attributed to <b>Anton Pann</b>. The full poem has eleven stanzas; on official occasions the <b>first, second, fourth and eleventh</b> are sung. It became the national anthem in 1990, having been sung during the December 1989 revolution. You are not usually expected to sing it — but you should recognize it, know its name and author, and understand roughly what it says."},
  {type:"listening", exerciseIds:["cv124"]},
  {type:"practice", exerciseIds:["cv123"]},
  {type:"review", exerciseIds:["cv122","cv121"]}
 ]},
{id:"l_civ_u3l1", unitId:"civ_u3", levelId:"civic", order:1, title:"Simbolurile naționale", titleEn:"National symbols",
 objective:"Answer confidently on the form of state, capital, language, flag, national day and anthem.",
 sections:[
  {type:"reading", readingId:"r_civ_stat"},
  {type:"vocab", vocabIds:["c_republica","c_capitala","c_steag","c_constitutie","c_lege"]},
  {type:"practice", exerciseIds:["cv141","cv142"]},
  {type:"review", exerciseIds:["cv121"]}
 ]},
{id:"l_civ_u3l2", unitId:"civ_u3", levelId:"civic", order:2, title:"Instituțiile statului", titleEn:"State institutions",
 objective:"Describe Parliament, the President and the Government, and how long terms of office run.",
 sections:[
  {type:"vocab", vocabIds:["c_parlament","c_presedinte","c_guvern"]},
  {type:"practice", exerciseIds:["cv143","cv144"]},
  {type:"review", exerciseIds:["cv141","cv142"]}
 ]},
{id:"l_civ_u4l1", unitId:"civ_u4", levelId:"civic", order:1, title:"Vecini și ape", titleEn:"Neighbours and waters",
 objective:"Name Romania's five neighbours with their directions, plus the main river, sea and mountains.",
 sections:[
  {type:"reading", readingId:"r_civ_geo"},
  {type:"vocab", vocabIds:["c_granita","c_munte","c_fluviu"]},
  {type:"practice", exerciseIds:["cv161","cv162"]},
  {type:"review", exerciseIds:["cv142"]}
 ]},
{id:"l_civ_u4l2", unitId:"civ_u4", levelId:"civic", order:2, title:"Regiuni și orașe", titleEn:"Regions and cities",
 objective:"Place the historical regions and major cities, and read directions on a map in Romanian.",
 sections:[
  {type:"practice", exerciseIds:["cv163"]},
  {type:"culture", title:"The historical regions", body:"Romania's regions carry real cultural weight and come up in conversation constantly. <b>Transilvania</b> in the center and north-west, with strong Hungarian and German heritage; <b>Muntenia</b> (also called Țara Românească) in the south, containing Bucharest; <b>Moldova</b> in the east — distinct from the neighbouring Republic of Moldova, though historically one region; <b>Oltenia</b> in the south-west; <b>Banat</b> and <b>Crișana</b> in the west; <b>Maramureș</b> in the north; and <b>Dobrogea</b> between the Danube and the Black Sea, the most ethnically mixed. Knowing where your own family came from is worth being able to say."},
  {type:"review", exerciseIds:["cv161","cv162"]}
 ]},
{id:"l_civ_u5l1", unitId:"civ_u5", levelId:"civic", order:1, title:"Datele importante", titleEn:"The dates that matter",
 objective:"Match the five most-asked dates to their events, and say them aloud correctly.",
 sections:[
  {type:"reading", readingId:"r_civ_ist"},
  {type:"vocab", vocabIds:["c_unire","c_independenta","c_revolutie"]},
  {type:"practice", exerciseIds:["cv181","cv182"]},
  {type:"review", exerciseIds:["cv142","cv181"]}
 ]},
{id:"l_civ_u6l1", unitId:"civ_u6", levelId:"civic", order:1, title:"Întrebări de interviu", titleEn:"Interview questions",
 objective:"Prepare and deliver answers to the questions asked in almost every interview.",
 sections:[
  {type:"context", dialogueId:"d_civ_interviu", note:"A full mock interview. Notice that the official uses <i>dumneavoastră</i> throughout — reply in the same register."},
  {type:"vocab", vocabIds:["c_cetatenie","c_cetatean","c_redobandire","c_stramos"]},
  {type:"production", exerciseIds:["cv201"]},
  {type:"review", exerciseIds:["cv141","cv182"]}
 ]},
{id:"l_civ_u6l2", unitId:"civ_u6", levelId:"civic", order:2, title:"Dosarul și documentele", titleEn:"Your file and documents",
 objective:"Understand the vocabulary of the paperwork and questions asked about your documents.",
 sections:[
  {type:"vocab", vocabIds:["c_dosar","c_certificat"]},
  {type:"practice", exerciseIds:["cv202"]},
  {type:"listening", exerciseIds:["cv203"]},
  {type:"culture", title:"A word of caution on procedure", body:"Everything in this unit is <b>language preparation</b>. The list of documents, the fees, the waiting times and even which office handles your file depend on your specific route to citizenship and change with some regularity. Treat any procedural detail you read here — including the document names above — as vocabulary to recognize, not as a checklist to act on. For the authoritative list, use the ANC's own published requirements or the consulate handling your case, and consider professional advice if your situation is unusual."},
  {type:"review", exerciseIds:["cv201","cv203"]}
 ]},
{id:"l_a2u1l1", unitId:"a2_1_u1", levelId:"a2_1", order:1, title:"Ce ai făcut în weekend?", titleEn:"What did you do on the weekend?",
 objective:"Talk about completed past events using perfectul compus, including reflexive verbs.",
 sections:[
  {type:"context", dialogueId:"d_a2u1", note:"Sorin and Maria compare weekends. Every past verb here is perfectul compus — see how many you can spot."},
  {type:"grammar", topicId:"g_perfect_compus", intro:"This is the everyday past tense. Romanian, unlike French or German, uses a avea as the auxiliary for every verb without exception."},
  {type:"vocab", vocabIds:["w_weekend","w_calatorie","w_avizita","w_aintalni","w_amintire"]},
  {type:"practice", exerciseIds:["e402","e403","e404"]},
  {type:"listening", exerciseIds:["e405"]},
  {type:"reading", readingId:"r_a2u1"},
  {type:"production", exerciseIds:["e401"]},
  {type:"review", exerciseIds:["e406","e402"]}
 ]},
{id:"l_a2u2l1", unitId:"a2_1_u2", levelId:"a2_1", order:1, title:"Ce planuri ai?", titleEn:"What are your plans?",
 objective:"Talk about future plans, express obligation with trebuie și, and give advice with ar trebui.",
 sections:[
  {type:"context", dialogueId:"d_a2u2", note:"Two colleagues compare summer plans. Notice that neither uses the formal future — it's <i>o să</i> throughout."},
  {type:"vocab", vocabIds:["a_plan","a_anulviitor","a_poimaine","a_curand","a_aspera","a_aintentiona"]},
  {type:"contrast", leftLabel:"Obligation — trebuie", rightLabel:"Advice — ar trebui",
   intro:"One word separates 'you have to' from 'you should'. Read each pair aloud and listen for how much softer the right-hand column is.",
   pairs:[
     ["Trebuie să vorbesc cu șeful.","Ar trebui să vorbesc cu șeful.","I have to talk to my boss.","I should talk to my boss."],
     ["Trebuie să pleci acum.","Ar trebui să pleci acum.","You have to leave now.","You ought to leave now."],
     ["Trebuie să te odihnești.","Ar trebui să te odihnești.","You must rest.","You should rest."]
   ],
   note:"Both take <b>să</b> + subjunctive, and <b>trebuie</b> never changes for person — the verb after <i>să</i> carries that. <b>Ar trebui</b> is simply its conditional form, and it is what you want almost every time you'd say 'should' in English."},
  {type:"vocab", vocabIds:["a_atrebui","a_artrebui"]},
  {type:"practice", exerciseIds:["a201","a202","a203"]},
  {type:"review", exerciseIds:["d_fut1","e783"]}
 ]},
{id:"l_a2u2l2", unitId:"a2_1_u2", levelId:"a2_1", order:2, title:"A ști sau a cunoaște?", titleEn:"To know — which one?",
 objective:"Choose correctly between a ști and a cunoaște, where English has only one verb.",
 sections:[
  {type:"contrast", leftLabel:"a ști — facts & skills", rightLabel:"a cunoaște — people & places",
   intro:"English 'know' splits in two in Romanian. Getting it wrong is immediately noticeable, and the division is completely regular once you see it.",
   pairs:[
     ["Știu răspunsul.","O cunosc pe Maria.","I know the answer.","I know Maria."],
     ["Știu să înot.","Cunosc bine Bucureștiul.","I know how to swim.","I know Bucharest well."],
     ["Nu știu unde este.","Nu cunosc pe nimeni aici.","I don't know where it is.","I don't know anyone here."]
   ],
   note:"<b>A ști</b> takes facts, answers, and <b>să</b>-clauses for skills. <b>A cunoaște</b> takes people and places you are acquainted with — and because a person is a specific direct object, it drags <b>pe</b> and a doubling pronoun with it: <i>o cunosc pe Maria</i>."},
  {type:"vocab", vocabIds:["a_asti","a_acunoaste"]},
  {type:"practice", exerciseIds:["a204","a205"]},
  {type:"production", exerciseIds:["a206"]},
  {type:"review", exerciseIds:["a202","d_pe1"]}
 ]},
{id:"l_a2u3l1", unitId:"a2_1_u3", levelId:"a2_1", order:1, title:"La recepție", titleEn:"At reception",
 objective:"Check into a hotel: confirm a booking, ask about breakfast and check-out, and use object pronouns to avoid repeating yourself.",
 sections:[
  {type:"context", dialogueId:"d_a2u3", note:"A full check-in. Listen for <i>am găsit-o</i> and <i>îl serviți</i> — the receptionist replaces nouns with pronouns rather than repeating them."},
  {type:"vocab", vocabIds:["a_hotel","a_rezervare","a_receptie","a_cheie","a_noapte_h","a_micdejun_inc","a_aramane","a_aajunge"]},
  {type:"grammar", topicId:"g_object_pronouns", intro:"Service language leans on these constantly, because repeating the noun every time sounds heavy in Romanian."},
  {type:"contrast", leftLabel:"Before the verb", rightLabel:"After the participle",
   intro:"Object pronouns normally sit in front of the verb — but <b>o</b> behaves differently in the past tense.",
   pairs:[
     ["Îl văd.","L-am văzut.","I see him/it.","I saw him/it."],
     ["O văd.","Am văzut-o.","I see her/it.","I saw her/it."],
     ["Îi aștept.","I-am așteptat.","I'm waiting for them.","I waited for them."]
   ],
   note:"In perfectul compus most pronouns contract with the auxiliary in front (<b>l-am</b>, <b>i-am</b>), but feminine <b>o</b> hooks onto the end of the participle instead: <b>am văzut-o</b>, <b>am găsit-o</b>. This asymmetry is worth drilling — it is one of the most reliable giveaways of a learner."},
  {type:"practice", exerciseIds:["a221","a222","a223"]},
  {type:"review", exerciseIds:["d_obj1","d_obj3"]}
 ]},
{id:"l_a2u3l2", unitId:"a2_1_u3", levelId:"a2_1", order:2, title:"Confirmări și anulări", titleEn:"Confirmations and cancellations",
 objective:"Read a formal booking email and understand times, prices and cancellation terms.",
 sections:[
  {type:"vocab", vocabIds:["a_vacanta","a_aastepta"]},
  {type:"reading", readingId:"r_a2u3"},
  {type:"practice", exerciseIds:["a224"]},
  {type:"listening", exerciseIds:["a225"]},
  {type:"culture", title:"Formal Romanian correspondence", body:"A formal Romanian email opens with <b>Stimate domnule…</b> / <b>Stimată doamnă…</b> and closes with <b>Cu stimă</b> or <b>Cu respect</b>. Two habits catch learners out. First, numbers are routinely <b>written out in words</b> — <i>opt sute cincizeci de lei</i>, <i>patruzeci și opt de ore</i> — which is far harder to read quickly than digits. Second, the reflexive passive is everywhere: <i>plata <b>se poate face</b></i>, <i>camera <b>trebuie eliberată</b></i>, <i>garanția <b>se returnează</b></i>. There is no stated subject; the action simply happens. Expect both in any official letter, contract or notice."},
  {type:"review", exerciseIds:["a222","a221"]}
 ]},
{id:"l_a2u4l1", unitId:"a2_1_u4", levelId:"a2_1", order:1, title:"Ce vă supără?", titleEn:"What's the problem?",
 objective:"Describe symptoms to a doctor and understand the questions you'll be asked.",
 sections:[
  {type:"context", dialogueId:"d_a2u4", note:"A consultation from opening question to prescription. Notice the doctor's advice is all <i>ar trebui să</i>."},
  {type:"vocab", vocabIds:["a_simptom","a_atusi","a_raceala_a2","a_analiza","a_tratament","a_aintelege"]},
  {type:"practice", exerciseIds:["a241","a242"]},
  {type:"review", exerciseIds:["e761","e762"]}
 ]},
{id:"l_a2u4l2", unitId:"a2_1_u4", levelId:"a2_1", order:2, title:"Sfaturi și recuperare", titleEn:"Advice and recovery",
 objective:"Give health advice, and describe an illness that is now over using the past tense.",
 sections:[
  {type:"vocab", vocabIds:["a_asfat","a_aseodihni"]},
  {type:"practice", exerciseIds:["a243"]},
  {type:"production", exerciseIds:["a244"]},
  {type:"review", exerciseIds:["a242","e767"]}
 ]},
{id:"l_a2u5l1", unitId:"a2_1_u5", levelId:"a2_1", order:1, title:"Vizionăm un apartament", titleEn:"Viewing a flat",
 objective:"Ask the questions that matter when renting, and use the genitive and dative in real contexts.",
 sections:[
  {type:"context", dialogueId:"d_a2u5", note:"A viewing. Notice <i>L-am renovat</i> — the landlord uses a pronoun rather than repeating 'the flat'."},
  {type:"vocab", vocabIds:["a_amuta","a_proprietar","a_contract","a_garantie","a_intretinere","a_vecin"]},
  {type:"grammar", topicId:"g_dative_genitive", intro:"Renting is where these two cases stop being abstract: whose flat it is, and who you complain to."},
  {type:"contrast", leftLabel:"Genitive — whose", rightLabel:"Dative — to whom",
   intro:"The noun looks identical in both. Only its job in the sentence tells them apart.",
   pairs:[
     ["Este mașina bunicii.","I-am scris bunicii.","It's grandma's car.","I wrote to grandma."],
     ["Casa proprietarului e mare.","M-am plâns proprietarului.","The landlord's house is big.","I complained to the landlord."],
     ["Sfârșitul contractului","Conform contractului","The end of the contract","According to the contract"]
   ],
   note:"Same form, two roles. On the left the person <b>owns</b> something; on the right the person <b>receives</b> something — and a dative usually brings a doubling pronoun onto the verb (<b>i-am</b> scris, <b>m-am</b> plâns). Ask yourself 'whose?' or 'to whom?' and the case follows."},
  {type:"practice", exerciseIds:["a261","a262"]},
  {type:"review", exerciseIds:["d_dg1","d_dg4"]}
 ]},
{id:"l_a2u5l2", unitId:"a2_1_u5", levelId:"a2_1", order:2, title:"Anunțuri de închiriere", titleEn:"Rental adverts",
 objective:"Read a rental advert critically and write an enquiry to a landlord.",
 sections:[
  {type:"vocab", vocabIds:["a_aseplange","a_adaugat"]},
  {type:"reading", readingId:"r_a2u5"},
  {type:"practice", exerciseIds:["a263"]},
  {type:"production", exerciseIds:["a264"]},
  {type:"review", exerciseIds:["a261","e865"]}
 ]},
{id:"l_b1u1l1", unitId:"b1_1_u1", levelId:"b1_1", order:1, title:"Păreri și argumente", titleEn:"Opinions and arguments",
 objective:"Express and justify an opinion, agree and disagree, and use să + subjunctive naturally.",
 sections:[
  {type:"context", dialogueId:"d_b1u1", note:"Alex și Ioana discută despre munca de acasă. Observă construcțiile cu <b>să</b>."},
  {type:"grammar", topicId:"g_subjunctive", intro:"Conjunctivul cu să este una dintre cele mai frecvente structuri din româna vorbită — înlocuiește infinitivul în aproape toate contextele."},
  {type:"vocab", vocabIds:["w_parere","w_deacord","w_dezavantaj","w_important"]},
  {type:"practice", exerciseIds:["e501","e502"]},
  {type:"reading", readingId:"r_b1u1"},
  {type:"grammar", topicId:"g_conditional", intro:"Condiționalul exprimă ipoteze și cereri politicoase."},
  {type:"production", exerciseIds:["e503","e505"]},
  {type:"review", exerciseIds:["e504","e501"]}
 ]},

/* ---------- A2.1 UNITS 6–8 ---------- */
{id:"l_a2u6l1", unitId:"a2_1_u6", levelId:"a2_1", order:1, title:"La interviu", titleEn:"At the interview",
 objective:"Talk about your education and work history, and handle the standard interview questions.",
 sections:[
  {type:"context", dialogueId:"d_a2u6", note:"Notice <i>Povestiți-mi</i> — an imperative with an attached dative pronoun, and the polite <i>dumneavoastră</i> form throughout."},
  {type:"vocab", vocabIds:["a_facultate","a_studii","a_diploma","a_locdemunca","a_post","a_salariu","a_experienta","a_interviu","a_atermina2","a_coleg2"]},
  {type:"grammar", topicId:"g_perfect_compus", intro:"Your work history is told in the perfect compus: what you finished, where you worked, what you did."},
  {type:"practice", exerciseIds:["a271","a272"]},
  {type:"practice", exerciseIds:["a273"]},
  {type:"reading", readingId:"r_a2u6"},
  {type:"review", exerciseIds:["a274","a271"]}
 ]},
{id:"l_a2u6l2", unitId:"a2_1_u6", levelId:"a2_1", order:2, title:"Anunțuri și candidaturi", titleEn:"Adverts and applications",
 objective:"Read a job advert closely and write an application in the right register.",
 sections:[
  {type:"vocab", vocabIds:["a_aangaja","a_aaplica","a_program","a_concediu"]},
  {type:"reading", readingId:"r_a2u6"},
  {type:"practice", exerciseIds:["a275"]},
  {type:"production", exerciseIds:["a276"]},
  {type:"review", exerciseIds:["a274","a273"]}
 ]},
{id:"l_a2u7l1", unitId:"a2_1_u7", levelId:"a2_1", order:1, title:"Ce fel de om este?", titleEn:"What kind of person is it?",
 objective:"Describe personality, and get adjective agreement right when a noun intervenes.",
 sections:[
  {type:"context", dialogueId:"d_a2u7", note:"Two colleagues comparing people. Watch the imperfect — <i>era</i>, <i>nu spunea</i> — used for how someone habitually was."},
  {type:"vocab", vocabIds:["a_prietenos","a_timid","a_rabdator","a_harnic","a_lenes","a_deschis","a_incapatanat","a_generos","a_serios","a_simpatic","a_fire","a_asemana"]},
  {type:"grammar", topicId:"g_adj_agreement", intro:"Personality adjectives are where agreement bites, because the noun and the person are often not the same gender."},
  {type:"contrast", leftLabel:"Agrees with the person", rightLabel:"Agrees with the noun",
   intro:"Both sentences describe the same woman. The adjective ending changes depending on what it actually attaches to.",
   pairs:[
     ["Ioana este deschisă.","Ioana este un om deschis.","Ioana is open.","Ioana is an open person."],
     ["Maria e foarte harnică.","Maria e un angajat harnic.","Maria is very hard-working.","Maria is a hard-working employee."],
     ["Ana pare serioasă.","Ana pare un coleg serios.","Ana seems serious.","Ana seems a serious colleague."]
   ],
   note:"On the left the adjective describes Ioana directly, so it is feminine. On the right it describes <b>om</b> / <b>angajat</b> / <b>coleg</b> — all masculine nouns — so it takes the masculine form even though the person is a woman. Find the noun the adjective is attached to, not the person you are talking about."},
  {type:"practice", exerciseIds:["a281","a282"]},
  {type:"practice", exerciseIds:["a283"]},
  {type:"production", exerciseIds:["a284"]},
  {type:"review", exerciseIds:["a281","a282"]}
 ]},
{id:"l_a2u8l1", unitId:"a2_1_u8", levelId:"a2_1", order:1, title:"La piață și în bucătărie", titleEn:"At the market and in the kitchen",
 objective:"Shop for food, follow a Romanian recipe, and recognise the impersonal se.",
 sections:[
  {type:"context", dialogueId:"d_a2u8", note:"A market exchange. Note <i>Ce vă dau?</i> — literally 'what shall I give you?', the standard way a seller opens."},
  {type:"vocab", vocabIds:["a_sarmale","a_mamaliga","a_ciorba2","a_smantana","a_reteta","a_ingredient","a_afierbe","a_apraji","a_acoace","a_gust","a_piata2","a_deposti"]},
  {type:"culture", title:"Sarmale, post, and when Romanians actually eat what", body:"<b>Sarmale</b> are the dish of celebration — Christmas, Easter, weddings, funerals. Nobody makes them on a weekday, and a Romanian will tell you without prompting that theirs are better than the restaurant version, which is usually true.<br><br><b>Postul</b> — fasting — still shapes menus far beyond the devout. During Lent and the weeks before Christmas, supermarkets label products <i>de post</i> and restaurants run a separate menu. If you are vegan, asking <i>aveți ceva de post?</i> will get you further than any imported word.<br><br>At the market, expect to be advised. A seller who says <i>sunt de grădină</i> is telling you the tomatoes are homegrown rather than imported, and being asked what you plan to cook is normal interest, not intrusion."},
  {type:"practice", exerciseIds:["a291","a293"]},
  {type:"reading", readingId:"r_a2u8"},
  {type:"review", exerciseIds:["a292","a291"]}
 ]},
{id:"l_a2u8l2", unitId:"a2_1_u8", levelId:"a2_1", order:2, title:"Scriem o rețetă", titleEn:"Writing a recipe",
 objective:"Write instructions using the impersonal se, the way Romanian recipes are actually written.",
 sections:[
  {type:"grammar", topicId:"g_reflexive", intro:"The same <b>se</b> you met on reflexive verbs does a second job: impersonal instructions and passives."},
  {type:"practice", exerciseIds:["a293"]},
  {type:"production", exerciseIds:["a294"]},
  {type:"review", exerciseIds:["a291","a292"]}
 ]},

/* ---------- A2.2 ---------- */
{id:"l_a2_2u1l1", unitId:"a2_2_u1", levelId:"a2_2", order:1, title:"Mai bun, cel mai bun", titleEn:"Better, the best",
 objective:"Compare things and say what you prefer, with the right word for 'than'.",
 sections:[
  {type:"vocab", vocabIds:["b_prefer","b_lafelde","b_decat","b_celmai","b_avantaj","b_dezavantaj2"]},
  {type:"grammar", topicId:"g_comparison", intro:"Romanian builds comparatives with words, not endings — there is no equivalent of '-er'."},
  {type:"contrast", leftLabel:"More than", rightLabel:"As … as",
   intro:"Two frames that English blurs and Romanian keeps apart. The word for 'than' is not the word for 'as'.",
   pairs:[
     ["E mai scump decât celălalt.","E la fel de scump ca celălalt.","It's more expensive than the other.","It's as expensive as the other."],
     ["Trenul e mai rapid decât autobuzul.","Trenul e la fel de rapid ca autobuzul.","The train is faster than the bus.","The train is as fast as the bus."],
     ["Ana vorbește mai bine decât mine.","Ana vorbește la fel de bine ca mine.","Ana speaks better than me.","Ana speaks as well as me."]
   ],
   note:"<b>Decât</b> belongs to inequality, <b>ca</b> to equality. Using <i>ca</i> after <i>mai</i> is the single most common comparison error English speakers make, because English uses 'as' in both halves of 'as fast as' and 'faster than' feels parallel."},
  {type:"practice", exerciseIds:["b301","b302"]},
  {type:"production", exerciseIds:["b303"]},
  {type:"review", exerciseIds:["b301","b302"]}
 ]},
{id:"l_a2_2u2l1", unitId:"a2_2_u2", levelId:"a2_2", order:1, title:"La bancă și la poștă", titleEn:"At the bank and the post office",
 objective:"Open an account, send a parcel, and handle a Romanian service counter.",
 sections:[
  {type:"context", dialogueId:"d_a2_2u2", note:"A counter exchange. Note how often the conditional <i>aș vrea</i> appears — that is the register these places run on."},
  {type:"vocab", vocabIds:["b_cont","b_card","b_aretrage","b_atransfera","b_comision","b_colet","b_atrimite2","b_ghiseu","b_formular"]},
  {type:"practice", exerciseIds:["b311","b312"]},
  {type:"production", exerciseIds:["b313"]},
  {type:"review", exerciseIds:["b311","b312"]}
 ]},
{id:"l_a2_2u3l1", unitId:"a2_2_u3", levelId:"a2_2", order:1, title:"Am o problemă", titleEn:"I have a problem",
 objective:"Complain effectively without being rude, and say what you want done about it.",
 sections:[
  {type:"context", dialogueId:"d_a2_2u3", note:"Watch how the customer opens: <i>Nu vă supărați</i> before the complaint, never straight into it."},
  {type:"vocab", vocabIds:["b_reclamatie","b_defect","b_aschimba2","b_bon","b_garantie2","b_arambursa","b_scuzati"]},
  {type:"culture", title:"How complaining works in Romania", body:"Two things surprise newcomers. First, the <b>bon fiscal</b> — the till receipt — is close to essential. Without it a shop can decline to do anything, and Romanians keep them for exactly this reason.<br><br>Second, politeness is carried almost entirely by the <b>conditional</b>. <i>Aș vrea să îl înlocuiți</i> is a normal request; <i>vreau să îl înlocuiți</i> is a demand, even though English 'I want' and 'I would like' feel only mildly apart. If you take one habit from this unit, make it reaching for <b>aș vrea</b> by default at any counter.<br><br>The legal backdrop: consumer warranty in Romania is two years on most goods, and <i>garanție</i> is the word that opens the conversation."},
  {type:"practice", exerciseIds:["b321","b322"]},
  {type:"production", exerciseIds:["b323"]},
  {type:"review", exerciseIds:["b321","b322"]}
 ]},
{id:"l_a2_2u4l1", unitId:"a2_2_u4", levelId:"a2_2", order:1, title:"Sărbători românești", titleEn:"Romanian celebrations",
 objective:"Recognise the main Romanian holidays and the phrases that go with them.",
 sections:[
  {type:"culture", title:"The year in Romanian celebrations", body:"<b>1 March — Mărțișor.</b> A red-and-white token given to women and girls to mark the start of spring. Worn pinned to a coat for the first week or two of March. Nothing like it exists in English-speaking countries, and being handed one without warning is a common first-week surprise.<br><br><b>Easter — Paște.</b> The bigger of the two great feasts for many families. Eggs are dyed red, and the greeting is <i>Hristos a înviat!</i> answered with <i>Adevărat a înviat!</i> for forty days afterwards.<br><br><b>Christmas — Crăciun.</b> Carolling (<b>colinde</b>) is still widely practised, with children going door to door. Sarmale are near-obligatory.<br><br><b>Name days — onomastica.</b> If you are called Maria, Ion, Gheorghe or Andrei, your saint's day is celebrated much like a birthday — and there are a lot of Marias and Ions. <b>La mulți ani</b> covers all of it."},
  {type:"vocab", vocabIds:["b_sarbatoare","b_craciun","b_paste","b_martisor","b_colinda","b_asarbatori","b_traditie","b_lamultiani"]},
  {type:"practice", exerciseIds:["b331","b332"]},
  {type:"review", exerciseIds:["b331","b332"]}
 ]},
{id:"l_a2_2u5l1", unitId:"a2_2_u5", levelId:"a2_2", order:1, title:"Cumpărăm haine", titleEn:"Buying clothes",
 objective:"Shop for clothes: sizes, trying things on, and saying what is wrong with the fit.",
 sections:[
  {type:"context", dialogueId:"d_a2_2u5", note:"Note <i>Vă stă foarte bine culoarea</i> — the verb agrees with <b>culoarea</b>, not with the customer."},
  {type:"vocab", vocabIds:["b_haine","b_marime","b_aproba","b_cabina","b_stramt","b_larg","b_areducere","b_asevedea"]},
  {type:"practice", exerciseIds:["b341","b342"]},
  {type:"review", exerciseIds:["b341","b342"]}
 ]},
{id:"l_a2_2u6l1", unitId:"a2_2_u6", levelId:"a2_2", order:1, title:"Reguli și sfaturi", titleEn:"Rules and advice",
 objective:"Give advice, state rules, and form the negative imperative correctly.",
 sections:[
  {type:"vocab", vocabIds:["b_sfat","b_aravea","b_einterzis","b_eobligatoriu","b_atentie","b_avoie"]},
  {type:"grammar", topicId:"g_imperative", intro:"The affirmative and the negative imperative are built differently — this is where most learners slip."},
  {type:"contrast", leftLabel:"Do it", rightLabel:"Don't do it",
   intro:"The negative is not the affirmative with <i>nu</i> in front. It uses the infinitive.",
   pairs:[
     ["Pleacă acum!","Nu pleca acum!","Leave now!","Don't leave now!"],
     ["Vino aici!","Nu veni aici!","Come here!","Don't come here!"],
     ["Fă asta!","Nu face asta!","Do this!","Don't do this!"],
     ["Uită tot!","Nu uita telefonul!","Forget everything!","Don't forget your phone!"]
   ],
   note:"On the right the verb reverts to its infinitive form after <b>nu</b> — <i>pleca, veni, face, uita</i> — with no ending change at all. Saying *<i>nu pleacă</i> or *<i>nu vino</i> is immediately audible as a learner error, and it is the most common one in this area."},
  {type:"practice", exerciseIds:["b351","b352"]},
  {type:"review", exerciseIds:["b351","b352"]}
 ]},
{id:"l_a2_2u7l1", unitId:"a2_2_u7", levelId:"a2_2", order:1, title:"Povești din trecut", titleEn:"Stories from the past",
 objective:"Tell a story: background in the imperfect, events in the perfect compus.",
 sections:[
  {type:"context", dialogueId:"d_a2_2u7", note:"A grandmother telling a story. Nearly every verb is one of two tenses — see if you can hear which does which job."},
  {type:"vocab", vocabIds:["b_odata","b_dintrodata","b_peatunci","b_infiecarezi","b_apoi2","b_intimpce"]},
  {type:"grammar", topicId:"g_imperfect", intro:"The imperfect is not a second past tense competing with the perfect compus. They do different jobs in the same sentence."},
  {type:"contrast", leftLabel:"Imperfect — background", rightLabel:"Perfect compus — event",
   intro:"The same story needs both. One paints the situation, the other moves it forward.",
   pairs:[
     ["Mergeam spre școală.","Am ajuns la școală.","I was walking to school.","I got to school."],
     ["Locuiam la țară.","M-am mutat la oraș.","I used to live in the countryside.","I moved to the city."],
     ["Ploua și era frig.","Dintr-odată a început furtuna.","It was raining and it was cold.","Suddenly the storm started."],
     ["În fiecare zi citeam seara.","Într-o seară am citit toată cartea.","Every day I used to read in the evening.","One evening I read the whole book."]
   ],
   note:"The left column has no endpoint — it is how things were, repeatedly or continuously. The right column is a single completed event. Time markers give it away: <b>în fiecare zi, pe atunci, mereu</b> pull the imperfect; <b>dintr-odată, într-o zi, ieri</b> pull the perfect compus."},
  {type:"practice", exerciseIds:["b361","b362"]},
  {type:"production", exerciseIds:["b363"]},
  {type:"review", exerciseIds:["b361","b362"]}
 ]},

/* ---------- B1.1 UNITS 2–8 ---------- */
{id:"l_b1u2l1", unitId:"b1_1_u2", levelId:"b1_1", order:1, title:"Cariera și schimbarea", titleEn:"Career and change",
 objective:"Talk about your field, how it has changed, and what you expect next.",
 sections:[
  {type:"vocab", vocabIds:["p_cariera","p_domeniu","p_asedezvolta","p_competenta","p_provocare","p_retea","p_aplicatie","p_ainlocui2","p_avantajos"]},
  {type:"grammar", topicId:"g_subjunctive", intro:"Almost everything you want to say about plans runs through <b>să</b>: vreau să, sper să, trebuie să, pot să."},
  {type:"practice", exerciseIds:["p401","p402"]},
  {type:"production", exerciseIds:["p403"]},
  {type:"review", exerciseIds:["p401","p402"]}
 ]},
{id:"l_b1u3l1", unitId:"b1_1_u3", levelId:"b1_1", order:1, title:"Când nu suntem de acord", titleEn:"When we disagree",
 objective:"Describe feelings precisely, and express regret about the past.",
 sections:[
  {type:"context", dialogueId:"d_b1u3", note:"Listen for <i>Ar fi trebuit să vorbesc</i> — a conditional perfect, and the core structure of this unit."},
  {type:"vocab", vocabIds:["p_relatie","p_incredere","p_asecerta","p_aseimpaca","p_asuparat","p_ingrijorat","p_multumit","p_dezamagit","p_asimtiface"]},
  {type:"grammar", topicId:"g_conditional", intro:"The conditional does two jobs here: softening a request, and regretting what you did not do."},
  {type:"contrast", leftLabel:"Advice about now", rightLabel:"Regret about the past",
   intro:"One extra word — <b>fi</b> — moves the whole sentence into the past.",
   pairs:[
     ["Ar trebui să vorbești cu ea.","Ar fi trebuit să vorbești cu ea.","You should talk to her.","You should have talked to her."],
     ["Ar fi bine să pleci mai devreme.","Ar fi fost bine să pleci mai devreme.","It would be good to leave earlier.","It would have been good to leave earlier."],
     ["Aș merge cu tine.","Aș fi mers cu tine.","I would go with you.","I would have gone with you."]
   ],
   note:"The conditional perfect is <b>aș/ai/ar + fi + participle</b>. English marks this with 'have'; Romanian marks it with <b>fi</b> in the same slot. Everything else in the sentence stays put, which makes it one of the cheapest high-value structures to learn at B1."},
  {type:"practice", exerciseIds:["p411","p412"]},
  {type:"production", exerciseIds:["p413"]},
  {type:"review", exerciseIds:["p411","p412"]}
 ]},
{id:"l_b1u4l1", unitId:"b1_1_u4", levelId:"b1_1", order:1, title:"Regiuni și diferențe", titleEn:"Regions and differences",
 objective:"Read a longer opinion piece about Romanian regional identity and use care to build longer sentences.",
 sections:[
  {type:"culture", title:"There is no neutral Romanian", body:"Learners often ask which accent is 'correct'. The honest answer is that the standard taught in courses — broadly the Bucharest/Muntenia variety — is a written norm more than a spoken reality.<br><br>What you will actually meet: in <b>Transylvania</b>, a slower rhythm and a rising intonation that southerners tease as sing-song, plus Hungarian and German loanwords in food and household vocabulary. In <b>Moldova</b>, softened consonants that make <i>ce</i> sound closer to <i>și</i>, and a distinct set of everyday words. In <b>Oltenia</b>, a famous habit of using the perfectul simplu — <i>făcui</i> rather than <i>am făcut</i> — for things that happened minutes ago, a tense that is literary everywhere else.<br><br>None of this needs to be produced. It needs to be recognised, so that a perfectly ordinary sentence does not stop you because it did not sound like the recording."},
  {type:"vocab", vocabIds:["p_obicei","p_regiune","p_mostenire","p_sat","p_aseraspandi","p_influenta"]},
  {type:"reading", readingId:"r_b1u4"},
  {type:"grammar", topicId:"g_relative", intro:"Longer sentences need <b>care</b> — the relative pronoun that joins two clauses into one."},
  {type:"practice", exerciseIds:["p421","p422"]},
  {type:"review", exerciseIds:["p421","p422"]}
 ]},
{id:"l_b1u5l1", unitId:"b1_1_u5", levelId:"b1_1", order:1, title:"Povestea unei călătorii", titleEn:"The story of a journey",
 objective:"Recount an extended experience, handling three past tenses in one narrative.",
 sections:[
  {type:"vocab", vocabIds:["p_experienta2","p_apeisaj","p_aserataci","p_aincerca2","p_neuitat","p_cazare"]},
  {type:"grammar", topicId:"g_imperfect", intro:"A long story needs the background and the events kept apart — and sometimes a third layer for what happened before the story began."},
  {type:"production", exerciseIds:["p431"]},
  {type:"review", exerciseIds:["b361","b363"]}
 ]},
{id:"l_b1u6l1", unitId:"b1_1_u6", levelId:"b1_1", order:1, title:"Hârtii și ghișee", titleEn:"Papers and counters",
 objective:"Read official instructions accurately and handle a Romanian administrative office.",
 sections:[
  {type:"context", dialogueId:"d_b1u6", note:"Note the impersonal <i>se eliberează</i> and <i>se depune</i> — official Romanian is written almost entirely in this form."},
  {type:"vocab", vocabIds:["p_acte","p_cerere","p_adepune","p_dosar","p_stampila","p_termen","p_aelibera","p_coada"]},
  {type:"reading", readingId:"r_b1u6"},
  {type:"practice", exerciseIds:["p441","p442"]},
  {type:"review", exerciseIds:["p441","p442"]}
 ]},
{id:"l_b1u7l1", unitId:"b1_1_u7", levelId:"b1_1", order:1, title:"Sistemul de sănătate", titleEn:"The health system",
 objective:"Navigate Romanian healthcare and give advice about habits and lifestyle.",
 sections:[
  {type:"culture", title:"How the Romanian health system is entered", body:"The <b>medic de familie</b> is the gate. You register with one, and for most things in the public system you start there — a specialist consultation usually needs a <b>trimitere</b> (referral) to be covered by insurance. Turning up at a specialist without one generally means paying privately, which many people do routinely for speed.<br><br>Two words worth having ready: <b>analize</b> (blood tests and similar) and <b>rețetă</b>, which means both a cooking recipe and a medical prescription — context does all the work.<br><br>Pharmacies (<b>farmacii</b>) are widespread and pharmacists are used to advising on minor complaints, which is often faster than a GP appointment for something small."},
  {type:"vocab", vocabIds:["p_asigurare","p_medicdefamilie","p_trimitere","p_analize","p_obisnuinta","p_aserenunta","p_echilibru"]},
  {type:"practice", exerciseIds:["p451","p452"]},
  {type:"review", exerciseIds:["p451","p452"]}
 ]},
{id:"l_b1u8l1", unitId:"b1_1_u8", levelId:"b1_1", order:1, title:"Decizii și consecințe", titleEn:"Decisions and consequences",
 objective:"Weigh options aloud and talk about hypothetical outcomes.",
 sections:[
  {type:"context", dialogueId:"d_b1u8", note:"A couple weighing a mortgage. Almost every sentence is a conditional — see how <i>dacă</i> pairs with it."},
  {type:"vocab", vocabIds:["p_decizie","p_ahotari2","p_consecinta","p_credit","p_arata2","p_amerita2","p_infond"]},
  {type:"grammar", topicId:"g_conditional", intro:"Hypotheticals need the conditional on <b>both</b> sides of <i>dacă</i> — this is where English habits mislead."},
  {type:"practice", exerciseIds:["p461"]},
  {type:"production", exerciseIds:["p462"]},
  {type:"review", exerciseIds:["p461","p412"]}
 ]},

/* ---------- B1.2 UNITS 1–7 ---------- */
{id:"l_b1_2u1l1", unitId:"b1_2_u1", levelId:"b1_2", order:1, title:"Dacă ar fi fost altfel", titleEn:"If things had been different",
 objective:"Handle unreal conditions in the past, and the family of words that set up a condition.",
 sections:[
  {type:"vocab", vocabIds:["q_ipoteza","q_incaz","q_cuconditia","q_altfel","q_chiardaca"]},
  {type:"grammar", topicId:"g_conditional", intro:"Three degrees of hypothetical: real, unreal present, unreal past. Romanian marks all three differently."},
  {type:"contrast", leftLabel:"Unreal present", rightLabel:"Unreal past",
   intro:"Adding <b>fi</b> shifts the whole hypothetical into the past — in both halves of the sentence.",
   pairs:[
     ["Dacă aș ști, ți-aș spune.","Dacă aș fi știut, ți-aș fi spus.","If I knew, I'd tell you.","If I had known, I'd have told you."],
     ["Dacă am avea timp, am veni.","Dacă am fi avut timp, am fi venit.","If we had time, we'd come.","If we had had time, we'd have come."],
     ["Dacă ar ploua, am rămâne acasă.","Dacă ar fi plouat, am fi rămas acasă.","If it rained, we'd stay home.","If it had rained, we'd have stayed home."]
   ],
   note:"Both halves move together — you cannot mix one present conditional with one past. In speech Romanians very often replace the whole thing with a double imperfect: <i>Dacă știam, îți spuneam</i>. That is normal and correct in conversation, but the conditional forms are what you want in writing."},
  {type:"practice", exerciseIds:["q501","q502"]},
  {type:"review", exerciseIds:["q501","p461"]}
 ]},
{id:"l_b1_2u2l1", unitId:"b1_2_u2", levelId:"b1_2", order:1, title:"Cum se citesc știrile", titleEn:"How to read the news",
 objective:"Follow short news items and report what someone said.",
 sections:[
  {type:"vocab", vocabIds:["q_stire","q_ziar","q_sursa","q_ainforma","q_potrivit","q_aafirma"]},
  {type:"reading", readingId:"r_b1_2u2"},
  {type:"grammar", topicId:"g_reported", intro:"News Romanian runs on reported speech: <b>că</b> for statements, <b>dacă</b> for questions, <b>să</b> for requests."},
  {type:"practice", exerciseIds:["q511","q512"]},
  {type:"practice", exerciseIds:["q513"]},
  {type:"review", exerciseIds:["q512","q513"]}
 ]},
{id:"l_b1_2u3l1", unitId:"b1_2_u3", levelId:"b1_2", order:1, title:"Probleme ale societății", titleEn:"Problems in society",
 objective:"State a problem, explain its causes, and propose a solution in writing.",
 sections:[
  {type:"vocab", vocabIds:["q_mediu","q_poluare","q_areciclat","q_asocietate","q_locuitor","q_aimbunatati"]},
  {type:"grammar", topicId:"g_connectors", intro:"An argument is held together by its connectors more than by its vocabulary."},
  {type:"production", exerciseIds:["q521"]},
  {type:"review", exerciseIds:["q511","q531"]}
 ]},
{id:"l_b1_2u4l1", unitId:"b1_2_u4", levelId:"b1_2", order:1, title:"Cum se construiește un argument", titleEn:"Building an argument",
 objective:"Concede, contrast and conclude — the moves that make an opinion sound considered.",
 sections:[
  {type:"vocab", vocabIds:["q_pedeoparte","q_desi","q_prinurmare","q_intrucat","q_panalaurma","q_dimpotriva"]},
  {type:"grammar", topicId:"g_connectors", intro:"Each connector announces what kind of move comes next. Using the wrong one misdirects the reader even when the sentence is correct."},
  {type:"contrast", leftLabel:"Formal / written", rightLabel:"Everyday / spoken",
   intro:"The same argumentative move, at two registers. Mixing them is what makes writing sound uneven.",
   pairs:[
     ["Întrucât nu am primit răspuns…","Pentru că nu am primit răspuns…","Since I received no answer…","Because I didn't get an answer…"],
     ["Prin urmare, propunem o soluție.","Deci propunem o soluție.","Therefore, we propose a solution.","So we're proposing a solution."],
     ["Cu toate acestea, rezultatul rămâne bun.","Totuși, rezultatul e bun.","Nevertheless, the result remains good.","Still, the result is good."]
   ],
   note:"The left column belongs in an email to an institution or a written argument; the right in speech and messages. Neither is more correct — but a text that swings between them reads as though it were assembled from two different sources."},
  {type:"practice", exerciseIds:["q531","q532"]},
  {type:"review", exerciseIds:["q531","q532"]}
 ]},
{id:"l_b1_2u5l1", unitId:"b1_2_u5", levelId:"b1_2", order:1, title:"Scopuri și obstacole", titleEn:"Goals and obstacles",
 objective:"Talk about long-term goals, what blocks them, and how you plan to get there.",
 sections:[
  {type:"vocab", vocabIds:["q_scop","q_atingescop","q_pelungtermen","q_solutie","q_aserezolva"]},
  {type:"grammar", topicId:"g_subjunctive", intro:"Goals are stated with <b>să</b>: <i>scopul meu este să…</i>, <i>vreau să…</i>, <i>e important să…</i>"},
  {type:"production", exerciseIds:["q541"]},
  {type:"review", exerciseIds:["p401","q531"]}
 ]},
{id:"l_b1_2u6l1", unitId:"b1_2_u6", levelId:"b1_2", order:1, title:"Ce se întâmplase înainte", titleEn:"What had happened before",
 objective:"Use and recognise the pluperfect, so a longer story's sequence stays clear.",
 sections:[
  {type:"vocab", vocabIds:["q_pana","q_dupace","q_inainte","q_amintire","q_aseintampla2"]},
  {type:"grammar", topicId:"g_pluperfect", intro:"A third past tense, for what had already happened when the story begins. One word, no auxiliary."},
  {type:"contrast", leftLabel:"Perfect compus — the event", rightLabel:"Pluperfect — before the event",
   intro:"When two past things happen in sequence, the earlier one steps back a tense.",
   pairs:[
     ["Am ajuns la gară.","Trenul plecase deja.","I arrived at the station.","The train had already left."],
     ["Nu am recunoscut strada.","Nu mai fusesem acolo niciodată.","I didn't recognise the street.","I had never been there before."],
     ["Mi-am dat seama târziu.","Tata nu spusese nimic toată dimineața.","I realised late.","My father had said nothing all morning."]
   ],
   note:"English uses 'had' + participle; Romanian uses a single word ending in <b>-se</b>. That is why it is easy to miss when listening — there is no auxiliary to cue you, just an unfamiliar ending on a verb you already know."},
  {type:"reading", readingId:"r_b1_2u6"},
  {type:"practice", exerciseIds:["q551","q552"]},
  {type:"review", exerciseIds:["q553","q551"]}
 ]},
{id:"l_b1_2u7l1", unitId:"b1_2_u7", levelId:"b1_2", order:1, title:"Cum se vorbește natural", titleEn:"Sounding natural",
 objective:"Use common idioms correctly and keep register consistent across a whole message.",
 sections:[
  {type:"vocab", vocabIds:["q_afidegura","q_alua","q_aface","q_capdelucru","q_lafeldebine","q_asemerge"]},
  {type:"culture", title:"Idioms are the last thing to add, not the first", body:"By B1 the temptation is to reach for colourful expressions to sound fluent. It usually has the opposite effect: an idiom dropped into otherwise careful textbook Romanian stands out as borrowed rather than owned.<br><br>The expressions in this unit are worth having because they are <b>frequent and neutral</b> — <i>a face față</i>, <i>nu are rost</i> and <i>a-i da bătăi de cap</i> come up constantly and carry no attitude of their own. What matters more than knowing them is <b>register consistency</b>: an informal idiom in a message that opens with <i>Stimate domn</i> reads as a mistake, even though both halves are correct Romanian.<br><br>The test to apply: would the rest of this message sound right coming from the same person in the same situation? If yes, the idiom belongs. If you had to reach for it, leave it out — plain correct Romanian never sounds wrong."},
  {type:"practice", exerciseIds:["q561"]},
  {type:"production", exerciseIds:["q562"]},
  {type:"review", exerciseIds:["q561","q532"]}
 ]},

/* ---------- I.L.R. B1 EXAM TRACK ---------- */
{id:"l_ilr_u1l1", unitId:"ilr_u1", levelId:"ilr", order:1, title:"Cele trei probe", titleEn:"The three papers",
 objective:"Know exactly what the ILR B1 exam asks of you, and where it differs from a general B1 course.",
 sections:[
  {type:"culture", title:"What the exam actually is", body:"The <b>Institutul Limbii Române</b> is a body under the Ministry of Education that certifies Romanian language competence at CEFR levels. The certificate (<b>atestat de competență lingvistică</b>) is used for university admission, the preparatory year, and various administrative purposes.<br><br>Its published B1 papers set out <b>three probe</b>:<br><br><b>I. Comprehensiune de lectură și competență gramaticală.</b> An authentic text with true/false statements, followed by sentence-transformation items. Grammar is <i>not</i> a separate paper.<br><br><b>II. Elaborarea unui text pe o temă dată.</b> Two writing tasks — in the published sample, a formal email to the ILR, and a roughly 200-word narrative built from a photograph.<br><br><b>III. Înțelegerea și exprimarea orală.</b> A recording with five open questions, then a spoken dialogue task.<br><br><b>One warning worth taking seriously.</b> The reading text in the ILR's own B1 sample is a literary essay by Nicolae Manolescu about how to read a novel — considerably harder than the informational texts most B1 courses use. Do not assume that comfortable B1 reading elsewhere means comfortable reading here."},
  {type:"vocab", vocabIds:["i_atestat","i_sesiune","i_proba","i_comprehensiune","i_competenta","i_elaborare"]},
  {type:"practice", exerciseIds:["i601","i602"]},
  {type:"review", exerciseIds:["i601","i602"]}
 ]},
{id:"l_ilr_u2l1", unitId:"ilr_u2", levelId:"ilr", order:1, title:"Adevărat sau fals", titleEn:"True or false",
 objective:"Handle the A/F format on an argumentative text, where the traps are structural rather than lexical.",
 sections:[
  {type:"culture", title:"How the A/F statements are built to catch you", body:"In an argumentative text, a false statement is rarely false because a word is wrong. It is false because of <b>who says it</b> or <b>what follows it</b>. Three patterns recur:<br><br><b>The rejected view.</b> The author states an opinion in order to disagree with it. A statement quoting that opinion matches the text word for word and is still false. Look for <i>pare</i>, <i>concluzia pare evidentă</i>, <i>mulți cred că</i> — then read the next paragraph.<br><br><b>The dropped concession.</b> The text says <i>desigur, există și…</i> or <i>chiar dacă…</i>. A statement built only on the main argument, ignoring the concession, is false.<br><br><b>The overstated scope.</b> The text says <i>mulți</i> or <i>de obicei</i>; the statement says <i>toți</i> or <i>întotdeauna</i>. Quantifiers are where careful readers gain marks.<br><br>Practical method: read the whole text once before looking at any statement. In an argument that turns, the first paragraph is often the position being demolished."},
  {type:"vocab", vocabIds:["i_adevarat","i_afirmatie"]},
  {type:"reading", readingId:"r_ilr_lectura"},
  {type:"practice", exerciseIds:["i611","i612"]},
  {type:"practice", exerciseIds:["i613","i614"]},
  {type:"review", exerciseIds:["i611","i613"]}
 ]},
{id:"l_ilr_u3l1", unitId:"ilr_u3", levelId:"ilr", order:1, title:"Transformări de frază", titleEn:"Sentence transformations",
 objective:"Rewrite a sentence from a fixed opening while keeping its meaning — the exam's most distinctive task.",
 sections:[
  {type:"culture", title:"The section nothing else prepares you for", body:"The instruction is <i>Continuați următoarele fraze, păstrând sensul și făcând schimbările necesare</i> — continue the sentence, keeping the meaning and making the necessary changes. You are given the original and the first word or two of the rewrite.<br><br>This is not translation and not a gap-fill. It tests whether you can move between <b>structures that mean the same thing</b>:<br><br>· passive ↔ reflexive passive — <i>va fi adusă</i> / <b>se va aduce</b><br>· spoken ↔ written future — <i>o să te aștept</i> / <b>te voi aștepta</b><br>· colloquial ↔ formal conditional — <i>dacă-mi cerea</i> / <b>dacă mi-ar fi cerut</b><br>· question ↔ statement of obligation — <i>de ce nu m-ai așteptat?</i> / <b>trebuia să mă aștepți</b><br>· pluperfect ↔ perfect compus when the connector changes<br><br><b>The single most useful habit:</b> look at the given opening words before you plan the sentence. They are not decoration — they dictate the structure, and often the person and tense of the verb, before you write anything."},
  {type:"vocab", vocabIds:["i_apastra","i_afraza"]},
  {type:"practice", exerciseIds:["i621","i622"]},
  {type:"practice", exerciseIds:["i623","i624"]},
  {type:"practice", exerciseIds:["i625"]},
  {type:"review", exerciseIds:["i622","i625"]}
 ]},
{id:"l_ilr_u4l1", unitId:"ilr_u4", levelId:"ilr", order:1, title:"Scrisoarea și narațiunea", titleEn:"The letter and the narrative",
 objective:"Produce the two written tasks: a formal request and a narrative built from a picture.",
 sections:[
  {type:"culture", title:"Two tasks, two completely different registers", body:"Paper II asks for both halves of your written range in one sitting, and candidates who prepare only one lose marks on the other.<br><br><b>The formal email</b> is largely formulaic, which is good news — the frame can be learned. <i>Stimate domn/Stimată doamnă</i>, then your reason for writing, then the specific request, then <i>Vă mulțumesc anticipat</i>, then <b>Cu stimă</b> and your name. Use <b>dumneavoastră</b> throughout and prefer the formal verb where one exists: <b>a solicita</b> over <i>a cere</i>, <b>a expune</b> over <i>a spune</i>.<br><br>Read the task twice for the number of things it asks. The published prompt asks you to request information <b>and</b> explain why you need the certificate — two obligations in one sentence.<br><br><b>The narrative</b> is the opposite: free, imaginative, and marked on tense control. The instruction <i>imaginându-vă circumstanțele</i> means describing what is in the picture does not answer it. You must invent. Aim near the stated word count."},
  {type:"vocab", vocabIds:["i_asolicita","i_aexpune","i_stimate","i_custima","i_naratiune"]},
  {type:"production", exerciseIds:["i631"]},
  {type:"production", exerciseIds:["i632"]},
  {type:"review", exerciseIds:["i602"]}
 ]},
{id:"l_ilr_u5l1", unitId:"ilr_u5", levelId:"ilr", order:1, title:"Ascultare și dialog", titleEn:"Listening and dialogue",
 objective:"Answer open questions on a recording, and build a two-way dialogue on a set topic.",
 sections:[
  {type:"culture", title:"What the oral paper rewards", body:"The recording in the published B1 sample is a short informational piece — a radio-style item on flu — followed by five <b>open questions</b> answered in your own words. No options to choose from, so recognition is not enough; you need the vocabulary of everyday topics available for production.<br><br>Sensible preparation is topic breadth rather than depth: health, work, transport, city life, weather, education. These are the domains such items are drawn from, and the questions are factual (<i>Ce este…? Care sunt…? Cum se numește…?</i>) rather than interpretive.<br><br><b>The dialogue task</b> asks you to construct a conversation with a partner on a given function — in the sample, asking for and giving advice. What is being assessed is whether you can sustain a two-way exchange: ask questions back, react, and use the right structures for the function. A monologue in two voices does not score well.<br><br>Practical note: the whole course's Listening section and the dialogues in the CEFR track are the closest available practice for this paper."},
  {type:"practice", exerciseIds:["i641"]},
  {type:"production", exerciseIds:["i642"]},
  {type:"review", exerciseIds:["i641"]}
 ]},

/* ---------- REGISTER TRACK LESSONS ---------- */
{id:"l_reg_u1l1", unitId:"reg_u1", levelId:"register", order:1, title:"Cum se vorbește de fapt", titleEn:"How people actually talk",
 objective:"Recognize the informal markers that fill ordinary Romanian speech, and judge when they fit.",
 sections:[
  {type:"culture", title:"Why textbook Romanian sounds odd out loud", body:"Course Romanian is not wrong — it is just <i>flat</i>. Real speech is padded with small words that carry no dictionary meaning but do most of the social work: <b>păi</b> before a hesitant answer, <b>mă rog</b> to wave something away, <b>hai</b> to urge or to end a call, <b>deci</b> as pure filler. Leaving them out is what makes a fluent learner still sound like a textbook.<br><br>The reverse mistake is worse. These markers signal closeness, so using them with an official, a landlord or someone much older reads as over-familiar. The skill this unit builds is not vocabulary — it is <b>judging distance</b>. Every item here is labelled for who you can safely say it to."},
  {type:"vocab", vocabIds:["r_ce_faci","r_ce_mai_zici","r_pai","r_ma_rog","r_hai","r_haide","r_deci","r_nasol","r_bine_misto","r_frate","r_bags","r_bre"]},
  {type:"practice", exerciseIds:["rg101","rg103"]},
  {type:"practice", exerciseIds:["rg102"]},
  {type:"production", exerciseIds:["rg104"]},
  {type:"review", exerciseIds:["rg101","rg103"]}
 ]},
{id:"l_reg_u2l1", unitId:"reg_u2", levelId:"register", order:1, title:"Reacții scurte", titleEn:"Short reactions",
 objective:"Respond to news, surprise and questions with the short forms Romanians actually use.",
 sections:[
  {type:"culture", title:"The reply is shorter than you think", body:"English speakers learning Romanian tend to build full sentences where a native would use two words. Asked where something is, a Romanian says <b>Habar n-am</b>, not <i>Nu am nicio informație despre asta</i>. Told surprising news, they say <b>Nu se poate!</b>, not <i>Este foarte surprinzător</i>.<br><br>The longer versions are grammatically perfect, which is exactly why they mislead — nothing marks them as wrong, they simply sound like a translation. Learning the short reflexes is one of the fastest ways to stop sounding foreign, and none of them require new grammar."},
  {type:"vocab", vocabIds:["r_serios","r_nuse_poate","r_normal","r_clar","r_habar","r_lasa","r_bafta","r_stai_asa","r_adica","r_gen"]},
  {type:"practice", exerciseIds:["rg111","rg112"]},
  {type:"practice", exerciseIds:["rg113"]},
  {type:"production", exerciseIds:["rg114"]},
  {type:"review", exerciseIds:["rg111","rg113"]}
 ]},
{id:"l_reg_u3l1", unitId:"reg_u3", levelId:"register", order:1, title:"Argou curent și argou vechi", titleEn:"Current slang and dated slang",
 objective:"Recognize common Romanian slang, and tell what is current from what dates you.",
 sections:[
  {type:"culture", title:"Slang has a shelf life", body:"This is the one area where a language course is structurally at a disadvantage: slang moves faster than material can be written, and a book teaching <b>beton</b> or <b>bengos</b> as current will still be teaching it a decade later. Using dated slang is worse than using none — it marks you unmistakably as someone who learned from old material, in a way that plain standard Romanian never does.<br><br>So treat this unit as a <b>comprehension</b> list, not a shopping list. Understand all of it; deploy almost none of it. The safest words for a learner to actually use are the mild ones that have been stable for decades — <b>mișto</b>, <b>tare</b>, <b>de treabă</b> — and even those belong with people your own age.<br><br>One further caution: several of these are graded by tone rather than meaning. <b>Șmecher</b> can be admiring or contemptuous with no change in wording. When a word's force depends on delivery, a non-native almost always misjudges it."},
  {type:"vocab", vocabIds:["r_misto","r_tare","r_marfa","r_beton","r_bengos","r_naspa","r_chestie","r_tip","r_de_treaba","r_a_da_teapa","r_a_se_da_mare","r_a_o_arde","r_smecher","r_baiat_destept"]},
  {type:"practice", exerciseIds:["rg121","rg122"]},
  {type:"practice", exerciseIds:["rg123"]},
  {type:"production", exerciseIds:["rg124"]},
  {type:"review", exerciseIds:["rg121","rg123"]}
 ]},
{id:"l_reg_u4l1", unitId:"reg_u4", levelId:"register", order:1, title:"Mesaje și scris online", titleEn:"Messages and writing online",
 objective:"Read Romanian written without diacritics, and know when you must restore them.",
 sections:[
  {type:"culture", title:"The missing diacritics", body:"Romanians routinely type without diacritics on phones: <i>imi pare rau ca intarzii</i> rather than <i>îmi pare rău că întârzii</i>. Nobody considers this a spelling mistake in a text message, and everyone reads it without effort.<br><br>For a learner this cuts both ways. You must be able to <b>read</b> undiacriticked Romanian, because a large share of what you receive will look like this. But you should still <b>write</b> with diacritics anywhere that isn't a casual message — an email to a landlord or an office without them reads as careless, and in a few cases the diacritics carry the meaning outright: <i>apar</i> (I appear) versus <b>apăr</b> (I defend), <i>tata</i> (dad) versus <b>tată</b> (father).<br><br>The diacritics bar under every typing exercise in this course exists for exactly this reason."},
  {type:"vocab", vocabIds:["r_sal","r_np","r_pff","r_mersi","r_pupici","r_bafta_txt"]},
  {type:"practice", exerciseIds:["rg131"]},
  {type:"production", exerciseIds:["rg132"]},
  {type:"review", exerciseIds:["rg131"]}
 ]},
{id:"l_reg_u5l1", unitId:"reg_u5", levelId:"register", order:1, title:"Înjurături: ce auzi și ce nu spui", titleEn:"Swearing: what you hear and what you don't say",
 objective:"Understand Romanian profanity when you hear it, and judge its strength accurately.",
 sensitive:true,
 sections:[
  {type:"culture", title:"Why this is here, and how it is taught", body:"Romanian swearing is frequent, inventive and considerably harsher than its English equivalents look on paper. You will hear it in the street, in traffic, in films and among friends, and not understanding it leaves you unable to tell an affectionate jab from a real insult — which is a comprehension gap with social consequences.<br><br>So this unit teaches profanity for <b>recognition</b>. Every item is graded for strength, and the strong ones are marked <i>never use</i> and shown partially masked. That is not squeamishness: profanity from a non-native rarely lands the way it does from a native. It can read as aggressive, or as a joke that has misfired, and the speaker usually cannot tell which has happened.<br><br>The genuinely useful takeaway is the <b>gradient</b>. <b>La naiba</b> is about as strong as 'damn'. <b>Du-te dracului</b> ends friendships. Treating those as interchangeable, which a dictionary invites you to do, is the actual danger."},
  {type:"vocab", vocabIds:["r_injuratura","r_a_injura","r_la_naiba","r_fir_ar","r_drace","r_prost","r_idiot","r_rahat","r_dute_dracu","r_pula"]},
  {type:"practice", exerciseIds:["rg141","rg143"]},
  {type:"practice", exerciseIds:["rg142"]},
  {type:"review", exerciseIds:["rg141","rg143"]}
 ]}
];
