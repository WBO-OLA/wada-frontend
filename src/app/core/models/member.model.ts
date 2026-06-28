import { Command } from './command.model';

export type MemberStatus = 'ACTIVE' | 'INJURED' | 'RETIRED' | 'PASSED_AWAY';

export type MemberRole =
  | 'COMMANDER' | 'DEPUTY_COMMANDER' | 'TAKIYAA' | 'SAGILII' | 'ABBAA_BUTTAA'
  | 'INTELLIGENCE_OFFICER' | 'LOGISTICS_OFFICER' | 'FINANCE_OFFICER'
  | 'MEDICAL_OFFICER' | 'COMMUNICATIONS_OFFICER' | 'TRAINING_OFFICER'
  | 'FIELD_OFFICER' | 'SQUAD_LEADER' | 'MEMBER';

export type MilitaryRank =
  | 'RECRUIT' | 'PRIVATE' | 'CORPORAL' | 'SERGEANT' | 'STAFF_SERGEANT'
  | 'WARRANT_OFFICER' | 'SECOND_LIEUTENANT' | 'FIRST_LIEUTENANT' | 'CAPTAIN'
  | 'MAJOR' | 'LIEUTENANT_COLONEL' | 'COLONEL' | 'BRIGADIER_GENERAL'
  | 'MAJOR_GENERAL' | 'LIEUTENANT_GENERAL' | 'GENERAL';

export type Gender = 'MALE' | 'FEMALE';

export type ActivityType = 'JOIN' | 'PROMOTION' | 'TRAINING' | 'INJURY' | 'MISSION' | 'MISSION_SUCCESS' | 'MISSION_FAILED' | 'AWARD' | 'RETIREMENT';

export interface Member {
  id?: number;
  militaryId: string;
  serviceNumber?: string;
  codeName?: string;
  firstName: string;
  lastName: string;
  gender?: Gender;
  nationalId?: string;
  nationality?: string;
  address?: string;
  phone?: string;
  email?: string;
  photoPath?: string;
  unit?: string;
  role?: string;
  memberRole?: MemberRole | null;
  responsibility?: string | null;
  dateOfBirth?: string;
  joinDate?: string;
  rank: MilitaryRank;
  command?: Command | null;
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

export interface TransferHistoryEntry {
  id: number;
  fromCommand?: { id: number; name: string; description?: string } | null;
  toCommand?: { id: number; name: string; description?: string } | null;
  transferredAt: string;
  transferredBy?: string;
  reason?: string;
}

export interface MemberTransferRequest {
  toCommandId?: number | null;
  transferredBy: string;
  reason?: string;
}

export interface MemberResponsibilityUpdateRequest {
  responsibility: string;
  changedBy: string;
  reason?: string;
}

export interface ResponsibilityHistoryEntry {
  id: number;
  previousResponsibility?: string | null;
  newResponsibility: string;
  changedAt: string;
  changedBy?: string;
  reason?: string;
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
  TRAINING: 'Training',
  INJURY: 'Injury',
  MISSION: 'Mission',
  MISSION_SUCCESS: 'Mission Accomplished',
  MISSION_FAILED: 'Mission Failed',
  AWARD: 'Award',
  RETIREMENT: 'Retirement',
};

export const MEMBER_ROLE_LABELS: Record<MemberRole, string> = {
  COMMANDER: 'Ajajaa (Commander)',
  DEPUTY_COMMANDER: 'Ajajaa Gargaaraa (Deputy Commander)',
  TAKIYAA: 'Takiyaa (Political Commissar)',
  SAGILII: 'Sagilii',
  ABBAA_BUTTAA: 'Abbaa Buttaa',
  INTELLIGENCE_OFFICER: 'Qondaala Nageenya (Intelligence Officer)',
  LOGISTICS_OFFICER: 'Qondaala Dhiyeessii (Logistics Officer)',
  FINANCE_OFFICER: 'Qondaala Maallaqaa (Finance Officer)',
  MEDICAL_OFFICER: 'Qondaala Fayyaa (Medical Officer)',
  COMMUNICATIONS_OFFICER: 'Qondaala Komunikeeshinii (Communications Officer)',
  TRAINING_OFFICER: 'Qondaala Leenjii (Training Officer)',
  FIELD_OFFICER: 'Qondaala Dirree (Field Officer)',
  SQUAD_LEADER: 'Hogganaa Garee (Squad Leader)',
  MEMBER: 'Miseensa (Regular Member)',
};

export const MEMBER_ROLE_COLORS: Record<MemberRole, string> = {
  COMMANDER: 'bg-slate-900 text-white',
  DEPUTY_COMMANDER: 'bg-slate-700 text-white',
  TAKIYAA: 'bg-purple-800 text-white',
  SAGILII: 'bg-violet-100 text-violet-800',
  ABBAA_BUTTAA: 'bg-rose-100 text-rose-800',
  INTELLIGENCE_OFFICER: 'bg-indigo-100 text-indigo-800',
  LOGISTICS_OFFICER: 'bg-amber-100 text-amber-800',
  FINANCE_OFFICER: 'bg-green-100 text-green-800',
  MEDICAL_OFFICER: 'bg-red-100 text-red-800',
  COMMUNICATIONS_OFFICER: 'bg-blue-100 text-blue-800',
  TRAINING_OFFICER: 'bg-orange-100 text-orange-800',
  FIELD_OFFICER: 'bg-teal-100 text-teal-800',
  SQUAD_LEADER: 'bg-cyan-100 text-cyan-800',
  MEMBER: 'bg-gray-100 text-gray-600',
};

export const ACTIVITY_TYPE_COLORS: Record<ActivityType, string> = {
  JOIN: 'bg-blue-100 text-blue-700',
  PROMOTION: 'bg-amber-100 text-amber-700',
  TRAINING: 'bg-purple-100 text-purple-700',
  INJURY: 'bg-orange-100 text-orange-700',
  MISSION: 'bg-indigo-100 text-indigo-700',
  MISSION_SUCCESS: 'bg-green-100 text-green-700',
  MISSION_FAILED: 'bg-red-100 text-red-700',
  AWARD: 'bg-green-100 text-green-700',
  RETIREMENT: 'bg-gray-100 text-gray-600',
};
