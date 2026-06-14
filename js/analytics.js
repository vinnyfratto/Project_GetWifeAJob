/**
 * analytics.js — Analytics view with SVG charts
 */
const Analytics = (() => {
  function render() {
    const apps = Storage.Applications.getAll();
    const ivs  = Storage.Interviews.getAll();
    const recs = Storage.Recruiters.getAll();

    // Apps by month (last 6)
    const monthCounts = {};
    apps.forEach(function(a) {
      if (!a.dateApplied) return;
      const m = a.dateApplied.slice(0,7);
      monthCounts[m] = (monthCounts[m]||0)+1;
    });
    const months = Object.keys(monthCounts).sort().slice(-6);

    // Interview rate
    const totalApps = apps.length;
    const interviewed = ivs.length;
    const interviewRate = totalApps > 0 ? Math.round((interviewed/totalApps)*100) : 0;

    // Offer rate
    const offers = apps.filter(function(a){ return a.status==="Offer"; }).length;
    const offerRate = totalApps > 0 ? Math.round((offers/totalApps)*100) : 0;

    // Recruiter response: recruiters with lastContactDate
    const responded = recs.filter(function(r){ return r.lastContactDate; }).length;
    const responseRate = recs.length > 0 ? Math.round((responded/recs.length)*100) : 0;

    // Apps by status
    const statusCounts = {};
    apps.forEach(function(a){ statusCounts[a.status]=(statusCounts[a.status]||0)+1; });

    // Top recruiters by lastContactDate recency
    const topRecs = recs.filter(function(r){ return r.lastContactDate; })
      .sort(function(a,b){ return b.lastContactDate>a.lastContactDate?1:-1; })
      .slice(0,5);

    return '<div class="view-header"><h2>Analytics</h2></div>' +
      '<div class="analytics-grid">' +
        '<div class="analytics-card">' +
          '<h3 class="chart-title">Applications Submitted by Month</h3>' +
          _barChart(months, monthCounts) +
        '</div>' +
        '<div class="analytics-card">' +
          '<h3 class="chart-title">Key Metrics</h3>' +
          _gaugeRow("Interview Rate", interviewRate) +
          _gaugeRow("Offer Rate", offerRate) +
          _gaugeRow("Recruiter Response Rate", responseRate) +
        '</div>' +
        '<div class="analytics-card">' +
          '<h3 class="chart-title">Applications by Status</h3>' +
          _statusBars(statusCounts) +
        '</div>' +
        '<div class="analytics-card">' +
          '<h3 class="chart-title">Most Active Recruiters</h3>' +
          _recTable(topRecs) +
        '</div>' +
      '</div>';
  }

  function _barChart(months, monthCounts) {
    if (!months.length) return '<p class="empty-chart">No application data yet.</p>';
    const maxVal = Math.max.apply(null, months.map(function(m){ return monthCounts[m]||0; }))||1;
    const W=400, H=160, padL=24, padB=32, barW=40, gap=10;
    let bars = "";
    months.forEach(function(m,i) {
      const val = monthCounts[m]||0;
      const barH = (val/maxVal)*(H-padB-16);
      const x = padL + i*(barW+gap);
      const y = H-padB-barH;
      bars += '<rect x="'+x+'" y="'+y+'" width="'+barW+'" height="'+barH+'" rx="4" fill="#9B8EC4"/>';
      bars += '<text x="'+(x+barW/2)+'" y="'+(y-4)+'" text-anchor="middle" font-size="11" fill="var(--text-muted)">'+val+'</text>';
      bars += '<text x="'+(x+barW/2)+'" y="'+(H-padB+16)+'" text-anchor="middle" font-size="10" fill="var(--text-muted)">'+m.slice(5)+'</text>';
    });
    return '<svg viewBox="0 0 '+(padL+months.length*(barW+gap)+20)+' '+H+'" width="100%">'+bars+'</svg>';
  }

  function _gaugeRow(label, pct) {
    const color = pct>=20?"#22c55e":pct>=10?"#f59e0b":"#ef4444";
    return '<div class="gauge-row">' +
      '<div class="gauge-label">'+label+'</div>' +
      '<div class="gauge-track"><div class="gauge-fill" style="width:'+pct+'%;background:'+color+'"></div></div>' +
      '<div class="gauge-pct" style="color:'+color+'">'+pct+'%</div>' +
    '</div>';
  }

  function _statusBars(statusCounts) {
    const entries = Object.entries(statusCounts).sort(function(a,b){ return b[1]-a[1]; });
    if (!entries.length) return '<p class="empty-chart">No data yet.</p>';
    const maxVal = entries[0][1]||1;
    let html = '<div class="hbar-chart">';
    entries.forEach(function(e) {
      const pct = Math.round((e[1]/maxVal)*100);
      html += '<div class="hbar-row">' +
        '<span class="hbar-label">'+e[0]+'</span>' +
        '<div class="hbar-track"><div class="hbar-fill" style="width:'+pct+'%"></div></div>' +
        '<span class="hbar-val">'+e[1]+'</span>' +
      '</div>';
    });
    return html+'</div>';
  }

  function _recTable(recs) {
    if (!recs.length) return '<p class="empty-chart">No recruiter data yet.</p>';
    let rows = "";
    recs.forEach(function(r) {
      rows += '<tr><td><strong>'+(r.name||"")+'</strong></td><td class="text-muted">'+(r.company||"")+'</td><td>'+(r.lastContactDate||"")+'</td></tr>';
    });
    return '<table class="data-table"><thead><tr><th>Recruiter</th><th>Company</th><th>Last Contact</th></tr></thead><tbody>'+rows+'</tbody></table>';
  }

  function _(s){ return s||""; }

  return { render };
})();
