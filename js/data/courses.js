/* Drumul spre Romana — Course structure: the four tracks, their levels, and the unit map.
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

/* Two tracks share one engine. "cefr" is the A1–B1 language course; "civic" is
   the citizenship / oath preparation course, which has its own levels, units
   and lessons but reuses the same exercise types, audio and review system. */
var COURSES = [
  {id:"cefr",  name:"Romanian A1–B1", short:"Language",
   blurb:"The full CEFR language course, from the alphabet to independent B1 use."},
  {id:"civic", name:"Cetățenie — Citizenship & Oath", short:"Citizenship",
   blurb:"Preparation for the Romanian citizenship interview and the oath of allegiance, for applicants restoring citizenship by descent."},
  {id:"ilr", name:"Atestat I.L.R. — B1 Exam Preparation", short:"I.L.R. exam",
   blurb:"Preparation for the Institutul Limbii Române B1 certification: the three papers, the question types they actually use, and a full mock exam under timed conditions."},
  {id:"register", name:"Româna reală — Register & Real Speech", short:"Real speech",
   blurb:"How Romanians actually talk: slang, filler words, texting, and the swearing you will hear whether or not you ever say it. Comprehension first — every item is labeled for how offensive it is and who you can safely say it to."}
];

var LEVELS = [
  {id:"a1_1", code:"A1.1", name:"Foundations I", cefr:"A1", course:"cefr"},
  {id:"a1_2", code:"A1.2", name:"Foundations II", cefr:"A1", course:"cefr"},
  {id:"a2_1", code:"A2.1", name:"Everyday Romanian I", cefr:"A2", course:"cefr"},
  {id:"a2_2", code:"A2.2", name:"Everyday Romanian II", cefr:"A2", course:"cefr"},
  {id:"b1_1", code:"B1.1", name:"Independent User I", cefr:"B1", course:"cefr"},
  {id:"b1_2", code:"B1.2", name:"Independent User II", cefr:"B1", course:"cefr"},
  {id:"civic", code:"CET", name:"Pregătire pentru cetățenie", cefr:"—", course:"civic"},
  {id:"register", code:"REG", name:"Româna reală", cefr:"A2+", course:"register"},
  {id:"ilr", code:"ILR", name:"Atestat B1", cefr:"B1", course:"ilr"}
];

var UNITS = [
  // A1.1
  {id:"a1_1_u1", levelId:"a1_1", order:1, title:"Bună! Salutări și prezentări", titleEn:"Hello! Greetings & Introductions", blurb:"The alphabet, Romanian sounds, greetings, and saying who you are.", depth:"full"},
  {id:"a1_1_u2", levelId:"a1_1", order:2, title:"Eu și familia mea", titleEn:"Me and My Family", blurb:"Family vocabulary, gender & articles, a avea, descriptions, numbers.", depth:"full"},
  {id:"a1_1_u3", levelId:"a1_1", order:3, title:"Viața de zi cu zi", titleEn:"Everyday Life", blurb:"Time, days, months, and talking about your daily routine.", depth:"full"},
  {id:"a1_1_u4", levelId:"a1_1", order:4, title:"Mâncare și băutură", titleEn:"Food & Drink", blurb:"Ordering at a café and restaurant, food vocabulary, and saying what you like with îmi place.", depth:"full"},
  {id:"a1_1_u5", levelId:"a1_1", order:5, title:"La cumpărături", titleEn:"Going Shopping", blurb:"Prices and numbers, demonstratives, clothing and sizes.", depth:"full"},
  {id:"a1_1_u6", levelId:"a1_1", order:6, title:"Prin oraș", titleEn:"Around Town", blurb:"Places in town, asking for and following directions, and public transport.", depth:"full"},
  {id:"a1_1_u7", levelId:"a1_1", order:7, title:"Casa mea", titleEn:"My Home", blurb:"Rooms and furniture, prepositions of place, and reading a property listing.", depth:"full"},
  {id:"a1_1_u8", levelId:"a1_1", order:8, title:"Vremea și anotimpurile", titleEn:"Weather & Seasons", blurb:"Impersonal weather verbs, the four seasons, and following a forecast.", depth:"full"},
  {id:"a1_1_u9", levelId:"a1_1", order:9, title:"Recapitulare A1.1", titleEn:"A1.1 Checkpoint & Review", blurb:"Mixed review and the A1.1 level checkpoint.", depth:"map", checkpoint:true},
  // A1.2
  {id:"a1_2_u1", levelId:"a1_2", order:1, title:"Ocupații și rutine", titleEn:"Jobs & Routines", blurb:"Occupations without an article, working hours, and adverbs of frequency.", depth:"full"},
  {id:"a1_2_u2", levelId:"a1_2", order:2, title:"Timpul liber", titleEn:"Free Time", blurb:"Hobbies and sport, and saying what you like doing with îmi place să.", depth:"full"},
  {id:"a1_2_u3", levelId:"a1_2", order:3, title:"La telefon și programări", titleEn:"Phone Calls & Appointments", blurb:"Phone language, months and dates, and booking an appointment.", depth:"full"},
  {id:"a1_2_u4", levelId:"a1_2", order:4, title:"Corpul și sănătatea", titleEn:"Body & Health", blurb:"Body parts, describing symptoms with mă doare, and handling a pharmacy visit.", depth:"full"},
  {id:"a1_2_u5", levelId:"a1_2", order:5, title:"Călătorii mici", titleEn:"Short Trips", blurb:"Buying train tickets, understanding announcements, and the colloquial future.", depth:"full"},
  {id:"a1_2_u6", levelId:"a1_2", order:6, title:"Prietenii și socializarea", titleEn:"Friends & Socializing", blurb:"Invitations, accepting and declining politely, and talking about events afterwards.", depth:"full"},
  {id:"a1_2_u7", levelId:"a1_2", order:7, title:"Cumpărături și prețuri II", titleEn:"Shopping & Prices II", blurb:"Comparing options with mai … decât and choosing the best of a set.", depth:"full"},
  {id:"a1_2_u8", levelId:"a1_2", order:8, title:"Recapitulare A1.2", titleEn:"A1.2 Checkpoint & Level Exam", blurb:"The full A1 level assessment.", depth:"map", checkpoint:true, levelExam:true},
  // A2.1
  {id:"a2_1_u1", levelId:"a2_1", order:1, title:"Amintiri și experiențe", titleEn:"Memories & Experiences", blurb:"Talking about the past with perfectul compus.", depth:"sample"},
  {id:"a2_1_u2", levelId:"a2_1", order:2, title:"Planuri de viitor", titleEn:"Future Plans", blurb:"Making plans with o să, obligation vs advice (trebuie / ar trebui), and a ști vs a cunoaște.", depth:"full"},
  {id:"a2_1_u3", levelId:"a2_1", order:3, title:"La hotel și în vacanță", titleEn:"Hotels & Vacations", blurb:"Checking in, object pronouns in service language, and reading a formal confirmation.", depth:"full"},
  {id:"a2_1_u4", levelId:"a2_1", order:4, title:"Sănătate și la doctor", titleEn:"Health & the Doctor", blurb:"Describing symptoms, understanding a consultation, and giving advice.", depth:"full"},
  {id:"a2_1_u5", levelId:"a2_1", order:5, title:"Casa și mutarea", titleEn:"Housing & Moving", blurb:"Renting a flat, genitive vs dative in context, and reading rental adverts.", depth:"full"},
  {id:"a2_1_u6", levelId:"a2_1", order:6, title:"Educație și muncă", titleEn:"Education & Work", blurb:"School, jobs, and everyday workplace talk.", depth:"full"},
  {id:"a2_1_u7", levelId:"a2_1", order:7, title:"Personalitate și descrieri", titleEn:"Personality & Descriptions", blurb:"Describing people's character and appearance.", depth:"full"},
  {id:"a2_1_u8", levelId:"a2_1", order:8, title:"Bucătăria românească", titleEn:"Romanian Cuisine", blurb:"Cooking vocabulary and Romanian food culture.", depth:"full"},
  {id:"a2_1_u9", levelId:"a2_1", order:9, title:"Recapitulare A2.1", titleEn:"A2.1 Checkpoint & Review", blurb:"Mixed review across the level so far.", depth:"map", checkpoint:true},
  // A2.2
  {id:"a2_2_u1", levelId:"a2_2", order:1, title:"Comparații și preferințe", titleEn:"Comparisons & Preferences", blurb:"Comparatives, superlatives, expressing preference.", depth:"full"},
  {id:"a2_2_u2", levelId:"a2_2", order:2, title:"La bancă și la poștă", titleEn:"Bank & Post Office", blurb:"Everyday errands and official services.", depth:"full"},
  {id:"a2_2_u3", levelId:"a2_2", order:3, title:"Probleme și reclamații", titleEn:"Problems & Complaints", blurb:"Complaining politely and asking for solutions.", depth:"full"},
  {id:"a2_2_u4", levelId:"a2_2", order:4, title:"Sărbători și tradiții", titleEn:"Holidays & Traditions", blurb:"Romanian holidays and celebrations.", depth:"full"},
  {id:"a2_2_u5", levelId:"a2_2", order:5, title:"Îmbrăcăminte și stil", titleEn:"Clothing & Style", blurb:"Fashion, style, and shopping for clothes.", depth:"full"},
  {id:"a2_2_u6", levelId:"a2_2", order:6, title:"Reguli și sfaturi", titleEn:"Rules & Advice", blurb:"The imperative and giving advice.", depth:"full"},
  {id:"a2_2_u7", levelId:"a2_2", order:7, title:"Povești din trecut", titleEn:"Stories From the Past", blurb:"Perfectul compus vs. imperfect in storytelling.", depth:"full"},
  {id:"a2_2_u8", levelId:"a2_2", order:8, title:"Recapitulare A2.2", titleEn:"A2.2 Checkpoint & Level Exam", blurb:"The full A2 level assessment.", depth:"map", checkpoint:true, levelExam:true},
  // B1.1
  {id:"b1_1_u1", levelId:"b1_1", order:1, title:"Păreri și opinii", titleEn:"Opinions & Viewpoints", blurb:"The subjunctive with să and expressing opinions.", depth:"sample"},
  {id:"b1_1_u2", levelId:"b1_1", order:2, title:"Cariere și tehnologie", titleEn:"Careers & Technology", blurb:"Work, careers, and talking about technology.", depth:"full"},
  {id:"b1_1_u3", levelId:"b1_1", order:3, title:"Relații și emoții", titleEn:"Relationships & Emotions", blurb:"Talking about relationships, feelings, personality.", depth:"full"},
  {id:"b1_1_u4", levelId:"b1_1", order:4, title:"Cultură și tradiții românești", titleEn:"Romanian Culture & Traditions", blurb:"Bucharest, Transylvania, and Romanian society.", depth:"full"},
  {id:"b1_1_u5", levelId:"b1_1", order:5, title:"Călătorii și povestiri", titleEn:"Travel & Storytelling", blurb:"Recounting travel experiences in detail.", depth:"full"},
  {id:"b1_1_u6", levelId:"b1_1", order:6, title:"Birocrație și servicii publice", titleEn:"Bureaucracy & Public Services", blurb:"Navigating official paperwork and services.", depth:"full"},
  {id:"b1_1_u7", levelId:"b1_1", order:7, title:"Sănătate și stil de viață", titleEn:"Health & Lifestyle", blurb:"Healthcare systems and lifestyle choices.", depth:"full"},
  {id:"b1_1_u8", levelId:"b1_1", order:8, title:"Locuințe și decizii", titleEn:"Housing & Decisions", blurb:"Describing decisions and their consequences.", depth:"full"},
  {id:"b1_1_u9", levelId:"b1_1", order:9, title:"Recapitulare B1.1", titleEn:"B1.1 Checkpoint & Review", blurb:"Mixed review across the level so far.", depth:"map", checkpoint:true},
  // B1.2
  {id:"b1_2_u1", levelId:"b1_2", order:1, title:"Ipoteze și condiții", titleEn:"Hypotheses & Conditions", blurb:"Conditional perfect and hypothetical situations.", depth:"full"},
  {id:"b1_2_u2", levelId:"b1_2", order:2, title:"Mass-media și știri", titleEn:"Media & News", blurb:"Understanding simple news and media Romanian.", depth:"full"},
  {id:"b1_2_u3", levelId:"b1_2", order:3, title:"Mediul și societatea", titleEn:"Environment & Society", blurb:"Environment, society, and everyday issues.", depth:"full"},
  {id:"b1_2_u4", levelId:"b1_2", order:4, title:"Argumentare și opinii avansate", titleEn:"Argument & Advanced Opinions", blurb:"Connectors for cause, contrast, and concession.", depth:"full"},
  {id:"b1_2_u5", levelId:"b1_2", order:5, title:"Educație și viitor", titleEn:"Education & the Future", blurb:"Goals, problems, and solutions.", depth:"full"},
  {id:"b1_2_u6", levelId:"b1_2", order:6, title:"Povestiri și istorie personală", titleEn:"Personal History", blurb:"The pluperfect and telling longer stories.", depth:"full"},
  {id:"b1_2_u7", levelId:"b1_2", order:7, title:"Comunicare naturală", titleEn:"Natural Communication", blurb:"Idioms, register, and natural conversation.", depth:"full"},
  {id:"b1_2_u8", levelId:"b1_2", order:8, title:"Examenul final B1", titleEn:"Final B1 Exam", blurb:"The comprehensive B1 level assessment.", depth:"map", checkpoint:true, levelExam:true},

  // ---------- CIVIC TRACK: citizenship & oath preparation ----------
  {id:"civ_u1", levelId:"civic", order:1, title:"Jurământul de credință", titleEn:"The Oath of Allegiance", blurb:"The oath text itself: every word, its meaning, its pronunciation, and how to deliver it from memory.", depth:"full"},
  {id:"civ_u2", levelId:"civic", order:2, title:"Imnul național", titleEn:"The National Anthem", blurb:"Deșteaptă-te, române! — the official stanzas, what they mean, and how to follow them when sung.", depth:"full"},
  {id:"civ_u3", levelId:"civic", order:3, title:"Statul și Constituția", titleEn:"The State & the Constitution", blurb:"Form of state, national symbols, institutions and fundamental rights — the constitutional questions that come up.", depth:"full"},
  {id:"civ_u4", levelId:"civic", order:4, title:"Geografia României", titleEn:"Geography of Romania", blurb:"Neighbours, regions, rivers, mountains and major cities.", depth:"full"},
  {id:"civ_u5", levelId:"civic", order:5, title:"Repere din istorie", titleEn:"Key Points in History", blurb:"The dates and figures most often asked about, from 1859 to EU accession.", depth:"full"},
  {id:"civ_u6", levelId:"civic", order:6, title:"Interviul și documentele", titleEn:"The Interview & Your Documents", blurb:"Typical interview questions, how to answer them, and the vocabulary of the paperwork.", depth:"full"},
  {id:"civ_u7", levelId:"civic", order:7, title:"Simulare de interviu", titleEn:"Mock Interview", blurb:"A mixed assessment drawing on everything in this track.", depth:"map", checkpoint:true, levelExam:true},

  /* ---------- REGISTER TRACK: how Romanians actually talk ----------
     Deliberately outside the CEFR sequence. Slang dates, varies by region and
     by age, and gets a learner into trouble in a way that textbook Romanian
     never does — so it is taught as a comprehension skill with explicit
     labeling rather than folded into the main progression as vocabulary to
     deploy. The swearing unit sits last and is gated behind an opt-in. */
  {id:"reg_u1", levelId:"register", order:1, title:"Vorbirea de zi cu zi", titleEn:"Everyday Informal Speech", blurb:"What actually comes out of people's mouths: contractions, dropped endings, and the words no textbook prints.", depth:"full"},
  {id:"reg_u2", levelId:"register", order:2, title:"Umplutură și reacții", titleEn:"Fillers & Reactions", blurb:"Deci, păi, mă rog, băi — the small words that make speech sound Romanian rather than translated.", depth:"full"},
  {id:"reg_u3", levelId:"register", order:3, title:"Argou", titleEn:"Slang", blurb:"Current everyday slang, sorted by how safe it is and who says it — plus the dated slang that marks you as having learned from old material.", depth:"full"},
  {id:"reg_u4", levelId:"register", order:4, title:"Româna scrisă online", titleEn:"Texting & Online Romanian", blurb:"Diacritic-free typing, abbreviations, and how written Romanian shifts on a phone.", depth:"full"},
  {id:"reg_u5", levelId:"register", order:5, title:"Înjurături și limbaj vulgar", titleEn:"Swearing & Offensive Language", blurb:"Romanian profanity explained for comprehension: what it means, how strong it is, and why almost none of it is yours to use. Opt-in.", depth:"full", sensitive:true},

  /* ---------- I.L.R. TRACK: B1 certification exam ----------
     Structured on the Institutul Limbii Române's own published sample papers
     (November 2019 Bucharest session), which set out three papers: reading
     comprehension with grammatical competence, written production, and oral
     comprehension with a spoken task. Materials here are written for this
     course — the official papers are linked, not copied. */
  {id:"ilr_u1", levelId:"ilr", order:1, title:"Cum arată examenul", titleEn:"What the exam looks like", blurb:"The three papers, what each one asks of you, and how the ILR exam differs from a general B1 course.", depth:"full"},
  {id:"ilr_u2", levelId:"ilr", order:2, title:"Comprehensiune de lectură", titleEn:"Reading Comprehension", blurb:"Authentic-difficulty texts and the adevărat/fals question format the exam uses.", depth:"full"},
  {id:"ilr_u3", levelId:"ilr", order:3, title:"Competență gramaticală", titleEn:"Grammatical Competence", blurb:"Sentence transformation — the paper's hardest section, and the one nothing else prepares you for.", depth:"full"},
  {id:"ilr_u4", levelId:"ilr", order:4, title:"Elaborarea unui text", titleEn:"Written Production", blurb:"The formal email and the 200-word narrative from a picture.", depth:"full"},
  {id:"ilr_u5", levelId:"ilr", order:5, title:"Înțelegerea și exprimarea orală", titleEn:"Oral Comprehension & Expression", blurb:"Answering open questions on a recording, then building a dialogue with the examiner's partner.", depth:"full"},
  {id:"ilr_u6", levelId:"ilr", order:6, title:"Simulare de examen", titleEn:"Full Mock Exam", blurb:"All three papers end to end, on material held back from the lessons.", depth:"map", mockRoute:"ilrmock"}
];
