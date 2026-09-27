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
 /* ei was previously glossed as "they (f.)" — wrong: ei is masculine plural
    (they-m.), ele is feminine plural (they-f.). The genitive/dative "her"
    sense (cartea ei = her book) is a real, separate use of the same word. */
 ["ei","her (possessive/dative); their; they (m.)","pron"],["lor","their","pron"],
 ["meu","my (m.)","pron"],["mea","my (f.)","pron"],["tău","your (m.)","pron"],["ta","your (f.)","pron"],
 ["nostru","our (m.)","pron"],["noastră","our (f.)","pron"],
 /* Subject pronouns — read constantly (they open half the sentences in the
    course) but never taught as vocabulary items, so they were never glossed
    at all until now. Declared together in SUBJECT_PRONOUNS further down this
    file; this is the first place their meanings are actually recorded. */
 ["eu","I","pron"],["tu","you (singular, informal)","pron"],
 ["el","he; it (m.)","pron"],["ea","she; it (f.)","pron"],
 ["noi","we","pron"],["ele","they (f.)","pron"],
 ["voi","you (plural); also the future-tense auxiliary 'will'","pron / part",
   "Voi merge = I will go (auxiliary); Voi mergeți = you (pl.) are going (pronoun) — same spelling, context decides."],
 /* e is the everyday spoken contraction of este (a fi, "to be") — as common
    in real sentences as the full form, and just as unglossed until now. */
 ["e","is (informal contraction of este)","verb","E frumos = it's beautiful."],
 ["toată","all, whole (f.)","adj"],["tot","all, everything","adj"],["fiecare","each, every","adj"],
 ["niște","some","art"],["un","a, an (m./n.)","art"],
 ["o","a, an (f.); also 'one'; also 'her/it' as a direct object pronoun","art / pron",
   "Îl cunosc = I know him; o cunosc = I know her — same pronoun slot, different gender."],
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
 /* Object pronoun clitics — short, unstressed, and everywhere in real speech,
    but easy to leave out of a word list because they never stand alone in an
    English gloss the way a noun does. */
 ["îl","him, it (m.) — direct object pronoun","pron","Îl cunosc pe Andrei = I know Andrei (lit. 'him')."],
 ["îi","to him, to her — indirect object pronoun; also 'them' (m., direct object)","pron"],
 ["le","to them — indirect object pronoun; also 'them' (f., direct object)","pron"],
 ["îmi","to me — indirect object pronoun","pron","Often fused with the verb in speech: îmi place = I like (lit. 'to me it is pleasing')."],
 ["îți","to you — indirect object pronoun (informal)","pron"],
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
 ["croiește","forge, shape (imperative)","verb"],["adânciră","they sank (archaic past)","verb"],
 ["că-n","that in (elided că + în)","conj","Same kind of poetic contraction as nost' — Că-n aste mâni mai curge un sânge de roman = that in these hands still flows a Roman blood."],
 ["deșteaptă-te","wake up! (reflexive imperative, informal)","verb","The anthem's opening word — Deșteaptă-te, române! = Wake up, Romanian!"],
 // Remaining anthem contractions — the rest of the same poem, elided the same
 // way as nost' and că-n: a whole clitic or short word fused onto the word
 // before or after it for the meter.
 ["aste","these (archaic/poetic for aceste)","adj"],
 ["mâni","hands (archaic/poetic for mâini)","noun"],
 ["cruzii","cruel (m., plural, definite)","adj","Cruzii tăi dușmani = your cruel enemies."],
 ["te-adânciră","sank you (elided te + adânciră)","verb","Barbarii te-adânciră = the barbarians sank you."],
 ["croiește-ți","shape for yourself (imperative + attached dative pronoun)","verb","Croiește-ți altă soartă = shape yourself another fate."],
 ["se-nchine","bow down (elided să se închine)","verb","Să se-nchine = that they may bow down."],
 ["fală-un","with pride, a (elided fală + un)","noun / art","Cu fală-un nume = proudly a name."],
 ["triumfător","triumphant","adj"],
 ["creștină","Christian (f.)","adj","Oastea e creștină = the army is Christian."],
 ["creștinism","Christianity","noun"],
 ["deviza-i","its motto is (elided deviza + îi/e)","noun / verb","Deviza-i libertate = its motto is liberty."],
 ["deplină","full, complete (f.)","adj","Cu glorie deplină = with full glory."],
 ["bine-n","better in (elided bine + în)","adv","Murim mai bine-n luptă = we'd rather die in battle."],
 ["crucea-n","the cross to the fore (elided crucea + în)","noun","Cu crucea-n frunte = with the cross before them."],
 ["vostru-n","your ... in (elided vostru + în)","pron","Cu focul vostru-n vine = with your fire in [our] veins."],
 ["viață-n","life in (elided viață + în)","noun","Viață-n libertate ori moarte! = Life in freedom, or death!"],
 // These already have a per-reading gloss in r_civ_imn's own glossary field
 // (js/data/texts.js), which covers that one reading — but not this global
 // index, so the same word shows as unglossed everywhere else it appears.
 ["preoți","priests","noun"],["barbarii","the barbarians","noun"],
 ["dușmani","enemies","noun"],["glorie","glory","noun"],
 ["piepturi","breasts, chests","noun"],["pământ","land, earth","noun"],
 ["sclavi","slaves","noun"],["soartă","fate, destiny","noun"],
 ["strănepoți","great-grandchildren","noun"],["umbre","shades, shadows","noun"],
 ["suveran","sovereign","adj"],["indivizibil","indivisible","adj"],
 // Top-frequency gap found by auditing every dialogue/reading line against
 // glossLookup: these had no entry anywhere and are common enough (4+
 // occurrences across the course) to fix directly rather than leave for a
 // future pass. Some pairs are genuinely indistinguishable once normLoose
 // strips diacritics (această/aceasta both key to "aceasta"; the adjective
 // române and the noun plural romane both key to "romane") — those entries
 // say so rather than silently picking one sense.
 ["doar","only, just","adv"],
 ["asta","this, that (colloquial)","pron","The everyday spoken form; aceasta/această is the more formal written equivalent."],
 ["minute","minutes","noun"],["despre","about, concerning","prep"],
 ["s-a","(reflexive/passive) has — contraction of se + a","part","S-a întâmplat = it happened (lit. 'itself has happened')."],
 ["ori","times, occurrences; or","conj / noun","De două ori = twice. Ori...ori... = either...or."],
 ["oameni","people","noun","Irregular plural of om."],["oamenii","the people","noun"],
 ["prima","the first (f.)","num"],["primul","the first (m.)","num"],
 ["m-am","(reflexive) have — contraction of mă + am","part","M-am trezit = I woke up (lit. 'myself I-have woken')."],
 ["ci","but rather, but instead","conj","A stronger contrast than dar — corrects the previous clause instead of just contrasting with it."],
 ["aceasta","this (f.) — pronoun 'aceasta' or adjective 'această' (before a noun)","pron / adj"],
 ["într-un","in a, into a (m./n.)","prep"],["dovadă","proof, evidence","noun"],
 ["însă","however, but","conj"],["acesta","this (m., formal/written)","pron"],
 ["euro","euro (currency)","noun","Invariable: un euro, doi euro."],
 ["toate","all (f./pl.)","adj","Form of toată/tot agreeing with a feminine or neuter plural noun."],
 ["acest","this (m., before a noun)","adj","Acest bărbat = this man — contrast acesta, which stands alone."],
 ["dintre","from among, of","prep","Unul dintre ei = one of them."],
 ["numai","only","adv"],["mine","me","pron","Used after a preposition: pentru mine, cu mine."],
 ["perfect","perfect; also 'Perfect!' = great!","adj"],
 ["mi","to me","pron","Short elided form of îmi, used before a vowel: mi-e dor = I miss (it/them)."],
 ["lucrurile","the things","noun"],["mâncare","food","noun"],["spre","toward, to","prep"],
 ["deloc","not at all","adv","Needs nu on the verb: nu-mi place deloc = I don't like it at all."],
 ["exact","exact(ly)","adj / adv"],["adresă","address","noun"],
 ["într-o","in a, into a (f.)","prep"],
 ["m-a","has ... me — contraction of mă + a","part","M-a văzut = he/she saw me."],
 ["distanță","distance","noun"],
 ["lumea","the world; everyone, people","noun","Idiomatic: toată lumea = everyone."],
 ["unele","some (f./pl.)","adj / pron"],["alt","other, another (m.)","adj"],
 ["plus","plus; also, in addition","conj"],["națională","national (f.)","adj"],
 ["mii","thousands","num","Plural of mie."],["kilometri","kilometers","noun"],
 ["atât","so much, that much","adv / adj"],["mașină","car; machine","noun"],
 ["model","model","noun"],
 ["romane","Romanian (f./pl. adjective); also 'novels' (plural of roman)","adj / noun"],
 ["perioadă","period (of time)","noun"],["același","the same (m.)","adj / pron"],
 ["imediat","immediately","adv"],["cuvinte","words","noun"],
 ["orice","any, anything, whatever","pron / adj"],["aceeași","the same (f.)","adj / pron"],
 ["veți","(future auxiliary) will — used with voi/dumneavoastră","part","Veți vedea = you will see."],
 ["lucruri","things","noun"],
 ["uniunii","of the Union — genitive/dative of uniune","noun","Part of Uniunea Europeană / Uniunii Europene, the European Union."],
 ["europene","European (f./pl.)","adj"],["identitate","identity","noun"],
 ["își","himself, herself, themselves (dative reflexive)","pron","Different from se: își amintește = he/she remembers (lit. 'reminds to-self')."],
 ["mi-a","to me + has — perfect-tense contraction","part","Mi-a spus = he/she told me (lit. 'to-me he/she-has said')."],
 ["niciunul","none, not a single one (m.)","pron","Requires nu on the verb, like nimic/nimeni."],
 ["nici","neither, not even","conj / adv","Nici...nici... = neither...nor."],
 ["lumină","light","noun"],["somn","sleep","noun","Somn ușor = sleep well."],
 // Next tier of the same audit: every remaining word-form occurring 3+ times.
 ["mei","my (m., plural)","pron"],["mele","my (f., plural)","pron"],
 ["total","total; altogether","noun / adj"],
 ["drum","road, way, journey","noun","Drum bun! = safe travels!"],
 ["drumul","the road","noun"],
 ["ne-am","(reflexive) have — contraction of ne + am","part","Ne-am întâlnit = we met."],
 ["l-am","have ... him — contraction of îl + am","part","L-am văzut = I saw him."],
 ["înapoi","back, backward","adv"],["naționale","national (f./n., plural)","adj"],
 ["varză","cabbage","noun"],
 ["bună","good (f.)","adj"],["buni","good (m., plural)","adj"],["bune","good (f./n., plural)","adj"],
 ["vită","cattle, beef; also 'vine, grapevine stock' as viță","noun","carne de vită = beef; viță de vie = grapevine — two different words, homographs once diacritics are stripped."],
 ["mi-am","to myself + have — perfect-tense contraction","part","Mi-am amintit = I remembered (lit. 'to myself I-have reminded')."],
 ["complet","complete(ly)","adj / adv"],["site","website","noun"],
 ["central","central","adj"],["moment","moment","noun"],
 ["zonă","zone, area","noun"],["medie","average","adj / noun"],
 ["ultimii","the last (m., plural)","adj"],["ultima","the last (f.)","adj"],
 ["lipsă","lack, absence","noun","în lipsa lui = in his absence."],
 ["internetul","the internet","noun"],["diferență","difference","noun"],
 ["manual","by hand (adj.); also 'textbook' (noun)","adj / noun","manual de română = Romanian textbook."],
 ["totuși","however, nevertheless","adv / conj"],
 ["altcuiva","to someone else","pron","Dative of altcineva."],
 ["cauză","cause","noun","din cauza = because of."],
 ["transport","transport, transportation","noun"],
 ["lucrările","the works, papers, assignments","noun"],
 ["zgomot","noise","noun"],
 ["ceea","that which","pron","Always in ceea ce = what, which: Ceea ce spui e adevărat = What you're saying is true."],
 ["ministerul","the ministry","noun"],
 ["curte","yard, courtyard; also 'court' (legal)","noun"],
 ["mirosul","the smell","noun"],
 ["miezul","the middle, the core","noun","miezul nopții = midnight."],
 ["întrebarea","the question","noun"],
 ["mi-au","to me + (they) have — perfect-tense contraction","part","Mi-au spus = they told me."],
 ["comuna","the commune (rural municipality); also 'common, shared' (f.)","noun / adj"],
 // Third tier of the same audit: every remaining word-form occurring exactly
 // twice. mihai_b and elenap, further down the source texts, are forum-style
 // anonymized usernames in a reading passage (like anonim_23) — not words,
 // deliberately left unglossed.
 ["interesant","interesting","adj"],["poză","photo, picture","noun"],
 ["verzi","green (plural)","adj"],
 ["vreo","about, some (approximate quantity, f./n.)","adj","N-ar observa vreo diferență = wouldn't notice any difference."],
 ["obișnuită","usual, ordinary (f.)","adj"],["principal","main, principal","adj"],
 ["nu-mi","not to me — contraction of nu + îmi","part","Nu-mi place = I don't like it."],
 ["câte","how many (each); câte unul = one each","adj / pron"],
 ["clasa","the classroom; the grade (school year)","noun"],
 ["s-au","(reflexive/passive, plural) have — contraction of se + au","part"],
 ["dreptate","justice, rightness","noun","a avea dreptate = to be right."],
 ["dublă","double (f.)","adj"],["douăsprezece","twelve (f./n.)","num"],
 ["deocamdată","for now, for the time being","adv"],
 ["economie","economy; also 'savings'","noun"],
 ["vedere","view, sight","noun","punct de vedere = point of view."],
 ["net","net (adj., as in net weight); also short for 'internet'","adj / noun"],
 ["dinainte","beforehand, in advance","adv"],["porc","pig; pork","noun"],
 ["pașaportul","the passport","noun"],
 ["ședere","stay, residence","noun","permis de ședere = residence permit."],
 ["umeri","shoulders","noun"],["apropo","by the way","adv"],
 ["regulă","rule","noun"],["următorul","the next (m.)","adj"],
 ["rezidență","residence","noun"],["copie","copy","noun"],
 ["oricând","anytime, whenever","adv"],["lift","elevator","noun"],
 ["animale","animals","noun"],["companie","company","noun"],["companii","companies","noun"],
 ["viitoare","future, next (f.)","adj"],["construcții","constructions, buildings","noun"],
 ["plecare","departure","noun"],["aproximativ","approximately","adv"],
 ["oferte","offers","noun"],["ofertă","offer","noun"],
 ["geacă","jacket","noun"],["clasic","classic","adj"],
 ["moarte","death","noun"],["lume","world; people","noun"],
 ["libertate","freedom, liberty","noun"],["național","national (m.)","adj"],
 ["galben","yellow","adj"],["sud","south","noun"],["est","east","noun"],
 ["neagră","black (f.)","adj"],["istorice","historical (f./pl.)","adj"],
 ["domnule","sir, mister (vocative)","noun","Polite address: Domnule Marin."],
 ["aer","air","noun"],["condiționat","conditioned","adj","aer condiționat = air conditioning."],
 ["bloc","apartment building, block","noun"],["minimum","minimum","noun / adv"],
 ["astfel","thus, this way","adv"],["liniștea","the quiet, the silence","noun"],
 ["liniște","quiet, silence","noun"],
 ["calculul","the calculation","noun"],["practice","practical (f./pl.)","adj"],
 ["monitorul","the monitor","noun"],
 ["practică","practice; internship (noun); also '(he/she) practices' (verb)","noun / verb"],
 ["abia","just, barely, hardly","adv"],
 ["maghiară","Hungarian (language; f. adjective)","adj / noun"],
 ["accentul","the accent","noun"],["simplu","simple","adj"],
 ["foi","sheets, leaves (of paper)","noun"],["diferite","different (f./pl.)","adj"],
 ["italiană","Italian (language; f. adjective)","adj / noun"],["măcar","at least","adv"],
 ["înregistrare","registration, recording","noun"],["document","document","noun"],
 ["original","original","adj"],
 ["unor","of some, to some","art","Oblique form of niște/unii."],
 ["spațiului","of the space","noun"],["imigrări","immigration(s)","noun"],
 ["celor","of those, to those","pron","Oblique form of cei/cele."],
 ["membrii","the members","noun"],["legal","legal","adj"],
 ["documentul","the document","noun"],["asfalt","asphalt","noun"],
 ["praf","dust","noun"],["clienți","clients, customers","noun"],
 ["studiu","study","noun"],["publicat","published","adj"],
 ["marile","the big ones (f./pl.)","adj"],["măsuri","measures","noun"],
 ["puternic","strong, powerful","adj"],["concluzia","the conclusion","noun"],
 ["sindicatele","the unions","noun"],["județe","counties","noun"],
 ["străine","foreign (f./pl.)","adj"],
 ["avusesem","I had had (pluperfect of a avea)","verb"],
 ["perete","wall","noun"],["primele","the first (f./pl.)","num"],
 ["abonament","subscription","noun"],["blocului","of the building","noun"],
 ["trecea","was passing (imperfect of a trece)","verb"],
 ["ne-a","has ... us — contraction of ne + a","part"],
 ["verificam","I was checking, used to check (imperfect); also 'we check' (verificăm, present)","verb"],
 ["sine","oneself","pron","de la sine = on its own; în sine = in itself."],
 ["modul","the module; also 'the way, the manner' (definite of mod)","noun"],
 ["corect","correct(ly)","adj / adv"],
 ["vei","(future auxiliary) will — informal singular","part","Vei vedea = you will see."],
 ["mod","way, manner, mode","noun"],
 ["așadar","therefore, so","adv / conj"],["nicăieri","nowhere","adv"],
 ["treaz","awake","adj"],["nelimitat","unlimited","adj"],
 ["gigabytes","gigabytes","noun"],["internet","internet","noun"],
 ["străinătate","abroad, foreign countries","noun","în străinătate = abroad."],
 ["mașini","cars","noun"],
 ["gunoiul","the trash, the garbage","noun"],["scară","the stairs; scale; ladder","noun"],
 ["liftul","the elevator","noun"],["sub","under, below","prep"],
 ["curentă","current (f., adj.); also related to 'curent' (electricity/current)","adj"],
 ["cuptor","oven","noun"],["ok","ok","adv"],
 ["plafonul","the ceiling; also 'cap, limit' (figurative)","noun"],
 ["dintr-un","from a, out of a (m./n.)","prep"],["liceu","high school","noun"],
 ["clădire","building","noun"],
 ["i-am","have ... to him/her — contraction of îi + am","part","I-am răspuns = I answered him/her."],
 ["tablă","the blackboard; also sheet metal","noun"],["elevi","students, pupils","noun"],
 ["alte","other (f./pl.)","adj"],["cuiva","to someone","pron","Dative of cineva."],
 ["veche","old (f.)","adj"],["dintr-o","from a, out of a (f.)","prep"],
 ["altundeva","somewhere else","adv"],
 ["microbuzului","of the minibus","noun"],["cursa","the route, the run (of a bus/train)","noun"],
 ["primarul","the mayor","noun"],["geamuri","windows","noun"],
 ["căldură","heat, warmth","noun"],["uliță","lane, small village street","noun"],
 ["le-au","have ... them — contraction of le + au","part"],
 ["vestea","the news","noun","Definite form of veste."],
 // Fourth (and largest) tier of the same audit: the 1-occurrence tail —
 // every word left that appears exactly once anywhere in the course.
 //
 // Three whole tenses turned up along the way that the conjugation engine
 // has no category for at all: the pluperfect (terminasem = "I had
 // finished"), the literary simple past (făcui = "I did"), and the gerund
 // (lucrând = "working"). Patched here as one-off forms rather than taught
 // as a paradigm — conjugation.js would need a real TENSE_LABEL entry and
 // engine rules for each to generate them properly, which is follow-up work,
 // not a same-night fix.
 ["deputaților","of the Deputies","noun","Camera Deputaților = the Chamber of Deputies."],
 ["asociația","the association","noun"],["absențele","the absences","noun"],
 ["autorii","the authors","noun"],["buletinul","the ID card (colloquial)","noun"],
 ["cv-ul","the CV, the résumé","noun"],["calendarul","the calendar","noun"],
 ["cerințe","requirements","noun"],["conform","according to, in accordance with","prep"],
 ["curieri","couriers","noun"],["câinii","the dogs","noun"],
 ["diferențele","the differences","noun"],["documentele","the documents","noun"],
 ["educație","education","noun"],["europeană","European (f.)","adj"],
 ["forma","the form; the shape","noun"],["frica","the fear","noun"],
 ["general","general","adj"],["greșeli","mistakes, errors","noun"],
 ["imperiul","the empire","noun"],["inspectoratul","the inspectorate","noun"],
 ["new","new (English fragment of a place name like New York)","adj"],
 ["oficial","official","adj"],["organizațiile","the organizations","noun"],
 ["otoman","Ottoman","adj"],["prognoza","the forecast","noun"],
 ["parcarea","the parking (lot)","noun"],["povestea","the story","noun"],
 ["povestiți-mi","tell me (formal imperative + attached dative pronoun)","verb"],
 ["primăria","the city hall","noun"],
 ["principatelor","of the Principalities","noun","Historical: Unirea Principatelor, the 1859 union of Moldavia and Wallachia."],
 ["psihologii","the psychologists","noun"],
 ["păcat","sin; also 'what a pity, what a shame'","noun / interj"],
 ["părinții","the parents","noun"],["regulament","regulation, rules","noun"],
 ["reprezentanții","the representatives","noun"],["românească","Romanian (f.)","adj"],
 ["roșiile","the tomatoes","noun"],["schimbarea","the change","noun"],
 ["senatul","the Senate","noun"],["sentimentul","the feeling","noun"],
 ["spuneți-mi","tell me (formal imperative + attached dative pronoun)","verb"],
 ["statisticile","the statistics","noun"],["susținătorii","the supporters","noun"],
 ["taxe","taxes, fees","noun"],["tinerii","the young people","noun"],
 ["ue","EU (European Union)","noun"],["uniunea","the Union","noun"],
 ["vom","we will (future auxiliary)","part"],["vârful","the peak, the summit","noun"],
 ["terminasem","I had finished (pluperfect)","verb"],
 ["adusesem","I had brought (pluperfect)","verb"],
 ["crezusem","I had believed (pluperfect)","verb"],
 ["dormisem","I had slept (pluperfect)","verb"],
 ["făcusem","I had done, I had made (pluperfect)","verb"],
 ["făcui","I did, I made (literary simple past)","verb"],
 ["fusese","he/she/it had been (pluperfect)","verb"],
 ["mâncasem","I had eaten (pluperfect)","verb"],
 ["numărase","he/she had counted (pluperfect)","verb"],
 ["pregătise","he/she had prepared (pluperfect)","verb"],
 ["promisesem","I had promised (pluperfect)","verb"],
 ["pusese","he/she had put (pluperfect)","verb"],
 ["spusese","he/she had said (pluperfect)","verb"],
 ["spusesem","I had said (pluperfect)","verb"],
 ["tăcuse","he/she had gone quiet, had fallen silent (pluperfect)","verb"],
 ["trecusem","I had passed (pluperfect)","verb"],
 ["venise","he/she had come (pluperfect)","verb"],
 ["mersei","I went (literary simple past)","verb"],
 ["apăsând","pressing (gerund)","verb"],["ascultând","listening (gerund)","verb"],
 ["lucrând","working (gerund)","verb"],["râzând","laughing (gerund)","verb"],
 ["știind","knowing (gerund)","verb"],["făcând","doing, making (gerund)","verb"],
 ["accident","accident","noun"],["acela","that (m.)","pron"],
 ["acele","those (f./n.)","adj"],["aceleași","the same (f./pl.)","adj / pron"],
 ["aceste","these (f./n.)","adj"],["acestea","these (f./n., pronoun)","pron"],
 ["act","act, official document","noun"],["actualizate","updated (f./pl.)","adj"],
 ["actuală","current, present (f.)","adj"],["adesea","often","adv"],
 ["adeverință","certificate, note (official)","noun"],
 ["administratorul","the administrator, the building manager","noun"],
 ["agenției","of the agency","noun"],["aglomerate","crowded, busy (f./pl.)","adj"],
 ["ajutor","help","noun"],["ala","that one (colloquial for ăla)","pron"],
 ["albastră","blue (f.)","adj"],["altcineva","someone else","pron"],
 ["alternativă","alternative","noun / adj"],["aluatul","the dough","noun"],
 ["ambalajul","the packaging","noun"],["amânarea","the postponement","noun"],
 ["anume","namely, specifically","adv"],["anumită","a certain (f.)","adj"],
 ["anxietatea","the anxiety","noun"],["aprinsă","lit, turned on (f.)","adj"],
 ["arhitectură","architecture","noun"],["articol","article","noun"],
 ["asemănătoare","similar","adj"],["asistent","assistant","noun"],
 ["asociații","associations","noun"],["aspiratorul","the vacuum cleaner","noun"],
 ["asupra","upon, on, about","prep"],["atent","attentive, careful","adj"],
 ["august","August","noun"],["aurie","golden (f.)","adj"],
 ["autorilor","of the authors","noun"],["avans","advance (payment)","noun"],
 ["avansat","advanced","adj"],["așezate","arranged, placed (f./pl.)","adj"],
 ["așteptare","waiting, expectation","noun"],
 ["banală","banal, trivial (f.)","adj"],["bandă","band, tape; also lane (traffic)","noun"],
 ["banilor","of the money","noun"],["bibliotecă","library","noun"],
 ["bicicleta","the bicycle","noun"],["boală","illness, sickness","noun"],
 ["brațele","the arms","noun"],["brusc","suddenly; abrupt","adv / adj"],
 ["bulevard","boulevard, avenue","noun"],["bulevarde","boulevards","noun"],
 ["bulevardul","the boulevard","noun"],["burse","scholarships","noun"],
 ["bărbații","the men","noun"],["cabinetul","the (doctor's) office","noun"],
 ["cafenele","cafes","noun"],["calcul","calculation","noun"],
 ["calculatoare","computers","noun"],["calculator","computer","noun"],
 ["calcule","calculations","noun"],["candidații","the candidates","noun"],
 ["cantități","quantities","noun"],["car","cart, wagon","noun"],
 ["caraghios","funny, ridiculous","adj"],["caselor","of the houses","noun"],
 ["ceapa","the onion","noun"],["ceasul","the clock, the watch","noun"],
 ["ceasuri","clocks, watches, hours","noun"],
 ["celelalte","the other ones (f./pl.)","pron"],
 ["celuilalt","to/of the other one (m.)","pron"],
 ["centrale","central (f./pl.); also 'power plants'","adj / noun"],
 ["cercetător","researcher","noun"],["cercetători","researchers","noun"],
 ["chat","chat","noun"],["cheltuiala","the expense","noun"],
 ["circulația","the traffic; circulation","noun"],["cititor","reader","noun"],
 ["ciudat","strange, weird","adj"],["civilizație","civilization","noun"],
 ["clarificări","clarifications","noun"],["colegilor","to/of the colleagues","noun"],
 ["comediile","the comedies","noun"],["comercianții","the merchants","noun"],
 ["comoditate","comfort, convenience","noun"],["comoditatea","the comfort","noun"],
 ["comportament","behavior","noun"],["compoziție","composition","noun"],
 ["comunist","communist","adj / noun"],["concentrare","concentration","noun"],
 ["concrete","concrete (f./pl.)","adj"],["condimentele","the spices","noun"],
 ["condiții","conditions","noun"],["considerabilă","considerable (f.)","adj"],
 ["contabilitate","accounting","noun"],["contactul","the contact","noun"],
 ["containerele","the containers","noun"],
 ["contravaloarea","the equivalent value","noun"],
 ["corecte","correct (f./pl.)","adj"],["costuri","costs","noun"],
 ["creierului","of the brain","noun"],["criză","crisis","noun"],
 ["croasant","croissant","noun"],["cumpărăturile","the shopping, the purchases","noun"],
 ["cumva","somehow","adv"],["cunoștințe","knowledge; acquaintances","noun"],
 ["cuplu","couple","noun"],["curent","current (electricity); trend","noun"],
 ["curiozitate","curiosity","noun"],["cursul","the course; the exchange rate","noun"],
 ["cutiile","the boxes","noun"],["căci","for, because (literary)","conj"],
 ["căruța","the cart","noun"],["datelor","of the data","noun"],
 ["decentă","decent (f.)","adj"],["definitiv","definitively, for good","adv"],
 ["degrabă","quickly — mai degrabă = rather","adv"],["demult","long ago","adv"],
 ["des","often; also thick, dense","adv / adj"],
 ["deschise","open (f./pl.)","adj"],["desene","drawings","noun"],
 ["destui","enough (m., plural)","adj"],["detaliat","detailed","adj"],
 ["dezastru","disaster","noun"],["diagnostic","diagnosis","noun"],
 ["dicționarele","the dictionaries","noun"],["diferit","different","adj"],
 ["dificil","difficult","adj"],["direct","direct(ly)","adj / adv"],
 ["directă","direct (f.)","adj"],["disciplină","discipline","noun"],
 ["discret","discreet","adj"],["discuțiile","the discussions","noun"],
 ["disponibilitatea","the availability","noun"],
 ["dobânda","the interest (banking)","noun"],["doctorului","of the doctor","noun"],
 ["doilea","second — al doilea = the second","num"],
 ["domiciliu","domicile, home address","noun"],
 ["două-trei","two or three","num"],["dovezi","proofs, evidence","noun"],
 ["drag","dear","adj"],["duminicile","the Sundays","noun"],
 ["echipele","the teams","noun"],["ecran","screen","noun"],
 ["ecranul","the screen","noun"],["ecranului","of the screen","noun"],
 ["efect","effect","noun"],["eficient","efficient","adj"],
 ["efort","effort","noun"],["egal","equal","adj"],
 ["elegantă","elegant (f.)","adj"],["enorm","enormous, huge","adj / adv"],
 ["entuziasm","enthusiasm","noun"],["european","European (m.)","adj"],
 ["evidentă","evident, obvious (f.)","adj"],["examen","exam","noun"],
 ["examenele","the exams","noun"],["examenelor","of the exams","noun"],
 ["expirarea","the expiration","noun"],["factură","invoice, bill","noun"],
 ["fapt","fact","noun"],["februarie","February","noun"],
 ["femeie","woman","noun"],["femeilor","of the women","noun"],
 ["final","final, end","noun / adj"],
 ["finalizarea","the finalization, the completion","noun"],
 ["fix","fixed; exactly","adj / adv"],["fizică","physics","noun"],
 ["flexibil","flexible","adj"],["florile","the flowers","noun"],
 ["foame","hunger","noun"],["foc","fire","noun"],["focul","the fire","noun"],
 ["formațiunea","the formation (administrative unit, or musical group)","noun"],
 ["formațiuni","formations","noun"],["fortificate","fortified","adj"],
 ["forțe","forces","noun"],["frecvente","frequent (f./pl.)","adj"],
 ["frumoase","beautiful (f./pl.)","adj"],
 ["frunte","forehead; also 'front, forefront'","noun"],
 ["furtună","storm","noun"],["fântână","well, fountain","noun"],
 ["gard","fence","noun"],["garduri","fences","noun"],
 ["garsonieră","studio apartment","noun"],["gaură","hole","noun"],
 ["găurit","drilled, full of holes","adj"],["geam","window (pane)","noun"],
 ["ghiocei","snowdrops","noun"],["glumă","joke","noun"],
 ["goală","empty (f.)","adj"],["grafică","graphics","noun"],
 ["gratuit","free (of charge)","adj"],["grea","heavy, difficult (f.)","adj"],
 ["greci","Greeks","noun"],["grele","heavy (f./pl.)","adj"],
 ["gri","gray","adj"],["grijă","care, worry","noun"],
 ["groasă","thick (f.)","adj"],["groază","horror, dread","noun"],
 ["grăbite","hurried (f./pl.)","adj"],["gustoase","tasty (f./pl.)","adj"],
 ["guvernământ","government, form of rule","noun"],
 ["gândul","the thought","noun"],["găleți","buckets","noun"],
 ["haină","coat, garment","noun"],["hibrid","hybrid","adj / noun"],
 ["hormonul","the hormone","noun"],["hârtie","paper","noun"],
 ["hârtii","papers","noun"],["iarăși","again","adv"],
 ["imagine","image","noun"],["imens","immense","adj"],
 ["incomplete","incomplete (f./pl.)","adj"],["independent","independent","adj"],
 ["industria","the industry","noun"],
 ["inima","the heart","noun"],["interactivă","interactive (f.)","adj"],
 ["interioară","interior, inner (f.)","adj"],["istorie","history","noun"],
 ["italiancă","Italian (woman)","noun"],["job","job","noun"],
 ["județul","the county","noun"],["kilogram","kilogram","noun"],
 ["laptopul","the laptop","noun"],["laterale","lateral, side (f./pl.)","adj"],
 ["lecturii","of the reading","noun"],["legat","tied, bound; also 'related to'","adj"],
 ["lesă","leash","noun"],["libere","free (f./pl.)","adj"],
 ["lichide","liquids","noun"],["lighean","washbasin","noun"],
 ["lingură","spoon","noun"],["liniștit","calm, quiet","adj"],
 ["liniștiți","calm, quiet (pl.)","adj"],["linkul","the link","noun"],
 ["lista","the list","noun"],["literatură","literature","noun"],
 ["living","living room","noun"],["localitate","locality","noun"],
 ["localități","localities","noun"],["localitățile","the localities","noun"],
 ["localnicii","the locals","noun"],["luminos","bright, luminous","adj"],
 ["lunar","monthly","adj / adv"],["lupte","fights, battles","noun"],
 ["luptă","fight, battle","noun"],["lămâie","lemon","noun"],
 ["mandat","term of office","noun"],["mandate","terms of office","noun"],
 ["marcajelor","of the markings","noun"],["marginea","the edge","noun"],
 ["marketing","marketing","noun"],["marțea","on Tuesdays","adv"],
 ["meci","match, game","noun"],["melatonină","melatonin","noun"],
 ["memorare","memorization","noun"],["memoria","the memory","noun"],
 ["metri","meters","noun"],["mijloace","means","noun"],
 ["milioane","millions","noun"],["minciună","lie","noun"],
 ["ministerului","of the ministry","noun"],["ministrul","the minister","noun"],
 ["minte","mind","noun"],["minunat","wonderful","adj"],
 ["mobilat","furnished (m.)","adj"],["mobilată","furnished (f.)","adj"],
 ["mobilă","furniture","noun"],["modele","models","noun"],
 ["modernă","modern (f.)","adj"],["motiv","reason, motive","noun"],
 ["mucegai","mold, mildew","noun"],["murată","pickled (f.)","adj"],
 ["mutare","move, moving","noun"],
 ["mărunt","small, minor — bani mărunți = small change","adj"],
 ["măsurarea","the measuring","noun"],["măsurătorile","the measurements","noun"],
 ["natal","native, home (adj.)","adj"],["naveta","the commute","noun"],
 ["națiune","nation","noun"],["neașteptat","unexpected","adj"],
 ["necesare","necessary (f./pl.)","adj"],["nedespachetate","unpacked (f./pl.)","adj"],
 ["negri","black (m., plural)","adj"],["nelocuit","uninhabited","adj"],
 ["nepotrivit","unsuitable","adj"],["nervi","nerves","noun"],
 ["neîntrerupt","uninterrupted","adj"],["nivel","level","noun"],
 ["nivelul","the level","noun"],["noastre","our (f./pl.)","pron"],
 ["nobiliar","noble, of nobility","adj"],["non-stop","24/7, non-stop","adj / adv"],
 ["nouăsprezecelea","nineteenth","num"],["numerar","cash","noun"],
 ["oală","pot (cooking)","noun"],["oară","time, occasion","noun"],
 ["obiect","object","noun"],["obiectul","the object","noun"],
 ["obișnuit","usual, ordinary (m.)","adj"],["obișnuite","usual, ordinary (f./pl.)","adj"],
 ["ocupate","occupied, busy (f./pl.)","adj"],["oficială","official (f.)","adj"],
 ["onestă","honest (f.)","adj"],["online","online","adj / adv"],
 ["orașelor","of the cities","noun"],["orezul","the rice","noun"],
 ["organizarea","the organizing, the organization","noun"],
 ["oricum","anyway, anyhow","adv"],["oricât","however much","adv"],
 ["origine","origin","noun"],
 ["ortosomnie","orthosomnia (anxiety about sleep-tracking data)","noun"],
 ["ouă","eggs","noun"],["oțet","vinegar","noun"],["palton","overcoat","noun"],
 ["paralel","parallel","adj"],
 ["parcursul","the course, the duration — pe parcursul = over the course of","noun"],
 ["parter","ground floor","noun"],["pasageri","passengers","noun"],
 ["pasul","the step","noun"],["pașaport","passport","noun"],
 ["pedagogic","pedagogical","adj"],["perioade","periods","noun"],
 ["perioadele","the periods","noun"],["periodic","periodic(ally)","adj / adv"],
 ["permanent","permanent(ly)","adj / adv"],["permanentă","permanent (f.)","adj"],
 ["persoană","person","noun"],["personajelor","of the characters","noun"],
 ["piele","skin; leather","noun"],["pierdere","loss","noun"],
 ["pierderea","the loss","noun"],["plastic","plastic","noun / adj"],
 ["platformă","platform","noun"],["plecării","of the departure","noun"],
 ["plictiseala","the boredom","noun"],["pline","full (f./pl.)","adj"],
 ["poduri","bridges","noun"],["politețe","politeness","noun"],
 ["pom","(fruit) tree","noun"],["pompierii","the firefighters","noun"],
 ["populația","the population","noun"],["posibilă","possible (f.)","adj"],
 ["poveste","story","noun"],["prea","too (excessively)","adv"],
 ["precum","such as, like","conj / prep"],
 ["prezentați","you present (formal); also 'present' (adj., plural)","verb / adj"],
 ["prezenți","present (m., plural)","adj"],
 ["prietenilor","to/of the friends","noun"],["prim-ministru","prime minister","noun"],
 ["primărie","city hall","noun"],["primăriei","of the city hall","noun"],
 ["privind","regarding, concerning","prep","Gerund of a privi, used as a preposition."],
 ["procedura","the procedure","noun"],["producția","the production","noun"],
 ["produsele","the products","noun"],["produsul","the product","noun"],
 ["programat","scheduled, programmed","adj"],["progres","progress","noun"],
 ["proiect","project","noun"],["proiecte","projects","noun"],
 ["propria","one's own (f.)","adj"],["propriului","of one's own (m.)","adj"],
 ["prosop","towel","noun"],["psihică","psychological, mental (f.)","adj"],
 ["puncte","points","noun"],["punga","the (plastic) bag","noun"],
 ["pur","pure","adj"],["puternice","strong (f./pl.)","adj"],
 ["puține","few, little (f./pl.)","adj"],["părți","parts","noun"],
 ["pătrunjel","parsley","noun"],["realitate","reality","noun"],
 ["reală","real (f.)","adj"],["recensământ","census","noun"],
 ["regimului","of the regime","noun"],["regret","regret","noun"],
 ["reguli","rules","noun"],["rele","bad (f./pl.)","adj"],
 ["reparație","repair","noun"],["reprezentant","representative","noun"],
 ["responsabilitate","responsibility","noun"],
 ["restituirea","the refund, the restitution","noun"],
 ["restricții","restrictions","noun"],["restul","the rest, the remainder","noun"],
 ["rezistenți","resistant, resilient (m./pl.)","adj"],["ritm","rhythm","noun"],
 ["romantică","romantic (f.)","adj"],["românește","in Romanian (adverb)","adv"],
 ["roșii","tomatoes; also 'red' (f./pl. adjective)","noun / adj"],
 ["rudenie","kinship, relatives","noun"],["rușine","shame","noun"],
 ["rând","row, turn, line (queue)","noun"],["rândul","the turn, the row","noun"],
 ["răutate","malice, meanness","noun"],["răzbunătoare","vengeful (f.)","adj"],
 ["saci","sacks, bags","noun"],["scorul","the score","noun"],
 ["scurte","short (f./pl.)","adj"],["scădere","decrease","noun"],
 ["scăderea","the decrease","noun"],["scării","of the stairs","noun"],
 ["secolul","the century","noun"],["secunde","seconds","noun"],
 ["sejur","stay (vacation)","noun"],["sens","meaning; direction","noun"],
 ["sentiment","feeling","noun"],["separat","separate(ly)","adj / adv"],
 ["separate","separate (f./pl.)","adj"],["serie","series","noun"],
 ["servicii","services","noun"],["serviciilor","of the services","noun"],
 ["silabă","syllable","noun"],["similar","similar","adj"],
 ["simplă","simple (f.)","adj"],["sincer","sincere(ly), honest(ly)","adj / adv"],
 ["situația","the situation","noun"],["slab","weak; thin","adj"],
 ["sociale","social (f./pl.)","adj"],["socoteală","count, reckoning, bill","noun"],
 ["spații","spaces","noun"],["spațiu","space","noun"],
 ["specialist","specialist","noun"],["specialiști","specialists","noun"],
 ["specialitate","specialty","noun"],["spitalele","the hospitals","noun"],
 ["standuri","stands, stalls","noun"],["starea","the state, the condition","noun"],
 ["stratul","the layer","noun"],["structuri","structures","noun"],
 ["străin","foreign; stranger","adj / noun"],["subiectul","the subject","noun"],
 ["sud-est","southeast","noun"],["sud-estul","the southeast","noun"],
 ["sud-vest","southwest","noun"],["suferința","the suffering","noun"],
 ["super","super, great (colloquial)","adj"],["superb","superb, gorgeous","adj"],
 ["superioare","superior, upper (f./pl.)","adj"],
 ["suplimentar","additional, supplementary","adj"],
 ["suplimentare","additional (f./pl.)","adj"],
 ["surprinzătoare","surprising (f.)","adj"],["surprinzător","surprising","adj"],
 ["sânge","blood","noun"],["sârba","the sârbă (a traditional Romanian dance)","noun"],
 ["sănătate","health","noun"],["săturat","full, satiated (from eating)","adj"],
 ["tehnologie","technology","noun"],["telefoanelor","of the phones","noun"],
 ["telemuncii","of remote work (telemuncă)","noun"],
 ["televizor","television (set)","noun"],["temperatură","temperature","noun"],
 ["tendința","the tendency","noun"],["teritoriale","territorial (f./pl.)","adj"],
 ["teritorială","territorial (f.)","adj"],["terminate","finished, completed (f./pl.)","adj"],
 ["termopan","double glazing (window type)","noun"],
 ["teze","term papers, exams","noun"],["tineri","young people","noun"],
 ["tirani","tyrants","noun"],["titlu","title","noun"],
 ["tocmai","just, exactly","adv"],["tradițional","traditional","adj"],
 ["trecătoare","passing, temporary (f.)","adj"],["treji","awake (m., plural)","adj"],
 ["tristețe","sadness","noun"],["turci","Turks","noun"],
 ["tătari","Tatars","noun"],["uitarea","the forgetting, oblivion","noun"],
 ["ulei","oil","noun"],["ultimele","the last (f./pl.)","adj"],
 ["ultimul","the last (m.)","adj"],["undeva","somewhere","adv"],
 ["unit","united","adj"],["unitar","unitary","adj"],["urgență","emergency","noun"],
 ["urmele","the traces, the marks","noun"],["urâte","ugly (f./pl.)","adj"],
 ["utilată","equipped, fitted (f.)","adj"],["ușoară","easy, light (f.)","adj"],
 ["vagă","vague (f.)","adj"],["valabil","valid","adj"],
 ["valorile","the values","noun"],["varianta","the variant","noun"],
 ["variante","variants","noun"],["vecinilor","of the neighbors","noun"],
 ["verbe","verbs","noun"],["verile","the summers","noun"],
 ["verișoară","cousin (female)","noun"],["vertical","vertical","adj"],
 ["vest","west","noun"],["veste","news (piece of)","noun"],
 ["veterinarul","the veterinarian","noun"],["vinerea","on Fridays","adv"],
 ["viu","alive, lively","adj"],["vițel","calf","noun"],
 ["vorba","the word, the saying","noun"],["vorbire","speech, speaking","noun"],
 ["voștri","your (m., plural)","pron"],["vremuri","times, eras","noun"],
 ["vreun","any, some (m.)","adj"],["vârf","peak, tip","noun"],
 ["zahăr","sugar","noun"],["zeamă","broth, brine, juice","noun"],
 ["zeci","tens — de zeci = tens of","num"],["zgomotos","noisy","adj"],
 ["începerea","the beginning, the start","noun"],
 ["închiderea","the closing","noun"],["îndepărtată","distant, remote (f.)","adj"],
 ["îngrijit","cared for, well-kept","adj"],["îngrijorare","worry, concern","noun"],
 ["întregi","whole, entire (m./pl.)","adj"],
 ["întrerupte","interrupted (f./pl.)","adj"],
 ["învățătoarelor","of the (female) teachers","noun"],
 ["înțelegere","understanding, agreement","noun"],
 ["șederii","of the stay","noun"],["șnur","cord, lace","noun"],
 ["țigări","cigarettes","noun"],["ținta","the target","noun"],
 // Contractions the tokenizer keeps as one word (hyphenated, no space).
 ["l-au","have ... him — contraction of îl + au","part"],
 ["le-a","has ... to them — contraction of le + a","part"],
 ["le-am","have ... to them — contraction of le + am","part"],
 ["n-a","hasn't — contraction of nu + a","part"],
 ["ne-o","to us + it/her — contraction of ne + o","part"],
 ["s-ar","would (reflexive/passive) — contraction of se + ar","part"],
 ["să-ți","that you (subjunctive + dative pronoun) — elided să + îți","part"],
 ["te-a","has ... you — contraction of te + a","part"],
 ["m-aș","I would (reflexive) — contraction of mă + aș","part"],
 ["mi-e","to me is — contraction of îmi + e","part","Mi-e dor = I miss (it/them)."],
 ["și-a","and has; also 'to himself/herself has' (dative reflexive)","part"],
 ["și-au","and have; also 'to themselves have' (dative reflexive)","part"],
 ["cunoscut-o","knew her — contraction of cunoscut + o","verb"],
 ["găsit-o","found her — contraction of găsit + o","verb"],
 ["reparat-o","repaired it — contraction of reparat + o","verb"],
 // Last handful. Several are a participle used as an adjective with full
 // gender/number agreement (aflat/aflată/aflați/aflate) — the conjugation
 // engine only ever generates the bare masculine singular, so the agreeing
 // forms need their own entry regardless of whether the verb itself exists.
 ["administratorului","of the administrator","noun"],
 ["aflate","located, found (f./pl.)","adj"],
 ["armate","armed (f./pl.); also 'armies'","adj / noun"],
 ["bază","base, basis","noun"],["construite","built, constructed (f./pl.)","adj"],
 ["creată","created (f.)","adj"],["culcare","going to bed, lying down","noun"],
 ["ediției","of the edition","noun"],["hahaha","laughter (ha ha ha)","interj"],
 ["lucrătoare","working (f.); also 'female worker'","adj / noun"],
 ["plănuit","planned","adj"],["pozele","the photos","noun"],
 ["praznic","feast, celebration (religious)","noun"],
 ["provocată","provoked, challenged (f.)","adj"],
 ["publicate","published (f./pl.)","adj"],
 ["revizuită","revised (f.)","adj"],["schimbare","change","noun"],
 ["taxă","tax, fee","noun"],["tocată","minced, chopped (f.)","adj"],
 ["urcarea","the climbing, the ascent","noun"],["vot","vote","noun"],
 ["văzute","seen (f./pl.)","adj"],["începusem","I had begun (pluperfect)","verb"]
];

/* Names are recognized so the gloss can say "proper name" rather than
   pretending the course is missing a word it should never contain. */
var KNOWN_NAMES = ["andrei","maria","ioana","elena","ion","radu","bianca","cristina","mihai","ana",
  "sarah","tom","lukas","vlad","sorin","alex","victor","dan","diana","paul","laura","bogdan",
  "cluj","cluj-napoca","bucurești","timișoara","iași","românia","herăstrău","aviatorilor",
  "ionescu","popescu","victoriei","berlin","londra","new york","america","anglia","franța","bulgaria",
  "moldova","brașov","transilvania","româniei","europa","europei",
  "oltenia","banat","maramureș","dobrogea","constanța","italia","spania","germania",
  "vali","viorica","marin","alexandru","ardeal","belgia","bucureștiul","bucureștiului",
  "carpați","chișinău","corvine","craiova","crișana","cuza","dobre","dunărea","dunării",
  "grecia","ioan","iulia","militari","moldoveanu","muntenia","nato","poiana","popa",
  "serbia","torino","traian","ucraina","ungaria","ștefan","york","interregio","mediaplus",
  "delta"];
/* new york above never actually matches either word of it: KNOWN_NAMES is
   checked one whitespace token at a time (see glossLookup), so a two-word
   entry here can only ever match a single-word click. Pre-existing, not
   something this pass fixes — flagged so nobody assumes multi-word names
   work here as a way to add "Uniunea Europeană". */

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
  reading:"Reading", production:"Written Production", review:"Review", contrast:"Compare"};

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
