/**
 * app.js — Main application: hash router, sidebar, search, dark mode, toast
 * Must be loaded LAST.
 */
const App = (() => {
  let _currentView = "dashboard";
  let _globalSearch = "";

  const NAV_ITEMS = [
    { id:"dashboard",    label:"Dashboard",      icon:"⊞" },
    { id:"recruiters",   label:"Recruiters",     icon:"👤" },
    { id:"companies",    label:"TX Companies",   icon:"🏢" },
    { id:"uscompanies",  label:"US Companies",   icon:"🇺🇸" },
    { id:"i35corridor",  label:"I-35 Corridor",  icon:"🛣️" },
    { id:"settings",     label:"Settings",       icon:"⚙️" },
  ];

  function init() {
    Storage.seed();
    Storage.seedI35();
    Storage.seedUS();
    _applySettings();
    _buildSidebar();
    _buildBottomNav();
    _bindSearch();
    _handleHash();
    window.addEventListener("hashchange", _handleHash);
  }

  function _applySettings() {
    const s = Storage.Settings.get();
    if (s.darkMode) {
      document.documentElement.classList.add("dark");
    }
  }

  function _buildSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;
    let nav = '<div class="sidebar-logo"><span class="logo-icon">✦</span><span class="logo-text">Find Wife a Job</span></div>';
    nav += '<nav class="sidebar-nav">';
    NAV_ITEMS.forEach(function(item) {
      nav += '<a href="#'+item.id+'" class="nav-item" data-view="'+item.id+'">' +
        '<span class="nav-icon">'+item.icon+'</span>' +
        '<span class="nav-label">'+item.label+'</span>' +
      '</a>';
    });
    nav += '</nav>';
    nav += '<div class="sidebar-footer"><div class="sidebar-user"><span class="user-avatar">SF</span><span class="user-name">Sara Fratto</span></div></div>';
    sidebar.innerHTML = nav;
  }

  function _buildBottomNav() {
    const bottomNav = document.getElementById("bottom-nav");
    if (!bottomNav) return;
    const mobileItems = NAV_ITEMS.slice(0,6);
    let nav = '';
    mobileItems.forEach(function(item) {
      nav += '<a href="#'+item.id+'" class="bottom-nav-item" data-view="'+item.id+'">' +
        '<span class="bn-icon">'+item.icon+'</span>' +
        '<span class="bn-label">'+item.label+'</span>' +
      '</a>';
    });
    bottomNav.innerHTML = nav;
  }

  function _handleHash() {
    const hash = window.location.hash.slice(1) || "dashboard";
    const view = NAV_ITEMS.find(function(n){ return n.id===hash; });
    if (!view) { navigate("dashboard"); return; }
    _currentView = hash;
    _updateActiveNav(hash);
    _renderView(hash);
  }

  function navigate(view) {
    window.location.hash = "#" + view;
  }

  function _updateActiveNav(active) {
    document.querySelectorAll(".nav-item, .bottom-nav-item").forEach(function(el) {
      el.classList.toggle("active", el.dataset.view === active);
    });
  }

  function _renderView(view) {
    const main = document.getElementById("main-content");
    if (!main) return;
    let html = "";
    switch(view) {
      case "dashboard":   html = Dashboard.render();   break;
      case "recruiters":  html = Recruiters.render();  break;
      case "companies":   html = Companies.render();    break;
      case "uscompanies": html = USCompanies.render();  break;
      case "i35corridor": html = I35Corridor.render();  break;
      case "settings":    html = Settings.render();    break;
      default:            html = Dashboard.render();
    }
    main.innerHTML = html;
  }

  function rerender() {
    _renderView(_currentView);
  }

  function _bindSearch() {
    const input = document.getElementById("global-search");
    if (!input) return;
    input.addEventListener("input", function() {
      _globalSearch = this.value.toLowerCase().trim();
      _doGlobalSearch(_globalSearch);
    });
    input.addEventListener("keydown", function(e) {
      if (e.key === "Escape") { this.value=""; _globalSearch=""; _hideSearchResults(); }
    });
  }

  function _doGlobalSearch(q) {
    if (!q) { _hideSearchResults(); return; }
    const results = [];
    Storage.Recruiters.getAll().forEach(function(r) {
      if ((r.name+r.company+r.notes).toLowerCase().includes(q)) {
        results.push({ type:"Recruiter", label:r.name+" — "+r.company, view:"recruiters" });
      }
    });
    Storage.Companies.getAll().forEach(function(c) {
      if ((c.company+c.notes).toLowerCase().includes(q)) {
        results.push({ type:"Company", label:c.company, view:"companies" });
      }
    });
    Storage.Jobs.getAll().forEach(function(j) {
      if ((j.company+j.title+j.notes).toLowerCase().includes(q)) {
        results.push({ type:"Job", label:j.title+" @ "+j.company, view:"jobs" });
      }
    });
    Storage.Applications.getAll().forEach(function(a) {
      if ((a.company+a.title).toLowerCase().includes(q)) {
        results.push({ type:"Application", label:a.title+" @ "+a.company+" ("+a.status+")", view:"applications" });
      }
    });
    _showSearchResults(results.slice(0,8));
  }

  function _showSearchResults(results) {
    let el = document.getElementById("search-results");
    if (!el) {
      el = document.createElement("div");
      el.id = "search-results";
      el.className = "search-results-dropdown";
      document.getElementById("topbar").appendChild(el);
    }
    if (!results.length) {
      el.innerHTML = '<div class="sr-empty">No results found.</div>';
    } else {
      el.innerHTML = results.map(function(r) {
        return '<div class="sr-item" onclick="App.navigate(\''+r.view+'\')" style="cursor:pointer">' +
          '<span class="sr-type">'+r.type+'</span>' +
          '<span class="sr-label">'+r.label+'</span>' +
        '</div>';
      }).join("");
    }
    el.style.display = "block";

    // Close on outside click
    setTimeout(function() {
      document.addEventListener("click", _hideSearchResults, { once:true });
    }, 0);
  }

  function _hideSearchResults() {
    const el = document.getElementById("search-results");
    if (el) el.style.display = "none";
  }

  function applyDarkMode(val) {
    if (val) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  function showToast(msg, duration) {
    duration = duration || 3000;
    let toast = document.getElementById("toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("toast-visible");
    setTimeout(function() { toast.classList.remove("toast-visible"); }, duration);
  }

  // Employers/recruiters whose current remote postings explicitly accept CPC-A (apprentice).
  // Sara is CPC-A, so these are her strongest first-apply targets. Confirmed via validation research.
  const CPC_A_FRIENDLY = [
    "Inova Health System",
    "PeaceHealth",
    "OSF HealthCare",
    "Cincinnati Children's Hospital",
    "BJC HealthCare",
    "Henry Ford Health",
    "Piedmont Healthcare",
    "Austin Regional Clinic (ARC)",
    "The Judge Group",
  ];
  function isCpcA(name) { return CPC_A_FRIENDLY.indexOf((name||"").trim()) !== -1; }

  // Open a card's URL in a new tab, unless the click landed on an interactive control
  function openUrl(ev, url) {
    if (!url) return;
    if (ev && ev.target && ev.target.closest && ev.target.closest("button, select, a, input, textarea, label")) return;
    window.open(url, "_blank", "noopener");
  }

  // Initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  return { rerender, navigate, applyDarkMode, showToast, openUrl, isCpcA };
})();
