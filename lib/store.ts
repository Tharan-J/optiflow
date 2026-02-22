import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ─── Enums ─────────────────────────────────────────────────────────────────────
export type Role = 'manager' | 'floor_manager' | 'doctor' | 'registration' | 'patient';
export type Department = 'Registration' | 'Refraction' | 'Dilation' | 'Consultation' | 'Tests' | 'Counseling' | 'Pharmacy';
export type PatientStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'REROUTED';

// ─── Clinical Timeline Entry ───────────────────────────────────────────────────
export interface TimelineEntry {
  department: Department;
  status: 'done' | 'current' | 'next' | 'skipped';
  completedAt?: string;       // ISO timestamp
  enteredAt?: string;
  summary?: string;           // e.g. "VA: 6/6 | IOP: 14"
  clinician?: string;
}

// ─── Clinical Zone Data ────────────────────────────────────────────────────────
export interface RefractionData {
  vaRight: string;
  vaLeft: string;
  sphereRight: string;
  sphereLeft: string;
  cylinderRight: string;
  cylinderLeft: string;
  axisRight: string;
  axisLeft: string;
  iopRight: string;
  iopLeft: string;
  notes: string;
  savedAt?: string;
}

export interface DilationData {
  drugUsed: 'Tropicamide' | 'Phenylephrine' | 'Tropicamide+Phenylephrine' | '';
  dropTime: string;
  readyTime: string;    // Auto +20 min
  eyeTreated: 'OD' | 'OS' | 'OU';
  notes: string;
  savedAt?: string;
}

export interface PrescriptionItem {
  id: string;
  medicine: string;
  dosage: number;
  unit: 'tab' | 'drop' | 'mg';
  frequency: string[];   // ['Morning', 'Night']
  duration: string;
  route: 'oral' | 'topical' | 'injection';
}

export interface ConsultationData {
  hpi: string;          // History of Presenting Illness
  diagnosis: string;
  diagnosisCode: string;
  eyeFindings: string;  // JSON SVG annotations
  prescription: PrescriptionItem[];
  followUpDays: number;
  referral: string;
  notes: string;
  savedAt?: string;
}

export interface ClinicalDraft {
  refraction?: Partial<RefractionData>;
  dilation?: Partial<DilationData>;
  consultation?: Partial<ConsultationData>;
}

// ─── Patient ───────────────────────────────────────────────────────────────────
export interface Patient {
  id: string;
  name: string;
  token: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  phone: string;
  symptoms: string[];
  complexityScore: number;
  currentDepartment: Department;
  status: PatientStatus;
  estimatedWaitTime: number;
  history: string[];           // Medical history
  allergies: string[];         // Highlighted in red
  enteredZoneAt?: string;      // ISO – used to detect >30 min alerts
  journey: Department[];       // Ordered path e.g. ['Registration','Refraction','Dilation','Consultation']
  timeline: TimelineEntry[];
  // Zone clinical records
  refractionData?: RefractionData;
  dilationData?: DilationData;
  consultationData?: ConsultationData;
  // Draft state per patient
  draft?: ClinicalDraft;
}

// ─── Store Interface ────────────────────────────────────────────────────────────
interface HospitalState {
  patients: Patient[];
  currentUserRole: Role;
  hospitalCapacity: number;
  selectedPatientId: string | null;

  addPatient: (patient: Patient) => void;
  updatePatientStatus: (id: string, department: Department, status: PatientStatus) => void;
  movePatientToNextZone: (id: string) => void;
  reroutePatient: (id: string, skipDept: Department) => void;
  setUserRole: (role: Role) => void;
  getDepartmentQueue: (dept: Department) => Patient[];
  selectPatient: (id: string | null) => void;
  saveRefractionData: (patientId: string, data: RefractionData) => void;
  saveDilationData: (patientId: string, data: DilationData) => void;
  saveConsultationData: (patientId: string, data: ConsultationData) => void;
  saveDraft: (patientId: string, zone: keyof ClinicalDraft, data: object) => void;
  getPatientById: (id: string) => Patient | undefined;
}

// ─── Default patient journey ───────────────────────────────────────────────────
const DEFAULT_JOURNEY: Department[] = ['Registration', 'Refraction', 'Dilation', 'Consultation'];
const HIGH_COMPLEXITY_JOURNEY: Department[] = ['Registration', 'Refraction', 'Dilation', 'Consultation', 'Tests'];

function makeTimeline(journey: Department[], currentDept: Department): TimelineEntry[] {
  const currentIdx = journey.indexOf(currentDept);
  return journey.map((dept, i) => ({
    department: dept,
    status: i < currentIdx ? 'done' : i === currentIdx ? 'current' : 'next',
    completedAt: i < currentIdx ? new Date(Date.now() - (currentIdx - i) * 25 * 60000).toISOString() : undefined,
    enteredAt: i === currentIdx ? new Date(Date.now() - 10 * 60000).toISOString() : undefined,
    summary: i < currentIdx ? mockSummary(dept) : undefined,
  }));
}

function mockSummary(dept: Department): string {
  const summaries: Partial<Record<Department, string>> = {
    Registration: 'Registered at 09:00 AM',
    Refraction: 'VA: 6/9 | IOP: 14 | Done',
    Dilation: 'Tropicamide 1% | Drop at 09:30',
    Consultation: 'Diagnosis: Myopia | Rx issued',
  };
  return summaries[dept] || 'Completed';
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const now = new Date().toISOString();
const minus = (mins: number) => new Date(Date.now() - mins * 60000).toISOString();

const MOCK_PATIENTS: Patient[] = [
  {
    id: 'p1', name: 'John Doe', token: 'A102', age: 45, gender: 'M', phone: '+91 98765 43210',
    symptoms: ['Blurry vision', 'Headache'],
    complexityScore: 4,
    currentDepartment: 'Refraction',
    status: 'WAITING',
    estimatedWaitTime: 12,
    history: ['Hypertension'],
    allergies: [],
    enteredZoneAt: minus(35),
    journey: DEFAULT_JOURNEY,
    timeline: makeTimeline(DEFAULT_JOURNEY, 'Refraction'),
  },
  {
    id: 'p2', name: 'Sarah Smith', token: 'A103', age: 62, gender: 'F', phone: '+91 87654 32109',
    symptoms: ['Cataract review', 'Reduced night vision'],
    complexityScore: 7,
    currentDepartment: 'Consultation',
    status: 'IN_PROGRESS',
    estimatedWaitTime: 0,
    history: ['Diabetes Type 2', 'Hypertension'],
    allergies: ['Penicillin'],
    enteredZoneAt: minus(15),
    journey: HIGH_COMPLEXITY_JOURNEY,
    timeline: makeTimeline(HIGH_COMPLEXITY_JOURNEY, 'Consultation'),
    refractionData: {
      vaRight: '6/9', vaLeft: '6/12', sphereRight: '-1.25', sphereLeft: '-1.50',
      cylinderRight: '-0.50', cylinderLeft: '-0.75', axisRight: '90', axisLeft: '85',
      iopRight: '16', iopLeft: '17', notes: 'Mild myopia OU',
      savedAt: minus(45),
    },
    dilationData: {
      drugUsed: 'Tropicamide', dropTime: minus(30), readyTime: minus(10),
      eyeTreated: 'OU', notes: '', savedAt: minus(30),
    },
  },
  {
    id: 'p3', name: 'Michael Chen', token: 'A104', age: 28, gender: 'M', phone: '+91 76543 21098',
    symptoms: ['Routine checkup'],
    complexityScore: 2,
    currentDepartment: 'Dilation',
    status: 'WAITING',
    estimatedWaitTime: 18,
    history: [],
    allergies: [],
    enteredZoneAt: minus(8),
    journey: DEFAULT_JOURNEY,
    timeline: makeTimeline(DEFAULT_JOURNEY, 'Dilation'),
    refractionData: {
      vaRight: '6/6', vaLeft: '6/6', sphereRight: '0.00', sphereLeft: '0.00',
      cylinderRight: '0.00', cylinderLeft: '0.00', axisRight: '0', axisLeft: '0',
      iopRight: '13', iopLeft: '14', notes: 'Normal vision',
      savedAt: minus(20),
    },
  },
  {
    id: 'p4', name: 'Elena Rodriguez', token: 'A105', age: 55, gender: 'F', phone: '+91 65432 10987',
    symptoms: ['Flashes of light', 'Floaters'],
    complexityScore: 9,
    currentDepartment: 'Refraction',
    status: 'WAITING',
    estimatedWaitTime: 25,
    history: ['Previous retinal tear', 'Myopia high'],
    allergies: ['Sulfa drugs', 'Aspirin'],
    enteredZoneAt: minus(5),
    journey: HIGH_COMPLEXITY_JOURNEY,
    timeline: makeTimeline(HIGH_COMPLEXITY_JOURNEY, 'Refraction'),
  },
  {
    id: 'p5', name: 'Ravi Shankar', token: 'A106', age: 38, gender: 'M', phone: '+91 54321 09876',
    symptoms: ['Dry eyes', 'Computer vision syndrome'],
    complexityScore: 3,
    currentDepartment: 'Consultation',
    status: 'WAITING',
    estimatedWaitTime: 10,
    history: [],
    allergies: [],
    enteredZoneAt: minus(20),
    journey: DEFAULT_JOURNEY,
    timeline: makeTimeline(DEFAULT_JOURNEY, 'Consultation'),
    refractionData: {
      vaRight: '6/6', vaLeft: '6/9', sphereRight: '0.25', sphereLeft: '0.50',
      cylinderRight: '0.00', cylinderLeft: '-0.25', axisRight: '0', axisLeft: '180',
      iopRight: '12', iopLeft: '13', notes: 'Mild hyperopia left eye',
      savedAt: minus(40),
    },
    dilationData: {
      drugUsed: 'Tropicamide', dropTime: minus(28), readyTime: minus(8),
      eyeTreated: 'OU', notes: '', savedAt: minus(28),
    },
  },
];

// ─── Store ─────────────────────────────────────────────────────────────────────
export const useStore = create<HospitalState>()(
  persist(
    (set, get) => ({
      patients: MOCK_PATIENTS,
      currentUserRole: 'manager',
      hospitalCapacity: 500,
      selectedPatientId: null,

      addPatient: (patient) => set((state) => ({ patients: [...state.patients, patient] })),

      updatePatientStatus: (id, department, status) => set((state) => ({
        patients: state.patients.map(p =>
          p.id === id
            ? {
                ...p,
                currentDepartment: department,
                status,
                enteredZoneAt: now,
                timeline: p.timeline.map(t => ({
                  ...t,
                  status: t.department === department ? 'current' :
                    t.status === 'done' ? 'done' : 'next',
                })),
              }
            : p
        ),
      })),

      movePatientToNextZone: (id) => set((state) => {
        const patient = state.patients.find(p => p.id === id);
        if (!patient) return state;
        const currentIdx = patient.journey.indexOf(patient.currentDepartment);
        const nextDept = patient.journey[currentIdx + 1];
        if (!nextDept) {
          // Mark fully completed
          return {
            patients: state.patients.map(p =>
              p.id === id ? { ...p, status: 'COMPLETED' } : p
            ),
          };
        }
        return {
          patients: state.patients.map(p =>
            p.id === id
              ? {
                  ...p,
                  currentDepartment: nextDept,
                  status: 'WAITING',
                  estimatedWaitTime: 15,
                  enteredZoneAt: new Date().toISOString(),
                  timeline: p.timeline.map(t => ({
                    ...t,
                    status:
                      t.department === p.currentDepartment
                        ? 'done'
                        : t.department === nextDept
                        ? 'current'
                        : t.status,
                    completedAt:
                      t.department === p.currentDepartment
                        ? new Date().toISOString()
                        : t.completedAt,
                    enteredAt:
                      t.department === nextDept
                        ? new Date().toISOString()
                        : t.enteredAt,
                  })),
                }
              : p
          ),
        };
      }),

      reroutePatient: (id, skipDept) => set((state) => {
        const patient = state.patients.find(p => p.id === id);
        if (!patient) return state;
        const newJourney = patient.journey.filter(d => d !== skipDept);
        const currentIdx = newJourney.indexOf(patient.currentDepartment);
        const nextDept = newJourney[currentIdx + 1] || patient.currentDepartment;
        return {
          patients: state.patients.map(p =>
            p.id === id
              ? {
                  ...p,
                  journey: newJourney,
                  currentDepartment: nextDept,
                  status: 'REROUTED',
                  enteredZoneAt: new Date().toISOString(),
                  timeline: makeTimeline(newJourney, nextDept).map((t, i) => ({
                    ...t,
                    status:
                      t.department === skipDept ? 'skipped' :
                      i < newJourney.indexOf(nextDept) ? 'done' :
                      i === newJourney.indexOf(nextDept) ? 'current' : 'next',
                  })),
                }
              : p
          ),
        };
      }),

      setUserRole: (role) => set({ currentUserRole: role }),

      getDepartmentQueue: (dept) => get().patients.filter(p => p.currentDepartment === dept),

      selectPatient: (id) => set({ selectedPatientId: id }),

      saveRefractionData: (patientId, data) => set((state) => ({
        patients: state.patients.map(p =>
          p.id === patientId ? { ...p, refractionData: data } : p
        ),
      })),

      saveDilationData: (patientId, data) => set((state) => ({
        patients: state.patients.map(p =>
          p.id === patientId ? { ...p, dilationData: data } : p
        ),
      })),

      saveConsultationData: (patientId, data) => set((state) => ({
        patients: state.patients.map(p =>
          p.id === patientId ? { ...p, consultationData: data } : p
        ),
      })),

      saveDraft: (patientId, zone, data) => set((state) => ({
        patients: state.patients.map(p =>
          p.id === patientId
            ? { ...p, draft: { ...p.draft, [zone]: data } }
            : p
        ),
      })),

      getPatientById: (id) => get().patients.find(p => p.id === id),
    }),
    {
      name: 'optiflow-hospital-state',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ patients: state.patients }),
    }
  )
);
