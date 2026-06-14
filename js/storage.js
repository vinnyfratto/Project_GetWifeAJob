/**
 * storage.js — LocalStorage abstraction layer for JobTracker CRM
 * Keys: jt_recruiters, jt_companies, jt_jobs, jt_applications,
 *       jt_interviews, jt_followups, jt_resumevault, jt_settings
 */
const Storage = (() => {
  const KEYS = {
    recruiters:   "jt_recruiters",
    companies:    "jt_companies",
    jobs:         "jt_jobs",
    applications: "jt_applications",
    interviews:   "jt_interviews",
    followups:    "jt_followups",
    resumevault:  "jt_resumevault",
    settings:     "jt_settings",
    seeded:       "jt_seeded",
  };

  function _get(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch(e) { return []; }
  }
  function _getObj(key, def) {
    try { return JSON.parse(localStorage.getItem(key)) || def; }
    catch(e) { return def; }
  }
  function _set(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
  function _uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function _today(offsetDays) {
    offsetDays = offsetDays || 0;
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  }

  function _crud(key) {
    return {
      getAll:  function() { return _get(key); },
      getById: function(id) { return _get(key).find(function(r){return r.id===id;})||null; },
      add: function(obj) {
        const rows = _get(key);
        const row  = Object.assign({ id: _uid(), createdAt: new Date().toISOString() }, obj);
        rows.push(row);
        _set(key, rows);
        return row;
      },
      update: function(id, patch) {
        const rows = _get(key);
        const idx  = rows.findIndex(function(r){return r.id===id;});
        if (idx === -1) return null;
        rows[idx] = Object.assign({}, rows[idx], patch, { updatedAt: new Date().toISOString() });
        _set(key, rows);
        return rows[idx];
      },
      remove: function(id) {
        const rows = _get(key).filter(function(r){return r.id!==id;});
        _set(key, rows);
      },
      replace: function(arr) { _set(key, arr); },
    };
  }

  const Recruiters   = _crud(KEYS.recruiters);
  const Companies    = _crud(KEYS.companies);
  const Jobs         = _crud(KEYS.jobs);
  const Applications = _crud(KEYS.applications);
  const Interviews   = _crud(KEYS.interviews);
  const FollowUps    = _crud(KEYS.followups);
  const ResumeVault  = _crud(KEYS.resumevault);

  const Settings = {
    get: function() {
      return _getObj(KEYS.settings, {
        name: "Sarah Mitchell",
        email: "",
        phone: "",
        targetTitle: "Remote Radiology / Medical Coder",
        certifications: "CPC-A",
        yearsExperience: "16",
        darkMode: false,
        defaultView: "dashboard",
      });
    },
    set: function(patch) {
      _set(KEYS.settings, Object.assign({}, Settings.get(), patch));
    },
  };

  /* ── SEED DATA ── */
  function seed() {
    if (localStorage.getItem(KEYS.seeded)) return;

    const recruiters = [
      { name:"Jennifer Walsh", company:"AMN Healthcare", email:"j.walsh@amnhealthcare.com", phone:"(972) 555-0182", linkedin:"https://linkedin.com/in/jenniferwalsh-amn", website:"https://www.amnhealthcare.com", specialty:"Medical Coding/RCM", priority:"High", state:"TX", lastContactDate:_today(-5), nextFollowUpDate:_today(9), notes:"Jennifer reached out via LinkedIn about a remote Radiology Coder opening. Very responsive. Mentioned AMN has several health-system clients in TX looking for CPC coders.", rating:5, tags:["radiology","remote","health-system"], radiology_fit:"High", remote_focus:"Yes" },
      { name:"Marcus Thompson", company:"Medix", email:"m.thompson@medixteam.com", phone:"(214) 555-0347", linkedin:"https://linkedin.com/in/marcusthompson-medix", website:"https://www.medixteam.com", specialty:"Medical Coding/RCM", priority:"High", state:"TX", lastContactDate:_today(-3), nextFollowUpDate:_today(11), notes:"Spoke by phone. Marcus specializes in HIM/coding roles across the Dallas metro. Has two active radiology coder reqs.", rating:4, tags:["HIM","dallas","physician-group"], radiology_fit:"High", remote_focus:"Yes" },
      { name:"Priya Nair", company:"The Judge Group", email:"p.nair@judge.com", phone:"(469) 555-0291", linkedin:"https://linkedin.com/in/priyanair-judge", website:"https://www.judge.com", specialty:"Medical Coding/RCM", priority:"Medium", state:"TX", lastContactDate:_today(-12), nextFollowUpDate:_today(2), notes:"Emailed about a 6-month contract-to-hire outpatient coding role. She mentioned the req may go perm.", rating:4, tags:["contract","outpatient","CTH"], radiology_fit:"High", remote_focus:"Yes" },
      { name:"Daniel Reeves", company:"KIWI-TEK", email:"d.reeves@kiwi-tek.com", phone:"(512) 555-0408", linkedin:"https://linkedin.com/in/danielreeves-kiwi", website:"https://www.kiwi-tek.com", specialty:"Medical Coding/RCM", priority:"High", state:"TX", lastContactDate:_today(-2), nextFollowUpDate:_today(5), notes:"KIWI-TEK is a 100% remote coding company. Daniel is their lead recruiter for radiology/diagnostic imaging roles. Very interested in 16-year background. Submitted resume.", rating:5, tags:["100%-remote","radiology","diagnostic-imaging"], radiology_fit:"High", remote_focus:"Yes" },
      { name:"Alicia Fontaine", company:"TAG MedStaffing", email:"a.fontaine@tagmedstaffing.com", phone:"(817) 555-0563", linkedin:"https://linkedin.com/in/aliciafontaine-tag", website:"https://www.tagmedstaffing.com", specialty:"Medical Coding/RCM", priority:"High", state:"TX", lastContactDate:_today(-7), nextFollowUpDate:_today(7), notes:"Alicia focuses exclusively on healthcare IT and coding staff. Mentioned a Baylor Scott and White remote radiology coder opening. Submitted resume. Awaiting feedback.", rating:4, tags:["radiology","BSW","perm"], radiology_fit:"High", remote_focus:"Yes" },
      { name:"Brian Holloway", company:"GHR Healthcare", email:"b.holloway@ghrhealthcare.com", phone:"(713) 555-0712", linkedin:"https://linkedin.com/in/brianholloway-ghr", website:"https://www.ghrhealthcare.com", specialty:"Medical Coding/RCM", priority:"Medium", state:"TX", lastContactDate:_today(-18), nextFollowUpDate:_today(6), notes:"GHR places a lot of travel and remote HIM professionals. Brian said they are building out a remote coding bench for Memorial Hermann.", rating:4, tags:["HIM","memorial-hermann","remote-bench"], radiology_fit:"High", remote_focus:"Yes" },
      { name:"Natalie Soto", company:"Amergis", email:"n.soto@amergis.com", phone:"(210) 555-0834", linkedin:"https://linkedin.com/in/nataliesoto-amergis", website:"https://www.amergis.com", specialty:"Medical Coding/RCM", priority:"Medium", state:"TX", lastContactDate:_today(-9), nextFollowUpDate:_today(5), notes:"Natalie handles coding and revenue cycle roles for South Texas. Discussed a remote outpatient coder position in San Antonio. Pay range $28-$34/hr.", rating:4, tags:["outpatient","physician-group","san-antonio"], radiology_fit:"High", remote_focus:"Yes" },
      { name:"Kevin Aldridge", company:"Kforce", email:"k.aldridge@kforce.com", phone:"(972) 555-0921", linkedin:"https://linkedin.com/in/kevinaldridge-kforce", website:"https://www.kforce.com", specialty:"Medical Coding/RCM", priority:"High", state:"TX", lastContactDate:_today(-4), nextFollowUpDate:_today(10), notes:"Kforce has a strong HIM practice. Kevin recruits for remote coding roles. Sent a job description for Coder III Inpatient at UT Southwestern.", rating:5, tags:["inpatient","UT-Southwestern","Coder-III"], radiology_fit:"High", remote_focus:"Yes" },
      { name:"Stephanie Brauer", company:"Cross Country Healthcare", email:"s.brauer@crosscountryhealthcare.com", phone:"(469) 555-1047", linkedin:"https://linkedin.com/in/stephaniebrauer-cch", website:"https://www.crosscountryhealthcare.com", specialty:"Medical Coding/RCM", priority:"Medium", state:"TX", lastContactDate:_today(-14), nextFollowUpDate:_today(0), notes:"Stephanie mentioned a 13-week remote radiology coder contract that may convert to perm. Due for follow-up TODAY.", rating:4, tags:["travel","contract","radiology","urgent"], radiology_fit:"High", remote_focus:"Yes" },
      { name:"Ryan Castellano", company:"CHG Healthcare", email:"r.castellano@chghealthcare.com", phone:"(214) 555-1183", linkedin:"https://linkedin.com/in/ryancastellano-chg", website:"https://www.chghealthcare.com", specialty:"Medical Coding/RCM", priority:"High", state:"TX", lastContactDate:_today(-6), nextFollowUpDate:_today(8), notes:"Ryan placed three medical coders at TX health systems last quarter. Actively working on a remote radiology / outpatient coder req for a large Dallas-area system.", rating:5, tags:["radiology","dallas","health-system","hot-lead"], radiology_fit:"High", remote_focus:"Yes" },
    ];

    const companies = [
      { company:"Texas Health Resources", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://careers.texashealth.org", contact:"", notes:"One of the largest faith-based, nonprofit health systems in the US. Strong remote coding program. Multiple active reqs." },
      { company:"Harris Health System", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.harrishealth.org/careers", contact:"", notes:"Houston-area public health system. Outpatient coding roles frequently posted. Known for stable employment and benefits." },
      { company:"Cook Children's", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://careers.cookchildrens.org", contact:"", notes:"Fort Worth-based pediatric system. Posted Outpatient Coding Specialist recently. Family-friendly culture." },
      { company:"UT Southwestern Medical Center", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://jobs.utsouthwestern.edu", contact:"", notes:"Top academic medical center in Dallas. Large HIM/coding department. Competitive pay and strong career growth." },
      { company:"Vee Healthtek", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.veehealthtek.com/careers", contact:"", notes:"Specialized healthcare coding company. 100% remote roles. Actively hiring Diagnostic Radiology Coders. Very high fit." },
      { company:"Greenberg & Larraby", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.greenberglarraby.com/careers", contact:"", notes:"Radiology billing and coding firm. Extremely high fit for radiology background. Small team with good culture." },
      { company:"Gentis Solutions", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.gentissolutions.com/jobs", contact:"", notes:"Healthcare staffing firm with perm and contract medical coder openings. Outpatient focus. Multiple TX clients." },
      { company:"Baylor Scott & White Health", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://jobs.bswhealth.com", contact:"", notes:"Largest nonprofit health system in Texas. Strong HIM department. Radiology Coder role posted — in phone screen stage." },
      { company:"HCA Healthcare", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://careers.hcahealthcare.com", contact:"", notes:"Large for-profit hospital system. Strong remote HIM program. Applied direct for outpatient coder role." },
      { company:"CommonSpirit Health", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://careers.commonspirit.org", contact:"", notes:"National nonprofit system with TX presence. Remote coding roles posted regularly. Good benefits and stability." },
      { company:"Memorial Hermann", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://jobs.memorialhermann.org", contact:"", notes:"Houston-based nonprofit. Large coding department. GHR Healthcare recruiter is building a remote coding bench here." },
      { company:"MD Anderson Cancer Center", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.mdanderson.org/about-md-anderson/careers.html", contact:"", notes:"World-renowned cancer center. Radiology and oncology coding experience is a strong fit. Hybrid/remote roles." },
      { company:"Texas Children's Hospital", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://jobs.texaschildrens.org", contact:"", notes:"Premier pediatric hospital system. Large coding team in Houston. Remote roles available. Strong mission-driven culture." },
      { company:"University Health", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.universityhealthsystem.com/careers", contact:"", notes:"San Antonio-based public health system. Actively hiring outpatient and specialty coders. Remote-friendly." },
      { company:"Christus Health", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://careers.christushealth.org", contact:"", notes:"Catholic nonprofit health system with extensive TX presence. HIM department frequently posts remote coding roles." },
    ];

    const jobs = [
      { company:"Texas Health Resources", title:"Coder III (Inpatient)", location:"Remote/TX", fit_score:85, status:"New", dateAdded:_today(-10), notes:"Inpatient coding role. Requires 3+ years experience. CPC or CCS preferred. Salary range $58k-$72k." },
      { company:"Texas Health Resources", title:"Coder II (Denials)", location:"Remote/TX", fit_score:85, status:"New", dateAdded:_today(-8), notes:"Denials management and coding review. Strong match for revenue cycle background. Centralized HIM team." },
      { company:"Harris Health System", title:"Outpatient Coder III", location:"Remote/TX", fit_score:85, status:"New", dateAdded:_today(-12), notes:"Level III outpatient coder. Focus on E&M and procedure coding. AAPC certification required." },
      { company:"Cook Children's", title:"Outpatient Coding Specialist", location:"Remote/TX", fit_score:85, status:"New", dateAdded:_today(-7), notes:"Pediatric outpatient coding. Experience with E&M, surgical, and diagnostic coding required." },
      { company:"UT Southwestern Medical Center", title:"Coding Specialist III", location:"Remote/TX", fit_score:85, status:"New", dateAdded:_today(-5), notes:"Academic medical center. Senior coding role across multiple specialties. Kforce recruiter forwarded this req." },
      { company:"Vee Healthtek", title:"Diagnostic Radiology Coder", location:"Remote/TX", fit_score:95, status:"Saved", dateAdded:_today(-3), notes:"TOP PRIORITY. 100% radiology coding. Requires radiology-specific experience — perfect match. Fully remote." },
      { company:"Greenberg & Larraby", title:"Professional Medical Coder", location:"Remote/TX", fit_score:85, status:"New", dateAdded:_today(-6), notes:"Radiology billing firm. Professional fee coding. Small, focused team. Great niche fit for radiology background." },
      { company:"Gentis Solutions", title:"Medical Coder (Outpatient)", location:"Remote/TX", fit_score:85, status:"New", dateAdded:_today(-9), notes:"Staffing firm posting for a TX health system client. Contract-to-hire likely. $30-$36/hr. Outpatient multi-specialty." },
      { company:"Baylor Scott & White", title:"Radiology Coder", location:"Remote/TX", fit_score:95, status:"Saved", dateAdded:_today(-4), notes:"TOP PRIORITY. Radiology-specific role at the largest TX nonprofit health system. Currently in phone screen stage." },
      { company:"HCA Healthcare", title:"Outpatient Coder", location:"Remote/TX", fit_score:85, status:"New", dateAdded:_today(-11), notes:"Large system. Multiple outpatient coding openings. Applied direct. Good benefits and remote flexibility." },
    ];

    const applications = [
      { company:"Vee Healthtek", title:"Diagnostic Radiology Coder", status:"Applied", priority:"High", dateApplied:_today(-3), notes:"Applied via company website and KIWI-TEK recruiter Daniel Reeves. Resume submitted. Awaiting ATS response." },
      { company:"Baylor Scott & White", title:"Radiology Coder", status:"Phone Screen", priority:"High", dateApplied:_today(-8), notes:"Phone screen scheduled. TAG MedStaffing coordinating. Prepare radiology coding scenarios." },
      { company:"AMN Healthcare", title:"Radiology Coding Specialist", status:"Recruiter Contacted", priority:"High", dateApplied:_today(-5), notes:"Jennifer Walsh at AMN reached out. Resume forwarded to client. Awaiting hiring manager review." },
      { company:"Texas Health Resources", title:"Coder III (Inpatient)", status:"Researching", priority:"Medium", dateApplied:_today(-2), notes:"Reviewing job description. Tailoring resume for inpatient focus. Plan to apply by end of week." },
      { company:"KIWI-TEK", title:"Remote Medical Coder", status:"Preparing Resume", priority:"High", dateApplied:_today(-1), notes:"Customizing resume to highlight 16 years experience and radiology specialization for this 100% remote company." },
    ];

    const resumevault = [
      { type:"Resume", title:"General Resume — Sarah Mitchell", url:"https://drive.google.com/your-general-resume-link", notes:"General-purpose medical coding resume. Updated June 2026.", dateAdded:_today(-30) },
      { type:"Resume", title:"Radiology Coding Resume — Sarah Mitchell", url:"https://drive.google.com/your-radiology-resume-link", notes:"Tailored resume emphasizing 16 years in Radiology Coding and CPC-A credential.", dateAdded:_today(-30) },
      { type:"LinkedIn", title:"LinkedIn Profile", url:"https://linkedin.com/in/sarah-mitchell-cpc", notes:"Keep updated with Open to Work status. Headline should match current target role.", dateAdded:_today(-60) },
      { type:"Certification", title:"CPC-A Certification — AAPC", url:"https://www.aapc.com/certification/cpc/", notes:"Certified Professional Coder - Apprentice (CPC-A). Include on all resumes and LinkedIn.", dateAdded:_today(-365) },
    ];

    recruiters.forEach(function(r){ Recruiters.add(r); });
    companies.forEach(function(c){ Companies.add(c); });
    jobs.forEach(function(j){ Jobs.add(j); });
    applications.forEach(function(a){ Applications.add(a); });
    resumevault.forEach(function(v){ ResumeVault.add(v); });

    localStorage.setItem(KEYS.seeded, "1");
    console.log("[Storage] Seed data loaded.");
  }

  function exportAll() {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      recruiters:   Recruiters.getAll(),
      companies:    Companies.getAll(),
      jobs:         Jobs.getAll(),
      applications: Applications.getAll(),
      interviews:   Interviews.getAll(),
      followups:    FollowUps.getAll(),
      resumevault:  ResumeVault.getAll(),
      settings:     Settings.get(),
    };
  }

  function importAll(data) {
    if (data.recruiters)   Recruiters.replace(data.recruiters);
    if (data.companies)    Companies.replace(data.companies);
    if (data.jobs)         Jobs.replace(data.jobs);
    if (data.applications) Applications.replace(data.applications);
    if (data.interviews)   Interviews.replace(data.interviews);
    if (data.followups)    FollowUps.replace(data.followups);
    if (data.resumevault)  ResumeVault.replace(data.resumevault);
    if (data.settings)     Settings.set(data.settings);
    localStorage.setItem(KEYS.seeded, "1");
  }

  return { Recruiters, Companies, Jobs, Applications, Interviews, FollowUps, ResumeVault, Settings, seed, exportAll, importAll, KEYS };
})();
