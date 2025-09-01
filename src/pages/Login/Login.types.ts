import { TypeOf, object, string } from 'zod';

export const loginSchema = object({
  email: string()
    .min(1, 'Email address is required')
    .email('Email Address is invalid'),
  password: string().min(1, 'Password is required'),
});

export type LoginInput = TypeOf<typeof loginSchema>;
