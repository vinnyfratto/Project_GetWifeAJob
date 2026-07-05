/**
 * storage.js — LocalStorage abstraction layer for JobTracker CRM
 * Keys: jt_recruiters, jt_companies, jt_jobs, jt_applications,
 *       jt_interviews, jt_followups, jt_resumevault, jt_settings
 */
const Storage = (() => {
  const KEYS = {
    recruiters:    "jt_recruiters",
    companies:     "jt_companies",
    i35companies:  "jt_i35companies",
    uscompanies:   "jt_uscompanies",
    jobs:          "jt_jobs",
    applications:  "jt_applications",
    interviews:    "jt_interviews",
    followups:     "jt_followups",
    resumevault:   "jt_resumevault",
    settings:      "jt_settings",
    seeded:        "jt_seeded_v10",
    i35seeded:     "jt_i35seeded_v5",
    usseeded:      "jt_usseeded_v5",
  };

  // Date every seed entry was cross-referenced and validated. Bump when re-validated.
  const VDATE = "Jul 5, 2026";

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

  const Recruiters    = _crud(KEYS.recruiters);
  const Companies     = _crud(KEYS.companies);
  const I35Companies  = _crud(KEYS.i35companies);
  const USCompanies   = _crud(KEYS.uscompanies);
  const Jobs          = _crud(KEYS.jobs);
  const Applications = _crud(KEYS.applications);
  const Interviews   = _crud(KEYS.interviews);
  const FollowUps    = _crud(KEYS.followups);
  const ResumeVault  = _crud(KEYS.resumevault);

  const Settings = {
    get: function() {
      return _getObj(KEYS.settings, {
        name: "Sara Fratto",
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
      { name:"GeBBS Healthcare Solutions",  website:"https://gebbs.com",                            notes:"Absorbed Aviacode's US coding operation (Aviacode is no longer standalone). Large RCM and coding company hiring remote US coders across specialties. CPC/CCS.", agency_type:"Direct Employer", specialty:"Medical Coding/RCM", tags:["100%-remote","coding-company"] },
      { name:"AGS Health",                  website:"https://www.agshealth.com",                    notes:"Remote medical coding and RCM company. Hires certified coders directly. Strong benefits and remote-first culture. Good fit for experienced coders.", agency_type:"Direct Employer", specialty:"Medical Coding/RCM", tags:["100%-remote","RCM"] },
      { name:"CorroHealth (TrustHCS)",      website:"https://www.corrohealth.com",                  notes:"TrustHCS merged into CorroHealth (2020). Large HIM and coding services firm. Hires remote US coders and auditors directly. Coding quality focus.", agency_type:"Direct Employer", specialty:"Medical Coding/HIM", tags:["HIM","coding-company"] },
      { name:"Ensemble Health Partners",    website:"https://www.ensemblehp.com",                   notes:"Large revenue cycle management company. Hires remote US medical coders and billing specialists. Strong RCM career growth. (nThrive is defunct; its services arm became Savista.)", agency_type:"Direct Employer", specialty:"Medical Coding/RCM", tags:["RCM","billing"] },
      { name:"Ciox Health (Datavant)",      website:"https://www.datavant.com",                     notes:"HIM and health data services company. Hires remote medical coders and HIM professionals. Good stability and benefits.", agency_type:"Direct Employer", specialty:"Medical Coding/HIM", tags:["HIM"] },
      { name:"Savista",                     website:"https://www.savistarcm.com",                   notes:"✅ Immediate openings July 2026: 25 pro-fee coders plus 10 inpatient coders across specialties. Revenue cycle company, 30+ years. Fully remote. CPC or CCS. Strong RCM career path.", agency_type:"Direct Employer", specialty:"Medical Coding/RCM", tags:["RCM","100%-remote"] },
      { name:"Healthcare Coding & Consulting (HCCS)", website:"https://www.hccscoding.com",          notes:"Family-owned US medical coding company. Confirmed hiring certified pro-fee and facility coders July 2026. Fully remote, no offshore. Good culture for experienced coders.", agency_type:"Direct Employer", specialty:"Medical Coding", tags:["100%-remote","coding-company"] },
      // ── Staffing Agencies — specialize in medical coding and HIM placements ──
      { name:"AMN Healthcare",              website:"https://www.amnhealthcare.com",                notes:"Large national healthcare staffing firm with a dedicated HIM and coding division. Frequently places remote medical coders at TX health systems.", agency_type:"Staffing Agency", specialty:"Medical Coding/HIM", tags:["HIM"] },
      { name:"Medix",                       website:"https://www.medixteam.com",               notes:"Healthcare staffing with strong HIM and medical coding focus. Active in the Texas market. Places outpatient and multi-specialty coders remotely.", agency_type:"Staffing Agency", specialty:"Medical Coding/HIM", tags:["HIM"] },
      { name:"himagine solutions",          website:"https://www.himaginesolutions.com",           notes:"✅ Confirmed active July 2026. One of the largest US medical coding companies (Omega-Himagine). Hires remote coders directly across all specialties. CPC/COC/CCS.", agency_type:"Direct Employer", specialty:"Medical Coding", tags:["100%-remote","coding-company"] },
      { name:"GHR Healthcare",              website:"https://www.ghrhealthcare.com",               notes:"HIM and coding specialist staffing firm. Places remote coders at TX hospitals and physician groups. Strong health-system client relationships.", agency_type:"Staffing Agency", specialty:"Medical Coding/HIM", tags:["HIM"] },
      { name:"TAG MedStaffing",             website:"https://www.tagmedstaffing.com",              notes:"Medical coding and HIM specialist staffing agency. Actively places coders at TX health systems. Good reputation in the coding community.", agency_type:"Staffing Agency", specialty:"Medical Coding/HIM", tags:["HIM"] },
      { name:"Cross Country Healthcare",    website:"https://www.crosscountryhealthcare.com",      notes:"Large healthcare staffing firm with a dedicated HIM division. Offers remote contract and permanent medical coding roles nationwide.", agency_type:"Staffing Agency", specialty:"Medical Coding/HIM", tags:["HIM","contract"] },
      { name:"The Judge Group",             website:"https://www.judge.com/jobs/",                 notes:"✅ Confirmed hiring July 2026, explicitly including CPC-A coders. Dedicated HIM and medical coding staffing desk. Remote, hybrid, and on-site roles. Great fit for newer certs.", agency_type:"Staffing Agency", specialty:"Medical Coding/HIM", tags:["HIM","contract","CPC-A-friendly"] },
      { name:"Insight Global",              website:"https://jobs.insightglobal.com",              notes:"✅ Active remote medical coding reqs July 2026. National staffing firm placing coders at health systems and RCM clients. Search 'coding' on their job portal. Contract and contract-to-hire.", agency_type:"Staffing Agency", specialty:"Medical Coding/RCM", tags:["contract"] },
      { name:"Aston Carter",                website:"https://www.astoncarter.com",                 notes:"✅ Remote Medical Coder placements confirmed July 2026 (some EST-hours roles). National staffing firm with a strong revenue cycle practice. Contract and contract-to-hire. Good coding volume.", agency_type:"Staffing Agency", specialty:"Medical Coding/RCM", tags:["contract"] },
      { name:"Amergis",                     website:"https://careers.amergis.com",                 notes:"✅ Remote outpatient and ED coder openings confirmed July 2026. Healthcare staffing firm placing certified coders on contract at hospitals and physician groups. Nationwide reach.", agency_type:"Staffing Agency", specialty:"Medical Coding", tags:["contract"] },
    ];

    const companies = [
      { company:"Texas Health Resources", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://jobs.texashealth.org", contact:"", notes:"✅ Actively hiring June 2026. One of the top TX employers for remote coders — confirmed open reqs on Indeed and Glassdoor. Outpatient and inpatient roles. Avg $20/hr." },
      { company:"Harris Health System", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://jobs.harrishealth.org", contact:"", notes:"Houston-area public health system. Outpatient Coder III roles confirmed active on Glassdoor (June 2026). E&M and procedure coding focus. AAPC cert required." },
      { company:"Cook Children's", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.cookchildrens.org/careers/", contact:"", notes:"✅ Confirmed hiring June 2026 per Indeed/Glassdoor. Fort Worth pediatric system. Outpatient Coding Specialist roles open. Pediatric coding experience a plus." },
      { company:"UT Southwestern Medical Center", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://jobs.utsouthwestern.edu", contact:"", notes:"✅ Confirmed active hiring June 2026. Dallas academic medical center. Coding Specialist III role confirmed on job boards. Competitive pay, strong career growth." },
      { company:"Conifer Health Solutions", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://jobs.tenethealth.com/conifer", contact:"", notes:"✅ Heavy hiring July 2026 (2,600+ remote coder listings on Indeed). Frisco TX based, Tenet's revenue cycle arm. Inpatient, outpatient, and risk adjustment coding. CPC or CCS, two plus years." },
      { company:"Greenberg & Larraby", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://apply.workable.com/greenberg-larraby-inc-gli/", contact:"", notes:"Radiology billing and coding firm in TX. High specialty fit for radiology background. Small team, personalized culture. Check careers page directly for openings." },
      { company:"Gentis Solutions", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.gentissolutions.com/jobs", contact:"", notes:"TX-based healthcare staffing placing outpatient and multi-specialty coders. Contract and perm roles. $30–$36/hr range reported. Multiple active TX health system clients." },
      { company:"Baylor Scott & White Health", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://jobs.bswhealth.com", contact:"", notes:"✅ Confirmed open remote medical coder role on Glassdoor June 2026. Largest TX nonprofit. Avg $27.49/hr per ZipRecruiter. Apply direct at jobs.bswhealth.com." },
      { company:"HCA Healthcare / Parallon", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://careers.hcahealthcare.com", contact:"", notes:"✅ Active hiring confirmed June 2026. TX's largest for-profit system. Parallon (HCA's RCM arm) posts remote coder roles continuously. Multiple TX facility reqs open." },
      { company:"CommonSpirit Health", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.commonspirit.careers/employment/remote-medical-coding-jobs/35300/8230896/1000000000100/2", contact:"", notes:"✅ Dedicated remote medical coding jobs page confirmed active June 2026. National nonprofit with TX presence. Apply direct at commonspirit.careers for fastest response." },
      { company:"Memorial Hermann", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://jobs.memorialhermann.org", contact:"", notes:"✅ Confirmed active hiring June 2026 per Indeed. Houston-based nonprofit. Large centralized coding team. Outpatient and specialty coding roles. Strong benefits." },
      { company:"MD Anderson Cancer Center", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.mdanderson.org/about-md-anderson/careers.html", contact:"", notes:"Houston oncology center. Radiology and oncology coding background is a strong fit. Hybrid/remote coding roles posted periodically. High prestige, competitive pay." },
      { company:"Texas Children's Hospital", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.texaschildrenspeople.org/careers/", contact:"", notes:"Premier pediatric system in Houston. Large HIM coding team. Remote outpatient coding roles posted regularly. Strong benefits and mission-driven culture." },
      { company:"University Health", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://careers.universityhealth.com", contact:"", notes:"✅ Confirmed active June 2026 — appeared in SA-area coder search results. San Antonio public health system. Outpatient and specialty coder roles. Remote-friendly." },
      { company:"Christus Health", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://careers.christushealth.org", contact:"", notes:"Catholic nonprofit with 60+ TX locations. HIM department posts remote coding roles regularly. Good benefits and job stability. Search 'medical coder' at careers.christushealth.org." },
      { company:"Houston Methodist", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.houstonmethodistcareers.org", contact:"", notes:"Major Houston academic health system. Centralized HIM coding team. Remote coder roles posted across multiple specialties. Competitive pay and strong reputation." },
      { company:"Parkland Health", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://jobs.parklandcareers.com", contact:"", notes:"Dallas County public hospital — one of the busiest in TX. Active remote coding program. Public-sector stability with good pay and benefits. Outpatient multi-specialty roles." },
      { company:"UTHealth Houston", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://careers.uth.tmc.edu/us/en/", contact:"", notes:"UT Health Science Center Houston physician practices. Outpatient, E&M, and specialty coding. Remote roles available for experienced coders. TMC affiliation = strong growth." },
      { company:"Children's Health (Dallas)", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://jobsearch.childrens.com/careers", contact:"", notes:"Children's Medical Center Dallas — large pediatric system with significant HIM team. Remote outpatient coding roles posted regularly. Great benefits and culture." },
      { company:"JPS Health Network", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://jpshealthnet.org/careers", contact:"", notes:"Tarrant County (Fort Worth) public health system. Outpatient multi-specialty coding. Stable public-sector employment. Good pay scale and benefits package." },
      { company:"Tenet Healthcare", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://jobs.tenethealth.com", contact:"", notes:"✅ Tenet Practice Resources confirmed active in SA market June 2026. Dallas-based national system. Central remote coding hub. Large-system stability and growth path." },
      { company:"Kelsey-Seybold Clinic", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://kelseyseyboldcareers.com", contact:"", notes:"One of Houston's largest multi-specialty physician groups. Outpatient coding and E&M focus. Good remote flexibility for experienced coders. Well-regarded employer." },
      { company:"UTMB Health", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://hr.utmb.edu/careers", contact:"", notes:"University of Texas Medical Branch, Galveston. Large academic medical center. HIM department posts remote coding roles periodically. Competitive academic pay scale." },
      { company:"WellMed Medical Management", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.joinwellmed.com/careers/", contact:"", notes:"San Antonio physician group (UnitedHealth Group). Medicare/senior patient focus = risk-adjustment coding demand. Outpatient remote roles. UHG benefits package." },
      { company:"Ascension Texas", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://careers.ascension.org", contact:"", notes:"Catholic nonprofit with 14 TX hospitals. Central HIM coding team posts remote outpatient and specialty coder roles regularly. Good stability and benefits." },
      { company:"Texas Oncology", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.texasoncology.com/careers", contact:"", notes:"Largest community oncology network in TX. Codes chemo admin, E&M, surgical oncology. Remote coding roles posted. Specialty background is a strong differentiator here." },
      { company:"Driscoll Children's Hospital", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.driscollchildrens.org/about/careers", contact:"", notes:"Corpus Christi pediatric referral center. Smaller HIM team — experienced coders stand out. Outpatient and HIM roles posted periodically. Mission-driven culture." },
      { company:"DHR Health", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.dhrhealth.com/careers", contact:"", notes:"McAllen regional system serving Rio Grande Valley. Growing HIM team. Outpatient coder roles posted with increasing remote flexibility. Fast-growing market." },
      { company:"Concentra", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.concentra.com/careers", contact:"", notes:"TX-headquartered occupational health network. Codes work-comp, E&M, injury procedures. Remote billing/coding roles available. Nationwide reach with TX base." },
      { company:"Covenant Health (Lubbock)", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://providence.jobs/employer/covenant-health/jobs/", contact:"", notes:"West TX regional system (Providence/St. Joseph). Outpatient and inpatient coding. Remote options for experienced coders. Good stability in the Lubbock market." },
      { company:"Hendrick Health", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.hendrickhealth.org/careers", contact:"", notes:"Abilene nonprofit. Smaller coding team means experienced coders get noticed quickly. Outpatient multi-specialty coding. Growing remote flexibility." },
      { company:"Texas Tech Physicians", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://jobs.ttuhsc.edu", contact:"", notes:"Academic physician group for TTUHSC. Multi-specialty outpatient coding across West TX campuses (Lubbock, Amarillo, El Paso). Remote roles available for experienced coders." },
      { company:"Valley Baptist Medical Center", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://jobs.tenethealth.com/valley-baptist", contact:"", notes:"Harlingen regional hospital (Tenet subsidiary) serving Rio Grande Valley. Remote coding opportunities routed through Tenet's central coding hub. Growing market." },
      { company:"Methodist Health System (Dallas)", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.methodisthealthsystem.org/careers", contact:"", notes:"Dallas faith-based nonprofit (independent from Houston Methodist). Multiple hospitals. HIM department posts remote coder roles. Well-regarded culture and benefits." },
      { company:"ScionHealth", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://jobs.scionhealth.com", contact:"", notes:"Successor to Kindred's long-term acute care hospitals (rebranded Dec 2021). Significant TX operations including Houston. Post-acute and LTACH coding is a niche specialty and a strong differentiator. Remote coding roles posted." },
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

    recruiters.forEach(function(r){ Recruiters.add(Object.assign({ validated: VDATE }, r)); });
    companies.forEach(function(c){ Companies.add(Object.assign({ validated: VDATE }, c)); });
    jobs.forEach(function(j){ Jobs.add(j); });
    applications.forEach(function(a){ Applications.add(a); });
    resumevault.forEach(function(v){ ResumeVault.add(v); });

    localStorage.setItem(KEYS.seeded, "1");
    console.log("[Storage] Seed data loaded.");
  }

  function seedI35() {
    if (localStorage.getItem(KEYS.i35seeded)) return;
    I35Companies.replace([]);
    const i35 = [
      // ── San Antonio ──────────────────────────────────────────────────────────
      { company:"University Health",                  city:"San Antonio", state:"TX", remote_friendly:"Yes", careerPage:"https://careers.universityhealth.com",         notes:"✅ Confirmed active June 2026 in SA coder search results. Large Bexar County public system. Inpatient, outpatient, and ED coding roles. Good public-sector benefits.", status:"New" },
      { company:"Baptist Health System (Tenet)",      city:"San Antonio", state:"TX", remote_friendly:"Yes", careerPage:"https://www.baptisthealthsystem.com/careers",            notes:"✅ Tenet Practice Resources confirmed active in SA market June 2026. Multi-hospital SA system. Remote coding roles for outpatient and inpatient specialties.", status:"New" },
      { company:"Methodist Healthcare (HCA)",         city:"San Antonio", state:"TX", remote_friendly:"Yes", careerPage:"https://www.sahealth.com/about-us/careers-at-methodist",                       notes:"✅ Parallon (HCA's RCM arm) confirmed active in SA market June 2026. Multi-hospital SA system. Strong remote HIM program. Hires experienced coders regularly.", status:"New" },
      { company:"CHRISTUS Santa Rosa Health System",  city:"San Antonio", state:"TX", remote_friendly:"Yes", careerPage:"https://careers.christushealth.org",                     notes:"Catholic nonprofit with multiple SA campuses. Central HIM team hires remote coders. Stable employer with strong mission-driven culture. Check careers.christushealth.org.", status:"New" },
      { company:"South Texas VA Health Care System",  city:"San Antonio", state:"TX", remote_friendly:"No",  careerPage:"https://www.usajobs.gov",                                notes:"VA system covering South TX. Search USAJOBS for GS-series medical coder positions. On-site only but federal pay scale, pension, and excellent benefits.", status:"New" },
      { company:"UT Health San Antonio",              city:"San Antonio", state:"TX", remote_friendly:"Yes", careerPage:"https://wp.uthscsa.edu/careers",                               notes:"✅ Hybrid coder role confirmed open July 2026 (remote plus on-campus, must live within commuting distance). Academic medical center and large physician group. Multi-specialty coding. Competitive academic pay.", status:"New" },
      { company:"Brooke Army Medical Center (BAMC)",  city:"San Antonio", state:"TX", remote_friendly:"No",  careerPage:"https://www.usajobs.gov",                                notes:"Civilian coder positions available via USAJOBS. On-site only. Federal pay and benefits. Search 'medical coder' at usajobs.gov filtered to San Antonio.", status:"New" },
      { company:"PAM Health",                         city:"San Antonio", state:"TX", remote_friendly:"Yes", careerPage:"https://pamhealthcareers.com",                        notes:"Formerly Post Acute Medical (rebranded 2021). LTACH and rehab facilities in SA. Post-acute/LTACH coding niche is a differentiator. Remote inpatient rehab coder roles.", status:"New" },
      { company:"CommuniCare Health Centers",         city:"San Antonio", state:"TX", remote_friendly:"Yes", careerPage:"https://communicaresa.org/careers",                 notes:"FQHC serving SA underserved communities. Outpatient multi-specialty coding and billing roles. Mission-driven and stable. Good fit for outpatient coders.", status:"New" },
      { company:"ECLAT Health Solutions",             city:"San Antonio", state:"TX", remote_friendly:"Yes", careerPage:"https://www.eclathealth.com/careers",           notes:"✅ Confirmed active in SA coder search June 2026. Medical coding and billing company with SA presence. Remote coding roles. Hires certified coders directly.", status:"New" },
      // ── New Braunfels ────────────────────────────────────────────────────────
      { company:"CHRISTUS Santa Rosa – New Braunfels",city:"New Braunfels", state:"TX", remote_friendly:"Yes", careerPage:"https://careers.christushealth.org",                  notes:"CHRISTUS system hospital in New Braunfels. Shares HIM infrastructure with SA campuses. Remote coding roles posted through central CHRISTUS HIM team.", status:"New" },
      { company:"Resolute Health Hospital (Baptist)", city:"New Braunfels", state:"TX", remote_friendly:"Yes", careerPage:"https://www.resolutehealth.com/careers",               notes:"Community hospital in New Braunfels. Smaller coding team — experienced coders get noticed. Good for outpatient and ED coding. Growing I-35 corridor facility.", status:"New" },
      // ── San Marcos ───────────────────────────────────────────────────────────
      { company:"CHRISTUS Santa Rosa – San Marcos",   city:"San Marcos",   state:"TX", remote_friendly:"Yes", careerPage:"https://careers.christushealth.org",                    notes:"Formerly Central Texas Medical Center (rebranded under CHRISTUS 2020). San Marcos hospital. Remote coding roles posted through the central CHRISTUS HIM team.", status:"New" },
      // ── Kyle / Buda ──────────────────────────────────────────────────────────
      { company:"Ascension Seton Hays – Kyle",        city:"Kyle",         state:"TX", remote_friendly:"Yes", careerPage:"https://jobs.ascension.org",                          notes:"Rapidly growing Ascension hospital in Kyle serving the booming Hays County population. Central Ascension remote coding roles. High-growth corridor.", status:"New" },
      // ── Austin ───────────────────────────────────────────────────────────────
      { company:"St. David's HealthCare",             city:"Austin",       state:"TX", remote_friendly:"Yes", careerPage:"https://careers.hcahealthcare.com/pages/st-davids-healthcare",                         notes:"✅ HCA-affiliated multi-hospital Austin system. Parallon (HCA RCM) posts remote coder roles continuously. Strong remote HIM program. Multiple specialty reqs.", status:"New" },
      { company:"Ascension Seton (Austin)",           city:"Austin",       state:"TX", remote_friendly:"Yes", careerPage:"https://jobs.ascension.org",                          notes:"Major nonprofit Austin health system. Large HIM and coding department. Remote-friendly for experienced coders. Multiple Austin-area facilities.", status:"New" },
      { company:"Dell Seton Medical Center (UT)",     city:"Austin",       state:"TX", remote_friendly:"Yes", careerPage:"https://jobs.ascension.org/us/en/texas/austin/seton/dell-seton-medical-center-at-the-university-of-texas", notes:"Ascension-operated UT teaching hospital in Austin (not UT Southwestern). Complex multi-specialty coding. Remote roles through Ascension. Strong career growth.", status:"New" },
      { company:"Austin Regional Clinic (ARC)",       city:"Austin",       state:"TX", remote_friendly:"Yes", careerPage:"https://www.austinregionalclinic.com/about/careers",         notes:"Largest physician group in Austin. Outpatient multi-specialty coding and billing. Good work-life balance reputation. Hires coders and billers regularly.", status:"New" },
      { company:"Dell Children's Medical Center",     city:"Austin",       state:"TX", remote_friendly:"Yes", careerPage:"https://jobs.ascension.org/us/en/texas/austin/dell-childrens", notes:"Pediatric hospital in Austin under Ascension. Specialty pediatric coding. Remote roles available through Ascension system. Growing pediatric coding team.", status:"New" },
      { company:"CommUnityCare Health Centers",       city:"Austin",       state:"TX", remote_friendly:"Yes", careerPage:"https://www.communitycaretx.org/careers",             notes:"FQHC serving Austin underserved communities. Outpatient multi-specialty coding and billing. Mission-driven employer with stable funding and good culture.", status:"New" },
      { company:"Baylor Scott & White – Round Rock",  city:"Round Rock",   state:"TX", remote_friendly:"Yes", careerPage:"https://jobs.bswhealth.com",                           notes:"✅ BSW confirmed open remote coder roles June 2026 (avg $27.49/hr). Round Rock campus north of Austin. Remote coding through BSW central HIM. Apply direct.", status:"New" },
      { company:"UT Health Austin",                   city:"Austin",       state:"TX", remote_friendly:"Yes", careerPage:"https://utmedicine.org/careers",                   notes:"UT Austin / Dell Medical School physician practice (not UT Southwestern). Outpatient coding and billing roles. Growing academic practice, competitive pay.", status:"New" },
    ];
    i35.forEach(function(c){ I35Companies.add(Object.assign({ validated: VDATE }, c)); });
    localStorage.setItem(KEYS.i35seeded, "1");
  }

  function seedUS() {
    if (localStorage.getItem(KEYS.usseeded)) return;
    USCompanies.replace([]);
    const us = [
      // ── Midwest ──────────────────────────────────────────────────────────────
      { company:"Mayo Clinic",                      state:"MN", remote_friendly:"Yes", careerPage:"https://jobs.mayoclinic.org/Remote",         notes:"✅ Remote jobs page confirmed active July 2026 at jobs.mayoclinic.org/Remote. World-renowned academic system. Large HIM/coding team. Top-tier pay and benefits.", status:"New" },
      { company:"Allina Health",                    state:"MN", remote_friendly:"Yes", careerPage:"https://www.allinahealth.org/careers",        notes:"Large MN nonprofit. Centralized HIM department. Remote outpatient and inpatient coding roles posted regularly. Good benefits and stable employer.", status:"New" },
      { company:"Essentia Health",                  state:"MN", remote_friendly:"Yes", careerPage:"https://www.essentiahealth.org/careers",      notes:"Regional system covering MN, WI, ND. Remote coding roles available. Outpatient and specialty focus. Good benefits in a stable nonprofit environment.", status:"New" },
      { company:"Optum (UnitedHealth Group)",       state:"MN", remote_friendly:"Yes", careerPage:"https://careers.unitedhealthgroup.com",       notes:"✅ 34–41 remote coding openings confirmed on Indeed/Glassdoor June 2026. Largest healthcare employer in the US. Risk adjustment, outpatient, inpatient roles. Competitive pay.", status:"New" },
      { company:"Northwestern Medicine",            state:"IL", remote_friendly:"Yes", careerPage:"https://jobs.nm.org",            notes:"Chicago academic health system. Large HIM department. Remote coding roles for experienced coders. Multi-specialty including outpatient and complex inpatient.", status:"New" },
      { company:"Rush University Medical Center",   state:"IL", remote_friendly:"Yes", careerPage:"https://www.rush.edu/careers",                notes:"Chicago academic medical center. Strong HIM team. Remote outpatient and inpatient coding roles. Good career growth in a nationally ranked system.", status:"New" },
      { company:"OSF HealthCare",                   state:"IL", remote_friendly:"Yes", careerPage:"https://www.osfcareers.org",       notes:"Catholic system across IL and MI. Remote coding roles. Outpatient multi-specialty and inpatient coding. Strong mission-driven culture and good benefits.", status:"New" },
      { company:"UnityPoint Health",                state:"IA", remote_friendly:"Yes", careerPage:"https://careers.unitypoint.org/results",                 notes:"Regional system across IA, IL, WI. Centralized coding team. Remote roles for outpatient and inpatient coders. Good stability in a community-focused system.", status:"New" },
      { company:"SSM Health",                       state:"MO", remote_friendly:"Yes", careerPage:"https://jobs.ssmhealth.com/us/en",           notes:"Catholic nonprofit across MO, IL, WI, OK. Remote HIM and coding roles. Multi-specialty outpatient focus. Stable system with strong benefits.", status:"New" },
      { company:"BJC HealthCare",                   state:"MO", remote_friendly:"Yes", careerPage:"https://www.bjccareers.org/",                 notes:"Major St. Louis health system (Barnes-Jewish, Wash U affiliation). Large centralized coding team. Remote coding roles posted regularly. Competitive pay.", status:"New" },
      { company:"Mercy Health System",              state:"MO", remote_friendly:"Yes", careerPage:"https://careers.mercy.net/",               notes:"Large Catholic system across MO, AR, KS, OK. Remote HIM coders hired regularly. Outpatient and inpatient roles. Strong tech-forward HIM environment.", status:"New" },
      { company:"Corewell Health",                  state:"MI", remote_friendly:"Yes", careerPage:"https://careers.corewellhealth.org",          notes:"Michigan's largest health system (formerly Spectrum + Beaumont). Remote coding roles. Multi-specialty and inpatient coding. Large centralized HIM team.", status:"New" },
      { company:"Henry Ford Health",                state:"MI", remote_friendly:"Yes", careerPage:"https://www.henryford.com/careers",               notes:"Detroit-based integrated health system. Large HIM department. Remote coding roles for experienced coders. Multi-specialty and outpatient focus.", status:"New" },
      { company:"Trinity Health",                   state:"MI", remote_friendly:"Yes", careerPage:"https://jobs.trinity-health.org/",      notes:"National Catholic system (HQ in MI) with 100+ hospitals. Remote coding roles across many facilities. Excellent benefits and job stability nationwide.", status:"New" },
      { company:"Indiana University Health",        state:"IN", remote_friendly:"Yes", careerPage:"https://careers.iuhealth.org/",                notes:"Indiana's largest health system. Strong HIM department. Remote outpatient and inpatient coding. Academic affiliation means complex, high-value coding experience.", status:"New" },
      { company:"OhioHealth",                       state:"OH", remote_friendly:"Yes", careerPage:"https://careers.ohiohealth.com",              notes:"Columbus-based nonprofit. Remote coding roles for experienced coders. Outpatient and inpatient multi-specialty. Competitive pay and strong culture.", status:"New" },
      { company:"Bon Secours Mercy Health",         state:"OH", remote_friendly:"Yes", careerPage:"https://careers.bsmhealth.org/us/en",                  notes:"Large Catholic system across OH, KY, VA and beyond. Remote HIM coding roles. Multi-specialty and outpatient focus. Stable national employer.", status:"New" },
      { company:"Cleveland Clinic",                 state:"OH", remote_friendly:"Yes", careerPage:"https://jobs.clevelandclinic.org",            notes:"✅ Remote coder roles confirmed on ZipRecruiter June 2026. World-class academic center. High complexity multi-specialty cases. Top-tier pay and prestige.", status:"New" },
      { company:"Nationwide Children's Hospital",   state:"OH", remote_friendly:"Yes", careerPage:"https://www.nationwidechildrens.org/careers",    notes:"Top-ranked pediatric hospital in Columbus. Remote pediatric coding roles. Complex specialty coding. One of the most respected children's hospitals in the US.", status:"New" },
      { company:"Cincinnati Children's Hospital",   state:"OH", remote_friendly:"Yes", careerPage:"https://jobs.cincinnatichildrens.org",        notes:"Top-ranked pediatric hospital. Remote specialty pediatric coding roles. Strong HIM department. Consistently ranked #1 or #2 children's hospital nationally.", status:"New" },
      { company:"Sanford Health",                   state:"SD", remote_friendly:"Yes", careerPage:"https://sanfordcareers.com/",           notes:"Large rural system across SD, ND, MN. Remote coding roles regularly posted. Multi-specialty outpatient focus. Very stable employer in a less competitive market.", status:"New" },
      // ── Northeast ────────────────────────────────────────────────────────────
      { company:"Mass General Brigham",             state:"MA", remote_friendly:"Yes", careerPage:"https://www.massgeneralbrigham.org/en/about/careers",      notes:"Leading academic system (MGH + Brigham & Women's). Large HIM team. Remote coding roles for experienced coders. Top-tier compensation and prestige.", status:"New" },
      { company:"Boston Children's Hospital",       state:"MA", remote_friendly:"Yes", careerPage:"https://jobs.bostonchildrens.org/",       notes:"#1-ranked US children's hospital. Remote pediatric coding roles. Complex specialty coding. Excellent reputation and competitive pay for coding staff.", status:"New" },
      { company:"Yale New Haven Health",            state:"CT", remote_friendly:"Yes", careerPage:"https://jobs.ynhhs.org",                   notes:"Yale-affiliated academic system in CT. Remote coding roles for outpatient and inpatient. Strong HIM department. Competitive pay in a high-cost market.", status:"New" },
      { company:"Hartford HealthCare",              state:"CT", remote_friendly:"Yes", careerPage:"https://www.hhccareers.org/us/en",          notes:"Largest health system in CT. Centralized HIM team. Remote coding roles for outpatient and inpatient specialties. Good benefits and career growth.", status:"New" },
      { company:"UPMC",                             state:"PA", remote_friendly:"Yes", careerPage:"https://careers.upmc.com",                    notes:"Major Pittsburgh academic medical center and insurer. Large well-known remote coding program. Inpatient, outpatient, and specialty roles. Competitive pay.", status:"New" },
      { company:"Children's Hospital of Philadelphia", state:"PA", remote_friendly:"Yes", careerPage:"https://careers.chop.edu",                notes:"Top-ranked pediatric hospital. Remote coding roles for complex pediatric specialties. Strong HIM team and competitive pay. Prestigious employer.", status:"New" },
      { company:"Johns Hopkins Medicine",           state:"MD", remote_friendly:"Yes", careerPage:"https://jobs.hopkinsmedicine.org",         notes:"World-renowned academic medical center in Baltimore. Remote coding roles for experienced coders. High-complexity multi-specialty cases. Top-tier compensation.", status:"New" },
      { company:"Sentara Health",                   state:"VA", remote_friendly:"Yes", careerPage:"https://www.sentaracareers.com",             notes:"✅ Confirmed hiring in national coder search results June 2026. Large system across VA and NC. Remote HIM coding roles. Multi-specialty outpatient and inpatient.", status:"New" },
      { company:"Inova Health System",              state:"VA", remote_friendly:"Yes", careerPage:"https://www.inova.org/careers",               notes:"Northern VA system serving the DC metro. Remote coding roles. Outpatient, inpatient, and specialty coding focus. High cost-of-living market = competitive pay.", status:"New" },
      { company:"WVU Medicine",                     state:"WV", remote_friendly:"Yes", careerPage:"https://wvumedicine.org/careers/",             notes:"Academic health system in WV. Remote coding roles available. Multi-specialty outpatient and inpatient focus. Less competitive market — strong candidates stand out.", status:"New" },
      // ── Southeast ────────────────────────────────────────────────────────────
      { company:"Vanderbilt University Medical Center", state:"TN", remote_friendly:"Yes", careerPage:"https://www.vumc.org/careers/",               notes:"Top academic medical center in Nashville. Large HIM team. Remote coding roles across complex multi-specialty cases. Nationally ranked. Strong pay and growth.", status:"New" },
      { company:"Ballad Health",                    state:"TN", remote_friendly:"Yes", careerPage:"https://www.balladhealth.org/careers",        notes:"Regional system across TN and VA. Remote coding roles for outpatient and inpatient. Stable community health system. Good fit for experienced coders.", status:"New" },
      { company:"Lifepoint Health",                 state:"TN", remote_friendly:"Yes", careerPage:"https://jobs.lifepointhealth.net",            notes:"National hospital company based in TN. Remote HIM coding roles across many facilities nationwide. Outpatient and inpatient coding. Large-system career growth.", status:"New" },
      { company:"Emory Healthcare",                 state:"GA", remote_friendly:"Yes", careerPage:"https://jobs.emoryhealthcare.org",         notes:"Academic health system in Atlanta. Large HIM department. Remote coding roles for experienced coders. Multi-specialty including complex academic cases.", status:"New" },
      { company:"Wellstar Health System",           state:"GA", remote_friendly:"Yes", careerPage:"https://careers.wellstar.org",                notes:"Largest nonprofit health system in GA. Remote coding roles. Outpatient and inpatient multi-specialty. Good benefits and a well-regarded employer in the Southeast.", status:"New" },
      { company:"Piedmont Healthcare",              state:"GA", remote_friendly:"Yes", careerPage:"https://piedmontcareers.org",                notes:"Large Atlanta-based nonprofit. Remote HIM coding roles. Multi-specialty outpatient and inpatient coding. Fast-growing system with good benefits.", status:"New" },
      { company:"Atrium Health",                    state:"NC", remote_friendly:"Yes", careerPage:"https://careers.atriumhealth.org",            notes:"Major system across NC, SC, GA (Advocate Health). Remote coding roles regularly posted. Large central HIM team. Good growth path in a large national system.", status:"New" },
      { company:"Duke Health",                      state:"NC", remote_friendly:"Yes", careerPage:"https://careers.dukehealth.org",              notes:"Academic medical center in Durham. Remote coding roles for experienced coders. High-complexity multi-specialty cases. Top-tier pay and academic prestige.", status:"New" },
      { company:"UNC Health",                       state:"NC", remote_friendly:"Yes", careerPage:"https://jobs.unchealthcare.org",               notes:"Academic health system across NC. Remote HIM coding roles. Outpatient, inpatient, and specialty coding. Strong benefits and job security.", status:"New" },
      { company:"Novant Health",                    state:"NC", remote_friendly:"Yes", careerPage:"https://jobs.novanthealth.org/careers-home",         notes:"Large nonprofit across NC, SC, VA. Remote coding roles posted regularly. Multi-specialty outpatient and inpatient focus. Good culture and benefits.", status:"New" },
      { company:"Prisma Health",                    state:"SC", remote_friendly:"Yes", careerPage:"https://careers.prismahealth.org",             notes:"Largest health system in SC. Remote coding roles. Outpatient and inpatient multi-specialty coding. Stable employer in a less competitive market.", status:"New" },
      { company:"MUSC Health",                      state:"SC", remote_friendly:"Yes", careerPage:"https://musc.career-pages.com",                    notes:"Academic medical center in Charleston SC. Remote coding roles for experienced coders. Multi-specialty focus. Historic academic system with competitive pay.", status:"New" },
      { company:"UAB Health System",                state:"AL", remote_friendly:"Yes", careerPage:"https://careers.uabmedicine.org",                    notes:"Academic medical center in Birmingham. Large HIM team. Remote coding roles across multiple specialties. Nationally ranked NCI cancer center = specialty coding depth.", status:"New" },
      { company:"Ochsner Health",                   state:"LA", remote_friendly:"Yes", careerPage:"https://careers.ochsner.org",                 notes:"Largest health system in LA. Remote coding roles regularly posted. Multi-specialty outpatient and inpatient. Strong regional employer with good benefits.", status:"New" },
      { company:"Baptist Health (Louisville)",      state:"KY", remote_friendly:"Yes", careerPage:"https://www.baptisthealth.com/careers",            notes:"Large health system across KY. Remote HIM coding roles. Outpatient and inpatient multi-specialty coding. Stable faith-based employer with good benefits.", status:"New" },
      { company:"AdventHealth",                     state:"FL", remote_friendly:"Yes", careerPage:"https://jobs.adventhealth.com",            notes:"Large faith-based system headquartered in FL with national presence. Remote coding roles. Multi-specialty outpatient and inpatient. Strong mission-driven culture.", status:"New" },
      { company:"Orlando Health",                   state:"FL", remote_friendly:"Yes", careerPage:"https://careers.orlandohealth.com",           notes:"Major health system in central FL. Remote HIM coding roles. Outpatient and inpatient multi-specialty coding. Good benefits and fast-growing FL market.", status:"New" },
      { company:"BayCare Health System",            state:"FL", remote_friendly:"Yes", careerPage:"https://baycare.org/careers",                 notes:"Large nonprofit in Tampa Bay area. Remote coding roles for outpatient and inpatient specialties. Competitive benefits and strong regional reputation.", status:"New" },
      { company:"UF Health",                        state:"FL", remote_friendly:"Yes", careerPage:"https://jobs.ufhealth.org/careers-home",             notes:"Academic health system at University of Florida. Remote coding roles. Multi-specialty and outpatient coding focus. Academic affiliation = high-complexity coding.", status:"New" },
      // ── West ─────────────────────────────────────────────────────────────────
      { company:"Kaiser Permanente",                state:"CA", remote_friendly:"Yes", careerPage:"https://www.kaiserpermanentejobs.org",           notes:"✅ Massive integrated health plan with dedicated coder hiring. Large HIM/coding team. Remote coding roles across multiple regions. Excellent pay and benefits.", status:"New" },
      { company:"Cedars-Sinai Medical Center",      state:"CA", remote_friendly:"Yes", careerPage:"https://careers.cshs.org",              notes:"Top LA academic medical center. Remote coding roles for experienced coders. High-complexity multi-specialty cases. Top-tier pay in a high-cost market.", status:"New" },
      { company:"UCLA Health",                      state:"CA", remote_friendly:"Yes", careerPage:"https://www.uclahealthcareers.org",             notes:"Major academic health system in LA. Remote coding roles for outpatient and inpatient. Multi-specialty and complex case focus. University of CA pay scale.", status:"New" },
      { company:"Sutter Health",                    state:"CA", remote_friendly:"Yes", careerPage:"https://jobs.sutterhealth.org/us/en",        notes:"Large nonprofit in Northern CA. Remote HIM coding roles. Outpatient and inpatient multi-specialty coding. One of the largest CA employers for coders.", status:"New" },
      { company:"Scripps Health",                   state:"CA", remote_friendly:"Yes", careerPage:"https://careers.scripps.org",            notes:"San Diego-based nonprofit. Remote coding roles available. Multi-specialty outpatient and inpatient coding. Well-regarded employer in the San Diego market.", status:"New" },
      { company:"Intermountain Health",             state:"UT", remote_friendly:"Yes", careerPage:"https://intermountainhealthcare.org/careers", notes:"Large nonprofit across UT, ID, CO and beyond. Remote HIM coding roles. Outpatient, inpatient, and specialty coding. Top-rated employer in the Intermountain West.", status:"New" },
      { company:"UCHealth",                         state:"CO", remote_friendly:"Yes", careerPage:"https://careers.uchealth.org",           notes:"Academic health system in CO (U of Colorado affiliation). Remote coding roles. Multi-specialty outpatient and inpatient. Competitive pay in a growing market.", status:"New" },
      { company:"Providence Health & Services",     state:"WA", remote_friendly:"Yes", careerPage:"https://providence.jobs",                notes:"Large Catholic system (WA, OR, CA, MT, AK). Remote HIM coding roles. Multi-specialty and outpatient coding. Excellent benefits and nationwide footprint.", status:"New" },
      { company:"MultiCare Health System",          state:"WA", remote_friendly:"Yes", careerPage:"https://jobs.multicare.org",          notes:"WA-based nonprofit health system serving Puget Sound area. Remote coding roles for outpatient and inpatient. Good benefits and stable community-based employer.", status:"New" },
      { company:"Seattle Children's Hospital",      state:"WA", remote_friendly:"Yes", careerPage:"https://careers.seattlechildrens.org",          notes:"Top-ranked pediatric hospital in the Pacific Northwest. Remote pediatric coding roles. Specialty coding for complex pediatric cases. Excellent pay and culture.", status:"New" },
      { company:"Legacy Health",                    state:"OR", remote_friendly:"Yes", careerPage:"https://www.legacyhealth.org/careers",       notes:"Portland-area nonprofit health system. Remote coding roles. Outpatient and inpatient multi-specialty coding. Community-focused employer with good benefits.", status:"New" },
      { company:"PeaceHealth",                      state:"WA", remote_friendly:"Yes", careerPage:"https://careers.peacehealth.org",        notes:"Catholic system across WA, OR, AK. Remote HIM coding roles. Outpatient and inpatient multi-specialty coding. Mission-driven culture and stable employment.", status:"New" },
      { company:"St. Luke's Health System",         state:"ID", remote_friendly:"Yes", careerPage:"https://careers.slhs.org",          notes:"Largest health system in ID. Remote coding roles available. Multi-specialty outpatient and inpatient. Less competitive market — strong candidates stand out.", status:"New" },
      { company:"Banner Health",                    state:"AZ", remote_friendly:"Yes", careerPage:"https://www.bannerhealth.com/careers",           notes:"Large nonprofit across AZ and western states. Remote HIM coding roles regularly posted. Multi-specialty coding. One of the largest AZ employers for coders.", status:"New" },
      { company:"CommonSpirit Health",              state:"IL", remote_friendly:"Yes", careerPage:"https://www.commonspirit.careers/employment/remote-medical-coding-jobs/35300/8230896/1000000000100/2", notes:"✅ Dedicated remote medical coding jobs page confirmed active June 2026. National nonprofit with facilities in 24 states. Apply direct at commonspirit.careers.", status:"New" },
      // ── National payers & RCM firms (confirmed hiring July 2026) ───────────────
      { company:"Molina Healthcare",                state:"CA", remote_friendly:"Yes", careerPage:"https://careers.molinahealthcare.com/search-jobs", notes:"✅ Multiple remote CPC reqs confirmed July 2026 (Certified Coder CPC/CCS, Risk Adjustment Coder, SIU Coding). Fortune 500 government-plan payer. HCC and risk adjustment focus. Strong pay.", status:"New" },
      { company:"Humana",                           state:"KY", remote_friendly:"Yes", careerPage:"https://careers.humana.com/us/en", notes:"✅ Remote Risk Adjustment Coder confirmed July 2026. Major national payer. Requires CPC (or CRC/CCS) and 3+ years HCC coding review. Fully remote in eligible states. Avg $29+/hr.", status:"New" },
      { company:"Elevance Health",                  state:"IN", remote_friendly:"Yes", careerPage:"https://careers.elevancehealth.com", notes:"✅ Remote billing and coding roles confirmed July 2026. Major national payer (formerly Anthem). CPC or CCS required. ICD-10 and CPT. Work-from-home in eligible states.", status:"New" },
      { company:"iMedX (Rapid Care Group)",         state:"GA", remote_friendly:"Yes", careerPage:"https://www.imedx.com/careers", notes:"Atlanta-based remote medical coding company. Hires certified coders as employees or contractors. Requires 3+ years experience. Serves hospitals and provider groups nationwide.", status:"New" },
      { company:"R1 RCM",                           state:"IL", remote_friendly:"Yes", careerPage:"https://www.r1rcm.com/careers/",              notes:"Large revenue cycle management company. Remote medical coders hired nationwide continuously. Strong career path in RCM. Competitive pay and established remote culture.", status:"New" },
    ];
    us.forEach(function(c){ USCompanies.add(Object.assign({ validated: VDATE }, c)); });
    localStorage.setItem(KEYS.usseeded, "1");
  }

  function exportAll() {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      recruiters:    Recruiters.getAll(),
      companies:     Companies.getAll(),
      i35companies:  I35Companies.getAll(),
      uscompanies:   USCompanies.getAll(),
      jobs:          Jobs.getAll(),
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
    if (data.i35companies) I35Companies.replace(data.i35companies);
    if (data.uscompanies)  USCompanies.replace(data.uscompanies);
    if (data.jobs)         Jobs.replace(data.jobs);
    if (data.applications) Applications.replace(data.applications);
    if (data.interviews)   Interviews.replace(data.interviews);
    if (data.followups)    FollowUps.replace(data.followups);
    if (data.resumevault)  ResumeVault.replace(data.resumevault);
    if (data.settings)     Settings.set(data.settings);
    localStorage.setItem(KEYS.seeded, "1");
  }

  return { Recruiters, Companies, I35Companies, USCompanies, Jobs, Applications, Interviews, FollowUps, ResumeVault, Settings, seed, seedI35, seedUS, exportAll, importAll, KEYS };
})();
