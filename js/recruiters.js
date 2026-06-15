/**
 * recruiters.js — Recruiters module: table with search, filter, sort, add/edit/delete
 */
const Recruiters = (() => {
  let _searchTerm = "";
  let _sortCol = "name";
  let _sortDir = 1;
  let _filterPriority = "";
  let _editId = null;

  function render() {
    let rows = Storage.Recruiters.getAll();
    if (_searchTerm) {
      const s = _searchTerm.toLowerCase();
      rows = rows.filter(function(r) {
        return (r.name||"").toLowerCase().includes(s) ||
               (r.company||"").toLowerCase().includes(s) ||
               (r.email||"").toLowerCase().includes(s) ||
               (r.notes||"").toLowerCase().includes(s);
      });
    }
    if (_filterPriority) {
      rows = rows.filter(function(r){ return r.priority === _filterPriority; });
    }
    rows.sort(function(a,b) {
      const av = (a[_sortCol]||"").toString().toLowerCase();
      const bv = (b[_sortCol]||"").toString().toLowerCase();
      return av < bv ? -_sortDir : av > bv ? _sortDir : 0;
    });

    const today = new Date().toISOString().slice(0,10);

    let tableRows = "";
    rows.forEach(function(r) {
      const isOverdue = r.nextFollowUpDate && r.nextFollowUpDate < today;
      const isDueToday = r.nextFollowUpDate && r.nextFollowUpDate === today;
      const tags = (r.tags||[]).map(function(t){ return '<span class="tag">' + t + '</span>'; }).join("");
      // Contact line: show email/phone only if filled in
      const contactLine = [r.email, r.phone].filter(Boolean).join(" · ");
      const nameCell = '<strong>' + (r.name||"") + '</strong>' +
        (tags ? '<br><span class="tags-cell" style="margin-top:4px">' + tags + '</span>' : '');

      const contactCell = r.website
        ? '<a href="' + r.website + '" target="_blank" rel="noopener" class="rec-link">Website ↗</a>'
        : '<button class="rec-link-empty" onclick="Recruiters.openEdit(\'' + r.id + '\')" title="Add website">+ Add Website</button>';

      const fitClass = r.radiology_fit==="High" ? "badge-green" : r.radiology_fit==="Medium" ? "badge-medium" : "badge-gray";
      tableRows += '<tr>' +
        '<td>' + nameCell + '</td>' +
        '<td>' + contactCell + '</td>' +
        '<td><span class="badge ' + fitClass + '">' + (r.radiology_fit||"—") + '</span></td>' +
        '<td class="actions-cell">' +
          '<button class="btn-icon" onclick="Recruiters.openEdit(\'' + r.id + '\')" title="Edit">✏️</button>' +
          '<button class="btn-icon btn-danger" onclick="Recruiters.remove(\'' + r.id + '\')" title="Delete">🗑</button>' +
        '</td>' +
      '</tr>';
    });

    if (!tableRows) {
      tableRows = '<tr><td colspan="4" class="empty-row">No recruiters found. Click "+ Add Recruiter" to get started.</td></tr>';
    }

    return '<div class="view-header">' +
        '<h2>Recruiters <span class="count-badge">' + Storage.Recruiters.getAll().length + '</span></h2>' +
        '<button class="btn-primary" onclick="Recruiters.openAdd()">+ Add Recruiter</button>' +
      '</div>' +
      '<div class="toolbar">' +
        '<input class="search-input" type="text" placeholder="Search recruiters..." value="' + _esc(_searchTerm) + '" oninput="Recruiters.setSearch(this.value)">' +
        '<select class="filter-select" onchange="Recruiters.setFilter(this.value)">' +
          '<option value="">All Priorities</option>' +
          '<option value="High"' + (_filterPriority==="High"?" selected":"") + '>High</option>' +
          '<option value="Medium"' + (_filterPriority==="Medium"?" selected":"") + '>Medium</option>' +
          '<option value="Low"' + (_filterPriority==="Low"?" selected":"") + '>Low</option>' +
        '</select>' +
      '</div>' +
      '<div class="table-wrap">' +
        '<table class="data-table sortable">' +
          '<thead><tr>' +
            _th("Agency / Recruiter","name") +
            '<th>Contact</th>' +
            '<th>Radiology Fit</th>' +
            '<th>Actions</th>' +
          '</tr></thead>' +
          '<tbody>' + tableRows + '</tbody>' +
        '</table>' +
      '</div>' +
      _modal();
  }

  function _th(label, col) {
    const arrow = _sortCol === col ? (_sortDir===1 ? " ↑" : " ↓") : "";
    return '<th class="sortable-col" onclick="Recruiters.sortBy(\'' + col + '\')" style="cursor:pointer">' + label + arrow + '</th>';
  }

  function _stars(rating) {
    let s = "";
    for (let i=1; i<=5; i++) {
      s += '<span class="star' + (i<=rating ? " filled" : "") + '">★</span>';
    }
    return s;
  }

  function _esc(s) {
    return (s||"").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }

  function _modal() {
    const r = _editId ? Storage.Recruiters.getById(_editId) : {};
    const title = _editId ? "Edit Recruiter" : "Add Recruiter";
    const tags = Array.isArray(r.tags) ? r.tags.join(", ") : (r.tags||"");

    return '<div id="recruiter-modal" class="modal-overlay hidden">' +
      '<div class="modal">' +
        '<div class="modal-header"><h3>' + title + '</h3><button class="modal-close" onclick="Recruiters.closeModal()">✕</button></div>' +
        '<div class="modal-body">' +
          '<div class="form-grid">' +
            _field("Name *", "rec-name", "text", r.name) +
            _field("Company *", "rec-company", "text", r.company) +
            _field("Email", "rec-email", "email", r.email) +
            _field("Phone", "rec-phone", "text", r.phone) +
            _field("LinkedIn URL", "rec-linkedin", "url", r.linkedin) +
            _field("Website", "rec-website", "url", r.website) +
            _field("Specialty", "rec-specialty", "text", r.specialty||"Medical Coding/RCM") +
            _field("State", "rec-state", "text", r.state||"TX") +
            _field("Last Contact", "rec-lastContact", "date", r.lastContactDate) +
            _field("Next Follow-Up", "rec-nextFollowUp", "date", r.nextFollowUpDate) +
          '</div>' +
          '<div class="form-row">' +
            '<label class="form-label">Priority</label>' +
            '<select id="rec-priority" class="form-input">' +
              '<option' + (r.priority==="High"?" selected":"") + '>High</option>' +
              '<option' + (r.priority==="Medium"?" selected":"") + '>Medium</option>' +
              '<option' + (r.priority==="Low"?" selected":"") + '>Low</option>' +
            '</select>' +
          '</div>' +
          '<div class="form-row">' +
            '<label class="form-label">Rating</label>' +
            '<select id="rec-rating" class="form-input">' +
              [1,2,3,4,5].map(function(n){ return '<option value="'+n+'"'+(r.rating===n?" selected":"")+'>'+"★".repeat(n)+'</option>'; }).join("") +
            '</select>' +
          '</div>' +
          '<div class="form-row">' +
            '<label class="form-label">Radiology Fit</label>' +
            '<select id="rec-radfit" class="form-input">' +
              '<option' + (r.radiology_fit==="High"?" selected":"") + '>High</option>' +
              '<option' + (r.radiology_fit==="Medium"?" selected":"") + '>Medium</option>' +
              '<option' + (r.radiology_fit==="Low"?" selected":"") + '>Low</option>' +
            '</select>' +
          '</div>' +
          '<div class="form-row">' +
            '<label class="form-label">Remote Focus</label>' +
            '<select id="rec-remote" class="form-input">' +
              '<option' + (r.remote_focus==="Yes"?" selected":"") + '>Yes</option>' +
              '<option' + (r.remote_focus==="No"?" selected":"") + '>No</option>' +
            '</select>' +
          '</div>' +
          '<div class="form-row">' +
            '<label class="form-label">Tags (comma-separated)</label>' +
            '<input id="rec-tags" type="text" class="form-input" value="' + _esc(tags) + '">' +
          '</div>' +
          '<div class="form-row form-row-full">' +
            '<label class="form-label">Notes</label>' +
            '<textarea id="rec-notes" class="form-textarea" rows="4">' + _esc(r.notes) + '</textarea>' +
          '</div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn-secondary" onclick="Recruiters.closeModal()">Cancel</button>' +
          '<button class="btn-primary" onclick="Recruiters.save()">Save</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function _field(label, id, type, value) {
    return '<div class="form-row">' +
      '<label class="form-label">' + label + '</label>' +
      '<input id="' + id + '" type="' + type + '" class="form-input" value="' + _esc(value) + '">' +
    '</div>';
  }

  function openAdd() {
    _editId = null;
    App.rerender();
    document.getElementById("recruiter-modal").classList.remove("hidden");
  }

  function openEdit(id) {
    _editId = id;
    App.rerender();
    document.getElementById("recruiter-modal").classList.remove("hidden");
  }

  function closeModal() {
    _editId = null;
    App.rerender();
  }

  function save() {
    const name = document.getElementById("rec-name").value.trim();
    if (!name) { alert("Name is required."); return; }
    const obj = {
      name:            name,
      company:         document.getElementById("rec-company").value.trim(),
      email:           document.getElementById("rec-email").value.trim(),
      phone:           document.getElementById("rec-phone").value.trim(),
      linkedin:        document.getElementById("rec-linkedin").value.trim(),
      website:         document.getElementById("rec-website").value.trim(),
      specialty:       document.getElementById("rec-specialty").value.trim(),
      state:           document.getElementById("rec-state").value.trim(),
      lastContactDate: document.getElementById("rec-lastContact").value,
      nextFollowUpDate:document.getElementById("rec-nextFollowUp").value,
      priority:        document.getElementById("rec-priority").value,
      rating:          parseInt(document.getElementById("rec-rating").value)||3,
      radiology_fit:   document.getElementById("rec-radfit").value,
      remote_focus:    document.getElementById("rec-remote").value,
      tags:            document.getElementById("rec-tags").value.split(",").map(function(t){ return t.trim(); }).filter(Boolean),
      notes:           document.getElementById("rec-notes").value.trim(),
    };
    if (_editId) {
      Storage.Recruiters.update(_editId, obj);
    } else {
      Storage.Recruiters.add(obj);
    }
    _editId = null;
    App.rerender();
  }

  function remove(id) {
    if (confirm("Delete this recruiter?")) {
      Storage.Recruiters.remove(id);
      App.rerender();
    }
  }

  function setSearch(val) { _searchTerm = val; App.rerender(); }
  function setFilter(val) { _filterPriority = val; App.rerender(); }
  function sortBy(col) {
    if (_sortCol === col) { _sortDir *= -1; } else { _sortCol = col; _sortDir = 1; }
    App.rerender();
  }

  return { render, openAdd, openEdit, closeModal, save, remove, setSearch, setFilter, sortBy };
})();
