/**
 * import-export.js — Export/Import JSON and CSV; full backup/restore
 */
const ImportExport = (() => {
  function _download(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function exportJSON() {
    const data = Storage.exportAll();
    // Export just applications for the current view
    const apps = data.applications;
    _download(
      "applications_" + _dateStr() + ".json",
      JSON.stringify(apps, null, 2),
      "application/json"
    );
    App.showToast("Applications exported as JSON.");
  }

  function exportCSV() {
    const apps = Storage.Applications.getAll();
    if (!apps.length) { App.showToast("No applications to export."); return; }
    const cols = ["company","title","status","priority","dateApplied","notes"];
    const header = cols.join(",");
    const rows = apps.map(function(a) {
      return cols.map(function(c) {
        const val = (a[c]||"").toString().replace(/"/g,'""');
        return '"'+val+'"';
      }).join(",");
    });
    _download("applications_" + _dateStr() + ".csv", [header].concat(rows).join("\n"), "text/csv");
    App.showToast("Applications exported as CSV.");
  }

  function backupAll() {
    const data = Storage.exportAll();
    _download(
      "jobtracker_backup_" + _dateStr() + ".json",
      JSON.stringify(data, null, 2),
      "application/json"
    );
    App.showToast("Full backup downloaded.");
  }

  function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        // Detect if it's a full backup or a single-entity export
        if (data.version) {
          // Full backup
          Storage.importAll(data);
          App.showToast("Full backup restored!");
        } else if (Array.isArray(data)) {
          // Array of applications
          Storage.Applications.replace(data);
          App.showToast("Applications imported!");
        } else {
          App.showToast("Unrecognized JSON format.");
          return;
        }
        App.rerender();
      } catch(err) {
        alert("Invalid JSON file: " + err.message);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function importCSV(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      const lines = e.target.result.split("\n").filter(function(l){ return l.trim(); });
      if (lines.length < 2) { App.showToast("CSV is empty."); return; }
      const headers = _parseCSVLine(lines[0]);
      const apps = [];
      for (let i=1; i<lines.length; i++) {
        const vals = _parseCSVLine(lines[i]);
        const obj = {};
        headers.forEach(function(h,j){ obj[h] = vals[j]||""; });
        if (obj.company || obj.title) apps.push(obj);
      }
      apps.forEach(function(a) { Storage.Applications.add(a); });
      App.showToast("Imported " + apps.length + " applications from CSV.");
      App.rerender();
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function restoreAll(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        Storage.importAll(data);
        App.showToast("Backup restored!");
        App.rerender();
      } catch(err) {
        alert("Invalid backup file: " + err.message);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function _dateStr() {
    return new Date().toISOString().slice(0,10);
  }

  function _parseCSVLine(line) {
    const result = [];
    let cur = "";
    let inQ = false;
    for (let i=0; i<line.length; i++) {
      const ch = line[i];
      if (ch==='"') {
        if (inQ && line[i+1]==='"') { cur+='"'; i++; }
        else { inQ = !inQ; }
      } else if (ch==="," && !inQ) {
        result.push(cur); cur="";
      } else {
        cur+=ch;
      }
    }
    result.push(cur);
    return result;
  }

  return { exportJSON, exportCSV, backupAll, importJSON, importCSV, restoreAll };
})();
