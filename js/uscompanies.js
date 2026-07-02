/**
 * uscompanies.js — US Companies module (national, non-TX)
 * Mirrors i35corridor.js; uses Storage.USCompanies; limit 100 results.
 */
const USCompanies = (() => {
  let _search = "";
  let _filterState = "";
  let _editId = null;

  const LIMIT = 100;

  function render() {
    let rows = Storage.USCompanies.getAll();
    if (_search) {
      const s = _search.toLowerCase();
      rows = rows.filter(function(r) {
        return (r.company||"").toLowerCase().includes(s) ||
               (r.state||"").toLowerCase().includes(s) ||
               (r.notes||"").toLowerCase().includes(s);
      });
    }
    if (_filterState) {
      rows = rows.filter(function(r){ return (r.state||"") === _filterState; });
    }
    const total = rows.length;
    rows = rows.slice(0, LIMIT);

    const allStates = Array.from(new Set(
      Storage.USCompanies.getAll().map(function(r){ return r.state||""; }).filter(Boolean)
    )).sort();

    let cards = "";
    rows.forEach(function(r) {
      cards +=
        '<div class="company-card' + (r.careerPage ? ' card-clickable' : '') + '"' +
            ' data-url="' + _esc(r.careerPage||"") + '"' +
            (r.careerPage ? ' onclick="App.openUrl(event, this.dataset.url)"' : '') + '>' +
          '<div class="company-card-header">' +
            '<div class="company-name">' + _esc(r.company||"") + '</div>' +
            '<div class="company-badges">' +
              '<span class="badge badge-state">' + _esc(r.state||"") + '</span>' +
              (r.remote_friendly==="Yes"
                ? '<span class="badge badge-green">Remote</span>'
                : '<span class="badge badge-gray">On-Site</span>') +
            '</div>' +
          '</div>' +
          '<div class="company-card-body">' +
            (r.careerPage ? '<div class="company-meta"><span class="icon-sm">🔗</span><a href="' + r.careerPage + '" target="_blank" class="link">Career Page</a></div>' : '') +
            (r.notes ? '<div class="company-notes">' + _esc(r.notes) + '</div>' : '') +
            (r.validated ? '<div class="company-validated">✓ Validated on ' + _esc(r.validated) + '</div>' : '') +
          '</div>' +
          '<div class="company-card-footer">' +
            _statusSelect(r) +
            '<div style="display:flex;gap:6px">' +
              '<button class="btn-sm btn-secondary" onclick="USCompanies.openEdit(\'' + r.id + '\')">Edit</button>' +
              '<button class="btn-sm btn-danger-outline" onclick="USCompanies.remove(\'' + r.id + '\')">Delete</button>' +
            '</div>' +
          '</div>' +
        '</div>';
    });

    if (!cards) cards = '<div class="empty-state">No companies found.</div>';

    const limitNote = total > LIMIT
      ? '<p style="font-size:12px;color:var(--text-muted);margin-bottom:8px">Showing ' + LIMIT + ' of ' + total + ' results.</p>'
      : '';

    return '<div class="view-header">' +
        '<h2>US Companies <span class="count-badge">' + Storage.USCompanies.getAll().length + '</span></h2>' +
        '<button class="btn-primary" onclick="USCompanies.openAdd()">+ Add Company</button>' +
      '</div>' +
      '<p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">National healthcare employers (outside Texas) that hire remote medical coders.</p>' +
      '<div class="toolbar">' +
        '<input class="search-input" type="text" placeholder="Search companies..." value="' + _esc(_search) + '" oninput="USCompanies.setSearch(this.value)">' +
        '<select class="filter-select" onchange="USCompanies.setFilterState(this.value)">' +
          '<option value="">All States</option>' +
          allStates.map(function(s){
            return '<option value="' + _esc(s) + '"' + (_filterState===s?' selected':'') + '>' + _esc(s) + '</option>';
          }).join("") +
        '</select>' +
      '</div>' +
      limitNote +
      '<div class="company-grid">' + cards + '</div>' +
      _modal();
  }

  function _statusSelect(r) {
    const status = r.status || "New";
    const colors = { "New":"#9B8EC4", "Applied":"#22c55e", "Pass":"#ef4444" };
    const color  = colors[status] || colors["New"];
    return '<select class="co-status-select" data-id="' + r.id + '" onchange="USCompanies.setStatus(this)" ' +
      'style="font-size:12px;font-weight:600;border:1px solid ' + color + '40;' +
             'background:' + color + '15;color:' + color + ';' +
             'border-radius:6px;padding:3px 8px;cursor:pointer;outline:none;">' +
      ['New','Applied','Pass'].map(function(s) {
        return '<option value="' + s + '"' + (status===s?' selected':'') + '>' + s + '</option>';
      }).join('') +
    '</select>';
  }

  function _esc(s) { return (s||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;"); }

  function _modal() {
    const r = _editId ? Storage.USCompanies.getById(_editId) : {};
    const title = _editId ? "Edit Company" : "Add US Company";
    return '<div id="us-modal" class="modal-overlay hidden">' +
      '<div class="modal">' +
        '<div class="modal-header"><h3>' + title + '</h3><button class="modal-close" onclick="USCompanies.closeModal()">✕</button></div>' +
        '<div class="modal-body">' +
          '<div class="form-grid">' +
            _field("Company Name *","us-name","text",r.company) +
            _field("State (abbrev)","us-state","text",r.state) +
            _field("Career Page URL","us-career","url",r.careerPage) +
          '</div>' +
          '<div class="form-row">' +
            '<label class="form-label">Remote Friendly</label>' +
            '<select id="us-remote" class="form-input">' +
              '<option' + (r.remote_friendly==="Yes"?" selected":"") + '>Yes</option>' +
              '<option' + (r.remote_friendly==="No"?" selected":"") + '>No</option>' +
            '</select>' +
          '</div>' +
          '<div class="form-row form-row-full">' +
            '<label class="form-label">Notes</label>' +
            '<textarea id="us-notes" class="form-textarea" rows="3">' + _esc(r.notes) + '</textarea>' +
          '</div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn-secondary" onclick="USCompanies.closeModal()">Cancel</button>' +
          '<button class="btn-primary" onclick="USCompanies.save()">Save</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function _field(label,id,type,value) {
    return '<div class="form-row"><label class="form-label">'+label+'</label><input id="'+id+'" type="'+type+'" class="form-input" value="'+_esc(value)+'"></div>';
  }

  function openAdd()   { _editId=null; App.rerender(); document.getElementById("us-modal").classList.remove("hidden"); }
  function openEdit(id){ _editId=id;   App.rerender(); document.getElementById("us-modal").classList.remove("hidden"); }
  function closeModal(){ _editId=null; App.rerender(); }

  function save() {
    const name = document.getElementById("us-name").value.trim();
    if (!name) { alert("Company name is required."); return; }
    const obj = {
      company:         name,
      state:           document.getElementById("us-state").value.trim().toUpperCase(),
      careerPage:      document.getElementById("us-career").value.trim(),
      remote_friendly: document.getElementById("us-remote").value,
      notes:           document.getElementById("us-notes").value.trim(),
    };
    if (_editId) { Storage.USCompanies.update(_editId, obj); } else { Storage.USCompanies.add(obj); }
    _editId = null; App.rerender();
  }

  function setStatus(select) {
    const id     = select.dataset.id;
    const status = select.value;
    if (status === "Pass") {
      if (confirm("Mark as Pass and delete this company?")) {
        Storage.USCompanies.remove(id);
        App.rerender();
        return;
      } else {
        select.value = (Storage.USCompanies.getById(id)||{}).status || "New";
        return;
      }
    }
    Storage.USCompanies.update(id, { status });
    const colors = { "New":"#9B8EC4", "Applied":"#22c55e" };
    const color  = colors[status] || "#9B8EC4";
    select.style.borderColor = color + "40";
    select.style.background  = color + "15";
    select.style.color       = color;
  }

  function remove(id) {
    if (confirm("Delete this company?")) { Storage.USCompanies.remove(id); App.rerender(); }
  }

  function setSearch(val)      { _search = val;      App.rerender(); }
  function setFilterState(val) { _filterState = val; App.rerender(); }

  return { render, openAdd, openEdit, closeModal, save, setStatus, remove, setSearch, setFilterState };
})();
