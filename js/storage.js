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
    seeded:        "jt_seeded_v6",
    i35seeded:     "jt_i35seeded_v1",
    usseeded:      "jt_usseeded_v1",
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
      { company:"Houston Methodist", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://careers.houstonmethodist.org", contact:"", notes:"Major Houston academic medical center and health system. Large HIM/coding department. Frequently posts remote coder roles across specialties." },
      { company:"Parkland Health", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://careers.phhs.org", contact:"", notes:"Dallas County public hospital system. One of the busiest safety-net hospitals in TX. Active remote coding program. Good pay and strong benefits." },
      { company:"UTHealth Houston", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://jobs.uth.tmc.edu", contact:"", notes:"UT Health Science Center Houston — academic physicians and specialty practices. Codes outpatient, E&M, and specialty procedures. Remote roles available." },
      { company:"Children's Health (Dallas)", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://careers.childrens.com", contact:"", notes:"Children's Medical Center Dallas. Large pediatric system with significant HIM/coding team. Remote outpatient coding roles posted regularly." },
      { company:"JPS Health Network", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://careers.jpshealthnet.org", contact:"", notes:"Tarrant County (Fort Worth) public health system. Outpatient multi-specialty coding. Solid public-sector pay and benefits package." },
      { company:"Tenet Healthcare", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://careers.tenethealth.com", contact:"", notes:"Dallas-based national hospital company with many TX facilities. Central coding hub posts remote coder roles. Large-system stability and career growth." },
      { company:"Kelsey-Seybold Clinic", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.kelsey-seybold.com/about-kelsey-seybold-clinic/careers", contact:"", notes:"One of Houston's largest multi-specialty physician groups. Robust HIM team. Outpatient coding and E&M focus. Good remote flexibility." },
      { company:"UTMB Health", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://hr.utmb.edu/careers", contact:"", notes:"University of Texas Medical Branch in Galveston. Large academic medical center. HIM department posts remote coding roles across multiple specialties." },
      { company:"WellMed Medical Management", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.wellmed.com/careers", contact:"", notes:"San Antonio-based large physician group (part of UnitedHealth Group). Focuses on senior/Medicare patients. Risk-adjustment and outpatient coding roles." },
      { company:"Ascension Texas", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://careers.ascension.org", contact:"", notes:"Catholic nonprofit system with 14 TX hospitals. Central HIM coding team. Posts remote outpatient and specialty coder roles regularly." },
      { company:"Texas Oncology", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.texasoncology.com/about-us/careers", contact:"", notes:"Largest community oncology network in Texas. Coding involves chemo admin, E&M, surgical oncology. Remote coding roles posted. High specialty fit." },
      { company:"Driscoll Children's Hospital", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.driscollchildrens.org/about/careers", contact:"", notes:"South TX pediatric referral center based in Corpus Christi. Smaller team with strong culture. Outpatient coding and HIM roles occasionally posted." },
      { company:"DHR Health", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.dhrhealth.com/careers", contact:"", notes:"McAllen-based regional health system serving South Texas/Rio Grande Valley. Growing HIM team. Outpatient coder roles posted; some remote flexibility." },
      { company:"Concentra", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.concentra.com/careers", contact:"", notes:"Occupational health and urgent care company headquartered in TX. Codes work-comp, E&M, and injury-related procedures. Remote billing/coding roles available." },
      { company:"Covenant Health (Lubbock)", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.covenanthealthlubbock.com/careers", contact:"", notes:"West Texas regional health system. Part of Providence/St. Joseph system. Outpatient and inpatient coding roles. Remote options available for experienced coders." },
      { company:"Hendrick Health", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.hendrickhealth.org/careers", contact:"", notes:"Abilene-based regional nonprofit health system. Smaller coding team — experienced coders stand out. Outpatient multi-specialty coding. Some remote flexibility." },
      { company:"Texas Tech Physicians", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://jobs.ttuhsc.edu", contact:"", notes:"Academic physician practice group for Texas Tech University Health Sciences Center. Multi-specialty outpatient coding across West TX campuses. Remote roles available." },
      { company:"Valley Baptist Medical Center", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.valleybaptist.net/careers", contact:"", notes:"Harlingen-based regional hospital (Tenet subsidiary) serving Rio Grande Valley. Outpatient and inpatient coding. Remote opportunities through Tenet central coding." },
      { company:"Methodist Health System (Dallas)", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://www.methodisthealthsystem.org/careers", contact:"", notes:"Dallas-based faith-based nonprofit (separate from Houston Methodist). Multiple hospitals. HIM department posts remote coder roles. Great culture and benefits." },
      { company:"Kindred Healthcare", state:"TX", remote_friendly:"Yes", target:"Yes", priority:"High", careerPage:"https://careers.kindredhealthcare.com", contact:"", notes:"Long-term acute care and rehab hospitals with significant TX operations. Post-acute coding experience valued. Remote inpatient coding roles available." },
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

  function seedI35() {
    if (localStorage.getItem(KEYS.i35seeded)) return;
    I35Companies.replace([]);
    const i35 = [
      // ── San Antonio ──────────────────────────────────────────────────────────
      { company:"University Health",                  city:"San Antonio", state:"TX", remote_friendly:"Yes", careerPage:"https://www.universityhealthsystem.com/careers",         notes:"Large public health system serving Bexar County. Active medical coding dept. Hires coders for inpatient, outpatient, and ED coding. Good benefits.", status:"New" },
      { company:"Baptist Health System (Tenet)",      city:"San Antonio", state:"TX", remote_friendly:"Yes", careerPage:"https://www.baptisthealthsystem.com/careers",            notes:"Multi-hospital system in SA. Part of Tenet Healthcare. Remote coding roles posted regularly for outpatient and inpatient specialties.", status:"New" },
      { company:"Methodist Healthcare (HCA)",         city:"San Antonio", state:"TX", remote_friendly:"Yes", careerPage:"https://www.sahealth.com/careers",                       notes:"HCA-owned multi-hospital system across SA. Strong remote HIM department. Frequently hires experienced medical coders.", status:"New" },
      { company:"CHRISTUS Santa Rosa Health System",  city:"San Antonio", state:"TX", remote_friendly:"Yes", careerPage:"https://careers.christushealth.org",                     notes:"Catholic nonprofit system with multiple SA campuses. HIM department hires remote coders. Strong mission-driven culture.", status:"New" },
      { company:"South Texas VA Health Care System",  city:"San Antonio", state:"TX", remote_friendly:"No",  careerPage:"https://www.usajobs.gov",                                notes:"VA system covering South TX. Search USAJOBS for medical coder GS positions. On-site but stable employment and federal benefits.", status:"New" },
      { company:"UT Health San Antonio",              city:"San Antonio", state:"TX", remote_friendly:"Yes", careerPage:"https://jobs.uthscsa.edu",                               notes:"Academic medical center and physician group. Large coding department covering multiple specialties. Remote-friendly for experienced coders.", status:"New" },
      { company:"Brooke Army Medical Center (BAMC)",  city:"San Antonio", state:"TX", remote_friendly:"No",  careerPage:"https://www.usajobs.gov",                                notes:"Military medical center — civilian coder positions available via USAJOBS. On-site. Federal pay scale and benefits.", status:"New" },
      { company:"Southwest General Hospital",         city:"San Antonio", state:"TX", remote_friendly:"Yes", careerPage:"https://www.swgeneralhospital.com/careers",              notes:"Community hospital in SW San Antonio. Smaller HIM team, good for outpatient coding roles. Remote flexibility for experienced staff.", status:"New" },
      { company:"Post Acute Medical",                 city:"San Antonio", state:"TX", remote_friendly:"Yes", careerPage:"https://www.postacutemedical.com/careers",               notes:"Long-term acute care and rehab facilities. Hires coders for specialty coding including LTACH. Remote roles available.", status:"New" },
      { company:"CommuniCare Health Centers",         city:"San Antonio", state:"TX", remote_friendly:"Yes", careerPage:"https://www.communicarehc.org/careers",                 notes:"Federally Qualified Health Center (FQHC) serving SA. Hires medical coders and billers for outpatient multi-specialty encounters.", status:"New" },
      // ── New Braunfels ────────────────────────────────────────────────────────
      { company:"CHRISTUS Santa Rosa – New Braunfels",city:"New Braunfels", state:"TX", remote_friendly:"Yes", careerPage:"https://careers.christushealth.org",                  notes:"CHRISTUS system hospital in New Braunfels. Shares HIM infrastructure with SA campuses. Remote coding roles available through CHRISTUS system.", status:"New" },
      { company:"Resolute Health Hospital",           city:"New Braunfels", state:"TX", remote_friendly:"Yes", careerPage:"https://www.resolutehealth.com/careers",               notes:"Community hospital in New Braunfels. Smaller coding team. Good opportunity for outpatient and ED coding roles close to home.", status:"New" },
      // ── San Marcos ───────────────────────────────────────────────────────────
      { company:"Ascension Seton Hays – San Marcos",  city:"San Marcos",   state:"TX", remote_friendly:"Yes", careerPage:"https://healthcare.ascension.org/careers",             notes:"Ascension system hospital in San Marcos. Part of Ascension Seton network. Remote coding roles available through the Ascension system.", status:"New" },
      { company:"Central Texas Medical Center",       city:"San Marcos",   state:"TX", remote_friendly:"Yes", careerPage:"https://www.ctmc.org/careers",                         notes:"Independent community hospital in San Marcos. Active HIM department. Good option for local outpatient and inpatient coding.", status:"New" },
      // ── Kyle / Buda ──────────────────────────────────────────────────────────
      { company:"Ascension Seton Hays – Kyle",        city:"Kyle",         state:"TX", remote_friendly:"Yes", careerPage:"https://healthcare.ascension.org/careers",             notes:"Growing hospital in Kyle serving fast-expanding Hays County. Ascension system remote coding roles available. High-growth area.", status:"New" },
      { company:"Kyle Regional Medical Center",       city:"Kyle",         state:"TX", remote_friendly:"Yes", careerPage:"https://www.stewardhealth.org/careers",                notes:"Steward Health Care hospital in Kyle. Outpatient and inpatient coding roles. Growing facility serving the Kyle-Buda corridor.", status:"New" },
      // ── Austin ───────────────────────────────────────────────────────────────
      { company:"St. David's HealthCare",             city:"Austin",       state:"TX", remote_friendly:"Yes", careerPage:"https://stdavids.com/careers",                         notes:"Large HCA-affiliated multi-hospital system in Austin. Strong remote HIM program. Regularly hires medical coders across all specialties.", status:"New" },
      { company:"Ascension Seton (Austin)",           city:"Austin",       state:"TX", remote_friendly:"Yes", careerPage:"https://healthcare.ascension.org/careers",             notes:"Major nonprofit health system in Austin. Large HIM and coding department. Remote-friendly for experienced coders.", status:"New" },
      { company:"Dell Seton Medical Center (UT)",     city:"Austin",       state:"TX", remote_friendly:"Yes", careerPage:"https://jobs.utsouthwestern.edu",                      notes:"Academic medical center in Austin affiliated with UT. Complex coding environment. Strong career growth for experienced coders.", status:"New" },
      { company:"Austin Regional Clinic (ARC)",       city:"Austin",       state:"TX", remote_friendly:"Yes", careerPage:"https://www.austinregionalclinic.com/careers",         notes:"Largest physician group in Austin. Outpatient multi-specialty coding. Hires medical coders and billers. Good work-life balance reputation.", status:"New" },
      { company:"Dell Children's Medical Center",     city:"Austin",       state:"TX", remote_friendly:"Yes", careerPage:"https://healthcare.ascension.org/careers",             notes:"Pediatric hospital in Austin under Ascension. Specialty coding for pediatric cases. Remote roles available through Ascension system.", status:"New" },
      { company:"CommunityCare (FQHC – Austin)",      city:"Austin",       state:"TX", remote_friendly:"Yes", careerPage:"https://www.communitycaretx.org/careers",             notes:"Federally Qualified Health Center serving Austin. Outpatient multi-specialty coding and billing roles. Mission-driven, stable employer.", status:"New" },
      { company:"Baylor Scott & White – Round Rock",  city:"Round Rock",   state:"TX", remote_friendly:"Yes", careerPage:"https://jobs.bswhealth.com",                           notes:"BSW hospital north of Austin. Part of largest TX nonprofit health system. Remote coding roles available through BSW central HIM.", status:"New" },
      { company:"UT Health Austin",                   city:"Austin",       state:"TX", remote_friendly:"Yes", careerPage:"https://jobs.utsouthwestern.edu",                      notes:"UT multispecialty physician practice in Austin. Outpatient coding roles available. Growing academic practice with competitive pay.", status:"New" },
    ];
    i35.forEach(function(c){ I35Companies.add(c); });
    localStorage.setItem(KEYS.i35seeded, "1");
  }

  function seedUS() {
    if (localStorage.getItem(KEYS.usseeded)) return;
    USCompanies.replace([]);
    const us = [
      // ── Midwest ──────────────────────────────────────────────────────────────
      { company:"Mayo Clinic",                      state:"MN", remote_friendly:"Yes", careerPage:"https://jobs.mayoclinic.org",                notes:"World-renowned academic medical center. Large HIM/coding team. Remote coding roles across multiple specialties. Top-tier pay and benefits.", status:"New" },
      { company:"Allina Health",                    state:"MN", remote_friendly:"Yes", careerPage:"https://www.allinahealth.org/careers",        notes:"Large MN nonprofit health system. Centralized HIM department. Remote outpatient and inpatient coding roles posted regularly.", status:"New" },
      { company:"Essentia Health",                  state:"MN", remote_friendly:"Yes", careerPage:"https://www.essentiahealth.org/careers",      notes:"Regional health system covering MN, WI, ND. Remote coding roles available. Specialty and outpatient focus.", status:"New" },
      { company:"Optum (UnitedHealth Group)",       state:"MN", remote_friendly:"Yes", careerPage:"https://careers.unitedhealthgroup.com",       notes:"Massive health services company. Hires hundreds of remote medical coders. Risk adjustment, outpatient, and inpatient roles. Competitive pay.", status:"New" },
      { company:"Northwestern Medicine",            state:"IL", remote_friendly:"Yes", careerPage:"https://www.nm.org/about/careers",            notes:"Academic health system in Chicago. Large HIM department. Remote coding roles for experienced coders across multiple specialties.", status:"New" },
      { company:"Rush University Medical Center",   state:"IL", remote_friendly:"Yes", careerPage:"https://www.rush.edu/careers",                notes:"Chicago academic medical center. Strong HIM team. Outpatient and inpatient remote coding roles. Good career growth.", status:"New" },
      { company:"OSF HealthCare",                   state:"IL", remote_friendly:"Yes", careerPage:"https://www.osfhealthcare.org/careers",       notes:"Catholic health system across IL and MI. Remote coding roles. Outpatient multi-specialty and inpatient coding.", status:"New" },
      { company:"UnityPoint Health",                state:"IA", remote_friendly:"Yes", careerPage:"https://jobs.unitypoint.org",                 notes:"Regional health system across IA, IL, WI. Centralized coding team. Remote roles for outpatient and inpatient coders.", status:"New" },
      { company:"SSM Health",                       state:"MO", remote_friendly:"Yes", careerPage:"https://www.ssmhealth.com/careers",           notes:"Catholic nonprofit across MO, IL, WI, OK. Remote HIM and coding roles. Multi-specialty outpatient focus.", status:"New" },
      { company:"BJC HealthCare",                   state:"MO", remote_friendly:"Yes", careerPage:"https://www.bjc.org/careers",                 notes:"Major St. Louis health system. Large centralized coding team. Remote coding roles posted regularly. Academic medical center affiliation.", status:"New" },
      { company:"Mercy Health System",              state:"MO", remote_friendly:"Yes", careerPage:"https://www.mercy.net/careers",               notes:"Large Catholic health system across MO, AR, KS, OK. Remote HIM coders hired regularly. Outpatient and inpatient roles.", status:"New" },
      { company:"Corewell Health",                  state:"MI", remote_friendly:"Yes", careerPage:"https://careers.corewellhealth.org",          notes:"Michigan's largest health system (formerly Spectrum + Beaumont). Remote coding roles. Multi-specialty and inpatient coding.", status:"New" },
      { company:"Henry Ford Health",                state:"MI", remote_friendly:"Yes", careerPage:"https://careers.henryford.com",               notes:"Detroit-based integrated health system. Large HIM department. Remote coding roles available for experienced coders.", status:"New" },
      { company:"Trinity Health",                   state:"MI", remote_friendly:"Yes", careerPage:"https://www.trinity-health.org/careers",      notes:"National Catholic system headquartered in MI. Remote coding roles across dozens of facilities. Strong benefits and stability.", status:"New" },
      { company:"Indiana University Health",        state:"IN", remote_friendly:"Yes", careerPage:"https://iuhealth.org/careers",                notes:"Indiana's largest health system. Strong HIM department. Remote outpatient and inpatient coding. Academic medical center affiliation.", status:"New" },
      { company:"OhioHealth",                       state:"OH", remote_friendly:"Yes", careerPage:"https://careers.ohiohealth.com",              notes:"Columbus-based nonprofit health system. Remote coding roles for experienced coders. Outpatient and inpatient multi-specialty.", status:"New" },
      { company:"Bon Secours Mercy Health",         state:"OH", remote_friendly:"Yes", careerPage:"https://jobs.bsmhealth.com",                  notes:"Large Catholic system across OH, KY, VA, and more. Remote HIM coding roles. Multi-specialty and outpatient focus.", status:"New" },
      { company:"Cleveland Clinic",                 state:"OH", remote_friendly:"Yes", careerPage:"https://jobs.clevelandclinic.org",            notes:"World-class academic medical center. Remote coding roles for experienced coders. High complexity cases across multiple specialties.", status:"New" },
      { company:"Nationwide Children's Hospital",   state:"OH", remote_friendly:"Yes", careerPage:"https://careers.nationwidechildrens.org",    notes:"Top pediatric hospital in Columbus. Remote pediatric coding roles. Specialty and outpatient coding focus.", status:"New" },
      { company:"Cincinnati Children's Hospital",   state:"OH", remote_friendly:"Yes", careerPage:"https://jobs.cincinnatichildrens.org",        notes:"Top-ranked pediatric hospital. Remote coding roles for specialty pediatric cases. Strong HIM department.", status:"New" },
      { company:"Sanford Health",                   state:"SD", remote_friendly:"Yes", careerPage:"https://careers.sanfordhealth.org",           notes:"Large rural health system across SD, ND, MN. Remote coding roles regularly posted. Multi-specialty outpatient focus.", status:"New" },
      // ── Northeast ────────────────────────────────────────────────────────────
      { company:"Mass General Brigham",             state:"MA", remote_friendly:"Yes", careerPage:"https://careers.massgeneralbrigham.org",      notes:"Leading academic health system (MGH, Brigham & Women's). Large HIM team. Remote coding roles for experienced coders. Top-tier compensation.", status:"New" },
      { company:"Boston Children's Hospital",       state:"MA", remote_friendly:"Yes", careerPage:"https://careers.childrenshospital.org",       notes:"Top pediatric hospital in the US. Remote pediatric coding roles. Specialty coding across complex pediatric cases.", status:"New" },
      { company:"Yale New Haven Health",            state:"CT", remote_friendly:"Yes", careerPage:"https://careers.ynhhs.org",                   notes:"Academic health system in CT. Remote coding roles for outpatient and inpatient. Strong HIM department. Competitive pay.", status:"New" },
      { company:"Hartford HealthCare",              state:"CT", remote_friendly:"Yes", careerPage:"https://jobs.hartfordhealthcare.org",          notes:"Largest health system in CT. Centralized HIM team. Remote coding roles for outpatient and inpatient specialties.", status:"New" },
      { company:"UPMC",                             state:"PA", remote_friendly:"Yes", careerPage:"https://careers.upmc.com",                    notes:"Major Pittsburgh academic medical center and insurer. Large remote coding program. Inpatient, outpatient, and specialty roles.", status:"New" },
      { company:"Children's Hospital of Philadelphia", state:"PA", remote_friendly:"Yes", careerPage:"https://careers.chop.edu",                notes:"Top pediatric hospital. Remote coding roles for complex pediatric specialties. Strong HIM team and competitive pay.", status:"New" },
      { company:"Johns Hopkins Medicine",           state:"MD", remote_friendly:"Yes", careerPage:"https://careers.hopkinsmedicine.org",         notes:"World-renowned academic medical center. Remote coding roles for experienced coders. High-complexity multi-specialty cases.", status:"New" },
      { company:"Sentara Healthcare",               state:"VA", remote_friendly:"Yes", careerPage:"https://www.sentara.com/careers",             notes:"Large health system across VA and NC. Remote HIM coding roles. Multi-specialty outpatient and inpatient coding.", status:"New" },
      { company:"Inova Health System",              state:"VA", remote_friendly:"Yes", careerPage:"https://www.inova.org/careers",               notes:"Northern VA health system near DC. Remote coding roles. Outpatient, inpatient, and specialty coding focus.", status:"New" },
      { company:"WVU Medicine",                     state:"WV", remote_friendly:"Yes", careerPage:"https://careers.wvumedicine.org",             notes:"Academic health system in WV. Remote coding roles available. Multi-specialty outpatient and inpatient focus.", status:"New" },
      // ── Southeast ────────────────────────────────────────────────────────────
      { company:"Vanderbilt University Medical Center", state:"TN", remote_friendly:"Yes", careerPage:"https://careers.vumc.org",               notes:"Top academic medical center in Nashville. Large HIM team. Remote coding roles across complex multi-specialty cases. Strong pay.", status:"New" },
      { company:"Ballad Health",                    state:"TN", remote_friendly:"Yes", careerPage:"https://www.balladhealth.org/careers",        notes:"Regional health system in TN and VA. Remote coding roles for outpatient and inpatient. Strong community focus.", status:"New" },
      { company:"Lifepoint Health",                 state:"TN", remote_friendly:"Yes", careerPage:"https://jobs.lifepointhealth.com",            notes:"National hospital company based in TN. Remote HIM coding roles across many facilities. Outpatient and inpatient coding.", status:"New" },
      { company:"Emory Healthcare",                 state:"GA", remote_friendly:"Yes", careerPage:"https://careers.emoryhealthcare.org",         notes:"Academic health system in Atlanta. Large HIM department. Remote coding roles for experienced coders. Multi-specialty focus.", status:"New" },
      { company:"Wellstar Health System",           state:"GA", remote_friendly:"Yes", careerPage:"https://careers.wellstar.org",                notes:"Largest nonprofit health system in GA. Remote coding roles. Outpatient and inpatient multi-specialty coding.", status:"New" },
      { company:"Piedmont Healthcare",              state:"GA", remote_friendly:"Yes", careerPage:"https://careers.piedmont.org",                notes:"Large Atlanta-based nonprofit. Remote HIM coding roles. Multi-specialty outpatient and inpatient coding. Good benefits.", status:"New" },
      { company:"Atrium Health",                    state:"NC", remote_friendly:"Yes", careerPage:"https://careers.atriumhealth.org",            notes:"Major health system across NC, SC, GA (now Advocate Health). Remote coding roles regularly posted. Large central HIM team.", status:"New" },
      { company:"Duke Health",                      state:"NC", remote_friendly:"Yes", careerPage:"https://careers.dukehealth.org",              notes:"Academic medical center in Durham. Remote coding roles for experienced coders. High-complexity multi-specialty cases.", status:"New" },
      { company:"UNC Health",                       state:"NC", remote_friendly:"Yes", careerPage:"https://jobs.unchealthcare.org",               notes:"Academic health system across NC. Remote HIM coding roles. Outpatient, inpatient, and specialty coding.", status:"New" },
      { company:"Novant Health",                    state:"NC", remote_friendly:"Yes", careerPage:"https://www.novanthealth.org/careers",         notes:"Large nonprofit across NC, SC, VA. Remote coding roles posted regularly. Multi-specialty outpatient and inpatient focus.", status:"New" },
      { company:"Prisma Health",                    state:"SC", remote_friendly:"Yes", careerPage:"https://careers.prismahealth.org",             notes:"Largest health system in SC. Remote coding roles. Outpatient and inpatient multi-specialty coding. Good stability.", status:"New" },
      { company:"MUSC Health",                      state:"SC", remote_friendly:"Yes", careerPage:"https://careers.musc.edu",                    notes:"Academic medical center in Charleston. Remote coding roles for experienced coders. Multi-specialty focus.", status:"New" },
      { company:"UAB Health System",                state:"AL", remote_friendly:"Yes", careerPage:"https://www.uab.edu/jobs",                    notes:"Academic medical center in Birmingham. Large HIM team. Remote coding roles across multiple specialties.", status:"New" },
      { company:"Ochsner Health",                   state:"LA", remote_friendly:"Yes", careerPage:"https://careers.ochsner.org",                 notes:"Largest health system in LA. Remote coding roles regularly posted. Multi-specialty outpatient and inpatient coding.", status:"New" },
      { company:"Baptist Health (Louisville)",      state:"KY", remote_friendly:"Yes", careerPage:"https://careers.baptisthealth.com",            notes:"Large health system in KY. Remote HIM coding roles. Outpatient and inpatient multi-specialty coding. Good benefits.", status:"New" },
      { company:"AdventHealth",                     state:"FL", remote_friendly:"Yes", careerPage:"https://careers.adventhealth.com",            notes:"Large faith-based system across FL and nationally. Remote coding roles. Multi-specialty outpatient and inpatient coding.", status:"New" },
      { company:"Orlando Health",                   state:"FL", remote_friendly:"Yes", careerPage:"https://careers.orlandohealth.com",           notes:"Major health system in central FL. Remote HIM coding roles. Outpatient and inpatient multi-specialty coding.", status:"New" },
      { company:"BayCare Health System",            state:"FL", remote_friendly:"Yes", careerPage:"https://careers.baycare.org",                 notes:"Large nonprofit in Tampa Bay area. Remote coding roles for outpatient and inpatient specialties. Competitive benefits.", status:"New" },
      { company:"UF Health",                        state:"FL", remote_friendly:"Yes", careerPage:"https://hr.ufhealth.org/careers",             notes:"Academic health system at Univ. of Florida. Remote coding roles. Multi-specialty and outpatient coding focus.", status:"New" },
      // ── West ─────────────────────────────────────────────────────────────────
      { company:"Kaiser Permanente",                state:"CA", remote_friendly:"Yes", careerPage:"https://jobs.kaiserpermanente.org",           notes:"Massive integrated health plan and delivery system. Large HIM/coding team. Remote coding roles across multiple regions and specialties.", status:"New" },
      { company:"Cedars-Sinai Medical Center",      state:"CA", remote_friendly:"Yes", careerPage:"https://jobs.cedars-sinai.edu",              notes:"Top LA academic medical center. Remote coding roles for experienced coders. High-complexity multi-specialty cases. Strong pay.", status:"New" },
      { company:"UCLA Health",                      state:"CA", remote_friendly:"Yes", careerPage:"https://careers.uclahealth.org",             notes:"Major academic health system. Remote coding roles for outpatient and inpatient. Multi-specialty and complex case focus.", status:"New" },
      { company:"Sutter Health",                    state:"CA", remote_friendly:"Yes", careerPage:"https://www.sutterhealth.org/careers",        notes:"Large nonprofit health system in Northern CA. Remote HIM coding roles. Outpatient and inpatient multi-specialty coding.", status:"New" },
      { company:"Scripps Health",                   state:"CA", remote_friendly:"Yes", careerPage:"https://www.scripps.org/careers",            notes:"San Diego-based nonprofit. Remote coding roles available. Multi-specialty outpatient and inpatient coding.", status:"New" },
      { company:"Intermountain Health",             state:"UT", remote_friendly:"Yes", careerPage:"https://intermountainhealthcare.org/careers", notes:"Large nonprofit across UT, ID, CO and beyond. Remote HIM coding roles. Outpatient, inpatient, and specialty coding.", status:"New" },
      { company:"UCHealth",                         state:"CO", remote_friendly:"Yes", careerPage:"https://www.uchealth.org/careers",           notes:"Academic health system in CO. Remote coding roles for experienced coders. Multi-specialty outpatient and inpatient.", status:"New" },
      { company:"Providence Health & Services",     state:"WA", remote_friendly:"Yes", careerPage:"https://jobs.providence.org",                notes:"Large Catholic system across WA, OR, CA and beyond. Remote HIM coding roles. Multi-specialty and outpatient coding.", status:"New" },
      { company:"MultiCare Health System",          state:"WA", remote_friendly:"Yes", careerPage:"https://www.multicare.org/careers",          notes:"WA-based nonprofit health system. Remote coding roles for outpatient and inpatient specialties. Good benefits.", status:"New" },
      { company:"Seattle Children's Hospital",      state:"WA", remote_friendly:"Yes", careerPage:"https://jobs.seattlechildrens.org",          notes:"Top pediatric hospital. Remote pediatric coding roles. Specialty and outpatient coding for complex pediatric cases.", status:"New" },
      { company:"Legacy Health",                    state:"OR", remote_friendly:"Yes", careerPage:"https://www.legacyhealth.org/careers",       notes:"Portland-area nonprofit health system. Remote coding roles. Outpatient and inpatient multi-specialty coding.", status:"New" },
      { company:"PeaceHealth",                      state:"WA", remote_friendly:"Yes", careerPage:"https://www.peacehealth.org/careers",        notes:"Catholic system across WA, OR, AK. Remote HIM coding roles. Outpatient and inpatient multi-specialty coding.", status:"New" },
      { company:"St. Luke's Health System",         state:"ID", remote_friendly:"Yes", careerPage:"https://careers.stlukesonline.org",          notes:"Largest health system in ID. Remote coding roles available. Multi-specialty outpatient and inpatient coding.", status:"New" },
      { company:"Banner Health",                    state:"AZ", remote_friendly:"Yes", careerPage:"https://careers.bannerhealth.com",           notes:"Large nonprofit across AZ and other western states. Remote HIM coding roles regularly posted. Multi-specialty coding.", status:"New" },
      { company:"R1 RCM",                           state:"IL", remote_friendly:"Yes", careerPage:"https://www.r1rcm.com/careers",              notes:"Large revenue cycle management company. Remote medical coders hired nationwide. Strong career path in RCM. Competitive pay.", status:"New" },
    ];
    us.forEach(function(c){ USCompanies.add(c); });
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
