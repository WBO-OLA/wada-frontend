export type CommandType = 'GLOBAL' | 'REGION' | 'UNIT';

export interface Command {
  id?: number;
  name: string;
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
  type: CommandType;
  parentId?: number | null;
}

export const COMMAND_TYPE_LABELS: Record<CommandType, string> = {
  GLOBAL: 'Global',
  REGION: 'Region',
  UNIT: 'Unit',
};
