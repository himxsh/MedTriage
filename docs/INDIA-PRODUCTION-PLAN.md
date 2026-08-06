# MedTriage — Detailed Plan of Action

**Goal:** Ship a polished, sellable clinical triage product for **India first**, land paying pilots, then raise VC on evidence.  
**Constraints:** Preserve clinician control; no outcome claims without measurement; do not sell enterprise SSO/EHR until demanded.  
**Inputs:** `business.md`, security audit run-3, India GTM + pricing discussions.  
**Pricing hypothesis (India list):** ₹39,999 / 2-week pilot → ₹99,000 / month / site (~₹12L ARR), raise after proof.  
**License:** PolyForm Noncommercial on private repo; **commercial contract required** before any paid hospital use.

---



## 0. North star and kill criteria



### North star

A triage nurse at one Indian acute-care site can submit text/voice intake, see a prioritized live queue, confirm/override urgency with an audit trail, and do this **without founder babysitting** for two weeks.

### Operating principle (from `business.md`)

MedTriage wins only if it saves clinicians time without weakening clinical control.

### Kill / pivot criteria (decide by end of Month 4)

Stop or reposition if **any** of these hold after a supervised pilot:

- Nurses abandon the queue when the founder is not on-site.
- Override rate is chaotic with no learning (e.g. random overrides, no pattern).
- Buyer will not pay ≥ ₹60k/month after a successful pilot.
- Legal/clinical advisors say positioning is SaMD-blocked for your intended claims without a multi-year path you cannot fund.

---



## 1. Current state (honest baseline)



### Implemented

- Text + audio intake → NLP (scispaCy/UMLS) → de-ID → Gemini structured triage
- PostgreSQL cases, Redis/WebSocket queue, clinician review + audit UI
- Landing/docs; cosmetic Login/Register



### Blocking gaps (must fix before real PHI)


| ID  | Gap                                                 | Severity                       |
| --- | --------------------------------------------------- | ------------------------------ |
| S1  | No server auth; SPA ungated; Login ignores password | HIGH                           |
| S2  | Audio upload path traversal                         | HIGH                           |
| S3  | Client-supplied `clinician_id` forges audit         | HIGH                           |
| S4  | Unauthenticated intake → cost/DoS/queue poison      | HIGH                           |
| S5  | Completed cases re-reviewable                       | MEDIUM                         |
| S6  | Arbitrary `new_level` / `action`                    | MEDIUM                         |
| P1  | No multi-tenant `org_id` isolation                  | BLOCKER for 2+ sites           |
| P2  | No pilot metrics export                             | BLOCKER for evidence-led sales |
| P3  | No India-region production deploy + DPA             | BLOCKER for hospital PHI       |
| P4  | No commercial license / SaaS terms                  | BLOCKER for paid contracts     |
| P5  | USD pricing on landing; India buyers need INR       | GTM                            |


---



## 2. Phased roadmap (overview)


| Phase | Name                                 | Timing                 | Exit criteria                                                |
| ----- | ------------------------------------ | ---------------------- | ------------------------------------------------------------ |
| **A** | Security & tenancy foundation        | Weeks 1–3              | Auth+RBAC live; audit fixes closed; no open PHI API          |
| **B** | Pilot-ready product + India features | Weeks 4–8              | Deployed in India region; metrics; Hindi+EN; DPA pack        |
| **C** | Design partner & supervised pilot    | Weeks 6–14 (overlap B) | Pilot complete with exportable metrics + LOI or paid convert |
| **D** | Sellable polish & first revenue      | Months 4–7             | 2–3 paying sites or clear no-go                              |
| **E** | VC-ready narrative                   | Months 6–9             | Deck + data room; raise or bootstrap decision                |


Workstreams run in parallel where noted (sales outreach starts while Phase B ships).

---



## 3. Phase A — Security & tenancy (Weeks 1–3)

**Owner:** Engineering (founder). **Do not** take real patient data until Done.

### A1. Authentication (real)

- [x] User model: `id`, `email`, `password_hash` (argon2/bcrypt), `name`, `role`, `org_id`, `is_active`, `created_at`
- [x] Register → invite-only for pilots (admin creates users); public self-register **off** in production
- [x] Login: email/password → **httpOnly secure cookie session** OR short-lived JWT in httpOnly cookie (prefer session server-side for revocation)
- [x] Logout clears session; basic lockout after N failures
- [x] Password change
- [x] Replace `saveClinician` / localStorage identity; UI reads `/api/v1/me`
- [x] SPA: `ProtectedRoute` for `/queue`, `/cases`, `/audit`, `/account`; redirect unauthenticated to `/login`
- [x] All API routes + `/ws/queue` require auth

**Roles (RBAC v1)**


| Role        | Can do                                                |
| ----------- | ----------------------------------------------------- |
| `intake`    | Create intake only (kiosk/clerk)                      |
| `nurse`     | Intake + queue + review Confirm/Override              |
| `physician` | Same as nurse + see evidence detail                   |
| `admin`     | Invite users, org settings, metrics export, retention |




### A2. Authorization & audit integrity

- [x] Derive `clinician_id` / actor from session only; strip client-supplied identity from review API
- [x] Scope every query by `org_id` (cases, audit, users)
- [x] Reject review unless `status == "Pending Review"` (409)
- [x] Whitelist `action ∈ {Confirm, Override}` and `new_level ∈ {Critical, High, Medium, Low}`
- [x] Keep down-triage reason ≥ 10 chars for Override to lower urgency



### A3. Upload & intake hardening

- [x] Ignore client filename; store `temp_uploads/{case_id}.bin` under resolved directory with containment check
- [x] Max upload size (e.g. 25 MB audio); max text length (e.g. 20k chars)
- [x] Rate limit: per-user and per-IP on `/intake` and `/login`
- [ ] Optional: separate intake API key for kiosk devices (still org-scoped)



### A4. Transport & config

- [x] TLS only in production; HSTS (`ENABLE_HSTS` + reverse proxy; see `docs/ops-production.md`)
- [x] CORS allowlist exact frontend origin(s); no `*` + credentials
- [x] Authenticated WebSocket (cookie or ticket query exchanged post-login)
- [x] Bind API to private network / reverse proxy; never advertise open `0.0.0.0` without auth (runbook + `__main__` defaults to `127.0.0.1`)
- [ ] Secrets only in env/secret manager; rotate Gemini key if ever exposed
- [x] Remove or neutralize `vite` `GEMINI_API_KEY` client define (backend-only keys)



### A5. Data model migration

- [x] Add `organizations` table
- [x] Add `org_id` FK on `cases`, `audit_logs`, `users`
- [x] Migration script + seed one demo org for local/dev
- [x] Soft-delete / retention fields stub: `deleted_at`, `retain_until`



### A6. Verification

- [x] Security regression checklist from run-3 findings (each finding has a test or curl script that now fails closed)
- [x] One runnable smoke: unauthenticated `GET /cases` → 401; authenticated cross-org id → 404/403
- [x] Path-traversal intake filename + offline `upload_path.check.py`; password change round-trip in `auth_smoke.py`

**Phase A exit:** Demo to yourself: cannot access queue logged out; cannot forge another clinician’s audit; cannot path-traverse upload. **Met** (eng); remaining A4 secrets rotation is ops hygiene.

---



## 4. Phase B — Pilot-ready product & new features (Weeks 4–8)

Split features into **Must (B0)**, **Should (B1)**, **Later (D+)**.

### B0. Must-have features for a sellable India pilot



#### B0.1 Organization admin console

- [x] Org name, site name, timezone (IST)
- [x] Invite clinicians by email/role; deactivate seats
- [x] Seat counter vs plan cap (5 pilot / 25 site — soft limit)
- [x] Show API/base URL and WS status for IT



#### B0.2 Pilot metrics dashboard + export

Per org, date range:

- [x] Cases ingested, processed, failed
- [x] Median / p95 time: intake accepted → triage ready (`accepted_at` → `created_at`)
- [x] Confirm vs Override rates; down-triage reason completion %
- [x] Urgency distribution
- [x] Active clinicians; open sessions (now — not historical uptime)
- [x] CSV export for weekly pilot review
- [ ] PDF export (defer)

*This is the sales asset.* Without it, you cannot run an evidence-led pilot.

#### B0.3 Hindi + English intake

- [x] UI locale toggle (EN / हिं)
- [ ] Voice: Whisper path with Hindi-capable model or Gemini multimodal STT if Whisper Hindi quality insufficient — **measure in Week 4 spike**
- [x] Text intake accepts Hinglish; prompt Gemini that output urgency labels stay English enum for UI consistency; chief complaint may be bilingual
- [x] Disclaimer strings localized



#### B0.4 Clinical safety chrome (product, not legal theater)

- [x] Persistent banner: “AI decision support — clinician must confirm before action”
- [x] Case detail: show confidence + evidence; block “complete” without Confirm/Override
- [x] Immutable Completed state in UI + API
- [x] Risk flags visually distinct; Critical cases pin/sort first (already intended — verify)



#### B0.5 Queue UX polish (sellable feel)

- [x] Filters: urgency, status, time window (mine deferred — no assignee field yet)
- [x] Keyboard: confirm next Critical (`C`)
- [x] Sound/visual pulse for new Critical (optional toggle — quiet ED nights)
- [x] Empty states, offline banner if API/WS down
- [x] Mobile-usable nurse tablet layout (queue + review); desktop for audit/admin



#### B0.6 India production deployment

- [ ] Host in **India region** (e.g. Mumbai): app, Postgres, Redis *(runbook ready — provision when cloud account ready)*
- [ ] Automated backups (daily + PITR if available); restore drill once
- [ ] Structured logging; error tracking (Sentry or equivalent)
- [ ] Staging env + prod env; no prod credentials on laptops in plaintext long-term
- [x] Uptime target for pilot: 99% during ward hours *(documented in india-deploy.md)*
- [x] Deploy gate checklist: [`docs/india-deploy.md`](./india-deploy.md)



#### B0.7 Compliance pack (lightweight but real)

- [x] DPDP-oriented privacy notice + hospital **Data Processing Agreement** template
- [x] Data retention policy (e.g. pilot 90 days default; configurable)
- [x] Patient data deletion request runbook (admin action)
- [x] Incident response one-pager (who to call, 72h internal)
- [x] Subprocessor list (Gemini/Google, host, email)
- [x] Document: de-ID before LLM; what still may leave India region if Gemini is foreign — **get legal eyes**
- [x] Clinical advisor review of claims language (CDS, not diagnosis) *(draft in claims-language.md — advisor sign-off pending)*



#### B0.8 Commercial / GTM assets

- Commercial license / Order Form + SaaS Terms (lawyer)
- [x] Landing pricing → **INR** tiers; remove or footnote USD
- [x] Pilot success criteria one-pager (from `business.md`)
- [x] Security one-pager for hospital IT (auth, encryption, residency, audit)



### B1. Should-have features (finish before or during first pilot if capacity)



#### B1.1 Shift & handoff report

- [x] End-of-shift CSV: open Pending Review, Critical backlog, overrides this shift
- [ ] NABH-friendly audit export (date range) — Audit page CSV already covers loaded rows



#### B1.2 Critical escalation notify

- [x] Optional webhook + email stub when urgency=Critical and unacked > N minutes (WhatsApp later)
- [x] Nurse must still confirm in-app (notify ≠ diagnose)



#### B1.3 Intake templates (India ED)

- [x] Quick chips: chest pain, fever, trauma, breathlessness, abdominal pain, pregnancy-related, snake bite, etc.
- [x] Prefills structured hints; still free-text capable



#### B1.4 Urgency protocol mapping (config)

- [x] Map Critical/High/Medium/Low → site labels (e.g. ESI-like or local color codes) **without claiming ESI certification**
- [x] Admin-configurable display names



#### B1.5 Model monitoring basics

- [x] Log Gemini latency, parse failures, fallback-to-mock rate
- [x] Alert if fallback rate spikes (silent Medium defaults are dangerous)



#### B1.6 Consent / purpose logging (org-level)

- [x] Record that site confirmed patients are processed under hospital notice for triage ops
- [x] Not a full consent UX in v1 unless advisor requires it



### B2. Explicitly defer (do not build in Phase B)


| Feature                                         | Why defer                                         |
| ----------------------------------------------- | ------------------------------------------------- |
| Full EHR / HL7 / FHIR bidirectional sync        | Wait for paying demand                            |
| Enterprise SSO (SAML/OIDC)                      | Enterprise tier; Week 0 IT can use local accounts |
| Patient-facing app / queue tickets for patients | Different product                                 |
| Autonomous triage / no clinician confirm        | Safety + regulatory suicide                       |
| Billing/Stripe automation                       | Invoice pilots manually                           |
| Multi-language beyond EN/Hindi                  | After pilot demand                                |
| ABDM / ABHA deep integration                    | Strategic later; not pilot-critical               |
| ClinicalBERT training pipeline polish           | Nice; not sales-blocking if Gemini path works     |
| Marketplace / multi-hospital self-serve signup  | Founder-led sales first                           |


---



## 5. Feature backlog detail (prioritized)



### P0 — Ship in Phase A–B (required to sell)

1. Real auth + sessions + ProtectedRoute
2. RBAC (`intake` / `nurse` / `physician` / `admin`)
3. Multi-tenant `org_id` isolation
4. Server-side audit actor
5. Upload containment + rate limits + size caps
6. Review state machine + enum validation
7. Authenticated WS + CORS allowlist + TLS
8. Metrics dashboard + CSV export
9. Hindi + English intake path
10. Safety chrome + Completed immutability
11. India-region deploy + backups
12. DPA + commercial terms + INR pricing page



### P1 — During first pilot / immediately after

1. Shift handoff report
2. Critical escalation notify (WhatsApp/SMS)
3. India ED intake templates
4. Local urgency display mapping
5. Model fallback monitoring + alerts
6. Admin data export / delete for DPDP requests
7. Tablet-optimized queue review flow
8. Weekly pilot email digest (metrics)



### P2 — Sellable scale (Months 4–7)

1. Multi-site org hierarchy (one hospital group, many EDs)
2. SSO (Google Workspace / Azure AD) when IT demands
3. Read-only FHIR/ADT ingest **or** CSV/HL7 dump import — only if partner asks
4. Role: nursing supervisor dashboard (override patterns)
5. Training mode (synthetic cases, no PHI) for onboarding
6. SLA status page for enterprise conversations
7. Annual invoicing + basic billing portal



### P3 — Platform / VC expansion story (post-raise or late)

1. ABDM/ABHA alignment exploration
2. Regional languages (Tamil, Telugu, Bengali) by demand
3. Protocol library co-built with clinical advisors
4. Benchmarking across anonymized sites (opt-in)
5. On-prem / VPC private deploy for large chains

---



## 6. Phase C — India GTM & supervised pilot (Weeks 6–14)



### C1. Ideal first customer profile

- Private hospital or urgent-care chain, **50–200 beds**, busy walk-in/ED
- NABH interest or accreditation pressure helps (audit story)
- Champion: ED HoD, CNO, or clinical ops / innovation lead
- IT can allow cloud SaaS with DPA (or VPN-restricted access)



### C2. Outreach machine (founder-led)

- [ ] List 50 targets (warm intros first: alumni, doctors you know, accelerators, hospital groups)
- [ ] Script: 15-min demo → problem interview → pilot proposal
- [ ] Goal: **20 conversations → 5 demos → 1–2 pilot agreements** by Week 12
- [ ] Do **not** lead with “AI replaces triage”; lead with structured intake + live queue + audit



### C3. Pilot design (from `business.md`, localized)

**Included**

- Deployment + config (IST, roles, templates)
- Clinician onboarding (1 hour nurse + 30 min physician)
- 2-week evaluation (or 4 weeks if IT delay)
- Weekly 30-min feedback with charge nurse
- Metrics export

**Success measures (pre-agree in writing)**

1. Median time intake → structured summary
2. % cases processed successfully
3. Confirm vs override rates
4. Down-triage rationale completion
5. Clinician usefulness (1–5) mid + end
6. Uptime during pilot ward hours

**Rules**

- Supervised; non-critical pathway first if hospital requires  
- No marketing “accuracy %” without clinician review design  
- Real PHI only after Phase A+B0.6/B0.7 signed



### C4. Commercial motion

- Design partner #1: ₹0–25k or free against LOI + case study rights  
- Next pilots: **₹39,999**  
- Convert: **₹99,000/month** or annual (~₹10L) with 10× monthly prepaid discount  
- Custom higher if buyer volunteers value-based price post-metrics



### C5. Clinical & regulatory advisors (parallel)

- [ ] Part-time clinical advisor (EM/urgent care India)  
- [ ] 1–2 consults: DPDP + CDSCO positioning (CDS with human gate, not autonomous device claims)  
- [ ] Update all public copy to match advisor language  

---



## 7. Phase D — Sellable polish & revenue (Months 4–7)



### D1. Product

- Fix top 10 pilot pain points (expect: latency, Hindi STT, duplicate intake, filter UX)
- Ship P1 features that nurses asked for twice
- Training mode + better onboarding checklist
- Reliability: queue reconnect, idempotent intake, dead-letter for failed AI jobs



### D2. Sales

- Case study (anonymized metrics + quote)
- Security questionnaire answers (standard Indian hospital IT list)
- Second and third site; prefer **same hospital group** (expansion story)



### D3. Operations

- Support channel (WhatsApp business or email SLA: next business day for pilot; 8×5 for paid)
- Runbooks: outage, key rotation, restore
- Cost control: Gemini budget alerts per org



### D4. Pricing evolution

- If pilot shows clear ≥ ₹2–3L/month capacity value → introduce **High-volume ED** at ₹1.75–2.5L/mo  
- Keep entry site plan for smaller desks

---



## 8. Phase E — VC readiness (Months 6–9)



### E1. What to raise on (signals)


| Signal     | Evidence                                       |
| ---------- | ---------------------------------------------- |
| Problem    | 10+ clinician interviews documented            |
| Product    | Pilot metrics + retention of nurse usage       |
| Security   | Auth/tenancy/residency/DPA; audit re-run clean |
| Business   | Paid pilot and/or site conversion; INR ACV     |
| Regulatory | Written CDS positioning + advisor note         |
| Team       | Founder + clinical advisor (+ eng hire plan)   |




### E2. Data room checklist

- [ ] Cap table / IP assignment to company (if incorporating)
- [ ] Commercial license template; PolyForm policy for public repo
- [ ] Architecture + security audit summary + remediations
- [ ] Pilot report + raw metrics export
- [ ] Pipeline of hospitals
- [ ] 18-month use of funds: eng (auth/tenancy/reliability), clinical, founder GTM
- [ ] Unit economics: Gemini COGS per case, gross margin hypothesis



### E3. Pitch narrative (one line)

“Auditable AI-assisted triage for Indian acute care — structured intake, live queue, clinician confirmation — sold site-by-site with measured pilot proof.”

**Not:** “Autonomous ER AI” / “replaces nurses” / “reduces mortality.”

### E4. Investor targets (India-first)

- Healthcare / SaaS seed funds comfortable with regulated adjacency
- Angels: hospital operators, health-tech founders
- Avoid promising US HIPAA expansion in seed deck as Year-1 mandate

---



## 9. Week-by-week (first 12 weeks)


| Week | Engineering                                                 | Product/Compliance               | GTM                             |
| ---- | ----------------------------------------------------------- | -------------------------------- | ------------------------------- |
| 1    | User/session auth; protect APIs; SPA guards                 | Draft DPA outline                | Target list of 50               |
| 2    | RBAC; org_id; fix review identity + enums + Completed lock  | Commercial terms lawyer kickoff  | 10 outreach msgs                |
| 3    | Upload harden; rate limits; WS auth; CORS; regression tests | Security one-pager               | 10 more outreach                |
| 4    | Metrics pipeline + export UI                                | Hindi spike (STT quality)        | 5 discovery calls               |
| 5    | Admin invites; queue polish; safety chrome                  | India cloud staging up           | 3 demos                         |
| 6    | Hindi+EN UI; intake templates                               | Prod India deploy + backup drill | Pilot proposal v1               |
| 7    | Escalation notify (basic); model monitoring                 | Privacy notice + subprocessors   | Negotiate design partner        |
| 8    | Bug bash; load test intake; docs for IT                     | Sign DPA; INR landing prices     | LOI / pilot schedule            |
| 9–10 | Pilot support; hotfixes                                     | Weekly metrics review            | Pilot Week 1–2 live             |
| 11   | Pilot feature asks (only P0/P1)                             | Mid-pilot usefulness survey      |                                 |
| 12   | Harden from pilot                                           | Pilot report export              | Convert conversation / go-no-go |


---



## 10. Team & ownership (lean)


| Seat                  | Responsibility                                                   |
| --------------------- | ---------------------------------------------------------------- |
| Founder / eng         | Phases A–B build, deploy, demos                                  |
| Clinical advisor (PT) | Protocol language, pilot design, claims review                   |
| Legal (fractional)    | DPA, SaaS terms, commercial license, CDSCO/DPDP note             |
| Later hire #1         | Full-stack eng (reliability + features) after paid pilot or seed |


No sales hire until founder closes first paid conversion or seed.

---



## 11. Budget sketch (bootstrap, indicative INR)


| Item                             | Rough                    |
| -------------------------------- | ------------------------ |
| India cloud (app+DB+Redis) early | ₹8–25k/mo                |
| Gemini API during pilots         | meter; set ₹ cap alerts  |
| Domain, email, error tracking    | ₹2–5k/mo                 |
| Legal templates + consults       | ₹1–3L one-time early     |
| Clinical advisor                 | equity and/or ₹ retainer |
| WhatsApp Business / SMS          | usage-based              |


Track **COGS per case** from Day 1 of pilot.

---



## 12. Definition of “polished sellable version”

A version you can put in front of a hospital IT + CNO without apology:

1. Login works; roles work; data cannot leak across orgs.
2. PHI only on authenticated channels; uploads safe.
3. Nurses can run a shift on tablet: intake → queue → confirm.
4. Hindi+English does not embarrass you on voice notes.
5. Admin exports metrics for the weekly pilot meeting.
6. India hosting + DPA + commercial contract ready to sign.
7. Landing speaks INR and CDS-safe language.
8. Audit log is legally meaningful (server identity, immutable completed).

Everything else is roadmap.

---



## 13. Immediate next actions (this week)

1. Incorporate or confirm IP ownership vehicle for commercial contracts.
2. Start Phase A1–A2 (auth + RBAC + strip client clinician_id).
3. Book clinical advisor coffee + lawyer for DPA/SaaS skeleton.
4. Build the 50-hospital outreach list.
5. Spike Hindi STT quality on 20 real sample notes (synthetic if needed).
6. Replace landing pricing with INR hypothesis.
7. Re-open security audit checklist as an eng ticket board (S1–S6).

---



## 14. Document control


| Version | Date       | Notes                                                                    |
| ------- | ---------- | ------------------------------------------------------------------------ |
| 1.0     | 2026-08-06 | Initial detailed plan from business.md + audit run-3 + India/VC strategy |


Update this doc after the first pilot with actual metrics and a revised P1 backlog.