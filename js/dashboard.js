/**
 * dashboard.js — Simple nav tile dashboard
 */
const Dashboard = (() => {

  function _kittenDialog() {
    const existing = document.getElementById("kitten-dialog");
    if (existing) { existing.remove(); return; }
    const overlay = document.createElement("div");
    overlay.id = "kitten-dialog";
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:9999;";
    overlay.innerHTML =
      '<div style="background:#ffffff;border-radius:18px;padding:32px 40px;text-align:center;max-width:340px;box-shadow:0 20px 60px rgba(0,0,0,.35);">' +
        '<img src="images/Mika.jpg" style="width:220px;height:220px;object-fit:cover;border-radius:12px;margin-bottom:18px;display:block;margin-left:auto;margin-right:auto;">' +
        '<p style="font-size:22px;font-weight:800;color:var(--text);margin:0 0 20px;">No, you go find job mommy! 🐾</p>' +
        '<button onclick="document.getElementById(\'kitten-dialog\').remove()" ' +
          'style="background:var(--accent);color:#fff;border:none;border-radius:8px;padding:10px 28px;font-size:15px;font-weight:700;cursor:pointer;">OK fine 😅</button>' +
      '</div>';
    overlay.addEventListener("click", function(e){ if(e.target===overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  }

  const TILES = [
    {
      id:      "recruiters",
      label:   "Recruiters",
      desc:    "Staffing agencies and direct employers to contact",
      icon:    "👤",
      count:   function(){ return Storage.Recruiters.getAll().length; },
    },
    {
      id:      "companies",
      label:   "Companies",
      desc:    "Remote healthcare employers across Texas",
      icon:    "🏢",
      count:   function(){ return Storage.Companies.getAll().length; },
    },
    {
      id:      "i35corridor",
      label:   "I-35 Corridor",
      desc:    "Local healthcare employers — San Antonio to Austin",
      icon:    "🛣️",
      count:   function(){ return Storage.I35Companies.getAll().length; },
    },
    {
      id:      "settings",
      label:   "Settings",
      desc:    "Profile, API key, and data management",
      icon:    "⚙️",
      count:   null,
    },
  ];

  const KITTEN_TILE =
    '<div class="dash-tile" onclick="Dashboard.kittenDialog()" style="cursor:pointer;overflow:hidden;padding:0;min-height:160px;position:relative;">' +
      '<img src="images/Mika.jpg" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit;" ' +
           'onerror="this.style.display=\'none\';this.parentElement.style.background=\'var(--accent-light)\';this.parentElement.innerHTML+=\'<div style=\\\"display:flex;align-items:center;justify-content:center;height:160px;font-size:48px;\\\">🐱</div>\'">' +
    '</div>';

  function render() {
    const s = Storage.Settings.get();
    const greeting = _greeting();

    const tiles = TILES.map(function(t) {
      const count = t.count ? t.count() : null;
      return '<div class="dash-tile" onclick="App.navigate(\'' + t.id + '\')">' +
        '<div class="dash-tile-icon">' + t.icon + '</div>' +
        '<div class="dash-tile-body">' +
          '<div class="dash-tile-label">' + t.label + '</div>' +
          '<div class="dash-tile-desc">' + t.desc + '</div>' +
        '</div>' +
        (count !== null
          ? '<div class="dash-tile-count">' + count + '</div>'
          : '') +
      '</div>';
    }).join("");

    return '<div class="dash-welcome">' +
        '<h2 class="dash-hello">' + greeting + ', ' + (s.name || "Sara") + ' 👋</h2>' +
        '<p class="dash-sub"><b>Project:</b> Find Wife a Job</p>' +
      '</div>' +
      '<div class="dash-tile-grid">' + tiles + KITTEN_TILE + '</div>';
  }

  function _greeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }

  return { render: render, kittenDialog: _kittenDialog };
})();
