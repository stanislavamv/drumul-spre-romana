/* Drumul spre Romana — the application chrome.
 *
 * The navigation and controls surrounding every page: the desktop top bar,
 * the mobile slide-out nav, and the light/dark theme toggle. renderTopbar and
 * mobileNav were extracted verbatim from index.html; effectiveTheme and
 * themeToggle were added alongside them since they're the same kind of thing
 * -- chrome rendered once per paint, independent of which page is showing.
 *
 * All four return HTML strings and insert nothing themselves — renderApp
 * concatenates renderTopbar() and themeToggle() around the page, and shell()
 * places mobileNav() inside the sidebar.
 *
 * Every dependency is already a global: LEVELS and NAV_TABS from js/data,
 * parseHash from router.js, state from state.js, currentStreak from
 * activity.js, overallCourseLevelId from progress.js, iconMenu/iconFlame/
 * iconMoon/iconSun from icons.js and navIsActive from navigation.js. That is
 * why this file can load before the application script rather than after it.
 *
 * The "use strict" directive is not new — it is the mode these functions
 * already ran in inside the application IIFE, repeated here because a separate
 * classic script would otherwise default to sloppy mode.
 */
"use strict";

function renderTopbar(){
  var lvl = LEVELS.find(function(l){ return l.id===overallCourseLevelId(); }) || LEVELS[0];
  var route = parseHash();
  var tabs = NAV_TABS;
  return '' +
  '<div class="topbar">'+
    '<button class="menu-btn" data-action="toggleSidebar" aria-label="Menu">'+iconMenu()+'</button>'+
    '<div class="brand" data-action="go" data-page="home">Drumul<span class="dot">·</span>Română</div>'+
    '<nav class="topnav">'+ tabs.map(function(t){
      return '<button class="'+(navIsActive(t[0], route.page)?"active":"")+'" data-action="go" data-page="'+t[0]+'">'+t[1]+'</button>';
    }).join("") +'</nav>'+
    '<div class="topbar-right">'+
      /* Visible while teacher mode is on, so an unlocked syllabus is never
         mistaken for earned progress. */
      (state.settings.unlockAll
        ? '<button class="teacher-chip" data-action="go" data-page="admin" title="Author mode is on — every unit is unlocked. Click to manage.">AUTHOR</button>'
        : '')+
      '<span class="level-pill">'+lvl.code+'</span>'+
      '<span class="streak-chip">'+iconFlame()+' '+currentStreak()+'</span>'+
    '</div>'+
  '</div>';
}

/* The theme actually showing right now: the explicit override once the
   learner has clicked the toggle, else whatever the OS is set to. Needed
   because the button names the theme a click would switch TO -- it has to
   know which one is current before it can say the opposite. */
function effectiveTheme(){
  if(state.settings.theme) return state.settings.theme;
  return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
}

/* Fixed at the bottom-right corner on every page, like the reduce-motion
   setting this mirrors in spirit but is common enough to want one click
   from anywhere rather than a trip to Progress → Settings. */
function themeToggle(){
  var target = effectiveTheme()==="dark" ? "light" : "dark";
  return '<button class="theme-toggle" data-action="toggleTheme" aria-label="Switch to '+target+' theme">'+
    (target==="dark"? iconMoon() : iconSun())+' '+target+
  '</button>';
}

/* On mobile the top bar's nav is hidden, so the slide-out sidebar has to carry
   it — otherwise Review, Practice, Grammar and the rest are simply unreachable
   on a phone. Hidden on desktop, where the top bar already shows it. */
function mobileNav(){
  var route = parseHash();
  return '<nav class="mobile-nav">'+
    '<div style="font-size:11px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--text-3);padding:0 8px 8px">Go to</div>'+
    NAV_TABS.map(function(t){
      return '<button class="mobile-nav-item'+(navIsActive(t[0], route.page)?" active":"")+'" '+
        'data-action="go" data-page="'+t[0]+'">'+t[1]+'</button>';
    }).join("")+
    '<hr class="rule" style="margin:14px 0">'+
  '</nav>';
}
