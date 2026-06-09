export type MemberStatus = 'ACTIVE' | 'NEW_JOINER' | 'INJURED' | 'RETIRED' | 'PASSED_AWAY';

export type MilitaryRank =
  | 'RECRUIT' | 'PRIVATE' | 'CORPORAL' | 'SERGEANT' | 'STAFF_SERGEANT'
  | 'WARRANT_OFFICER' | 'SECOND_LIEUTENANT' | 'FIRST_LIEUTENANT' | 'CAPTAIN'
  | 'MAJOR' | 'LIEUTENANT_COLONEL' | 'COLONEL' | 'BRIGADIER_GENERAL'
  | 'MAJOR_GENERAL' | 'LIEUTENANT_GENERAL' | 'GENERAL';

export interface Member {
  id?: number;
  militaryId: string;
  firstName: string;
  lastName: string;
  nationalId?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  dateJoined?: string;
  rank: MilitaryRank;
  unit: string;
  status: MemberStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
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
  NEW_JOINER: 'New Joiner',
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
