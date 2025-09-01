import { TypeOf, object, string } from 'zod';

export const welcomeSchema = object({
  password: string()
    .min(1, 'Password is required')
    .min(8, 'Password is to short'),
  companyName: string().min(3, 'Workspace name is requared!'),
  //purposeOfUse: string(),
});

export const welcomeSchemaWithoutPassword = object({
  companyName: string().min(3, 'Workspace name is requared!'),
  //purposeOfUse: string(),
});

export const welcomeInvitedSchema = object({
  password: string()
    .min(1, 'Password is required')
    .min(8, 'Password is to short'),
});

export type WelcomeInvitedInput = TypeOf<typeof welcomeInvitedSchema>;

export type WelcomeInput = TypeOf<typeof welcomeSchema>;

export type WelcomeMode = 'simple' | 'invited';
