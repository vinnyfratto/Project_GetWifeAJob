/**
 * i35corridor.js — I-35 Corridor Companies module
 * Mirrors companies.js exactly; uses Storage.I35Companies
 */
const I35Corridor = (() => {
  let _search = "";
  let _filterCity = "";
  let _editId = null;

  function render() {
    let rows = Storage.I35Companies.getAll();
    if (_search) {
      const s = _search.toLowerCase();
      rows = rows.filter(function(r) {
        return (r.company||"").toLowerCase().includes(s) ||
               (r.city||"").toLowerCase().includes(s) ||
               (r.notes||"").toLowerCase().includes(s);
      });
    }
    if (_filterCity) {
      rows = rows.filter(function(r){ return (r.city||"") === _filterCity; });
    }

    // Build city filter options from data
    const allCities = Array.from(new Set(
      Storage.I35Companies.getAll().map(function(r){ return r.city||""; }).filter(Boolean)
    )).sort();

    let cards = "";
    rows.forEach(function(r) {
      cards += '<div class="company-card' + (r.careerPage ? ' card-clickable' : '') + '"' +
          ' data-url="' + _esc(r.careerPage||"") + '"' +
          (r.careerPage ? ' onclick="App.openUrl(event, this.dataset.url)"' : '') + '>' +
        '<div class="company-card-header">' +
          '<div class="company-name">' + _esc(r.company||"") + '</div>' +
          '<div class="company-badges">' +
            (App.isCpcA(r.company) ? '<span class="badge badge-cpca" title="Currently accepts CPC-A">CPC-A ✓</span>' : '') +
            (r.remote_friendly==="Yes" ? '<span class="badge badge-green">Remote</span>' : '<span class="badge badge-gray">On-Site</span>') +
          '</div>' +
        '</div>' +
        '<div class="company-card-body">' +
          '<div class="company-meta"><span class="icon-sm">📍</span>' + _esc(r.city||"") + ', ' + _esc(r.state||"TX") + '</div>' +
          (r.careerPage ? '<div class="company-meta"><span class="icon-sm">🔗</span><a href="' + r.careerPage + '" target="_blank" class="link">Career Page</a></div>' : '') +
          (r.notes ? '<div class="company-notes">' + _esc(r.notes) + '</div>' : '') +
          (r.validated ? '<div class="company-validated">✓ Validated on ' + _esc(r.validated) + '</div>' : '') +
        '</div>' +
        '<div class="company-card-footer">' +
          _statusSelect(r) +
          '<div style="display:flex;gap:6px">' +
            '<button class="btn-sm btn-secondary" onclick="I35Corridor.openEdit(\'' + r.id + '\')">Edit</button>' +
            '<button class="btn-sm btn-danger-outline" onclick="I35Corridor.remove(\'' + r.id + '\')">Delete</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    });

    if (!cards) cards = '<div class="empty-state">No companies found.</div>';

    return '<div class="view-header">' +
        '<h2>I-35 Corridor <span class="count-badge">' + Storage.I35Companies.getAll().length + '</span></h2>' +
        '<button class="btn-primary" onclick="I35Corridor.openAdd()">+ Add Company</button>' +
      '</div>' +
      '<p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">Healthcare employers along I-35 between San Antonio and Austin that hire medical coders.</p>' +
      '<div class="toolbar">' +
        '<input class="search-input" type="text" placeholder="Search companies..." value="' + _esc(_search) + '" oninput="I35Corridor.setSearch(this.value)">' +
        '<select class="filter-select" onchange="I35Corridor.setFilterCity(this.value)">' +
          '<option value="">All Cities</option>' +
          allCities.map(function(c){
            return '<option value="' + _esc(c) + '"' + (_filterCity===c?' selected':'') + '>' + _esc(c) + '</option>';
          }).join("") +
        '</select>' +
      '</div>' +
      '<div class="company-grid">' + cards + '</div>' +
      _modal();
  }

  function _statusSelect(r) {
    const status = r.status || "New";
    const colors = { "New":"#9B8EC4", "Applied":"#22c55e", "Pass":"#ef4444" };
    const color  = colors[status] || colors["New"];
    return '<select class="co-status-select" ' +
        'data-id="' + r.id + '" ' +
        'onchange="I35Corridor.setStatus(this)" ' +
        'style="font-size:12px;font-weight:600;border:1px solid ' + color + '40;' +
               'background:' + color + '15;color:' + color + ';' +
               'border-radius:6px;padding:3px 8px;cursor:pointer;outline:none;">' +
      ['New','Applied','Pass'].map(function(s) {
        return '<option value="' + s + '"' + (status === s ? ' selected' : '') + '>' + s + '</option>';
      }).join('') +
    '</select>';
  }

  function _esc(s) { return (s||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;"); }

  function _modal() {
    const r = _editId ? Storage.I35Companies.getById(_editId) : {};
    const title = _editId ? "Edit Company" : "Add I-35 Company";
    return '<div id="i35-modal" class="modal-overlay hidden">' +
      '<div class="modal">' +
        '<div class="modal-header"><h3>' + title + '</h3><button class="modal-close" onclick="I35Corridor.closeModal()">✕</button></div>' +
        '<div class="modal-body">' +
          '<div class="form-grid">' +
            _field("Company Name *","i35-name","text",r.company) +
            _field("City","i35-city","text",r.city) +
            _field("State","i35-state","text",r.state||"TX") +
            _field("Career Page URL","i35-career","url",r.careerPage) +
          '</div>' +
          '<div class="form-row">' +
            '<label class="form-label">Remote Friendly</label>' +
            '<select id="i35-remote" class="form-input">' +
              '<option' + (r.remote_friendly==="Yes"?" selected":"") + '>Yes</option>' +
              '<option' + (r.remote_friendly==="No"?" selected":"") + '>No</option>' +
            '</select>' +
          '</div>' +
          '<div class="form-row form-row-full">' +
            '<label class="form-label">Notes</label>' +
            '<textarea id="i35-notes" class="form-textarea" rows="3">' + _esc(r.notes) + '</textarea>' +
          '</div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn-secondary" onclick="I35Corridor.closeModal()">Cancel</button>' +
          '<button class="btn-primary" onclick="I35Corridor.save()">Save</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function _field(label,id,type,value) {
    return '<div class="form-row"><label class="form-label">'+label+'</label><input id="'+id+'" type="'+type+'" class="form-input" value="'+_esc(value)+'"></div>';
  }

  function openAdd() { _editId=null; App.rerender(); document.getElementById("i35-modal").classList.remove("hidden"); }
  function openEdit(id) { _editId=id; App.rerender(); document.getElementById("i35-modal").classList.remove("hidden"); }
  function closeModal() { _editId=null; App.rerender(); }

  function save() {
    const name = document.getElementById("i35-name").value.trim();
    if (!name) { alert("Company name is required."); return; }
    const obj = {
      company:        name,
      city:           document.getElementById("i35-city").value.trim(),
      state:          document.getElementById("i35-state").value.trim(),
      careerPage:     document.getElementById("i35-career").value.trim(),
      remote_friendly:document.getElementById("i35-remote").value,
      notes:          document.getElementById("i35-notes").value.trim(),
    };
    if (_editId) { Storage.I35Companies.update(_editId, obj); } else { Storage.I35Companies.add(obj); }
    _editId = null; App.rerender();
  }

  function setStatus(select) {
    const id     = select.dataset.id;
    const status = select.value;
    if (status === "Pass") {
      if (confirm("Mark as Pass and delete this company?")) {
        Storage.I35Companies.remove(id);
        App.rerender();
        return;
      } else {
        const saved = (Storage.I35Companies.getById(id) || {}).status || "New";
        select.value = saved;
        return;
      }
    }
    Storage.I35Companies.update(id, { status });
    const colors = { "New":"#9B8EC4", "Applied":"#22c55e" };
    const color  = colors[status] || "#9B8EC4";
    select.style.borderColor = color + "40";
    select.style.background  = color + "15";
    select.style.color       = color;
  }

  function remove(id) {
    if (confirm("Delete this company?")) { Storage.I35Companies.remove(id); App.rerender(); }
  }

  function setSearch(val)     { _search = val;     App.rerender(); }
  function setFilterCity(val) { _filterCity = val; App.rerender(); }

  return { render, openAdd, openEdit, closeModal, save, setStatus, remove, setSearch, setFilterCity };
})();
