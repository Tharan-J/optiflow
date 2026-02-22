# OptiFlow - Intelligent Eye Hospital Workflow System

OptiFlow is a Next.js-based intelligent clinical workflow and patient tracking system specifically designed for high-volume eye hospitals. It eliminates physical queues, optimizes patient routing across different clinical zones (Refraction, Dilation, Consultation), and provides real-time visibility for managers, doctors, and patients.

## 🌟 Key Features

### 1. 🏥 Zone-Based Clinical Workflows
- **Refraction Template:** Ultra-fast data entry with 90% dropdowns for Visual Acuity, Sphere, Cylinder, Axis, and IOP. Auto-saves drafts as staff type.
- **Dilation Template:** Interactive drug administration logging. Auto-calculates "Ready for Exam" times (+20 mins) with live countdown timers and status banners.
- **Consultation Template:** Hybrid model featuring History of Presenting Illness (HPI), diagnosis chips, an interactive **SVG Eye Diagram** drawing tool, and a dynamic **Prescription Builder**.

### 2. 🧠 Intelligent Routing & Flow Control
- **Floor Manager Dashboard:** Live tracking of all patients mapped to specific zones. Identifies bottlenecks in real-time.
- **Overdue Alerts:** Patients waiting >30 minutes trigger pulsing amber alerts across the system to ensure no patient is forgotten.
- **Manual Skip/Reroute:** Allows floor managers to manually skip non-essential zones (e.g., skip Dilation) to balance queue loads dynamically.

### 3. 👨‍⚕️ Doctor Queue & Workspace
- **Smart Queue:** Doctors see their waiting patients prioritized. High-complexity patients are flagged with distinct badges. Allergy warnings are visible instantly.
- **Tabbed Workspace:** Seamlessly switch between the current Consultation Template, Visit History (timeline of today's journey), and Vitals (Refraction/Dilation findings).

### 4. 📱 Mobile-First Patient Live Tracker (`/track/[tokenId]`)
- **No-Login Access:** Patients scan a QR code to view their secure, token-based link (e.g., `/track/A104`). No app download or password required.
- **Pizza Tracker UI:** A visual stepper showing completed, current, and upcoming zones.
- **Live Predictor:** Tells the patient their exact queue position ("2 patients ahead") and estimated call-in time based on current floor velocity.
- **Feedback Nudge:** If a patient is stuck in Dilation for >40 minutes, a button appears allowing them to silently notify the floor manager.
- **Interactive Floor Map:** A popup SVG schematic of the hospital floor for easy wayfinding.

### 5. 🏗️ Master Patient Sidebar
- A globally accessible slide-out panel that provides a holistic view of the patient at any point in time. Shows demographics, clinical complexity, allergies (in high-contrast red), medical history, and summaries of all zone data collected so far.

---

## 🏗️ Architecture & Flow

### Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS (with custom Clinical Light theme using `oklch` colors)
- **UI Components:** Shadcn UI + Lucide React (Icons) + Recharts (Data Visualization)
- **State Management:** Zustand (Client-side localized store with `sessionStorage` persistence for drafts)
- **Forms & Validation:** React Hook Form + Zod

### Data Flow & State Management (Zustand)
Because OptiFlow is designed to be highly responsive, it utilizes a powerful client-side Zustand store (`lib/store.ts`) mapped to a localized data model. 
1. **Patient Model:** Every patient has a defined `journey` (array of zones) and a `timeline` (logs of entered/completed times).
2. **Draft Persistence:** Forms (Refraction, Dilation) dispatch `saveDraft` actions on every keystroke. This prevents data loss if a clinician accidentally refreshes the page.
3. **Zone Handover:** Clicking "Save & Move" updates the patient's `currentDepartment` and pushes a new timestamp to the `timeline`, instantly making them appear in the next zone's queue.

### Role-Based Access Control (RBAC)
Middleware (`proxy.ts`) protects all `/dashboard/*` routes. Authentication is mocked via `lib/auth-store.ts`.
- **MANAGER:** Global access to all zones and AI analytics.
- **FLOOR_LEAD:** Access to Floor Manager view and Patient Scanner.
- **DOCTOR:** Access to Doctor Dashboards and Clinical Templates.
- **STAFF:** Access to Registration and Triage.

*(Note: `/track/[tokenId]` is explicitly excluded from auth to remain public for patients).*

---

## 📂 File Structure

```text
optiflow/
├── app/
│   ├── auth/login/page.tsx      # Role-based login portal
│   ├── dashboard/
│   │   ├── doctor/page.tsx      # Doctor workspace & queue
│   │   ├── floor/page.tsx       # Floor Manager control tower
│   │   ├── intelligence/        # AI & Analytics overview
│   │   ├── manager/page.tsx     # Global hospital stats
│   │   └── registration/        # Patient intake & triage
│   ├── track/
│   │   └── [tokenId]/page.tsx   # Mobile-first public patient tracker
│   ├── layout.tsx               # Root layout & fonts
│   ├── globals.css              # Tailwind config & clinical theme colors
│   └── page.tsx                 # Landing page
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx   # Enforces RBAC wrapper
│   ├── clinical/
│   │   ├── ConsultationTemplate.tsx # HPI, Eye Drawing, Rx Builder
│   │   ├── DilationTemplate.tsx     # Timers & Drug administration
│   │   ├── RefractionTemplate.tsx   # Fast-fill vision data
│   │   └── MasterPatientSidebar.tsx # Global slide-out patient profile
│   ├── shared/
│   │   ├── Sidebar.tsx          # Main navigation & Tracker quick-launch
│   │   └── Topbar.tsx           # Global search and user controls
│   └── ui/                      # Standard Shadcn UI components
├── lib/
│   ├── store.ts                 # Zustand store (Patients, Zones, Drafts)
│   ├── auth-store.ts            # Zustand store (User auth context)
│   └── utils.ts                 # Tailwind merge utilities
├── types/
│   └── auth.ts                  # TS Definitions for roles and permissions
└── proxy.ts                     # Next.js Middleware (Auth routing block)
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **Node.js** (v18+ recommended) and `npm` installed.

### 2. Installation
Clone the repository, then install dependencies:
```bash
npm install
```

### 3. Start Development Server
Run the Next.js development server:
```bash
npm run dev
```

### 4. Access the Application
The application will be available at `http://localhost:3000`.

### 5. Using the System (Testing Accounts)
When you navigate to `/auth/login`, select a role from the dropdown. The mock credentials will automatically fill in:
- **Manager:** Has access to the Global Dashboard and Flow Intelligence.
- **Floor Lead:** Has access to the Floor Control page (Zone management).
- **Doctor:** Has access to the Doctor Queue and Clinical Templates.

### 6. Testing the Patient Tracker
To test the public mobile view:
1. Log in as any role.
2. In the bottom left of the Sidebar (under "Patient Tracker"), type a token like `A104` or `B902`.
3. Press Enter. It will directly open the public `/track/[tokenId]` page.
4. Alternatively, open a new Incognito window and go to `http://localhost:3000/track/A104` directly.
