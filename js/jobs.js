/**
 * jobs.js — Jobs module: card grid with search, filter, add/edit/delete
 */
const Jobs = (() => {
  let _search = "";
  let _filterStatus = "";
  let _editId = null;

  const STATUS_COLORS = {
    "New":     "#9B8EC4",
    "Saved":   "#a78bfa",
    "Applied": "#22c55e",
    "Archived":"#94a3b8",
  };

  function render() {
    let rows = Storage.Jobs.getAll();
    if (_search) {
      const s = _search.toLowerCase();
      rows = rows.filter(function(r) {
        return (r.company||"").toLowerCase().includes(s) ||
               (r.title||"").toLowerCase().includes(s) ||
               (r.notes||"").toLowerCase().includes(s);
      });
    }
    if (_filterStatus) {
      rows = rows.filter(function(r){ return r.status === _filterStatus; });
    }
    rows.sort(function(a,b){ return (b.fit_score||0)-(a.fit_score||0); });

    let cards = "";
    rows.forEach(function(r) {
      const color = STATUS_COLORS[r.status] || "#9B8EC4";
      const fitColor = r.fit_score >= 90 ? "#22c55e" : r.fit_score >= 80 ? "#9B8EC4" : "#94a3b8";
      cards += '<div class="job-card">' +
        '<div class="job-card-top">' +
          '<span class="job-fit" style="color:' + fitColor + ';border-color:' + fitColor + '40">' + (r.fit_score||0) + '% fit</span>' +
          '<span class="badge" style="background:' + color + '20;color:' + color + ';border:1px solid ' + color + '40">' + (r.status||"") + '</span>' +
        '</div>' +
        '<div class="job-title">' + (r.title||"") + '</div>' +
        '<div class="job-company">' + (r.company||"") + '</div>' +
        '<div class="job-location text-muted"><span class="icon-sm">📍</span>' + (r.location||"") + '</div>' +
        (r.notes ? '<div class="job-notes">' + r.notes + '</div>' : '') +
        '<div class="job-footer">' +
          '<span class="text-muted">' + (r.dateAdded||"") + '</span>' +
          '<div class="job-actions">' +
            '<button class="btn-sm btn-secondary" onclick="Jobs.openEdit(\'' + r.id + '\')">Edit</button>' +
            '<button class="btn-sm btn-primary" onclick="Jobs.markApplied(\'' + r.id + '\')">Apply</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    });
    if (!cards) cards = '<div class="empty-state">No jobs found. Click "+ Add Job" to track one.</div>';

    return '<div class="view-header">' +
        '<h2>Jobs <span class="count-badge">' + Storage.Jobs.getAll().length + '</span></h2>' +
        '<div style="display:flex;gap:8px;align-items:center">' +
          '<button class="btn-secondary" id="ai-refresh-btn" onclick="Jobs.refreshWithAI()" title="Use Anthropic AI to find current remote TX medical coding jobs">✦ Find Remote TX Jobs</button>' +
          '<button class="btn-primary" onclick="Jobs.openAdd()">+ Add Job</button>' +
        '</div>' +
      '</div>' +
      '<div class="toolbar">' +
        '<input class="search-input" type="text" placeholder="Search jobs..." value="' + _esc(_search) + '" oninput="Jobs.setSearch(this.value)">' +
        '<select class="filter-select" onchange="Jobs.setFilter(this.value)">' +
          '<option value="">All Statuses</option>' +
          ['New','Saved','Applied','Archived'].map(function(s) {
            return '<option value="'+s+'"'+(_filterStatus===s?' selected':'')+'>'+s+'</option>';
          }).join("") +
        '</select>' +
      '</div>' +
      '<div class="job-grid">' + cards + '</div>' +
      _modal();
  }

  function _esc(s){ return (s||"").replace(/"/g,"&quot;").replace(/</g,"&lt;"); }

  function _modal() {
    const r = _editId ? Storage.Jobs.getById(_editId) : {};
    const title = _editId ? "Edit Job" : "Add Job";
    return '<div id="job-modal" class="modal-overlay hidden">' +
      '<div class="modal">' +
        '<div class="modal-header"><h3>'+title+'</h3><button class="modal-close" onclick="Jobs.closeModal()">✕</button></div>' +
        '<div class="modal-body">' +
          '<div class="form-grid">' +
            _field("Company *","job-company","text",r.company) +
            _field("Job Title *","job-title","text",r.title) +
            _field("Location","job-location","text",r.location||"Remote/TX") +
            _field("Fit Score (0-100)","job-fit","number",r.fit_score||85) +
            _field("Date Added","job-date","date",r.dateAdded) +
          '</div>' +
          '<div class="form-row">' +
            '<label class="form-label">Status</label>' +
            '<select id="job-status" class="form-input">' +
              ['New','Saved','Applied','Archived'].map(function(s){return '<option'+(r.status===s?' selected':'')+'>'+s+'</option>';}).join("") +
            '</select>' +
          '</div>' +
          '<div class="form-row form-row-full">' +
            '<label class="form-label">Notes</label>' +
            '<textarea id="job-notes" class="form-textarea" rows="3">'+_esc(r.notes)+'</textarea>' +
          '</div>' +
        '</div>' +
        '<div class="modal-footer"><button class="btn-secondary" onclick="Jobs.closeModal()">Cancel</button><button class="btn-primary" onclick="Jobs.save()">Save</button></div>' +
      '</div></div>';
  }

  function _field(label,id,type,value) {
    return '<div class="form-row"><label class="form-label">'+label+'</label><input id="'+id+'" type="'+type+'" class="form-input" value="'+_esc(value)+'"></div>';
  }

  function openAdd() { _editId=null; App.rerender(); document.getElementById("job-modal").classList.remove("hidden"); }
  function openEdit(id) { _editId=id; App.rerender(); document.getElementById("job-modal").classList.remove("hidden"); }
  function closeModal() { _editId=null; App.rerender(); }

  function save() {
    const company = document.getElementById("job-company").value.trim();
    const title   = document.getElementById("job-title").value.trim();
    if (!company||!title) { alert("Company and Title are required."); return; }
    const obj = {
      company,
      title,
      location:  document.getElementById("job-location").value.trim(),
      fit_score: parseInt(document.getElementById("job-fit").value)||85,
      status:    document.getElementById("job-status").value,
      dateAdded: document.getElementById("job-date").value || new Date().toISOString().slice(0,10),
      notes:     document.getElementById("job-notes").value.trim(),
    };
    if (_editId) { Storage.Jobs.update(_editId,obj); } else { Storage.Jobs.add(obj); }
    _editId=null; App.rerender();
  }

  function markApplied(id) {
    const job = Storage.Jobs.getById(id);
    if (!job) return;
    Storage.Jobs.update(id,{status:"Applied"});
    Storage.Applications.add({
      company:     job.company,
      title:       job.title,
      status:      "Applied",
      priority:    "Medium",
      dateApplied: new Date().toISOString().slice(0,10),
      notes:       "Applied via Jobs tracker.",
    });
    App.rerender();
  }

  function setSearch(val){ _search=val; App.rerender(); }
  function setFilter(val){ _filterStatus=val; App.rerender(); }

  function refreshWithAI() {
    const key = (Storage.Settings.get().anthropicKey || "").trim();
    if (!key) {
      App.showToast("Add your Anthropic API key in Settings first.");
      App.navigate("settings");
      return;
    }

    // Show loading state on the button
    const btn = document.getElementById("ai-refresh-btn");
    if (btn) { btn.disabled = true; btn.textContent = "⏳ Searching..."; }

    // Build a list of companies already tracked so Claude avoids duplicates
    const existing = Storage.Jobs.getAll().map(function(j){ return j.company; });
    const today = new Date().toISOString().slice(0,10);

    const prompt = [
      "You are a job search assistant for an experienced Medical Coding professional.",
      "Profile: 16 years experience | Radiology Coding specialist | Medical Billing | CPC-A certified | Texas resident | seeking REMOTE positions.",
      "",
      "Find remote medical billing and medical coding job openings at TEXAS-BASED companies or companies with strong Texas operations.",
      "Focus on: Radiology Coding, Medical Billing, Revenue Cycle (RCM), HIM, Outpatient Coding, Diagnostic Imaging Coding.",
      "",
      "Return ONLY a raw JSON array — no markdown, no code fences, no explanation. Format:",
      '[{"company":"","title":"","location":"Remote/TX","fit_score":85,"notes":""}]',
      "",
      "Rules:",
      "- Texas-based employers or companies with major TX health system clients",
      "- Remote-eligible only",
      "- fit_score: 92-95 for radiology/diagnostic imaging coding, 85-90 for medical billing/RCM, 78-84 for general coding",
      "- notes: 1-2 sentences on the role and why it fits her background",
      "- Return 12-15 jobs",
      "- Today's date: " + today,
      "- Skip these companies already tracked: " + (existing.length ? existing.join(", ") : "none"),
    ].join("\n");

    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key":                          key,
        "anthropic-version":                  "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
        "content-type":                       "application/json",
      },
      body: JSON.stringify({
        model:      "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        messages:   [{ role: "user", content: prompt }],
      }),
    })
    .then(function(res) {
      if (!res.ok) {
        return res.json().then(function(e) {
          throw new Error((e.error && e.error.message) || ("API error " + res.status));
        });
      }
      return res.json();
    })
    .then(function(data) {
      const text = (data.content && data.content[0] && data.content[0].text) || "";

      // Strip any accidental markdown fences before parsing
      const clean = text.replace(/```json|```/gi, "").trim();
      let jobs;
      try {
        jobs = JSON.parse(clean);
      } catch(e) {
        throw new Error("Could not parse AI response as JSON. Raw: " + text.slice(0, 200));
      }

      if (!Array.isArray(jobs) || !jobs.length) {
        throw new Error("AI returned an empty list.");
      }

      const added = [];
      const skipped = [];
      const todayStr = new Date().toISOString().slice(0,10);
      const allJobs  = Storage.Jobs.getAll();

      jobs.forEach(function(j) {
        if (!j.company || !j.title) return;
        // Skip if exact company+title already exists
        const dup = allJobs.find(function(x) {
          return x.company.toLowerCase() === (j.company||"").toLowerCase() &&
                 x.title.toLowerCase()   === (j.title||"").toLowerCase();
        });
        if (dup) { skipped.push(j.title); return; }

        Storage.Jobs.add({
          company:   j.company,
          title:     j.title,
          location:  j.location  || "Remote/TX",
          fit_score: parseInt(j.fit_score) || 82,
          status:    "New",
          dateAdded: todayStr,
          notes:     (j.notes || "") + " [AI Suggested]",
        });
        added.push(j.title);
      });

      App.rerender();
      const msg = added.length
        ? ("✦ Added " + added.length + " job" + (added.length > 1 ? "s" : "") +
           (skipped.length ? " (" + skipped.length + " duplicate" + (skipped.length > 1 ? "s" : "") + " skipped)" : ""))
        : "All results were already in your list.";
      App.showToast(msg, 5000);
    })
    .catch(function(err) {
      console.error("[Jobs.refreshWithAI]", err);
      App.showToast("Error: " + err.message, 6000);
      const b = document.getElementById("ai-refresh-btn");
      if (b) { b.disabled = false; b.textContent = "✦ Find Remote TX Jobs"; }
    });
  }

  return { render, openAdd, openEdit, closeModal, save, markApplied, setSearch, setFilter, refreshWithAI };
})();
