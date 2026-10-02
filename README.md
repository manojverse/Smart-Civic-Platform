# CIVICSENSE: Smart Municipal Grievance Redressal & Intelligent Civic Governance Platform

> **Final-Year Computer Science & Engineering (CSE) Capstone Project**  
> *Academic Year: 2025–2026*  
> *Domain: Full-Stack Web Development, AI / NLP, Geographic Information Systems (GIS), Municipal GovTech*

---

## 🏛️ 1. Project Overview & Problem Statement

### 1.1 Problem Statement
In urban municipalities across developing and metropolitan areas, civic challenges such as **hazardous potholes, uncollected garbage heaps, broken streetlights, water pipeline bursts, sewage overflows, damaged public property, and traffic disruptions** severely degrade public life and citizen safety. 

Existing reporting channels suffer from systemic friction:
- **Bureaucratic Black Holes:** Citizens report issues via phone helplines or paper forms without knowing which department is responsible or who is assigned.
- **Lack of Transparency & Auditability:** Citizens receive no confirmation of when an issue was reviewed, who inspected it, or when it will be fixed.
- **Authority Overload & Duplicate Fatigue:** Municipal ward offices receive hundreds of identical complaints for the same road crater or transformer spark, wasting critical engineering hours on manual filtering.
- **Misclassification & Delayed SLA Responses:** Hazardous life-safety defects (e.g., exposed electrical wiring, high-speed road craters) are handled with standard low-priority queues instead of automated emergency dispatch.

### 1.2 The CivicSense Solution
**CivicSense** is an integrated, end-to-end smart municipal governance and civic complaint tracking platform designed to connect **Citizens, Field Crew Officers, Departmental Engineers, and Municipal Commissioners** into a single transparent, real-time ecosystem.

CivicSense bridges the civic divide with:
1. **Evidence-Based Reporting:** Visual photographic evidence combined with browser GPS geotagging on OpenStreetMap.
2. **AI-Assisted Triage & Priority Scoring:** Dual-layer NLP triage (powered by Google Gemini with deterministic fallback) that evaluates severity, hazard risk, target department, confidence, and SLA deadlines.
3. **Geospatial Deduplication:** Automatic Haversine proximity scanning that detects duplicate reports within 400m and allows neighbors to "Upvote / Support Existing" rather than cluttering queues.
4. **End-to-End Audit Trail:** Transparent 7-stage lifecycle tracking (*Submitted → Under Review → Verified → Assigned → In Progress → Resolved → Closed / Reopened*) with timestamped history.
5. **Municipal Command Dashboard:** Departmental assignment, field officer dispatch with badge numbers, confidential internal notes, and photographic resolution proof upload.
6. **Civic GIS Map & Real-time Analytics:** Interactive ward heatmap, SLA compliance ratios, departmental clearance rates, and citizen satisfaction ratings.

---

## 🏗️ 2. System Architecture

```
                                  [ CITIZEN / USER ]
                                           │
                        ┌──────────────────┴──────────────────┐
                        ▼                                     ▼
                [ Issue Reporting ]                   [ My Complaints ]
         (Photos, GPS Geotag, Details)           (Status, Timeline, Feedback)
                        │                                     ▲
                        ▼                                     │
           ┌─────────────────────────┐                        │
           │  Geospatial Deduplication│                        │
           │ (Haversine 400m Buffer) │                        │
           └────────────┬────────────┘                        │
                        ▼                                     │
           ┌─────────────────────────┐                        │
           │   AI Classification     │                        │
           │ (Gemini API + Rule NLP) ├────────────────┐       │
           └────────────┬────────────┘                │       │
                        │ Category, Priority, SLA     │       │
                        ▼                             ▼       │
           ┌─────────────────────────┐       ┌────────────────┴──────┐
           │ Central Civic Context   │◄─────►│ Real-time Event Layer │
           │ & LocalStorage State    │       │ (In-App Toast Alerts) │
           └────────────┬────────────┘       └───────────────────────┘
                        ▲
                        │
    ┌───────────────────┼────────────────────────┐
    ▼                   ▼                        ▼
[ Authority Portal ]  [ GIS Map Explorer ]    [ Analytics Engine ]
(Assignment, SLA,    (OpenStreetMap /         (KPIs, Ward Metrics,
 Internal Notes)     Leaflet Hotspots)        SLA Compliance SVG)
```

---

## ⚡ 3. Complete End-to-End Workflow Demonstration

CivicSense is designed for an immediate, flawless viva and capstone demo without third-party billing setup:

1. **Citizen Submission:**
   - Citizen **Deepika Rao** selects the **Potholes** category.
   - Enters title *"Massive hazardous crater on 100ft Road"* and uploads a photo.
   - Clicks **Use My Live GPS** to automatically lock lat/long coordinates (`12.9654, 77.6432`) in **Ward 112 - Domlur**.
   - Clicks **Run AI Analysis**: Gemini evaluates hazard severity, sets priority to **P1-Critical**, department to **Public Works Department (PWD)**, and calculates a **12-hour resolution SLA**.
   - Submits report: Receives grievance ID `CIVIC-2026-XXXX` with an instant printable receipt.

2. **Municipal Notification & Authority Review:**
   - An in-app toast and audio-visual badge notifies central municipal staff: *"New Complaint Registered: CIVIC-2026-XXXX"*.
   - Municipal Commissioner or PWD Officer switches persona via the 1-click **Role Switcher**.
   - In the **Authority Portal**, the officer filters by *PWD* and *P1-Critical*.
   - Officer reviews the AI risk analysis, advances status to **Verified**, and assigns Field Officer **Rajesh Kumar (Badge BBMP-FO-9412)**.
   - Adds internal dispatch remark: *"Repair truck deployed with cold-mix asphalt"*.

3. **Field Repair & Photographic Resolution:**
   - Field Officer marks status as **In Progress**, then **Resolved**.
   - Uploads after-repair photographic proof showing the sealed pothole.
   - Adds completion note: *"Crater leveled with bituminous concrete. Surface cured."*

4. **Citizen Audit, Feedback & Rating:**
   - Citizen tracking page updates instantly with the resolution timestamp, officer badge, and proof photo.
   - Citizen awards a **5-star rating** with remark *"Repaired in under 8 hours! Excellent response."*
   - If the repair was incomplete, citizen can click **Reopen Ticket** with photographic justification.

5. **Analytics & Ward Scorecards Update:**
   - The **Civic Analytics Dashboard** updates the Ward 112 SLA compliance score, PWD resolution throughput, and citizen satisfaction index in real time.

---

## 🛠️ 4. Technology Stack & Design Decisions

| Subsystem | Technology Used | Architectural Justification |
| :--- | :--- | :--- |
| **Frontend UI** | **React 18, TypeScript, Tailwind CSS** | Clean component architecture, strict type safety, zero runtime style leaks, high performance. |
| **Icons & Micro-Interactions** | **Lucide-react** | Cohesive, accessible, modern municipal design system. |
| **Mapping & GIS** | **Leaflet, OpenStreetMap** | 100% Free and open-source GIS mapping; no paid Google Maps API billing or rate limits required. |
| **Backend & Middleware** | **Node.js, Express, Vite** | Unified server running on port 3000 serving client SPA and `/api/*` proxies. |
| **AI Triage Layer** | **@google/genai (Gemini 2.5 Flash) + Deterministic NLP Engine** | Dual-mode: uses real Gemini AI when API key is present; seamlessly falls back to offline rule-based NLP so the app always works. |
| **State & Persistence** | **React Context API + LocalStorage** | Durable client-side offline-first persistence; state survives browser reloads; includes 1-click "Reset Seed Data". |

---

## 📂 5. Project Directory Structure

```
civicsense/
├── .env.example                     # Sample environment variable definitions
├── metadata.json                    # Application metadata & permissions
├── package.json                     # Scripts & dependencies
├── server.ts                        # Express server with Vite middleware & AI proxy
├── index.html                       # HTML5 entry with CivicSense branding
├── src/
│   ├── main.tsx                     # React client bootstrap
│   ├── App.tsx                      # Main app shell & router
│   ├── index.css                    # Tailwind CSS configuration & Leaflet fixes
│   ├── types.ts                     # Core domain TypeScript interfaces & enums
│   ├── data/
│   │   └── seedData.ts              # Realistic municipal complaints, wards & staff
│   ├── services/
│   │   └── aiClassifier.ts          # Dual-engine AI triage & duplicate detector
│   ├── context/
│   │   └── CivicContext.tsx         # Central state manager, SLA timers & toasts
│   └── components/
│       ├── Navbar.tsx               # Header, persona switcher & notification drawer
│       ├── CivicHome.tsx            # Municipal portal homepage & overview
│       ├── ReportIssue.tsx          # Multi-step complaint reporting & receipt
│       ├── MyComplaints.tsx         # Citizen grievance tracker & karma score
│       ├── ComplaintTracker.tsx     # 7-stage lifecycle audit timeline & feedback
│       ├── AuthorityDashboard.tsx   # Admin command portal, officer assignment & SLA
│       ├── DepartmentManagement.tsx # Municipal wings & field officer roster
│       ├── CivicMapView.tsx         # Interactive GIS map with hotspot toggles
│       ├── CivicAnalytics.tsx       # KPI cards, charts & ward scorecards
│       ├── CivicTips.tsx            # Emergency helplines (112, 1912, 1916) & handbook
│       ├── UserProfileModal.tsx     # Citizen/Staff profile & demo persona picker
│       └── LeafletMap.tsx           # Reusable OpenStreetMap Leaflet component
```

---

## 🚀 6. Installation & Local Development

### Prerequisites
- **Node.js**: v18.0 or higher
- **npm**: v9.0 or higher

### Steps to Run
1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/civicsense.git
   cd civicsense
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional):**
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key if you wish to use the live cloud model:
   ```env
   GEMINI_API_KEY="AIzaSy..."
   ```
   *(Note: If no key is configured, CivicSense automatically uses its built-in rule-based NLP classifier without failing!)*

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

5. **Build for Production:**
   ```bash
   npm run build
   npm start
   ```

---

## 🌐 7. Deployment Guide

### Deploying to Vercel
1. Push your project to a GitHub repository.
2. In the Vercel Dashboard, click **Add New** → **Project** and select your GitHub repository.
3. Configure Build Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `GEMINI_API_KEY` (Optional)
5. Click **Deploy**.

### Deploying to Google Cloud Run / Docker
CivicSense includes a production-ready Express server bundled with esbuild into `dist/server.cjs` and configured to bind to host `0.0.0.0` and port `3000`.

---

## 🎓 8. Final-Year Viva Presentation Q&A Reference

**Q1: How does CivicSense handle duplicate complaints?**  
*Answer:* CivicSense executes the **Haversine Proximity Algorithm** on geographic coordinates whenever an issue is drafted. If an active complaint in the same or matching category exists within **400 meters**, CivicSense flags the duplicate and prompts the citizen to upvote/support the existing report. This aggregates community urgency while preventing administrative queue flooding.

**Q2: What happens if the Gemini AI service is offline or rate-limited?**  
*Answer:* CivicSense employs a **Graceful Degradation Pattern**. The frontend calls `/api/ai/classify`. If the network request fails, times out, or no API key is supplied, the service immediately routes the prompt through the deterministic rule-based NLP classifier (`classifyComplaintOffline`). This guarantees 100% uptime during demonstrations.

**Q3: How is data persisted in this prototype?**  
*Answer:* The application uses an event-driven `CivicContext` synchronized with `localStorage`. All status changes, timeline audit records, newly submitted complaints, officer assignments, and feedback ratings persist across page reloads. A **Reset Demo Data** button is provided in the header for resetting to initial seed conditions.

---

## 📄 9. License & Academic Attribution
Developed as an academic capstone project in Computer Science and Engineering. Open-source under the **Apache 2.0 License**.
#   S m a r t - C i v i c - P l a t f o r m  
 #   S m a r t - C i v i c - P l a t f o r m  
 