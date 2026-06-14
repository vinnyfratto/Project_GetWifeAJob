/**
 * dashboard.js — Dashboard view: stats cards + SVG charts
 */
const Dashboard = (() => {

  function render() {
    const rec  = Storage.Recruiters.getAll();
    const co   = Storage.Companies.getAll();
    const jobs = Storage.Jobs.getAll();
    const apps = Storage.Applications.getAll();
    const ivs  = Storage.Interviews.getAll();

    // ── stats ──
    const today = new Date().toISOString().slice(0, 10);
    const followUpsDue = rec.filter(function(r) {
      return r.nextFollowUpDate && r.nextFollowUpDate <= today;
    }).length + ivs.filter(function(i) {
      return !i.followUpSent && i.date && i.date < today;
    }).length;

    const offers = apps.filter(function(a){ return a.status === "Offer"; }).length;
    const activeApps = apps.filter(function(a){
      return ["Applied","Phone Screen","Interview","Recruiter Contacted"].indexOf(a.status) > -1;
    }).length;
    const ivsScheduled = ivs.filter(function(i){ return i.date >= today; }).length;

    // ── apps by status for donut ──
    const statusCounts = {};
    apps.forEach(function(a){
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
    });

    // ── apps by month for bar chart ──
    const monthCounts = {};
    apps.forEach(function(a){
      if (!a.dateApplied) return;
      const m = a.dateApplied.slice(0, 7);
      monthCounts[m] = (monthCounts[m] || 0) + 1;
    });
    const months = Object.keys(monthCounts).sort().slice(-6);

    // ── top companies by application count ──
    const companyCounts = {};
    apps.forEach(function(a){
      if (!a.company) return;
      companyCounts[a.company] = (companyCounts[a.company] || 0) + 1;
    });
    const topCompanies = Object.entries(companyCounts)
      .sort(function(a,b){ return b[1]-a[1]; })
      .slice(0, 5);

    const statusColors = {
      "Researching": "#C4B5FD",
      "Preparing Resume": "#a78bfa",
      "Applied": "#9B8EC4",
      "Recruiter Contacted": "#7c3aed",
      "Phone Screen": "#6d28d9",
      "Interview": "#5b21b6",
      "Offer": "#4c1d95",
      "Rejected": "#ef4444",
      "Closed": "#94a3b8",
    };

    const recentApps = apps.slice(-5).reverse();

    const html = '<div class="dashboard-grid">' +
      // Stats row
      '<div class="stats-row">' +
        _statCard("Recruiters", rec.length, "people", "#9B8EC4") +
        _statCard("Companies", co.length, "building", "#7c3aed") +
        _statCard("Jobs Tracked", jobs.length, "briefcase", "#C4B5FD") +
        _statCard("Active Apps", activeApps, "send", "#6d28d9") +
        _statCard("Interviews", ivsScheduled, "calendar", "#a78bfa") +
        _statCard("Follow-Ups Due", followUpsDue, "bell", followUpsDue > 0 ? "#ef4444" : "#9B8EC4") +
        _statCard("Offers", offers, "star", offers > 0 ? "#22c55e" : "#9B8EC4") +
      '</div>' +
      // Charts row
      '<div class="charts-row">' +
        '<div class="chart-card">' +
          '<h3 class="chart-title">Applications by Month</h3>' +
          _barChart(months, monthCounts) +
        '</div>' +
        '<div class="chart-card">' +
          '<h3 class="chart-title">Applications by Status</h3>' +
          _donutChart(statusCounts, statusColors) +
        '</div>' +
        '<div class="chart-card">' +
          '<h3 class="chart-title">Top Companies</h3>' +
          _hBarChart(topCompanies) +
        '</div>' +
      '</div>' +
      // Recent activity
      '<div class="section-card">' +
        '<h3 class="section-title">Recent Applications</h3>' +
        _recentAppsTable(recentApps, statusColors) +
      '</div>' +
      // Follow-ups due
      '<div class="section-card">' +
        '<h3 class="section-title">Follow-Ups Due Today</h3>' +
        _followUpsDueList(rec, today) +
      '</div>' +
    '</div>';

    return html;
  }

  function _statCard(label, value, icon, color) {
    const icons = {
      people: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
      briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
      send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
      calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
      bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
      star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    };
    return '<div class="stat-card" style="--stat-color:' + color + '">' +
      '<div class="stat-icon" style="color:' + color + '">' + (icons[icon] || '') + '</div>' +
      '<div class="stat-value">' + value + '</div>' +
      '<div class="stat-label">' + label + '</div>' +
    '</div>';
  }

  function _barChart(months, monthCounts) {
    if (!months.length) return '<p class="empty-chart">No data yet.</p>';
    const maxVal = Math.max.apply(null, months.map(function(m){ return monthCounts[m]||0; })) || 1;
    const W = 300, H = 140, padL = 20, padB = 30, barW = 32, gap = 8;
    const chartW = months.length * (barW + gap);
    const svgW = Math.max(W, chartW + padL + 20);

    let bars = '';
    months.forEach(function(m, i) {
      const val = monthCounts[m] || 0;
      const barH = (val / maxVal) * (H - padB - 10);
      const x = padL + i * (barW + gap);
      const y = H - padB - barH;
      const label = m.slice(5); // MM
      bars += '<rect x="' + x + '" y="' + y + '" width="' + barW + '" height="' + barH + '" rx="4" fill="#9B8EC4"/>';
      bars += '<text x="' + (x + barW/2) + '" y="' + (y - 4) + '" text-anchor="middle" font-size="10" fill="var(--text-muted)">' + val + '</text>';
      bars += '<text x="' + (x + barW/2) + '" y="' + (H - padB + 14) + '" text-anchor="middle" font-size="10" fill="var(--text-muted)">' + label + '</text>';
    });
    return '<svg viewBox="0 0 ' + svgW + ' ' + H + '" width="100%" class="chart-svg">' + bars + '</svg>';
  }

  function _donutChart(statusCounts, statusColors) {
    const entries = Object.entries(statusCounts);
    if (!entries.length) return '<p class="empty-chart">No data yet.</p>';
    const total = entries.reduce(function(s,e){ return s+e[1]; }, 0);
    const cx=80, cy=70, r=55, ir=32;
    let angle = -Math.PI/2;
    let paths = '';
    let legend = '';
    entries.forEach(function(entry) {
      const [status, count] = entry;
      const slice = (count/total) * 2 * Math.PI;
      const x1 = cx + r*Math.cos(angle);
      const y1 = cy + r*Math.sin(angle);
      const x2 = cx + r*Math.cos(angle+slice);
      const y2 = cy + r*Math.sin(angle+slice);
      const xi1 = cx + ir*Math.cos(angle);
      const yi1 = cy + ir*Math.sin(angle);
      const xi2 = cx + ir*Math.cos(angle+slice);
      const yi2 = cy + ir*Math.sin(angle+slice);
      const large = slice > Math.PI ? 1 : 0;
      const color = statusColors[status] || "#9B8EC4";
      if (slice > 0.01) {
        paths += '<path d="M'+xi1+','+yi1+' L'+x1+','+y1+' A'+r+','+r+' 0 '+large+',1 '+x2+','+y2+' L'+xi2+','+yi2+' A'+ir+','+ir+' 0 '+large+',0 '+xi1+','+yi1+' Z" fill="'+color+'" stroke="var(--bg-primary)" stroke-width="1.5"/>';
      }
      legend += '<div class="legend-item"><span class="legend-dot" style="background:'+color+'"></span><span>'+status+' ('+count+')</span></div>';
      angle += slice;
    });
    paths += '<text x="'+cx+'" y="'+(cy+5)+'" text-anchor="middle" font-size="16" font-weight="700" fill="var(--text-primary)">'+total+'</text>';
    paths += '<text x="'+cx+'" y="'+(cy+18)+'" text-anchor="middle" font-size="9" fill="var(--text-muted)">TOTAL</text>';
    return '<div class="donut-wrap"><svg viewBox="0 0 160 140" width="160" class="chart-svg">'+paths+'</svg><div class="donut-legend">'+legend+'</div></div>';
  }

  function _hBarChart(topCompanies) {
    if (!topCompanies.length) return '<p class="empty-chart">No data yet.</p>';
    const maxVal = topCompanies[0][1] || 1;
    const H = 24;
    let rows = '';
    topCompanies.forEach(function(entry) {
      const [co, count] = entry;
      const pct = Math.round((count/maxVal)*100);
      rows += '<div class="hbar-row">' +
        '<span class="hbar-label">' + co + '</span>' +
        '<div class="hbar-track"><div class="hbar-fill" style="width:' + pct + '%"></div></div>' +
        '<span class="hbar-val">' + count + '</span>' +
      '</div>';
    });
    return '<div class="hbar-chart">' + rows + '</div>';
  }

  function _recentAppsTable(apps, statusColors) {
    if (!apps.length) return '<p class="empty-chart">No applications yet. Add some in the Applications view.</p>';
    let rows = '';
    apps.forEach(function(a) {
      const color = statusColors[a.status] || "#9B8EC4";
      rows += '<tr>' +
        '<td>' + (a.company || '') + '</td>' +
        '<td>' + (a.title || '') + '</td>' +
        '<td><span class="badge" style="background:' + color + '20;color:' + color + ';border:1px solid ' + color + '40">' + (a.status || '') + '</span></td>' +
        '<td class="text-muted">' + (a.dateApplied || '') + '</td>' +
      '</tr>';
    });
    return '<div class="table-wrap"><table class="data-table"><thead><tr><th>Company</th><th>Title</th><th>Status</th><th>Date</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function _followUpsDueList(recruiters, today) {
    const due = recruiters.filter(function(r){ return r.nextFollowUpDate && r.nextFollowUpDate <= today; });
    if (!due.length) return '<p class="empty-chart">No follow-ups due today.</p>';
    let items = '';
    due.forEach(function(r) {
      const overdue = r.nextFollowUpDate < today;
      items += '<div class="followup-item' + (overdue ? ' overdue' : '') + '">' +
        '<div class="fu-info"><strong>' + r.name + '</strong><span class="text-muted"> — ' + r.company + '</span></div>' +
        '<div class="fu-date ' + (overdue ? 'text-danger' : 'text-warning') + '">' + (overdue ? 'Overdue: ' : 'Due: ') + r.nextFollowUpDate + '</div>' +
      '</div>';
    });
    return '<div class="followup-list">' + items + '</div>';
  }

  return { render: render };
})();
