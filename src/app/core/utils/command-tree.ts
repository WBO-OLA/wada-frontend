import { Command, CommandWithDepth } from '../models/command.model';

export function buildCommandTree(commands: Command[]): CommandWithDepth[] {
  const byParentId = new Map<number | null, Command[]>();
  for (const command of commands) {
    const parentId = command.parent?.id ?? null;
    const siblings = byParentId.get(parentId) ?? [];
    siblings.push(command);
    byParentId.set(parentId, siblings);
  }

  const result: CommandWithDepth[] = [];

  function visit(parentId: number | null, depth: number) {
    const children = byParentId.get(parentId) ?? [];
    for (const command of children) {
      result.push({ ...command, depth });
      if (command.id !== undefined) {
        visit(command.id, depth + 1);
      }
    }
  }

  visit(null, 0);
  return result;
}
