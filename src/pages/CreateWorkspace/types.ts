import { TypeOf, object, string } from 'zod';

export const createWorkspaceSchema = object({
  companyName: string().min(3, 'Workspace name is requared!'),
});

export type CreateWorkspaceInput = TypeOf<typeof createWorkspaceSchema>;
