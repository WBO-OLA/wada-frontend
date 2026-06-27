export type CommandType = 'CHIEF' | 'ZONE' | 'BRIGADE' | 'REGION' | 'UNIT';

export interface Command {
  id?: number;
  name: string;
  description?: string;
  type: CommandType;
  parent?: { id: number; name: string; type: CommandType } | null;
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
}

export const COMMAND_TYPE_LABELS: Record<CommandType, string> = {
  CHIEF: 'Chief Command (Ajajaa Walii Galaa)',
  ZONE: 'Zone Command (Ajajaa Zoonii)',
  BRIGADE: 'Brigade (Birgeedii)',
  REGION: 'Region',
  UNIT: 'Unit',
};
