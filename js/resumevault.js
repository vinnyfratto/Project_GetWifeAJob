/**
 * resumevault.js — Resume Vault: link manager for resumes, certifications, LinkedIn
 */
const ResumeVault = (() => {
  let _editId = null;

  const TYPE_ICONS = {
    "Resume":"📄","LinkedIn":"🔗","Certification":"🏆","Cover Letter":"✉️","Other":"📁"
  };

  function render() {
    const items = Storage.ResumeVault.getAll();
    let cards = "";
    items.forEach(function(v) {
      const icon = TYPE_ICONS[v.type] || "📁";
      cards += '<div class="vault-card">' +
        '<div class="vault-card-header">' +
          '<span class="vault-icon">'+icon+'</span>' +
          '<div class="vault-info">' +
            '<div class="vault-title">'+(v.title||"")+'</div>' +
            '<div class="vault-type text-muted">'+(v.type||"")+'</div>' +
          '</div>' +
        '</div>' +
        (v.notes ? '<div class="vault-notes">'+(v.notes||"")+'</div>' : '') +
        '<div class="vault-footer">' +
          '<span class="text-muted">'+(v.dateAdded||"")+'</span>' +
          '<div class="vault-actions">' +
            (v.url ? '<a href="'+v.url+'" target="_blank" class="btn-sm btn-primary">Open</a>' : '') +
            '<button class="btn-sm btn-secondary" onclick="ResumeVault.openEdit(\''+v.id+'\')">Edit</button>' +
            '<button class="btn-sm btn-danger-outline" onclick="ResumeVault.remove(\''+v.id+'\')">Delete</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    });
    if (!cards) cards = '<div class="empty-state">No documents yet. Click "+ Add Document" to start your vault.</div>';

    return '<div class="view-header">' +
        '<h2>Resume Vault <span class="count-badge">'+items.length+'</span></h2>' +
        '<button class="btn-primary" onclick="ResumeVault.openAdd()">+ Add Document</button>' +
      '</div>' +
      '<div class="vault-grid">'+cards+'</div>' +
      _modal();
  }

  function _esc(s){ return (s||"").replace(/"/g,"&quot;").replace(/</g,"&lt;"); }

  function _modal() {
    const v = _editId ? Storage.ResumeVault.getById(_editId) : {};
    const title = _editId ? "Edit Document" : "Add Document";
    const types = ["Resume","Radiology Resume","Cover Letter","LinkedIn","Certification","Other"];
    return '<div id="vault-modal" class="modal-overlay hidden">' +
      '<div class="modal">' +
        '<div class="modal-header"><h3>'+title+'</h3><button class="modal-close" onclick="ResumeVault.closeModal()">✕</button></div>' +
        '<div class="modal-body">' +
          '<div class="form-row"><label class="form-label">Type</label>' +
            '<select id="vault-type" class="form-input">'+
              types.map(function(t){return '<option'+(v.type===t?' selected':'')+'>'+t+'</option>';}).join("")+
            '</select></div>' +
          '<div class="form-row"><label class="form-label">Title *</label><input id="vault-title" type="text" class="form-input" value="'+_esc(v.title)+'"></div>' +
          '<div class="form-row"><label class="form-label">URL / Link</label><input id="vault-url" type="url" class="form-input" value="'+_esc(v.url)+'"></div>' +
          '<div class="form-row"><label class="form-label">Date Added</label><input id="vault-date" type="date" class="form-input" value="'+_esc(v.dateAdded)+'"></div>' +
          '<div class="form-row form-row-full"><label class="form-label">Notes</label><textarea id="vault-notes" class="form-textarea" rows="3">'+_esc(v.notes)+'</textarea></div>' +
        '</div>' +
        '<div class="modal-footer"><button class="btn-secondary" onclick="ResumeVault.closeModal()">Cancel</button><button class="btn-primary" onclick="ResumeVault.save()">Save</button></div>' +
      '</div></div>';
  }

  function openAdd() { _editId=null; App.rerender(); document.getElementById("vault-modal").classList.remove("hidden"); }
  function openEdit(id) { _editId=id; App.rerender(); document.getElementById("vault-modal").classList.remove("hidden"); }
  function closeModal() { _editId=null; App.rerender(); }

  function save() {
    const t = document.getElementById("vault-title").value.trim();
    if (!t) { alert("Title is required."); return; }
    const obj = {
      type:      document.getElementById("vault-type").value,
      title:     t,
      url:       document.getElementById("vault-url").value.trim(),
      dateAdded: document.getElementById("vault-date").value || new Date().toISOString().slice(0,10),
      notes:     document.getElementById("vault-notes").value.trim(),
    };
    if (_editId) { Storage.ResumeVault.update(_editId,obj); } else { Storage.ResumeVault.add(obj); }
    _editId=null; App.rerender();
  }

  function remove(id) {
    if (confirm("Delete this document?")) { Storage.ResumeVault.remove(id); App.rerender(); }
  }

  return { render, openAdd, openEdit, closeModal, save, remove };
})();
