import {
  AssignedOfficer,
  Complaint,
  ComplaintCategory,
  MunicipalDepartment,
  Priority
} from '../types';

export interface WorkerCandidate extends AssignedOfficer {
  ward?: string;
  lat?: number;
  lng?: number;
  skills?: ComplaintCategory[];
  activeTasksCount?: number;
  isAvailable?: boolean;
  status?: 'active' | 'on_leave' | 'busy';
}

export interface AssignmentScoringResult {
  officer: AssignedOfficer;
  totalScore: number;
  breakdown: {
    departmentMatch: number; // Max 30
    skillMatch: number;      // Max 20
    availability: number;    // Max 15
    workloadScore: number;   // Max 20
    distanceScore: number;   // Max 15
  };
  distanceKm: number;
  rationale: string;
}

// Calculate Haversine distance in km
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

/**
 * Multi-Factor Location-Aware Assignment Score Algorithm:
 * Assignment Score = Department Match (30) + Skill Match (20) + Availability (15) + Workload (20) + Distance (15)
 */
export function scoreWorkerAssignment(
  worker: WorkerCandidate,
  targetDept: MunicipalDepartment,
  category: ComplaintCategory,
  complaintLat: number,
  complaintLng: number,
  complaintWard?: string,
  existingComplaints: Complaint[] = []
): AssignmentScoringResult {
  // 1. Department Match (Max 30)
  const isDeptMatch = worker.department === targetDept;
  const departmentMatch = isDeptMatch ? 30 : 5;

  // 2. Skill Match (Max 20)
  let skillMatch = 10;
  if (worker.skills && worker.skills.includes(category)) {
    skillMatch = 20;
  } else if (isDeptMatch) {
    skillMatch = 15;
  }

  // 3. Availability (Max 15)
  const availability = worker.isAvailable !== false ? 15 : 0;

  // 4. Workload (Max 20) - Count active tasks currently assigned to this worker
  const activeTasks = existingComplaints.filter(
    (c) =>
      c.assignedOfficer?.id === worker.id &&
      (c.status === 'Assigned' || c.status === 'In Progress' || c.status === 'Accepted')
  ).length;

  let workloadScore = 20;
  if (activeTasks === 1) workloadScore = 16;
  else if (activeTasks === 2) workloadScore = 12;
  else if (activeTasks === 3) workloadScore = 8;
  else if (activeTasks >= 4) workloadScore = 4;

  // 5. Distance & Area Proximity (Max 15)
  // Smart City town center coordinates default: 18.1124, 83.3978
  const wLat = worker.lat || 18.1124;
  const wLng = worker.lng || 83.3978;
  const distanceKm = calculateDistanceKm(complaintLat, complaintLng, wLat, wLng);

  let distanceScore = 5;
  if (distanceKm <= 1.5) distanceScore = 15;
  else if (distanceKm <= 3.5) distanceScore = 12;
  else if (distanceKm <= 6.0) distanceScore = 9;
  else if (distanceKm <= 10.0) distanceScore = 6;

  // Area match bonus (if same ward)
  if (complaintWard && worker.ward && complaintWard === worker.ward) {
    distanceScore = Math.min(15, distanceScore + 3);
  }

  const totalScore = departmentMatch + skillMatch + availability + workloadScore + distanceScore;

  const rationale = `${worker.name} scored ${totalScore}/100: Dept (${departmentMatch}/30), Skill (${skillMatch}/20), Workload: ${activeTasks} tasks (${workloadScore}/20), Dist: ${distanceKm}km (${distanceScore}/15).`;

  const scoredOfficer: AssignedOfficer = {
    id: worker.id,
    name: worker.name,
    phone: worker.phone,
    badgeNumber: worker.badgeNumber,
    department: worker.department,
    distanceKm,
    assignmentScore: totalScore,
  };

  return {
    officer: scoredOfficer,
    totalScore,
    breakdown: {
      departmentMatch,
      skillMatch,
      availability,
      workloadScore,
      distanceScore,
    },
    distanceKm,
    rationale,
  };
}

/**
 * Automatically evaluates all available officers and returns the top-matching worker
 */
export function findBestWorkerForComplaint(
  availableWorkers: WorkerCandidate[],
  department: MunicipalDepartment,
  category: ComplaintCategory,
  lat: number,
  lng: number,
  ward?: string,
  existingComplaints: Complaint[] = []
): AssignmentScoringResult {
  const scored = availableWorkers.map((w) =>
    scoreWorkerAssignment(w, department, category, lat, lng, ward, existingComplaints)
  );

  // Sort descending by total score, then by distance ascending
  scored.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return a.distanceKm - b.distanceKm;
  });

  return scored[0];
}
