# PRD: Autonomous Job Discovery & Application Agent

**Author:** Harsh
**Document type:** Product Requirements Document
**Status:** Draft v1.0
**Date:** July 2026

---

## 1. Problem Statement

Job seekers applying to fresher/early-career roles (APM, Business Analyst, Product Analyst, Marketing Analyst) spend disproportionate time on low-value, repetitive work: searching multiple portals, re-reading postings to check fit, and manually re-entering the same information into dozens of application forms. This time cost reduces the number of *quality* applications a candidate can realistically submit, and increases fatigue-driven errors.

**Goal of this product:** Build a system that continuously discovers relevant job postings across multiple sources, scores each posting against the candidate's resume/profile, and autonomously submits applications for postings that clear a fit threshold — without the candidate needing to search or triage manually.

---

## 2. Goals & Non-Goals

### Goals
- Continuously scrape/aggregate job postings from multiple sources into one normalized feed.
- Structure every posting into a consistent schema (see Section 5) so postings are comparable.
- Score each posting against the user's resume and generate a **Match %**.
- Autonomously fill and submit applications for postings above a configurable match threshold.
- Give the user full visibility and override control over what gets auto-applied.

### Non-Goals (v1)
- This system does not let the user manually search/browse first — discovery is fully automated, feed-based (per your requirement that it "not include which job do you want" — i.e., no manual query step; the system decides what to surface based on profile match).
- No salary negotiation, interview scheduling, or post-application follow-up automation (future phase).
- No cross-platform messaging to recruiters (future phase — high risk of misrepresenting the candidate).

---

## 3. Target User / Persona

**Primary user:** Early-career job seeker (fresher to 2 YOE) applying to APM / BA / Product Analyst / Marketing Analyst roles in India, applying at volume across LinkedIn, Naukri, Indeed, and similar boards.

**Core need:** Maximize quality applications per week without spending hours on manual search and repetitive form-filling.

---

## 4. Core User Flow

1. User uploads resume(s) once (supports multiple resume variants — e.g., APM, BA, Marketing Analyst — matching your existing 4-variant setup).
2. User sets preferences: target roles, locations, experience band, minimum salary, auto-apply match threshold (e.g., "only auto-apply above 75% match").
3. System scrapes/ingests new postings on a schedule (e.g., every 4–6 hours).
4. Each posting is parsed into the standard schema and scored against the active resume(s).
5. Postings above the auto-apply threshold → queued and auto-submitted (or held for one-tap approval, depending on user's autonomy setting).
6. Postings below threshold but above a "review" floor → shown in a review queue, not auto-applied.
7. User gets a daily digest: applications sent, match scores, response status.

---

## 5. Job Posting Data Schema

Every scraped posting must be normalized into this structure regardless of source site:

| Field | Description |
|---|---|
| Job Title | Normalized title (raw + standardized, e.g., "APM" → "Associate Product Manager") |
| Company Name | Employer |
| Company Size / Type | Startup / SME / Enterprise / MNC (inferred if not stated) |
| Location | City + remote/hybrid/onsite flag |
| **Experience Level Label** | Standardized band: **Fresher (0 yrs) / Junior (0–1 yrs) / Intermediate (1–3 yrs) / Mid (3–5 yrs) / Senior (5+ yrs)** — mapped from raw posting text even when phrased inconsistently |
| Years of Experience Required | Numeric range, e.g., 0–2 |
| **Salary / CTC Range** | As disclosed; flagged "Not Disclosed" if absent, with an estimated market-rate range shown separately (never presented as fact) |
| Employment Type | Full-time / Internship / Contract |
| Job Description Summary | Condensed responsibilities (not full scraped text, to control noise and avoid displacive copying) |
| Required Skills | Extracted skill list (structured, for match scoring) |
| Preferred/Bonus Skills | Extracted separately from "required" |
| Education Requirement | Degree/field if specified |
| Application Deadline | If stated |
| Source Platform | LinkedIn / Naukri / Indeed / Internshala / company career page |
| Posting Date | For freshness ranking |
| Application Method | Easy Apply / External redirect / Email-based (this determines whether auto-apply is even feasible) |
| Match % | Computed field (Section 6) |

---

## 6. Resume Matching Engine

**Purpose:** Convert "does this job fit me" into a transparent, auditable score rather than a black box.

**Inputs:**
- Parsed resume (skills, tools, degrees, years of experience, project keywords, past titles)
- Parsed job posting (required skills, experience band, education requirement)

**Suggested scoring model (weighted, not just keyword overlap):**

| Component | Weight |
|---|---|
| Required skills overlap | 40% |
| Experience-level fit (band match) | 20% |
| Domain/industry relevance (e.g., SaaS, FMCG, product analytics) | 15% |
| Education/degree match | 10% |
| Preferred/bonus skills overlap | 10% |
| Keyword/title similarity | 5% |

**Output:** A single 0–100% Match Score, plus a short breakdown ("Strong: Product case study experience. Gap: SQL not evidenced in resume") — this breakdown matters more than the raw number, since it tells the user *why*, and can double as auto-generated notes for tailoring the resume before send.

**Design principle:** The score should be explainable, not just a number — this is what will separate this tool from a generic keyword matcher and is genuinely useful PM/analytics territory to showcase.

---

## 7. Autonomous Application Engine

**Functional requirements:**
- Detect application method per posting (native form / Easy Apply / external ATS / email).
- Auto-fill using resume + saved profile answers (common screening questions: notice period, current CTC, expected CTC, willingness to relocate).
- Select the correct resume variant automatically based on job category (APM vs BA vs Marketing Analyst).
- Attach a tailored short answer/cover note where the platform requires free text (template + light personalization from job title/company, not full AI-generated essays that read as generic).
- Log every submitted application with timestamp, posting snapshot, resume version used, and match score at time of send.
- Respect user-set daily/weekly application caps to avoid platform flags for spammy behavior.
- Full audit trail — nothing should be a "black box" application the user can't trace back.

**Explicit constraint:** Auto-apply should never fire below the user's set threshold, and the user should always be able to flip any job category from "auto-apply" to "review-first" at any time.

---

## 8. Non-Functional Requirements

- **Platform ToS compliance:** Most job boards (LinkedIn especially) restrict automated scraping/auto-apply in their terms of service. This is a real constraint, not just a technical one — the PRD should flag this explicitly as a risk to design around (e.g., preferring official APIs/partner feeds where they exist, rate-limiting scraping, and being conservative on volume) rather than something to engineer past.
- **Credential security:** Any stored login sessions/cookies must be encrypted at rest; no plaintext storage of platform passwords.
- **Data freshness:** Postings older than X days should be deprioritized/expired automatically.
- **Reliability:** Scraper should degrade gracefully (skip/flag a source) if a site's layout changes, rather than silently failing.
- **Explainability:** Every auto-decision (match score, auto-apply trigger) must be inspectable after the fact.

---

## 9. Success Metrics (KPIs)

- **Applications sent per week** (volume)
- **Match score at time of application** (average — quality proxy)
- **Response rate** (recruiter views / replies / interview invites per 100 applications) — the real quality signal
- **Time saved** vs. manual baseline (self-reported or estimated from time-per-application benchmarks)
- **False-positive auto-applies** (applications the user would not have sent manually, flagged in weekly review)

---

## 10. Phased Rollout

**Phase 1 (MVP):**
- Manual resume upload, single job board (start with the one with best scraping feasibility — likely Naukri or Internshala given fewer anti-bot barriers than LinkedIn)
- Schema normalization + match scoring
- Review queue only (no auto-submit yet) — validate scoring quality first

**Phase 2:**
- Add auto-apply for Easy Apply-style native forms
- Add 2nd and 3rd job sources
- Daily digest notifications

**Phase 3:**
- Multi-resume variant auto-selection
- Application caps, smarter dedup (same job posted on multiple boards)
- Response-tracking integration (parsing recruiter reply emails)

---

## 11. Risks & Open Questions

- **ToS/legal risk:** Scraping and auto-submitting on platforms like LinkedIn violates their terms and can get an account flagged or banned — needs an explicit risk-acceptance decision per platform before build.
- **Application quality risk:** Auto-apply at scale can produce a flood of low-effort-looking applications if thresholds are set too low — mitigate with a conservative default threshold (e.g., 80%+) and always show the match breakdown.
- **CAPTCHA/anti-bot defenses:** Will limit which sources can realistically be automated end-to-end vs. review-and-manual-submit only.
- **Open question:** Should low-match-but-close postings (e.g., 60–75%) trigger a "resume tailoring suggestion" instead of being silently dropped?
- **Open question:** Single unified profile, or per-role-category profiles (since you already maintain 4 tailored resume variants)?

---

## 12. Why This Is a Strong Portfolio Piece (not just a personal tool)

This PRD demonstrates PM thinking beyond "build a scraper": schema design, a weighted/explainable scoring model, phased de-risking (review-first before auto-submit), and an explicit legal/ToS risk section — the kind of judgment interviewers probe for in APM case rounds. Worth positioning this the same way you framed the FIFA dashboard: honestly, as PM thinking demonstrated through a technical build, not a coding showcase.
