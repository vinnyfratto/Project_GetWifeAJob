/**
 * dashboard.js — Simple nav tile dashboard
 */
const Dashboard = (() => {

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
      desc:    "Remote healthcare employers across the US",
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
        '<p class="dash-sub">Where would you like to go today?</p>' +
      '</div>' +
      '<div class="dash-tile-grid">' + tiles + '</div>';
  }

  function _greeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }

  return { render: render };
})();
