/**
 * settings.js — Settings view
 */
const Settings = (() => {
  function render() {
    const s = Storage.Settings.get();
    return '<div class="view-header"><h2>Settings</h2></div>' +
      '<div class="settings-grid">' +
        '<div class="settings-section">' +
          '<h3 class="settings-section-title">Profile</h3>' +
          '<div class="form-group">' +
            _field("Full Name","s-name","text",s.name) +
            _field("Email","s-email","email",s.email) +
            _field("Phone","s-phone","text",s.phone) +
            _field("Target Title","s-title","text",s.targetTitle) +
            _field("Certifications","s-certs","text",s.certifications) +
            _field("Years Experience","s-years","number",s.yearsExperience) +
          '</div>' +
          '<button class="btn-primary" onclick="Settings.saveProfile()">Save Profile</button>' +
        '</div>' +
        '<div class="settings-section">' +
          '<h3 class="settings-section-title">Preferences</h3>' +
          '<div class="pref-row">' +
            '<label class="pref-label">Dark Mode</label>' +
            '<label class="toggle-switch">' +
              '<input type="checkbox" id="s-dark" '+(s.darkMode?"checked":"")+' onchange="Settings.toggleDark(this.checked)">' +
              '<span class="toggle-slider"></span>' +
            '</label>' +
          '</div>' +
          '<div class="pref-row">' +
            '<label class="pref-label">Default View</label>' +
            '<select id="s-default" class="form-input" onchange="Settings.savePrefs()">' +
              ['dashboard','recruiters','companies','jobs','applications','interviews','followups','resumevault','analytics'].map(function(v){
                return '<option value="'+v+'"'+(s.defaultView===v?' selected':'')+'>'+v.charAt(0).toUpperCase()+v.slice(1)+'</option>';
              }).join("")+
            '</select>' +
          '</div>' +
        '</div>' +
        '<div class="settings-section">' +
          '<h3 class="settings-section-title">AI Job Search</h3>' +
          '<div class="form-group">' +
            '<div class="form-row">' +
              '<label class="form-label">Anthropic API Key</label>' +
              '<input id="s-apikey" type="password" class="form-input" placeholder="sk-ant-..." value="' + (s.anthropicKey||"").replace(/"/g,"&quot;") + '">' +
              '<span style="font-size:11px;color:var(--text-muted);margin-top:4px;display:block">Stored only in your browser. Never sent anywhere except Anthropic\'s API.</span>' +
            '</div>' +
          '</div>' +
          '<button class="btn-primary" onclick="Settings.saveApiKey()">Save API Key</button>' +
        '</div>' +
        '<div class="settings-section">' +
          '<h3 class="settings-section-title">Data Management</h3>' +
          '<div class="data-actions">' +
            '<button class="btn-secondary" onclick="ImportExport.exportJSON()">Export JSON</button>' +
            '<button class="btn-secondary" onclick="ImportExport.exportCSV()">Export CSV</button>' +
            '<button class="btn-secondary" onclick="ImportExport.backupAll()">Backup All</button>' +
            '<label class="btn-secondary" style="cursor:pointer">Import JSON<input type="file" accept=".json" onchange="ImportExport.importJSON(event)" style="display:none"></label>' +
            '<label class="btn-secondary" style="cursor:pointer">Import CSV<input type="file" accept=".csv" onchange="ImportExport.importCSV(event)" style="display:none"></label>' +
          '</div>' +
          '<div style="margin-top:16px">' +
            '<button class="btn-danger-outline" onclick="Settings.clearData()">Clear All Data</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function _field(label,id,type,value) {
    return '<div class="form-row"><label class="form-label">'+label+'</label><input id="'+id+'" type="'+type+'" class="form-input" value="'+((value||"").toString().replace(/"/g,"&quot;"))+'"></div>';
  }

  function saveProfile() {
    Storage.Settings.set({
      name:           document.getElementById("s-name").value.trim(),
      email:          document.getElementById("s-email").value.trim(),
      phone:          document.getElementById("s-phone").value.trim(),
      targetTitle:    document.getElementById("s-title").value.trim(),
      certifications: document.getElementById("s-certs").value.trim(),
      yearsExperience:document.getElementById("s-years").value.trim(),
    });
    App.showToast("Profile saved!");
  }

  function savePrefs() {
    const s = Storage.Settings.get();
    Storage.Settings.set({
      defaultView: document.getElementById("s-default").value,
    });
  }

  function toggleDark(val) {
    Storage.Settings.set({ darkMode: val });
    App.applyDarkMode(val);
  }

  function saveApiKey() {
    const key = (document.getElementById("s-apikey").value || "").trim();
    Storage.Settings.set({ anthropicKey: key });
    App.showToast(key ? "API key saved." : "API key cleared.");
  }

  function clearData() {
    if (confirm("This will delete ALL data. Are you sure?")) {
      if (confirm("Really? This cannot be undone.")) {
        Object.values(Storage.KEYS).forEach(function(k){ localStorage.removeItem(k); });
        location.reload();
      }
    }
  }

  function _(s){ return s||""; }

  return { render, saveProfile, savePrefs, toggleDark, saveApiKey, clearData };
})();
