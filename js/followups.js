/**
 * followups.js — Follow-Ups view (auto-generated from recruiters + interviews)
 */
const FollowUps = (() => {
  function render() {
    const today = new Date().toISOString().slice(0,10);
    const endOfWeek = new Date();
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    const eow = endOfWeek.toISOString().slice(0,10);

    const recs = Storage.Recruiters.getAll();
    const ivs  = Storage.Interviews.getAll();

    // Build a unified list of items
    const items = [];
    recs.forEach(function(r) {
      if (!r.nextFollowUpDate) return;
      items.push({
        type:    "Recruiter",
        name:    r.name + " — " + r.company,
        date:    r.nextFollowUpDate,
        notes:   r.notes || "",
        contact: r.email || "",
        id:      r.id,
      });
    });
    ivs.forEach(function(iv) {
      if (iv.followUpSent) return;
      if (!iv.date) return;
      items.push({
        type:  "Interview",
        name:  iv.company + " — " + iv.position,
        date:  iv.date,
        notes: iv.notes || "",
        id:    iv.id,
      });
    });

    const overdue  = items.filter(function(i){ return i.date <  today; });
    const dueToday = items.filter(function(i){ return i.date === today; });
    const thisWeek = items.filter(function(i){ return i.date > today && i.date <= eow; });
    const upcoming = items.filter(function(i){ return i.date >  eow; });

    function _section(title, list, cls) {
      if (!list.length) return '<div class="fu-section"><h3 class="fu-section-title '+cls+'">'+title+' <span class="count-badge">0</span></h3><p class="empty-chart">None.</p></div>';
      let html = '<div class="fu-section"><h3 class="fu-section-title '+cls+'">'+title+' <span class="count-badge">'+list.length+'</span></h3><div class="fu-list">';
      list.forEach(function(item) {
        html += '<div class="fu-item ' + cls + '-item">' +
          '<div class="fu-item-left">' +
            '<span class="fu-type-badge">'+item.type+'</span>' +
            '<strong>'+item.name+'</strong>' +
          '</div>' +
          '<div class="fu-item-right">' +
            '<span class="fu-date">'+item.date+'</span>' +
            (item.contact ? '<a href="mailto:'+item.contact+'" class="btn-sm btn-secondary">Email</a>' : '') +
          '</div>' +
        '</div>';
      });
      html += '</div></div>';
      return html;
    }

    return '<div class="view-header"><h2>Follow-Ups</h2></div>' +
      '<div class="fu-sections">' +
        _section("Overdue", overdue, "fu-overdue") +
        _section("Due Today", dueToday, "fu-today") +
        _section("This Week", thisWeek, "fu-week") +
        _section("Upcoming", upcoming, "fu-upcoming") +
      '</div>';
  }

  return { render };
})();
