import { z } from 'zod';

const passwordSchema = z.string().min(1).max(128);

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase().max(150),
  password: passwordSchema,
});

export const refreshSessionSchema = z.object({
  refreshToken: z.string().regex(/^[a-f0-9]{64}$/i),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshSessionInput = z.infer<typeof refreshSessionSchema>;
