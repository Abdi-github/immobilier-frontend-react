import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z.string().email('Invalid email address');

/**
 * Phone validation schema (Swiss format)
 */
export const phoneSchema = z
  .string()
  .regex(
    /^(\+41|0041|0)?[1-9][0-9]{8}$/,
    'Invalid phone number format'
  );

/**
 * Contact form validation schema
 */
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal('')),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

/**
 * Search filters validation schema
 */
export const searchFiltersSchema = z.object({
  query: z.string().optional(),
  transactionType: z.enum(['rent', 'buy']).default('rent'),
  categoryId: z.string().nullable().optional(),
  cantonId: z.string().nullable().optional(),
  cityId: z.string().nullable().optional(),
  priceMin: z.number().nullable().optional(),
  priceMax: z.number().nullable().optional(),
  roomsMin: z.number().nullable().optional(),
  roomsMax: z.number().nullable().optional(),
  surfaceMin: z.number().nullable().optional(),
  surfaceMax: z.number().nullable().optional(),
  amenities: z.array(z.string()).optional(),
});

export type SearchFiltersData = z.infer<typeof searchFiltersSchema>;

/**
 * Login form validation schema
 */
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

/**
 * Register form validation schema
 */
export const registerFormSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: emailSchema,
    phone: phoneSchema.optional().or(z.literal('')),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerFormSchema>;
