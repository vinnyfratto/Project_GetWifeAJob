# JobTracker CRM

Personal job search CRM for **Sarah Mitchell** — Medical Coding, Radiology Coder, CPC-A, Texas remote job search.

## Quick Start

Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari). No build step, no server required.

For local development with live file serving:
```
npx serve .
```

## Deploying to GitHub Pages

1. Push this folder to a GitHub repository.
2. Go to **Settings → Pages → Source: main branch / root**.
3. Your CRM will be live at `https://yourusername.github.io/repo-name/`.

All data is stored in the browser's `localStorage` — nothing leaves your device.

## Features

| Module | Description |
|---|---|
| Dashboard | Stats cards, SVG charts (apps by month, by status, top companies) |
| Recruiters | Full table with search, sort, filter, star ratings, tags, notes |
| Companies | Card grid of 15 target TX health systems |
| Jobs | Card grid with fit score, status filter, one-click Apply |
| Applications | Drag-and-drop Kanban (9 columns: Researching → Offer → Closed) |
| Interviews | Table with type, follow-up tracking |
| Follow-Ups | Auto-generated from recruiter next-contact dates + interviews; Overdue/Today/This Week |
| Resume Vault | Link manager for resumes, LinkedIn, certifications |
| Analytics | SVG bar charts + metric gauges (interview rate, offer rate, response rate) |
| Settings | Profile, dark mode toggle, export/import JSON & CSV, full backup |

## Seed Data Included

- **10 recruiters** from AMN Healthcare, Medix, The Judge Group, KIWI-TEK, TAG MedStaffing, GHR Healthcare, Amergis, Kforce, Cross Country Healthcare, CHG Healthcare
- **15 target companies** (all TX, remote-friendly, High priority)
- **10 jobs** tracked (2 marked 95% fit: Vee Healthtek Diagnostic Radiology Coder + Baylor Scott & White Radiology Coder)
- **5 applications** across different Kanban columns
- **4 resume vault entries** (General Resume, Radiology Resume, LinkedIn, CPC-A)

## Tech Stack

- Pure HTML5 / CSS3 / Vanilla JS — no frameworks, no dependencies
- Google Fonts: Nunito Sans + Inter
- LocalStorage persistence (all data stays on your device)
- Accent color: `#9B8EC4` (soft purple)
