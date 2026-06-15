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
    seeded:       "jt_seeded_v4",   // bumped: replace-before-seed fix, no more duplicates
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
        anthropicKey: "",
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
      // Radiology Fit: High = known radiology/diagnostic imaging coding specialist
      //               Medium = general medical coding/HIM placements
      //               Low = general staffing, coding is secondary to their core business
      { name:"KIWI-TEK",                 company:"KIWI-TEK",                 email:"", phone:"", linkedin:"", website:"https://www.kiwi-tek.com",             specialty:"Medical Coding/RCM", priority:"High", state:"", lastContactDate:"", nextFollowUpDate:"", notes:"100% remote medical coding company. Known radiology and diagnostic imaging coding specialist. Top fit.", rating:0, tags:["radiology","100%-remote"], radiology_fit:"High", remote_focus:"Yes" },
      { name:"AMN Healthcare",           company:"AMN Healthcare",           email:"", phone:"", linkedin:"", website:"https://www.amnhealthcare.com",         specialty:"Medical Coding/RCM", priority:"High", state:"", lastContactDate:"", nextFollowUpDate:"", notes:"Large national firm with a dedicated radiology coding division. Frequently places remote radiology coders at major health systems.", rating:0, tags:["radiology"], radiology_fit:"High", remote_focus:"Yes" },
      { name:"Cross Country Healthcare", company:"Cross Country Healthcare", email:"", phone:"", linkedin:"", website:"https://www.crosscountryhealthcare.com", specialty:"Medical Coding/RCM", priority:"High", state:"", lastContactDate:"", nextFollowUpDate:"", notes:"Well-known for remote radiology coding travel and permanent contracts. Strong radiology-specific bench.", rating:0, tags:["radiology","contract"], radiology_fit:"High", remote_focus:"Yes" },
      { name:"TAG MedStaffing",          company:"TAG MedStaffing",          email:"", phone:"", linkedin:"", website:"https://www.tagmedstaffing.com",         specialty:"Medical Coding/RCM", priority:"High", state:"", lastContactDate:"", nextFollowUpDate:"", notes:"Medical coding and HIM specialist staffing firm. Actively places radiology coders at TX health systems.", rating:0, tags:["radiology","HIM"], radiology_fit:"High", remote_focus:"Yes" },
      { name:"GHR Healthcare",           company:"GHR Healthcare",           email:"", phone:"", linkedin:"", website:"https://www.ghrhealthcare.com",          specialty:"Medical Coding/RCM", priority:"High", state:"", lastContactDate:"", nextFollowUpDate:"", notes:"HIM and coding specialist. Places remote radiology and outpatient coders. Strong TX health-system relationships.", rating:0, tags:["HIM"], radiology_fit:"High", remote_focus:"Yes" },
      { name:"Medix",                    company:"Medix",                    email:"", phone:"", linkedin:"", website:"https://www.medixstaffing.com",          specialty:"Medical Coding/RCM", priority:"High", state:"", lastContactDate:"", nextFollowUpDate:"", notes:"Healthcare staffing with HIM and coding focus. Active in Texas. Places outpatient and specialty coders remotely.", rating:0, tags:[], radiology_fit:"Medium", remote_focus:"Yes" },
      { name:"The Judge Group",          company:"The Judge Group",          email:"", phone:"", linkedin:"", website:"https://www.judge.com",                  specialty:"Medical Coding/RCM", priority:"High", state:"", lastContactDate:"", nextFollowUpDate:"", notes:"National firm with a healthcare IT and HIM division. Places permanent and contract medical coders.", rating:0, tags:[], radiology_fit:"Medium", remote_focus:"Yes" },
      { name:"Amergis",                  company:"Amergis",                  email:"", phone:"", linkedin:"", website:"https://www.amergis.com",                specialty:"Medical Coding/RCM", priority:"High", state:"", lastContactDate:"", nextFollowUpDate:"", notes:"Large healthcare staffing company with dedicated coding division. Remote roles across TX health systems.", rating:0, tags:[], radiology_fit:"Medium", remote_focus:"Yes" },
      { name:"Kforce",                   company:"Kforce",                   email:"", phone:"", linkedin:"", website:"https://www.kforce.com",                 specialty:"Medical Coding/RCM", priority:"High", state:"", lastContactDate:"", nextFollowUpDate:"", notes:"Strong HIM practice. Recruits for remote coding roles at major TX health systems including UT Southwestern.", rating:0, tags:["HIM"], radiology_fit:"Medium", remote_focus:"Yes" },
      { name:"CHG Healthcare",           company:"CHG Healthcare",           email:"", phone:"", linkedin:"", website:"https://www.chghealthcare.com",          specialty:"Medical Coding/RCM", priority:"High", state:"", lastContactDate:"", nextFollowUpDate:"", notes:"One of the largest healthcare staffing companies in the US. Remote HIM and coding placements in Texas.", rating:0, tags:[], radiology_fit:"Medium", remote_focus:"Yes" },
      { name:"Oxford Global Resources",  company:"Oxford Global Resources",  email:"", phone:"", linkedin:"", website:"https://www.oxfordcorp.com",             specialty:"Medical Coding/RCM", priority:"Medium", state:"", lastContactDate:"", nextFollowUpDate:"", notes:"Specialized healthcare IT and HIM staffing. Places experienced coders in remote roles.", rating:0, tags:[], radiology_fit:"Medium", remote_focus:"Yes" },
      { name:"Soliant Health",           company:"Soliant Health",           email:"", phone:"", linkedin:"", website:"https://www.soliant.com",                specialty:"Medical Coding/RCM", priority:"Medium", state:"", lastContactDate:"", nextFollowUpDate:"", notes:"Allied health and HIM staffing. Remote medical coding placements, occasional radiology roles.", rating:0, tags:["HIM"], radiology_fit:"Medium", remote_focus:"Yes" },
      { name:"A-Line Staffing",          company:"A-Line Staffing",          email:"", phone:"", linkedin:"", website:"https://www.alinestaffing.com",          specialty:"Medical Coding/RCM", priority:"Medium", state:"", lastContactDate:"", nextFollowUpDate:"", notes:"Healthcare staffing with billing and coding focus. Remote roles in TX and nationwide.", rating:0, tags:[], radiology_fit:"Medium", remote_focus:"Yes" },
      { name:"CSI Companies",            company:"CSI Companies",            email:"", phone:"", linkedin:"", website:"https://www.csicompanies.com",           specialty:"Medical Coding/RCM", priority:"Medium", state:"", lastContactDate:"", nextFollowUpDate:"", notes:"Healthcare staffing firm with RCM and coding division. Active in Texas market.", rating:0, tags:["RCM"], radiology_fit:"Medium", remote_focus:"Yes" },
      { name:"Maxim Healthcare",         company:"Maxim Healthcare",         email:"", phone:"", linkedin:"", website:"https://www.maximhealthcare.com",        specialty:"Medical Coding/RCM", priority:"Medium", state:"", lastContactDate:"", nextFollowUpDate:"", notes:"Large national healthcare staffing. HIM and coding division with remote opportunities.", rating:0, tags:[], radiology_fit:"Medium", remote_focus:"Yes" },
      { name:"Aya Healthcare",           company:"Aya Healthcare",           email:"", phone:"", linkedin:"", website:"https://www.ayahealthcare.com",          specialty:"Medical Coding/RCM", priority:"Medium", state:"", lastContactDate:"", nextFollowUpDate:"", notes:"Fast-growing healthcare staffing firm expanding into remote HIM and coding placements.", rating:0, tags:[], radiology_fit:"Medium", remote_focus:"Yes" },
      { name:"HealthCare Support",       company:"HealthCare Support",       email:"", phone:"", linkedin:"", website:"https://www.healthcaresupport.com",      specialty:"Medical Coding/RCM", priority:"Medium", state:"", lastContactDate:"", nextFollowUpDate:"", notes:"Specializes in healthcare administrative and coding roles. Good Texas market presence.", rating:0, tags:[], radiology_fit:"Medium", remote_focus:"Yes" },
      { name:"Planet Healthcare",        company:"Planet Healthcare",        email:"", phone:"", linkedin:"", website:"https://www.planethealthcare.net",       specialty:"Medical Coding/RCM", priority:"Medium", state:"", lastContactDate:"", nextFollowUpDate:"", notes:"Healthcare staffing with coding and billing focus. Remote coding opportunities in TX.", rating:0, tags:[], radiology_fit:"Medium", remote_focus:"Yes" },
      { name:"Vaco Healthcare",          company:"Vaco Healthcare",          email:"", phone:"", linkedin:"", website:"https://www.vaco.com",                   specialty:"Medical Coding/RCM", priority:"Medium", state:"", lastContactDate:"", nextFollowUpDate:"", notes:"Healthcare staffing and consulting with revenue cycle and coding placements.", rating:0, tags:["RCM"], radiology_fit:"Medium", remote_focus:"Yes" },
      { name:"LaSalle Network",          company:"LaSalle Network",          email:"", phone:"", linkedin:"", website:"https://www.thelasallenetwork.com",      specialty:"Medical Coding/RCM", priority:"Medium", state:"", lastContactDate:"", nextFollowUpDate:"", notes:"Revenue cycle and coding staffing. General healthcare focus — coding is one of several practice areas.", rating:0, tags:["RCM"], radiology_fit:"Low", remote_focus:"Yes" },
      { name:"TEKsystems Healthcare",    company:"TEKsystems Healthcare",    email:"", phone:"", linkedin:"", website:"https://www.teksystems.com",             specialty:"Medical Coding/RCM", priority:"Medium", state:"", lastContactDate:"", nextFollowUpDate:"", notes:"Primarily IT staffing with a healthcare division. Coding placements are secondary to their core IT business.", rating:0, tags:[], radiology_fit:"Low", remote_focus:"Yes" },
      { name:"Insight Global Healthcare",company:"Insight Global Healthcare",email:"", phone:"", linkedin:"", website:"https://www.insightglobal.com",         specialty:"Medical Coding/RCM", priority:"Medium", state:"", lastContactDate:"", nextFollowUpDate:"", notes:"General staffing with a growing healthcare division. Coding is not a primary specialty.", rating:0, tags:[], radiology_fit:"Low", remote_focus:"Yes" },
      { name:"Apex Systems Healthcare",  company:"Apex Systems Healthcare",  email:"", phone:"", linkedin:"", website:"https://www.apexsystems.com",           specialty:"Medical Coding/RCM", priority:"Medium", state:"", lastContactDate:"", nextFollowUpDate:"", notes:"Technology and IT staffing first. Healthcare coding placements are occasional, not a core focus.", rating:0, tags:[], radiology_fit:"Low", remote_focus:"Yes" },
      { name:"Randstad Healthcare",      company:"Randstad Healthcare",      email:"", phone:"", linkedin:"", website:"https://www.randstadusa.com",            specialty:"Medical Coding/RCM", priority:"Medium", state:"", lastContactDate:"", nextFollowUpDate:"", notes:"Global general staffing company. Healthcare is a division — radiology coding experience not a differentiator here.", rating:0, tags:[], radiology_fit:"Low", remote_focus:"Yes" },
      { name:"Roth Staffing",            company:"Roth Staffing",            email:"", phone:"", linkedin:"", website:"https://www.rothstaffing.com",           specialty:"Medical Coding/RCM", priority:"Medium", state:"", lastContactDate:"", nextFollowUpDate:"", notes:"General staffing firm. Healthcare and coding are among many verticals — not a specialist agency.", rating:0, tags:[], radiology_fit:"Low", remote_focus:"Yes" },
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
      { type:"Resume",        title:"General Resume",          url:"", notes:"General-purpose medical coding resume. Add your file link here (Google Drive, Dropbox, etc.).", dateAdded:_today(0) },
      { type:"Resume",        title:"Radiology Coding Resume", url:"", notes:"Tailored resume emphasizing 16 years in Radiology Coding and CPC-A credential. Add your file link here.", dateAdded:_today(0) },
      { type:"LinkedIn",      title:"LinkedIn Profile",        url:"", notes:"Add your LinkedIn URL here. Keep Open to Work status active.", dateAdded:_today(0) },
      { type:"Certification", title:"CPC-A Certification",     url:"https://www.aapc.com/certification/cpc/", notes:"Certified Professional Coder - Apprentice (CPC-A). AAPC certification page.", dateAdded:_today(0) },
    ];

    // Replace (not append) so re-seeding never duplicates
    Recruiters.replace([]);
    Companies.replace([]);
    Jobs.replace([]);
    Applications.replace([]);
    ResumeVault.replace([]);

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
