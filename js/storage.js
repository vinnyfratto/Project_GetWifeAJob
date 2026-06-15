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
    seeded:       "jt_seeded_v5",   // bumped: medical coder recruiter list, agency_type field
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
      // ── Direct Employers — companies that hire medical coders directly ──────
      { name:"KIWI-TEK",                   website:"https://www.kiwi-tek.com",                     notes:"100% remote medical coding company. One of the most respected dedicated coding employers. Hires experienced coders directly — no staffing middleman.", agency_type:"Direct Employer", specialty:"Medical Coding", tags:["100%-remote","coding-company"] },
      { name:"Aviacode",                    website:"https://www.aviacode.com",                     notes:"100% remote medical coding company. Hires coders across all specialties including outpatient, inpatient, and multi-specialty. Competitive pay and stable remote work.", agency_type:"Direct Employer", specialty:"Medical Coding", tags:["100%-remote","coding-company"] },
      { name:"AGS Health",                  website:"https://www.agshealth.com",                    notes:"Remote medical coding and RCM company. Hires certified coders directly. Strong benefits and remote-first culture. Good fit for experienced coders.", agency_type:"Direct Employer", specialty:"Medical Coding/RCM", tags:["100%-remote","RCM"] },
      { name:"TrustHCS",                    website:"https://www.trusthcs.com",                     notes:"HIM and medical coding services firm. Hires remote coders directly. Focuses on coding quality and education. Good culture for experienced coders.", agency_type:"Direct Employer", specialty:"Medical Coding/HIM", tags:["HIM","coding-company"] },
      { name:"nThrive (Ensemble Health)",   website:"https://www.ensemblehp.com",                   notes:"Revenue cycle management company formed from nThrive. Hires remote medical coders and billing specialists. Strong career growth path in RCM.", agency_type:"Direct Employer", specialty:"Medical Coding/RCM", tags:["RCM","billing"] },
      { name:"Ciox Health (Datavant)",      website:"https://www.datavant.com",                     notes:"HIM and health data services company. Hires remote medical coders and HIM professionals. Good stability and benefits.", agency_type:"Direct Employer", specialty:"Medical Coding/HIM", tags:["HIM"] },
      { name:"MedPartners HIM",             website:"https://www.medpartners.com",                  notes:"Medical coding and HIM staffing and services firm. Places coders directly and through staffing. Specializes in coding quality and auditing.", agency_type:"Direct Employer", specialty:"Medical Coding/HIM", tags:["HIM","auditing"] },
      { name:"Nuance / 3M HIS",             website:"https://www.nuance.com/healthcare.html",       notes:"Healthcare AI and coding technology company. Hires remote medical coders for CDI and coding roles. Strong technology environment.", agency_type:"Direct Employer", specialty:"Medical Coding/CDI", tags:["CDI","technology"] },
      // ── Staffing Agencies — specialize in medical coding and HIM placements ──
      { name:"AMN Healthcare",              website:"https://www.amnhealthcare.com",                notes:"Large national healthcare staffing firm with a dedicated HIM and coding division. Frequently places remote medical coders at TX health systems.", agency_type:"Staffing Agency", specialty:"Medical Coding/HIM", tags:["HIM"] },
      { name:"Medix",                       website:"https://www.medixstaffing.com",               notes:"Healthcare staffing with strong HIM and medical coding focus. Active in the Texas market. Places outpatient and multi-specialty coders remotely.", agency_type:"Staffing Agency", specialty:"Medical Coding/HIM", tags:["HIM"] },
      { name:"Kforce Healthcare",           website:"https://www.kforce.com",                      notes:"Strong HIM staffing practice. Recruits for remote medical coding and billing roles at major TX health systems.", agency_type:"Staffing Agency", specialty:"Medical Coding/HIM", tags:["HIM"] },
      { name:"GHR Healthcare",              website:"https://www.ghrhealthcare.com",               notes:"HIM and coding specialist staffing firm. Places remote coders at TX hospitals and physician groups. Strong health-system client relationships.", agency_type:"Staffing Agency", specialty:"Medical Coding/HIM", tags:["HIM"] },
      { name:"TAG MedStaffing",             website:"https://www.tagmedstaffing.com",              notes:"Medical coding and HIM specialist staffing agency. Actively places coders at TX health systems. Good reputation in the coding community.", agency_type:"Staffing Agency", specialty:"Medical Coding/HIM", tags:["HIM"] },
      { name:"Cross Country Healthcare",    website:"https://www.crosscountryhealthcare.com",      notes:"Large healthcare staffing firm with a dedicated HIM division. Offers remote contract and permanent medical coding roles nationwide.", agency_type:"Staffing Agency", specialty:"Medical Coding/HIM", tags:["HIM","contract"] },
      { name:"Soliant Health",              website:"https://www.soliant.com",                     notes:"Allied health and HIM staffing. Places remote medical coders, billers, and HIM professionals at hospitals and physician practices.", agency_type:"Staffing Agency", specialty:"Medical Coding/HIM", tags:["HIM"] },
      { name:"HealthCare Support",          website:"https://www.healthcaresupport.com",           notes:"Staffing firm specializing in healthcare administrative and clinical roles including medical coding and billing. Good TX market presence.", agency_type:"Staffing Agency", specialty:"Medical Coding/Billing", tags:["billing"] },
      { name:"Supplemental Health Care",    website:"https://www.supplementalhealthcare.com",      notes:"Healthcare staffing with HIM and coding placements. Places coders at hospitals and physician practices on contract and permanent basis.", agency_type:"Staffing Agency", specialty:"Medical Coding/HIM", tags:["HIM","contract"] },
      { name:"Staffmark Healthcare",        website:"https://www.staffmark.com",                   notes:"Healthcare staffing with medical coding and billing positions. Good Texas market presence with remote roles.", agency_type:"Staffing Agency", specialty:"Medical Coding/Billing", tags:["billing"] },
      { name:"CareerStaff Unlimited",       website:"https://www.careerstaff.com",                 notes:"Healthcare staffing firm placing HIM and coding professionals. Remote medical coding roles available across TX health systems.", agency_type:"Staffing Agency", specialty:"Medical Coding/HIM", tags:["HIM"] },
      { name:"Medical Staffing Network",    website:"https://www.msnhealth.com",                   notes:"One of the largest healthcare staffing firms in the US. Places medical coders and billers in remote and on-site roles.", agency_type:"Staffing Agency", specialty:"Medical Coding/Billing", tags:["billing"] },
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
