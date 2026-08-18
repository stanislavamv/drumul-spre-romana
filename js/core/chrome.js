/* Drumul spre Romana — shared page chrome.
 *
 * Extracted verbatim from index.html. The layout wrapper every page renders
 * itself into, the course-track switcher, and the page-level fallback.
 *
 * shell() is the most broadly used function in the application — 18 of the 21
 * PAGES functions call it — which is why it earns a file of its own rather than
 * living among the pages it wraps. It always prepends mobileNav() to the
 * sidebar, so navigation stays reachable from the menu button on pages that
 * have no desktop sidebar at all.
 *
 * notFound() deliberately does NOT call shell(): it writes its own
 * .shell/.main markup and omits the sidebar entirely, so a bad route renders a
 * dead end with no navigation chrome around it. That asymmetry is pre-existing
 * and is preserved here unchanged.
 *
 * No DOM access — all three return HTML strings for a caller to insert.
 *
 * The "use strict" directive is not new — it is the mode these functions
 * already ran in inside the application IIFE, repeated here because a separate
 * classic script would otherwise default to sloppy mode.
 */
"use strict";

function shell(sidebarHtml, mainHtml, railHtml, wide){
  /* Every page gets a sidebar on mobile, even those that have none on desktop,
     so the navigation is always reachable from the menu button. */
  var side = mobileNav() + (sidebarHtml || "");
  return '<div class="shell">'+
    '<aside class="sidebar'+(session.sidebarOpen?" open":"")+(sidebarHtml?"":" nav-only")+'">'+side+'</aside>'+
    '<main class="main'+(wide?" main-wide":"")+'"><div class="main-inner">'+mainHtml+'</div></main>'+
    (railHtml? '<aside class="rightrail">'+railHtml+'</aside>':'')+
  '</div>';
}

/* Body-level switcher. Redundant on desktop, where the sidebar carries one —
   so it is hidden there and shown only on mobile, whose sidebar sits behind
   the menu button and would otherwise hide the second course entirely. */
function courseSwitcher(){
  return '<div class="course-switch-body" style="display:flex;gap:6px;margin-bottom:18px;flex-wrap:wrap">'+
    COURSES.map(function(c){
      var active = currentCourse()===c.id;
      var built = UNITS.filter(function(u){
        var lv = levelById(u.levelId); return lv && (lv.course||"cefr")===c.id && lessonsOfUnit(u.id).length;
      }).length;
      return '<button class="chip'+(active?" active":"")+'" data-action="setCourse" data-course="'+c.id+'" '+
        'style="padding:8px 14px">'+escapeHtml(c.short)+
        '<span style="opacity:.6;margin-left:6px">'+built+' units</span></button>';
    }).join("")+
  '</div>';
}

function notFound(msg){
  return '<div class="shell"><main class="main"><div class="main-inner">'+
    '<div class="empty-state"><p style="margin-bottom:14px">'+escapeHtml(msg)+'</p>'+
    '<button class="btn secondary" data-action="go" data-page="home">Back to Learn</button></div></div></main></div>';
}
