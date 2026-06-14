/**
 * applications.js — Kanban board with drag-and-drop
 */
const Applications = (() => {
  const COLUMNS = [
    "Researching","Preparing Resume","Applied","Recruiter Contacted",
    "Phone Screen","Interview","Offer","Rejected","Closed"
  ];
  const COL_COLORS = {
    "Researching":"#94a3b8","Preparing Resume":"#C4B5FD","Applied":"#9B8EC4",
    "Recruiter Contacted":"#a78bfa","Phone Screen":"#7c3aed","Interview":"#6d28d9",
    "Offer":"#22c55e","Rejected":"#ef4444","Closed":"#64748b"
  };
  let _dragId = null;
  let _editId = null;

  function render() {
    const apps = Storage.Applications.getAll();

    let cols = "";
    COLUMNS.forEach(function(col) {
      const items = apps.filter(function(a){ return a.status===col; });
      let cards = "";
      items.forEach(function(a) {
        const pColor = a.priority==="High"?"#ef4444":a.priority==="Low"?"#94a3b8":"#f59e0b";
        cards += '<div class="kanban-card" draggable="true" ' +
          'data-id="'+a.id+'" ' +
          'ondragstart="Applications.dragStart(event,\''+a.id+'\')" ' +
          'ondragend="Applications.dragEnd(event)">' +
          '<div class="kcard-top">' +
            '<span class="kcard-priority" style="background:'+pColor+'20;color:'+pColor+'">'+(a.priority||"Medium")+'</span>' +
            '<button class="btn-icon-sm" onclick="Applications.openEdit(\''+a.id+'\')">✏️</button>' +
          '</div>' +
          '<div class="kcard-company">'+(a.company||"")+'</div>' +
          '<div class="kcard-title">'+(a.title||"")+'</div>' +
          '<div class="kcard-date text-muted">'+(a.dateApplied||"")+'</div>' +
          '<button class="btn-icon-sm btn-danger-sm" onclick="Applications.remove(\''+a.id+'\')" style="float:right;margin-top:4px">🗑</button>' +
        '</div>';
      });
      const colColor = COL_COLORS[col]||"#9B8EC4";
      cols += '<div class="kanban-col" ' +
        'data-col="'+col+'" ' +
        'ondragover="Applications.dragOver(event)" ' +
        'ondrop="Applications.drop(event,\''+col+'\')">' +
        '<div class="kanban-col-header" style="border-top:3px solid '+colColor+'">' +
          '<span class="kanban-col-title">'+col+'</span>' +
          '<span class="kanban-col-count">'+items.length+'</span>' +
        '</div>' +
        '<div class="kanban-cards">'+cards+'</div>' +
      '</div>';
    });

    return '<div class="view-header">' +
        '<h2>Applications — Kanban Board</h2>' +
        '<button class="btn-primary" onclick="Applications.openAdd()">+ Add Application</button>' +
      '</div>' +
      '<div class="kanban-board">'+cols+'</div>' +
      _modal();
  }

  // fix typo with a helper alias
  function _(s){ return s||""; }

  function _esc(s){ return (s||"").replace(/"/g,"&quot;").replace(/</g,"&lt;"); }

  function _modal() {
    const a = _editId ? Storage.Applications.getById(_editId) : {};
    const title = _editId ? "Edit Application" : "Add Application";
    return '<div id="app-modal" class="modal-overlay hidden">' +
      '<div class="modal">' +
        '<div class="modal-header"><h3>'+title+'</h3><button class="modal-close" onclick="Applications.closeModal()">✕</button></div>' +
        '<div class="modal-body">' +
          '<div class="form-grid">' +
            _field("Company *","app-company","text",a.company) +
            _field("Job Title *","app-title","text",a.title) +
            _field("Date Applied","app-date","date",a.dateApplied) +
          '</div>' +
          '<div class="form-row"><label class="form-label">Status</label>' +
            '<select id="app-status" class="form-input">' +
              COLUMNS.map(function(c){return '<option'+(a.status===c?' selected':'')+'>'+c+'</option>';}).join("") +
            '</select>' +
          '</div>' +
          '<div class="form-row"><label class="form-label">Priority</label>' +
            '<select id="app-priority" class="form-input">' +
              ['High','Medium','Low'].map(function(p){return '<option'+(a.priority===p?' selected':'')+'>'+p+'</option>';}).join("") +
            '</select>' +
          '</div>' +
          '<div class="form-row form-row-full"><label class="form-label">Notes</label>' +
            '<textarea id="app-notes" class="form-textarea" rows="3">'+_esc(a.notes)+'</textarea>' +
          '</div>' +
        '</div>' +
        '<div class="modal-footer"><button class="btn-secondary" onclick="Applications.closeModal()">Cancel</button><button class="btn-primary" onclick="Applications.save()">Save</button></div>' +
      '</div></div>';
  }

  function _field(label,id,type,value) {
    return '<div class="form-row"><label class="form-label">'+label+'</label><input id="'+id+'" type="'+type+'" class="form-input" value="'+_esc(value)+'"></div>';
  }

  function openAdd() { _editId=null; App.rerender(); document.getElementById("app-modal").classList.remove("hidden"); }
  function openEdit(id) { _editId=id; App.rerender(); document.getElementById("app-modal").classList.remove("hidden"); }
  function closeModal() { _editId=null; App.rerender(); }

  function save() {
    const company = document.getElementById("app-company").value.trim();
    const title   = document.getElementById("app-title").value.trim();
    if (!company||!title) { alert("Company and Title are required."); return; }
    const obj = {
      company,
      title,
      status:      document.getElementById("app-status").value,
      priority:    document.getElementById("app-priority").value,
      dateApplied: document.getElementById("app-date").value || new Date().toISOString().slice(0,10),
      notes:       document.getElementById("app-notes").value.trim(),
    };
    if (_editId) { Storage.Applications.update(_editId,obj); } else { Storage.Applications.add(obj); }
    _editId=null; App.rerender();
  }

  function remove(id) {
    if (confirm("Delete this application?")) { Storage.Applications.remove(id); App.rerender(); }
  }

  /* ── Drag & Drop ── */
  function dragStart(event, id) {
    _dragId = id;
    event.currentTarget.classList.add("dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  }

  function dragEnd(event) {
    event.currentTarget.classList.remove("dragging");
    document.querySelectorAll(".kanban-col").forEach(function(c){ c.classList.remove("drag-over"); });
  }

  function dragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const col = event.currentTarget;
    document.querySelectorAll(".kanban-col").forEach(function(c){ c.classList.remove("drag-over"); });
    col.classList.add("drag-over");
  }

  function drop(event, newStatus) {
    event.preventDefault();
    const id = _dragId || event.dataTransfer.getData("text/plain");
    if (id) {
      Storage.Applications.update(id, { status: newStatus });
      _dragId = null;
      App.rerender();
    }
  }

  return { render, openAdd, openEdit, closeModal, save, remove, dragStart, dragEnd, dragOver, drop };
})();
