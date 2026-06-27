import { MilitaryRank } from './member.model';

export type CommandType = 'CHIEF' | 'ZONE' | 'BRIGADE' | 'REGION' | 'UNIT';

export interface CommanderSummary {
  id: number;
  firstName: string;
  lastName: string;
  militaryId: string;
  rank: MilitaryRank;
  responsibility?: string | null;
}

export interface Command {
  id?: number;
  name: string;
  description?: string;
  type: CommandType;
  parent?: { id: number; name: string; type: CommandType } | null;
  commander?: CommanderSummary | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommandWithDepth extends Command {
  depth: number;
}

export interface CommandRequest {
  name: string;
  description?: string;
  type: CommandType;
  parentId?: number | null;
  commanderId?: number | null;
}

export const COMMAND_TYPE_LABELS: Record<CommandType, string> = {
  CHIEF: 'Chief Command (Ajajaa Walii Galaa)',
  ZONE: 'Zone Command (Ajajaa Zoonii)',
  BRIGADE: 'Brigade (Birgeedii)',
  REGION: 'Region',
  UNIT: 'Unit',
};
