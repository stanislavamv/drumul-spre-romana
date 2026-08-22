/* Drumul spre Romana — Gloss index, word lists, numerals, labels and other lookup tables.
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

/* ===================== GLOSS INDEX =====================
   Click-to-gloss has to resolve INFLECTED forms, not just headwords. A text
   says frați, bunicii, locuiesc, are — while VOCAB stores frate, bunic and
   VERBS stores a locui, a avea. Without a reverse index almost every click in
   a real passage misses.

   Built once from data that already exists: vocabulary headwords plus their
   stated plural/definite forms, every cell of every conjugation table, and a
   small core list of high-frequency words the course uses but never formally
   teaches as vocabulary items. */
var CORE_GLOSS = [
 ["și","and","conj"],["sau","or","conj"],["dar","but","conj"],["iar","and / whereas","conj",
   "Links two clauses with a mild contrast — softer than dar."],
 ["cu","with","prep"],["fără","without","prep"],["la","at, to","prep"],["în","in","prep"],
 ["pe","on; marks a specific person as direct object","prep","See the grammar note on personal accusative with pe."],
 ["de","of, from; required after numbers from 20","prep"],["pentru","for","prep"],
 ["din","from, out of","prep"],["până","until, as far as","prep"],["prin","through","prep"],
 ["foarte","very","adv"],["mult","much, a lot","adv"],["puțin","a little","adv"],
 ["mai","more; also a future/comparative marker","adv","mai + adjective forms the comparative: mai mare = bigger."],
 ["acum","now","adv"],["apoi","then, next","adv"],["deja","already","adv"],["încă","still, yet","adv"],
 ["aici","here","adv"],["acolo","there","adv"],["așa","so, like this","adv"],["cam","rather, about","adv"],
 ["mare","big, large","adj","Two-form adjective: mare (sg.), mari (pl.). Never takes -ă."],
 ["mic","small","adj","Four-form: mic, mică, mici, mici."],
 ["bun","good","adj","Four-form: bun, bună, buni, bune."],
 ["nou","new","adj"],["vechi","old (of things)","adj"],["lung","long","adj"],["scurt","short","adj"],
 ["rece","cold","adj"],["cald","warm, hot","adj"],["greu","hard, heavy","adj"],["ușor","easy, light","adj"],
 ["care","who, which, that","pron","The all-purpose relative pronoun."],
 ["ce","what","pron"],["cine","who","pron"],["cât","how much","pron"],["cum","how","adv"],
 ["când","when","adv"],["unde","where","adv"],["de ce","why","adv"],
 ["lui","his; to him (also marks masculine genitive)","pron"],
 ["ei","her; their; they (f.)","pron"],["lor","their","pron"],
 ["meu","my (m.)","pron"],["mea","my (f.)","pron"],["tău","your (m.)","pron"],["ta","your (f.)","pron"],
 ["nostru","our (m.)","pron"],["noastră","our (f.)","pron"],
 ["toată","all, whole (f.)","adj"],["tot","all, everything","adj"],["fiecare","each, every","adj"],
 ["niște","some","art"],["un","a, an (m./n.)","art"],["o","a, an (f.); also 'one'","art"],
 ["nu","no, not","adv"],["da","yes","adv"],["nimic","nothing","pron","Requires nu on the verb."],
 ["nimeni","nobody","pron","Requires nu on the verb."],
 ["țară","country; la țară = in the countryside","noun"],
 ["oraș","city, town","noun"],["casă","house","noun"],["zi","day","noun"],["an","year","noun"],
 ["om","person, man","noun"],["lucru","thing","noun"],["viață","life","noun"],["prieten","friend","noun"],
 ["acasă","(at) home","adv"],["afară","outside","adv"],["împreună","together","adv"],
 // Numbers — used constantly in prices, times, ages and dates.
 ["unu","one","num"],["una","one (f.)","num"],["doi","two (m.)","num","doi/două is the only number that changes for gender."],
 ["două","two (f.)","num"],["trei","three","num"],["patru","four","num"],["cinci","five","num"],
 ["șase","six","num"],["șapte","seven","num"],["opt","eight","num"],["nouă","nine; also 'new' (f.)","num"],
 ["zece","ten","num"],["unsprezece","eleven","num"],["doisprezece","twelve","num"],
 ["treisprezece","thirteen","num"],["paisprezece","fourteen","num"],["cincisprezece","fifteen","num"],
 ["șaisprezece","sixteen","num"],["șaptesprezece","seventeen","num"],["optsprezece","eighteen","num"],
 ["nouăsprezece","nineteen","num"],["douăzeci","twenty","num","From 20 up, add de before the noun: douăzeci de ani."],
 ["treizeci","thirty","num"],["patruzeci","forty","num"],["cincizeci","fifty","num"],
 ["șaizeci","sixty","num"],["șaptezeci","seventy","num"],["optzeci","eighty","num"],["nouăzeci","ninety","num"],
 ["sută","hundred","num"],["sute","hundreds","num"],["mie","thousand","num"],
 ["jumătate","half","noun","Used for half past the hour: nouă și jumătate."],
 ["sfert","quarter","noun"],["întâi","first","num","Used for the 1st of the month: întâi martie."],
 // Grammatical particles that carry real meaning but are never 'vocabulary'.
 ["se","himself/herself/themselves (reflexive)","pron","Part of a reflexive verb: se trezește = he/she wakes up."],
 ["mă","myself (reflexive); me","pron"],["te","yourself (reflexive); you","pron"],
 ["ne","ourselves; us","pron"],["vă","yourselves; you (formal)","pron"],
 ["să","(subjunctive marker)","part","Introduces the subjunctive after verbs like a vrea, a putea, a trebui."],
 ["că","that","conj","Introduces a reported clause: Cred că e bine."],
 ["ca","as, like","prep","Not to be confused with că. ca să = in order to."],
 ["între","between","prep"],["câteva","a few, several","adj"],["mulți","many (m.)","adj"],
 ["multe","many (f./n.)","adj"],["altă","other, another (f.)","adj"],["alți","other (m. pl.)","adj"],
 // Content words that appear across the texts without a vocabulary entry.
 ["centru","center, downtown","noun"],["timp","time","noun"],["obicei","habit, custom","noun","de obicei = usually."],
 ["dejun","lunch/meal","noun","mic dejun = breakfast."],["rapid","quick, fast","adj"],
 ["franceză","French (language)","noun"],["engleză","English (language)","noun"],
 ["matematică","mathematics","noun"],["grădină","garden","noun"],["sat","village","noun"],
 ["vară","summer","noun"],["iarnă","winter","noun"],["primăvară","spring","noun"],["toamnă","autumn","noun"],
 ["munte","mountain","noun"],["mare (substantiv)","sea","noun"],["cabană","mountain cabin","noun"],
 ["drumeție","hike","noun"],["peisaj","landscape, scenery","noun"],["obositor","tiring","adj"],
 ["curățenie","cleaning","noun"],["flexibilitate","flexibility","noun"],["angajat","employee","noun"],
 ["angajator","employer","noun"],["echipă","team","noun"],["birou","office, desk","noun"],
 ["spital","hospital","noun"],["piscină","swimming pool","noun"],["sală","gym; hall","noun"],
 ["știri","news","noun"],["roman","novel","noun"],["comedie","comedy","noun"],
 ["luni","Monday","noun"],["marți","Tuesday","noun"],["miercuri","Wednesday","noun"],
 ["joi","Thursday","noun"],["vineri","Friday","noun"],["sâmbătă","Saturday","noun"],["duminică","Sunday","noun"],
 // Remaining high-frequency words from the reading passages.
 ["a","(infinitive marker)","part","Marks the infinitive: a merge = to go."],
 ["restaurant","restaurant","noun"],["verde","green","adj"],["negru","black","adj"],
 ["alb","white","adj"],["roșu","red","adj"],["albastru","blue","adj"],
 ["oaie","sheep","noun","brânză de oaie = sheep's cheese."],
 ["plată","still (of water); payment","adj","apă plată = still water."],
 ["minut","minute","noun"],["jos","down; pe jos = on foot","adv"],
 ["pui","chicken","noun"],["cartof","potato","noun"],["sarmale","cabbage rolls (national dish)","noun"],
 ["mămăligă","polenta","noun"],["smântână","sour cream","noun"],["borș","fermented bran used to sour soup","noun"],
 ["reducere","discount, sale","noun","la reducere = on sale."],
 ["cadou","gift","noun"],["etaj","floor, storey","noun"],["intrare","entrance","noun"],
 ["stație","stop, station","noun"],["trafic","traffic","noun"],["nord","north","noun"],
 ["deschis","open","adj"],["închis","closed","adj"],["gata","ready, done","adj"],
 ["târziu","late","adv"],["devreme","early","adv"],["repede","quickly","adv"],["încet","slowly","adv"],
 ["poftiți","here you are; go ahead (polite)","phrase"],["sigur","sure, certainly","adv"],
 ["desigur","of course","adv"],["poate","maybe; he/she can","adv"],
 ["nevoie","need","noun","am nevoie de = I need."],["noroc","luck; cheers","noun"],
 ["părinte","parent","noun"],["copilărie","childhood","noun"],["viitor","future","noun"],
 ["trecut","past; last (week, year)","noun"],["săptămâna trecută","last week","phrase"],
 ["împreună","together","adv"],["singur","alone; only","adj"],["altceva","something else","pron"],
 ["ceva","something","pron"],["cineva","someone","pron"],["totul","everything","pron"],
 // Archaic / poetic forms that appear in the anthem.
 ["nost","our (elided form of nostru)","pron","Written nost' in the anthem — an old shortening of nostru."],
 ["oaste","army, host","noun"],["deviza","the motto","noun"],["preasfânt","most holy","adj"],
 ["mărețe","great, majestic (f. pl.)","adj"],["strigă","shouts, cries","verb"],
 ["croiește","forge, shape (imperative)","verb"],["adânciră","they sank (archaic past)","verb"]
];

/* Names are recognized so the gloss can say "proper name" rather than
   pretending the course is missing a word it should never contain. */
var KNOWN_NAMES = ["andrei","maria","ioana","elena","ion","radu","bianca","cristina","mihai","ana",
  "sarah","tom","lukas","vlad","sorin","alex","victor","dan","diana","paul","laura","bogdan",
  "cluj","cluj-napoca","bucurești","timișoara","iași","românia","herăstrău","aviatorilor",
  "ionescu","popescu","victoriei","berlin","londra","new york","america","anglia","franța","bulgaria"];

/* English function words with no Romanian homograph. Deliberately excludes
   a, an, care, e, in, la, nu, sa, si, ma, o — every one of those is also a
   Romanian word, and counting them would push real Romanian to "English". */
var ENGLISH_MARKERS = {
  the:1, of:1, and:1, to:1, you:1, your:1, is:1, are:1, was:1, were:1, for:1,
  with:1, that:1, this:1, these:1, those:1, from:1, what:1, which:1, when:1,
  how:1, why:1, would:1, should:1, could:1, will:1, have:1, has:1, had:1,
  been:1, they:1, their:1, there:1, than:1, then:1, into:1, about:1, write:1,
  writing:1, use:1, using:1, need:1, make:1, take:1, say:1, says:1, each:1,
  it:1, its:1, but:1, not:1, only:1, also:1, here:1, more:1, most:1, one:1,
  two:1, three:1, sentence:1, sentences:1, word:1, words:1, answer:1,
  question:1, questions:1, correct:1, translate:1, complete:1, choose:1
};

/* Optional leading subject pronoun — Romanian drops it freely, so an answer
   that differs only by one should never be marked wrong. */
var SUBJECT_PRONOUNS = ["eu","tu","el","ea","noi","voi","ei","ele","dumneavoastră"];

/* Words that may sit between the verb and its subject without being it. */
var AGREEMENT_SKIP = ["foarte","mult","multa","multă","mai","ales","si","și","tare","cam",
                      "destul","de","prea","chiar","doar","numai","deloc","putin","puțin"];

/* Token scan rather than regex. JavaScript's \b is defined over ASCII \w, so
   there is NO word boundary before "Î" — a pattern like /\bîmi/ silently fails
   on exactly the Romanian words we care about, while matching "nu-mi" fine
   because that starts with an ASCII letter. Scanning tokens sidesteps it. */
var LIKE_PRONOUNS = ["imi","iti","ii","ne","va","le","mi","ti","nu-mi","nu-ti","nu-i",
                     "nu-ne","nu-va","nu-le","mi-","ti-","i-","ne-","v-","li-"];

var HURT_PRONOUNS = ["ma","te","il","o","ne","va","ii","le","nu-ma","nu-te","nu-l","m-","te-"];

var TYPE_LABEL = {mcq:"Multiple choice", fill:"Fill in the blank", build:"Build the sentence",
  trans_en_ro:"Translate into Romanian", trans_ro_en:"Translate into English", transcribe:"Listen & type",
  dictation:"Dictation", match:"Matching", transform:"Transform", conjugate:"Conjugation",
  error_fix:"Correct the mistake", dialogue:"Dialogue", reading_q:"Reading comprehension",
  produce:"Write your own", minimal_pair:"Sound discrimination"};

/* ---------- MEDIA / SHADOWING LIBRARY ----------
   Videos live on YouTube and are embedded, never downloaded — the recordings
   belong to the channels that made them, and embedding keeps the view with
   them. Nothing loads until the learner presses play, so opening this page
   makes no request to Google.

   Every id below was checked against YouTube's oembed endpoint: each one
   resolves, is embeddable, and the channel and title are as returned by
   YouTube rather than typed from memory. A dead embed is worse than an empty
   shelf, so anything added later should be verified the same way.

   Levels are an approximation. Where a channel states a level in its own
   title that is used; otherwise it is a judgement from the content, and it is
   labelled as such rather than presented as authoritative. */
var MEDIA = [
  {id:"bnBzEKwAqUA", kind:"video", title:"Everything You Need to Master Beginner Romanian (FAST)",
   channel:"The Romanian Academy", level:"A1", levelSource:"judged",
   note:"A broad beginner overview. Useful early for orientation rather than shadowing — the English scaffolding is heavy, so it tells you what exists rather than giving you much Romanian to imitate."},
  {id:"9Shsj_XcFVo", kind:"video", title:"Romanian Listening Practice A1 — My Day (Limba Română A1 · Ziua mea)",
   channel:"Romanian with Anamaria", level:"A1", levelSource:"stated",
   note:"Slow, clearly enunciated daily-routine narration. One of the best first shadowing targets in this list: short sentences, present tense, high-frequency reflexives (mă trezesc, mă spăl, mă îmbrac)."},
  {id:"7j7cRfWwdng", kind:"video", title:"Super Slow Romanian — Rutina mea zilnică (A1–A2, with subtitles)",
   channel:"The Polyglot Comedian", level:"A1–A2", levelSource:"stated",
   note:"Deliberately slowed speech with subtitles. Ideal for shadowing because the pace leaves room to speak along on a first pass; same daily-routine vocabulary as the Anamaria video, so the two reinforce each other."},
  {id:"3AeE85tvtyk", kind:"video", title:"Rutina Mea Zilnică — Episode 14 (A1–A2 Romanian podcast)",
   channel:"Talk Tonic Radio", level:"A1–A2", levelSource:"stated",
   note:"Podcast format, so no visual support — a step up from the subtitled videos. Try it after you can follow the two above, and use it to check whether you actually have the vocabulary or were reading it."},
  {id:"1MVfKl_xj5M", kind:"video", title:"Super Slow Romanian — A2–B1 level, with subtitles",
   channel:"The Polyglot Comedian", level:"A2–B1", levelSource:"stated",
   note:"The same slow delivery at a higher level. Longer sentences and past tenses; good bridge material once the A1 routine videos feel comfortable."},
  {id:"irPd-_cnrpQ", kind:"video", title:"RUTINA ZILNICĂ în limba română (with Russian glossing)",
   channel:"Arina Chirila", level:"A2", levelSource:"judged",
   note:"Daily routine explained with Russian translation alongside. Useful if you read Russian; if not, the Romanian portions still work as listening, and the pace is unhurried."}
];

/* ---------- I.L.R. MOCK EXAM ----------
   Run as three separate papers rather than one shuffled pool, because that is
   how the real thing is sat and because the papers test different things: you
   can pass the reading and fail the writing, and a single blended percentage
   would hide exactly that. Each paper is reported on its own.

   No countdown timer. The ILR does not publish per-paper durations, and a
   made-up limit would train the wrong pace — so the page shows elapsed time
   for self-assessment and says plainly why. */
var ILR_PAPERS = [
  {n:1, ro:"Comprehensiune de lectură și competență gramaticală", en:"Reading comprehension & grammatical competence",
   note:"A text with true/false statements, then sentence transformations. Read the whole text before looking at the statements."},
  {n:2, ro:"Elaborarea unui text pe o temă dată", en:"Written production",
   note:"Two tasks: a formal letter and a narrative. Count the obligations in each prompt before you start writing."},
  {n:3, ro:"Înțelegerea și exprimarea orală", en:"Oral comprehension & expression",
   note:"A listening item and a dialogue task. In the real exam this paper is spoken; here the dialogue is written out."}
];

/* ---------- LESSON RUNNER ---------- */
var STAGE_LABEL = {context:"Context", grammar:"Grammar", vocab:"Vocabulary", culture:"Culture",
  practice:"Guided practice", listening:"Listening", pronunciation:"Pronunciation",
  reading:"Reading", production:"Production", review:"Review", contrast:"Compare"};

/* ---------- READING NUMERALS ALOUD ----------
   Digits in a text were inert: a learner could click every word in "În 1859,
   Alexandru Ioan Cuza a fost ales domn" and still have no idea how to say the
   year. Numerals are also where Romanian diverges sharply from English, so
   leaving them unglossed skips a real teaching point rather than a detail.

   Things worth knowing, all of which this encodes:
     · Years are read in FULL, not in pairs — 1859 is "o mie opt sute cincizeci
       și nouă", never "eighteen fifty-nine".
     · sută and mie are feminine, so they take două: două mii, not *doi mii.
     · Several teens and tens are irregular in speech: paisprezece (14),
       șaisprezece (16), șaizeci (60).
     · From 20 up, counting a noun needs "de": douăzeci DE ani, but nouăsprezece
       ani with no "de". */
var NUM_ONES = ["zero","unu","doi","trei","patru","cinci","șase","șapte","opt","nouă"];

var NUM_TEENS = ["zece","unsprezece","doisprezece","treisprezece","paisprezece","cincisprezece",
                 "șaisprezece","șaptesprezece","optsprezece","nouăsprezece"];

var NUM_TENS = ["","","douăzeci","treizeci","patruzeci","cincizeci","șaizeci","șaptezeci","optzeci","nouăzeci"];

/* The feminine forms, needed before sută/mie and when counting feminine nouns. */
var NUM_ONES_F = ["zero","una","două","trei","patru","cinci","șase","șapte","opt","nouă"];

/* Ordinals only where a learner actually meets them: dates. The 1st of a month
   is întâi, never *unu — "1 decembrie" is read "întâi decembrie". */
var MONTHS_RO = ["ianuarie","februarie","martie","aprilie","mai","iunie",
                 "iulie","august","septembrie","octombrie","noiembrie","decembrie"];

/* ---------- THE ANTHEM AS MUSIC ----------
   Both recordings are instrumental and in the public domain: the modern one is
   a US Navy Band performance (a US Government work), the historical one a
   pre-1926 Victor Military Band cut. Freely-licensed SUNG recordings of the
   anthem essentially do not exist, so the melody is here to be learned against
   the printed words rather than to be sung along with. Native <audio> rather
   than the Speech module — this is music, not pronunciation. */
var ANTHEM_TRACKS = [
  {id:"navy", file:"audio/anthem/anthem-navy-band.ogg", title:"United States Navy Band",
   meta:"instrumental · 2:19 · recorded c. 2003",
   note:"A clean modern band performance at ceremonial tempo — the version you would hear at an official event. Use it to fix the melody and, above all, the pace: the anthem is slower than most people expect on a first reading."},
  {id:"victor", file:"audio/anthem/anthem-victor-band.ogg", title:"Victor Military Band",
   meta:"instrumental · 2:59 · recorded before 1926",
   note:"A historical brass-band recording made within living memory of the 1848 revolution the words come from. Rougher sound, broader phrasing — worth one listen for the sense of how long this melody has been carrying these words."}
];

/* ---------- HOW THE ANTHEM IS ACTUALLY SUNG ----------
   Both bundled recordings are instrumental, so on their own they do not answer
   the question a learner actually has: where do the words go? That answer is
   in the verse structure, and it is fully checkable rather than a matter of
   taste. Every line of Mureșanu's poem is a 13- or 14-syllable line split by a
   caesura after the seventh syllable, one poetic line to one musical phrase.
   The elisions written into the text — te-adânciră, se-nchine, fală-un — are
   not typography, they are singing instructions: those vowels collapse into one
   syllable, and a learner who pronounces them separately runs out of melody.
   Syllable counts below are marked so they can be verified by counting. */
var ANTHEM_SUNG = {
  intro:"Each line is one musical phrase. Sing to the break marked ‖ — that is the caesura, and it falls after the seventh syllable in every single line — then take a breath and finish the line. Lines alternate 14 and 13 syllables.",
  lines:[
    {ro:"Deșteaptă-te, române, ‖ din somnul cel de moarte,",
     syl:"Deș · teap · tă · te ‖ ro · mâ · ne ‖ din · som · nul · cel · de · moar · te", count:14,
     note:"No elisions in this line — every syllable is its own. <b>Deșteaptă-te</b> carries the stress on <b>teap</b>."},
    {ro:"În care te-adânciră ‖ barbarii de tirani!",
     syl:"În · ca · re · te-a · dân · ci · ră ‖ bar · ba · rii · de · ti · rani", count:13,
     note:"<b>te-adânciră</b>: <i>te</i> and <i>a</i> collapse into a single syllable <i>tea</i>. Sing it as one beat, not two."},
    {ro:"Acum ori niciodată, ‖ croiește-ți altă soartă,",
     syl:"A · cum · ori · ni · cio · da · tă ‖ cro · ieș · te-ți · al · tă · soar · tă", count:14,
     note:"<b>niciodată</b> is four syllables, not five — <i>cio</i> is one. <b>croiește-ți</b> ends on a single beat carrying the attached <i>-ți</i>."},
    {ro:"La care să se-nchine ‖ și cruzii tăi dușmani!",
     syl:"La · ca · re · să · se-n · chi · ne ‖ și · cru · zii · tăi · duș · mani", count:13,
     note:"<b>se-nchine</b> is <i>se</i> + <i>închine</i> with the <i>î</i> swallowed: three syllables, <i>se-n · chi · ne</i>."}
  ],
  occasions:[
    ["1 December", "National Day — sung at official ceremonies across the country."],
    ["Flag-raising and state occasions", "Stanza 1 only, in almost every case."],
    ["Sporting fixtures", "Stanza 1, usually with the crowd singing over a recording."],
    ["Citizenship ceremonies", "You may be asked to stand; joining in is welcomed but not required."]
  ]
};

/* One sung version, embedded directly on the reading. The on-screen lyrics
   are the whole point of picking this recording: they show how the
   syllables line up against the melody. */
var ANTHEM_VIDEOS = [
  {id:"3WIqeSiUbNc", title:"Deșteaptă-te, române — with on-screen lyrics", by:"JR videos"}
];

/* ---------- CONJUGATION DRILLS ----------
   Generates conjugation questions on demand from the verb tables, so a learner
   can drill one tense across many verbs rather than only ever meeting the
   present tense inside lessons. */
var TENSE_META = [
  {id:"present",     ro:"Prezent",         en:"Present"},
  {id:"past",        ro:"Perfect compus",  en:"Compound past"},
  {id:"imperfect",   ro:"Imperfect",       en:"Imperfect"},
  {id:"future",      ro:"Viitor",          en:"Future"},
  {id:"conditional", ro:"Condițional",     en:"Conditional"},
  {id:"subjunctive", ro:"Conjunctiv",      en:"Subjunctive"},
  {id:"imperative",  ro:"Imperativ",       en:"Imperative"}
];

var PERSON_LABELS = {eu:"eu", tu:"tu", el:"el / ea", noi:"noi", voi:"voi", ei:"ei / ele"};

/* Each band holds more items than are asked, so retaking the test does not
   replay the same questions. Combined with per-attempt option shuffling, this
   makes memorizing positions or item order useless. */
var PLACEMENT_BANDS = [
 {level:"a1_1", label:"A1.1", items:[
   {type:"mcq", q:"Eu ___ din America.", opts:["sunt","este","are","ești"], a:0},
   {type:"mcq", q:"Fratele meu ___ douăzeci de ani.", opts:["este","are","face","sunt"], a:1},
   {type:"mcq", q:"Which is correct?", opts:["o casă mare","o casă mareă","un casă mare","o casa mari"], a:0},
   {type:"mcq", q:"Noi ___ studenți.", opts:["suntem","sunt","este","ești"], a:0},
   {type:"mcq", q:"Ea este ___.", opts:["profesoară","profesor","profesorii","profesoare"], a:0},
   {type:"mcq", q:"___ locuiești? — La Cluj.", opts:["Unde","Cine","Când","Ce"], a:0},
   {type:"fill", q:"Complete: Bună ___! (the greeting used in the morning)", accept:["dimineața","dimineata"], hint:"One word."},
   {type:"fill", q:"Say 'thank you' in Romanian.", accept:["mulțumesc","multumesc","mersi"], hint:"One word."}
 ]},
 {level:"a1_2", label:"A1.2", items:[
   {type:"mcq", q:"___ trezesc la ora șapte în fiecare zi.", opts:["Mă","Îmi","Se","Te"], a:0},
   {type:"mcq", q:"Îmi ___ merele.", opts:["place","plac","plăcut","plăcea"], a:1},
   {type:"mcq", q:"Nu beau ___ cafea seara.", opts:["niciodată","totdeauna","uneori","des"], a:0},
   {type:"mcq", q:"Mă ___ capul.", opts:["doare","dor","doar","durere"], a:0},
   {type:"mcq", q:"Merg la sală ___ două ori pe săptămână.", opts:["de","în","la","cu"], a:0},
   {type:"mcq", q:"Îmi place ___ citesc seara.", opts:["să","a","că","de"], a:0},
   {type:"fill", q:"Write the missing word: Ziua mea este pe ___ martie. (the 1st)", accept:["întâi","intai"], hint:"Not 'unu'."},
   {type:"fill", q:"Complete: Trenul ___ o întârziere de zece minute. (a avea)", accept:["are"], hint:"One word."}
 ]},
 {level:"a2_1", label:"A2.1", items:[
   {type:"mcq", q:"Ieri ___ la magazin.", opts:["sunt mers","am mers","merg","voi merge"], a:1},
   {type:"mcq", q:"___ întâlnit cu prietenii sâmbătă.", opts:["M-am","Mă am","Sunt","Am mă"], a:0},
   {type:"mcq", q:"Când eram mic, ___ la țară în fiecare vară.", opts:["am mers","mergeam","voi merge","merg"], a:1},
   {type:"mcq", q:"Ce ___ în weekend?", opts:["ai făcut","ai fost făcut","erai făcut","faci ai"], a:0},
   {type:"mcq", q:"Anul trecut ___ în Grecia.", opts:["am fost","sunt fost","eram fi","voi fi"], a:0},
   {type:"fill", q:"Put into perfectul compus: <b>eu / a cumpăra</b> → ___ pâine.", accept:["am cumpărat","am cumparat"], hint:"Two words."},
   {type:"fill", q:"Complete: Mâine ___ să merg la doctor. (colloquial future, two words)", accept:["o să","am să"], hint:"Two short words."}
 ]},
 {level:"a2_2", label:"A2.2", items:[
   {type:"mcq", q:"Cartea este ___ interesantă ___ filmul.", opts:["mai … decât","mult … ca","cel mai … de","așa … ca"], a:0},
   {type:"mcq", q:"Negative command: ___ telefonul acasă!", opts:["Nu uita","Nu uiți","Nu uitați să","Nu ai uitat"], a:0},
   {type:"mcq", q:"I-am dat cartea ___.", opts:["Mariei","Maria","la Maria","pe Maria"], a:0},
   {type:"mcq", q:"Este ___ bun restaurant din oraș.", opts:["cel mai","mai","cea mai","al mai"], a:0},
   {type:"mcq", q:"Este la fel de scump ___ celălalt.", opts:["ca","decât","de","că"], a:0},
   {type:"fill", q:"Complete with the correct object pronoun: Pe Andrei ___ văd în fiecare zi.", accept:["îl","il"], hint:"One short word."},
   {type:"fill", q:"Complete: Casa ___ este mare. (of my parents — one word)", accept:["părinților","parintilor"], hint:"Genitive plural."}
 ]},
 {level:"b1_1", label:"B1.1", items:[
   {type:"mcq", q:"Vreau ___ învăț română.", opts:["să","a","de","că"], a:0},
   {type:"mcq", q:"E important ca echipele ___ față în față.", opts:["să se întâlnească","se întâlnesc","să se întâlnesc","întâlnindu-se"], a:0},
   {type:"mcq", q:"Omul ___ vorbeam este profesor.", opts:["despre care","care","pe care","de care ce"], a:0},
   {type:"mcq", q:"Trebuie ___ plecăm acum.", opts:["să","a","de","ca"], a:0},
   {type:"mcq", q:"Cartea ___ am citit-o este excelentă.", opts:["pe care","care","de care","ce"], a:0},
   {type:"fill", q:"Complete naturally: Cred ___ este o idee bună. (one word)", accept:["că"], hint:"Two letters, with a diacritic."},
   {type:"fill", q:"Complete: Aș vrea ___ vorbesc cu managerul. (one word)", accept:["să","sa"], hint:"Two letters."}
 ]},
 {level:"b1_2", label:"B1.2", items:[
   {type:"mcq", q:"Dacă ___ mai mult timp, aș călători mai mult.", opts:["am","aș avea","voi avea","aveam"], a:1},
   {type:"mcq", q:"___ fi știut, aș fi venit mai devreme.", opts:["Dacă aș","Dacă am","Dacă voi","Dacă o să"], a:0},
   {type:"mcq", q:"___ ploua, am ieșit totuși la plimbare.", opts:["Deși","Pentru că","Ca să","Astfel"], a:0},
   {type:"mcq", q:"Nu a venit ___ era bolnav.", opts:["pentru că","ca să","deși","în timp ce"], a:0},
   {type:"mcq", q:"___ urmare, am decis să rămân.", opts:["Prin","Pentru","Ca","De"], a:0},
   {type:"fill", q:"Join with a connector of purpose: Am economisit bani ___ să călătoresc.", accept:["ca"], hint:"Two letters."},
   {type:"fill", q:"Complete: ___ toate că era târziu, am continuat. (one word)", accept:["cu"], hint:"Two letters — 'cu toate că' means 'although'."}
 ]}
];

/* Single source of truth for the main navigation — the top bar uses it on
   desktop, and the slide-out sidebar repeats it on mobile, where the top bar
   is hidden. Verbs sits beside Grammar and Vocabulary, since all three are
   reference tools rather than study flows. */
var NAV_TABS = [
  ["home","Learn"], ["review","Review"], ["practice","Practice"], ["listening","Listening"],
  ["media","Media"], ["grammar","Grammar"], ["verbs","Verbs"], ["vocabulary","Vocabulary"],
  ["progress","Progress"]
];
