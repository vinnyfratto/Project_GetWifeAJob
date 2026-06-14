/**
 * interviews.js — Interviews module
 */
const Interviews = (() => {
  let _editId = null;

  function render() {
    const ivs = Storage.Interviews.getAll().sort(function(a,b){
      return (a.date||"") < (b.date||"") ? 1 : -1;
    });
    const today = new Date().toISOString().slice(0,10);

    let rows = "";
    ivs.forEach(function(iv) {
      const isPast = iv.date && iv.date < today;
      rows += '<tr class="' + (isPast ? "row-past" : "") + '">' +
        '<td><strong>'+(iv.company||"")+'</strong></td>' +
        '<td>'+(iv.position||"")+'</td>' +
        '<td>'+(iv.date||"")+'</td>' +
        '<td>'+(iv.time||"")+'</td>' +
        '<td><span class="badge badge-type">'+(iv.type||"")+'</span></td>' +
        '<td>'+(iv.interviewer||"")+'</td>' +
        '<td><span class="badge '+(iv.followUpSent?"badge-green":"badge-gray")+'">'+(iv.followUpSent?"Sent":"Pending")+'</span></td>' +
        '<td class="actions-cell">' +
          '<button class="btn-icon" onclick="Interviews.openEdit(\''+iv.id+'\')">✏️</button>' +
          '<button class="btn-icon" onclick="Interviews.toggleFollowUp(\''+iv.id+'\','+(!iv.followUpSent)+')" title="Toggle follow-up">'+(iv.followUpSent?"↩":"✓")+'</button>' +
          '<button class="btn-icon btn-danger" onclick="Interviews.remove(\''+iv.id+'\')">🗑</button>' +
        '</td>' +
      '</tr>';
    });
    if (!rows) rows = '<tr><td colspan="8" class="empty-row">No interviews yet. Click "+ Add Interview" to log one.</td></tr>';

    return '<div class="view-header">' +
        '<h2>Interviews <span class="count-badge">'+ivs.length+'</span></h2>' +
        '<button class="btn-primary" onclick="Interviews.openAdd()">+ Add Interview</button>' +
      '</div>' +
      '<div class="table-wrap">' +
        '<table class="data-table">' +
          '<thead><tr><th>Company</th><th>Position</th><th>Date</th><th>Time</th><th>Type</th><th>Interviewer</th><th>Follow-Up</th><th>Actions</th></tr></thead>' +
          '<tbody>'+rows+'</tbody>' +
        '</table>' +
      '</div>' +
      _modal();
  }

  function _(s){ return s||""; }
  function _esc(s){ return (s||"").replace(/"/g,"&quot;").replace(/</g,"&lt;"); }

  function _modal() {
    const iv = _editId ? Storage.Interviews.getById(_editId) : {};
    const title = _editId ? "Edit Interview" : "Add Interview";
    return '<div id="iv-modal" class="modal-overlay hidden">' +
      '<div class="modal">' +
        '<div class="modal-header"><h3>'+title+'</h3><button class="modal-close" onclick="Interviews.closeModal()">✕</button></div>' +
        '<div class="modal-body">' +
          '<div class="form-grid">' +
            _field("Company *","iv-company","text",iv.company) +
            _field("Position *","iv-position","text",iv.position) +
            _field("Date","iv-date","date",iv.date) +
            _field("Time","iv-time","time",iv.time) +
            _field("Interviewer","iv-interviewer","text",iv.interviewer) +
          '</div>' +
          '<div class="form-row"><label class="form-label">Interview Type</label>' +
            '<select id="iv-type" class="form-input">' +
              ['Phone','Video','In-Person','Panel'].map(function(t){return '<option'+(iv.type===t?' selected':'')+'>'+t+'</option>';}).join("") +
            '</select>' +
          '</div>' +
          '<div class="form-row"><label class="form-label"><input type="checkbox" id="iv-followup"'+(iv.followUpSent?" checked":"")+' style="margin-right:6px">Follow-Up Sent</label></div>' +
          '<div class="form-row form-row-full"><label class="form-label">Questions Asked</label><textarea id="iv-questions" class="form-textarea" rows="2">'+_esc(iv.questionsAsked)+'</textarea></div>' +
          '<div class="form-row form-row-full"><label class="form-label">Notes</label><textarea id="iv-notes" class="form-textarea" rows="3">'+_esc(iv.notes)+'</textarea></div>' +
        '</div>' +
        '<div class="modal-footer"><button class="btn-secondary" onclick="Interviews.closeModal()">Cancel</button><button class="btn-primary" onclick="Interviews.save()">Save</button></div>' +
      '</div></div>';
  }

  function _field(label,id,type,value) {
    return '<div class="form-row"><label class="form-label">'+label+'</label><input id="'+id+'" type="'+type+'" class="form-input" value="'+_esc(value)+'"></div>';
  }

  function openAdd() { _editId=null; App.rerender(); document.getElementById("iv-modal").classList.remove("hidden"); }
  function openEdit(id) { _editId=id; App.rerender(); document.getElementById("iv-modal").classList.remove("hidden"); }
  function closeModal() { _editId=null; App.rerender(); }

  function save() {
    const co = document.getElementById("iv-company").value.trim();
    const pos = document.getElementById("iv-position").value.trim();
    if (!co||!pos) { alert("Company and Position are required."); return; }
    const obj = {
      company:      co,
      position:     pos,
      date:         document.getElementById("iv-date").value,
      time:         document.getElementById("iv-time").value,
      type:         document.getElementById("iv-type").value,
      interviewer:  document.getElementById("iv-interviewer").value.trim(),
      followUpSent: document.getElementById("iv-followup").checked,
      questionsAsked:document.getElementById("iv-questions").value.trim(),
      notes:        document.getElementById("iv-notes").value.trim(),
    };
    if (_editId) { Storage.Interviews.update(_editId,obj); } else { Storage.Interviews.add(obj); }
    _editId=null; App.rerender();
  }

  function toggleFollowUp(id, val) {
    Storage.Interviews.update(id,{followUpSent:val});
    App.rerender();
  }

  function remove(id) {
    if (confirm("Delete this interview?")) { Storage.Interviews.remove(id); App.rerender(); }
  }

  return { render, openAdd, openEdit, closeModal, save, remove, toggleFollowUp };
})();
