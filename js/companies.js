/**
 * companies.js — Companies module
 */
const Companies = (() => {
  let _search = "";
  let _editId = null;

  function render() {
    let rows = Storage.Companies.getAll();
    if (_search) {
      const s = _search.toLowerCase();
      rows = rows.filter(function(r) {
        return (r.company||"").toLowerCase().includes(s) ||
               (r.notes||"").toLowerCase().includes(s);
      });
    }
    let cards = "";
    rows.forEach(function(r) {
      cards += '<div class="company-card">' +
        '<div class="company-card-header">' +
          '<div class="company-name">' + (r.company||"") + '</div>' +
          '<div class="company-badges">' +
            (r.remote_friendly==="Yes" ? '<span class="badge badge-green">Remote</span>' : '') +
            (r.target==="Yes" ? '<span class="badge badge-purple">Target</span>' : '') +
            '<span class="badge badge-' + (r.priority||"").toLowerCase() + '">' + (r.priority||"") + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="company-card-body">' +
          '<div class="company-meta"><span class="icon-sm">📍</span>' + (r.state||"") + '</div>' +
          (r.careerPage ? '<div class="company-meta"><span class="icon-sm">🔗</span><a href="' + r.careerPage + '" target="_blank" class="link">Career Page</a></div>' : '') +
          (r.contact ? '<div class="company-meta"><span class="icon-sm">👤</span>' + r.contact + '</div>' : '') +
          (r.notes ? '<div class="company-notes">' + r.notes + '</div>' : '') +
        '</div>' +
        '<div class="company-card-footer">' +
          '<button class="btn-sm btn-secondary" onclick="Companies.openEdit(\'' + r.id + '\')">Edit</button>' +
          '<button class="btn-sm btn-danger-outline" onclick="Companies.remove(\'' + r.id + '\')">Delete</button>' +
        '</div>' +
      '</div>';
    });
    if (!cards) cards = '<div class="empty-state">No companies found. Click "+ Add Company" to begin.</div>';

    return '<div class="view-header">' +
        '<h2>Companies <span class="count-badge">' + Storage.Companies.getAll().length + '</span></h2>' +
        '<button class="btn-primary" onclick="Companies.openAdd()">+ Add Company</button>' +
      '</div>' +
      '<div class="toolbar">' +
        '<input class="search-input" type="text" placeholder="Search companies..." value="' + _esc(_search) + '" oninput="Companies.setSearch(this.value)">' +
      '</div>' +
      '<div class="company-grid">' + cards + '</div>' +
      _modal();
  }

  function _esc(s) { return (s||"").replace(/"/g,"&quot;").replace(/</g,"&lt;"); }

  function _modal() {
    const r = _editId ? Storage.Companies.getById(_editId) : {};
    const title = _editId ? "Edit Company" : "Add Company";
    return '<div id="company-modal" class="modal-overlay hidden">' +
      '<div class="modal">' +
        '<div class="modal-header"><h3>' + title + '</h3><button class="modal-close" onclick="Companies.closeModal()">✕</button></div>' +
        '<div class="modal-body">' +
          '<div class="form-grid">' +
            _field("Company Name *","co-name","text",r.company) +
            _field("State","co-state","text",r.state||"TX") +
            _field("Career Page URL","co-career","url",r.careerPage) +
            _field("Contact Name","co-contact","text",r.contact) +
          '</div>' +
          '<div class="form-row">' +
            '<label class="form-label">Remote Friendly</label>' +
            '<select id="co-remote" class="form-input"><option'+(r.remote_friendly==="Yes"?" selected":"")+'>Yes</option><option'+(r.remote_friendly==="No"?" selected":"")+'>No</option></select>' +
          '</div>' +
          '<div class="form-row">' +
            '<label class="form-label">Target Company</label>' +
            '<select id="co-target" class="form-input"><option'+(r.target==="Yes"?" selected":"")+'>Yes</option><option'+(r.target==="No"?" selected":"")+'>No</option></select>' +
          '</div>' +
          '<div class="form-row">' +
            '<label class="form-label">Priority</label>' +
            '<select id="co-priority" class="form-input"><option'+(r.priority==="High"?" selected":"")+'>High</option><option'+(r.priority==="Medium"?" selected":"")+'>Medium</option><option'+(r.priority==="Low"?" selected":"")+'>Low</option></select>' +
          '</div>' +
          '<div class="form-row form-row-full">' +
            '<label class="form-label">Notes</label>' +
            '<textarea id="co-notes" class="form-textarea" rows="3">' + _esc(r.notes) + '</textarea>' +
          '</div>' +
        '</div>' +
        '<div class="modal-footer"><button class="btn-secondary" onclick="Companies.closeModal()">Cancel</button><button class="btn-primary" onclick="Companies.save()">Save</button></div>' +
      '</div></div>';
  }

  function _field(label,id,type,value) {
    return '<div class="form-row"><label class="form-label">'+label+'</label><input id="'+id+'" type="'+type+'" class="form-input" value="'+_esc(value)+'"></div>';
  }

  function openAdd() { _editId=null; App.rerender(); document.getElementById("company-modal").classList.remove("hidden"); }
  function openEdit(id) { _editId=id; App.rerender(); document.getElementById("company-modal").classList.remove("hidden"); }
  function closeModal() { _editId=null; App.rerender(); }

  function save() {
    const name = document.getElementById("co-name").value.trim();
    if (!name) { alert("Company name is required."); return; }
    const obj = {
      company:        name,
      state:          document.getElementById("co-state").value.trim(),
      careerPage:     document.getElementById("co-career").value.trim(),
      contact:        document.getElementById("co-contact").value.trim(),
      remote_friendly:document.getElementById("co-remote").value,
      target:         document.getElementById("co-target").value,
      priority:       document.getElementById("co-priority").value,
      notes:          document.getElementById("co-notes").value.trim(),
    };
    if (_editId) { Storage.Companies.update(_editId,obj); } else { Storage.Companies.add(obj); }
    _editId=null; App.rerender();
  }

  function remove(id) {
    if (confirm("Delete this company?")) { Storage.Companies.remove(id); App.rerender(); }
  }

  function setSearch(val) { _search=val; App.rerender(); }

  return { render, openAdd, openEdit, closeModal, save, remove, setSearch };
})();
