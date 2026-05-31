import { z } from 'zod';

/** Sign-in form validation */
export const signInSchema = z.object({
	email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
});
export type SignInFormValues = z.infer<typeof signInSchema>;

/** Sign-up form validation */
export const signUpSchema = z.object({
	email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
	firstName: z.string().min(1, 'First name is required'),
	lastName: z.string().optional(),
});
export type SignUpFormValues = z.infer<typeof signUpSchema>;

/** Reset password form validation */
export const resetPasswordSchema = z
	.object({
		password: z.string().min(6, 'Password must be at least 6 characters'),
		confirmPassword: z.string().min(1, 'Please confirm your password'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

/** Forgot password (email only) */
export const forgotPasswordSchema = z.object({
	email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

/** Checkout customer info form */
export const customerInfoSchema = z.object({
	email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
});
export type CustomerInfoFormValues = z.infer<typeof customerInfoSchema>;

/** Contact form validation */
export const contactFormSchema = z.object({
	firstName: z.string().min(1, 'First name is required'),
	lastName: z.string().optional(),
	email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
	phone: z.string().optional(),
	message: z.string().min(10, 'Message must be at least 10 characters'),
});
export type ContactFormValues = z.infer<typeof contactFormSchema>;

/** Profile update form */
export const updateProfileSchema = z.object({
	firstName: z.string().min(1, 'First name is required'),
	lastName: z.string().optional(),
	email: z.string().email('Please enter a valid email').optional(),
});
export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

/** Change password form */
export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Current password is required'),
		newPassword: z.string().min(6, 'Password must be at least 6 characters'),
		confirmPassword: z.string().min(1, 'Please confirm your password'),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
