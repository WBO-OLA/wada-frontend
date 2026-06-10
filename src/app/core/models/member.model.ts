export type MemberStatus = 'ACTIVE' | 'INJURED' | 'RETIRED' | 'PASSED_AWAY';

export type MilitaryRank =
  | 'RECRUIT' | 'PRIVATE' | 'CORPORAL' | 'SERGEANT' | 'STAFF_SERGEANT'
  | 'WARRANT_OFFICER' | 'SECOND_LIEUTENANT' | 'FIRST_LIEUTENANT' | 'CAPTAIN'
  | 'MAJOR' | 'LIEUTENANT_COLONEL' | 'COLONEL' | 'BRIGADIER_GENERAL'
  | 'MAJOR_GENERAL' | 'LIEUTENANT_GENERAL' | 'GENERAL';

export type ActivityType = 'JOIN' | 'PROMOTION' | 'INJURY' | 'MISSION' | 'AWARD' | 'RETIREMENT';

export interface Member {
  id?: number;
  militaryId: string;
  firstName: string;
  lastName: string;
  nationalId?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  joinDate?: string;
  rank: MilitaryRank;
  unit: string;
  status: MemberStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MemberActivity {
  id?: number;
  memberId?: number;
  title: string;
  description?: string;
  activityDate: string;
  type: ActivityType;
  createdAt?: string;
}

export interface MemberStatusUpdateRequest {
  status: MemberStatus;
  changedBy: string;
  notes?: string;
}

export interface MemberRankUpdateRequest {
  rank: MilitaryRank;
  promotedBy: string;
  notes?: string;
}

export interface MedicalRecord {
  id?: number;
  recordDate: string;
  diagnosis: string;
  treatment?: string;
  physician?: string;
  confidential: boolean;
  notes?: string;
  createdAt?: string;
}

export interface StatusHistoryEntry {
  id: number;
  previousStatus: MemberStatus;
  newStatus: MemberStatus;
  changedAt: string;
  changedBy?: string;
  notes?: string;
}

export interface RankHistoryEntry {
  id: number;
  previousRank: MilitaryRank;
  newRank: MilitaryRank;
  promotedAt: string;
  promotedBy?: string;
  notes?: string;
}

export const STATUS_LABELS: Record<MemberStatus, string> = {
  ACTIVE: 'Active',
  INJURED: 'Injured',
  RETIRED: 'Retired',
  PASSED_AWAY: 'Passed Away',
};

export const RANK_LABELS: Record<MilitaryRank, string> = {
  RECRUIT: 'Recruit',
  PRIVATE: 'Private',
  CORPORAL: 'Corporal',
  SERGEANT: 'Sergeant',
  STAFF_SERGEANT: 'Staff Sergeant',
  WARRANT_OFFICER: 'Warrant Officer',
  SECOND_LIEUTENANT: '2nd Lieutenant',
  FIRST_LIEUTENANT: '1st Lieutenant',
  CAPTAIN: 'Captain',
  MAJOR: 'Major',
  LIEUTENANT_COLONEL: 'Lt. Colonel',
  COLONEL: 'Colonel',
  BRIGADIER_GENERAL: 'Brigadier General',
  MAJOR_GENERAL: 'Major General',
  LIEUTENANT_GENERAL: 'Lt. General',
  GENERAL: 'General',
};

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  JOIN: 'Joined',
  PROMOTION: 'Promotion',
  INJURY: 'Injury',
  MISSION: 'Mission',
  AWARD: 'Award',
  RETIREMENT: 'Retirement',
};

export const ACTIVITY_TYPE_COLORS: Record<ActivityType, string> = {
  JOIN: 'bg-blue-100 text-blue-700',
  PROMOTION: 'bg-amber-100 text-amber-700',
  INJURY: 'bg-orange-100 text-orange-700',
  MISSION: 'bg-indigo-100 text-indigo-700',
  AWARD: 'bg-green-100 text-green-700',
  RETIREMENT: 'bg-gray-100 text-gray-600',
};
