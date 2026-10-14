'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/schemas';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { AuthLink, AuthShell } from '@/components/auth/auth-shell';
import { FORM_LABEL, Notice, TEXT_LINK } from '@/components/auth/auth-feedback';

export function ForgotPasswordForm() {
	const [sent, setSent] = useState(false);

	const form = useForm<ForgotPasswordFormValues>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: { email: '' },
	});

	const { submit, isSubmitting } = useFormSubmit(form, { url: '/api/auth/forgot-password' });

	const onSubmit = async (data: ForgotPasswordFormValues) => {
		await submit({ email: data.email });
		setSent(true);
	};

	const handleResend = () => {
		setSent(false);
		void form.handleSubmit(onSubmit)();
	};

	return (
		<AuthShell
			eyebrow="Nº 00 — Password"
			title={
				<>
					Forgotten <em>password</em>?
				</>
			}
			intro={
				sent
					? undefined
					: 'Enter your email and we’ll send a link to set a new one. Or skip it and sign in with an emailed code.'
			}
			footer={<AuthLink href="/auth/sign-in">Back to sign in</AuthLink>}
		>
			{sent ? (
				<div className="space-y-6">
					<Notice tone="success">
						If an account exists for <span className="font-medium">{form.getValues('email')}</span>, a reset link is on its
						way.
					</Notice>
					<button type="button" onClick={handleResend} className={TEXT_LINK}>
						Resend email
					</button>
				</div>
			) : (
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel className={FORM_LABEL}>Email</FormLabel>
									<FormControl>
										<Input {...field} type="email" autoComplete="email" placeholder="you@example.com" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
							{isSubmitting ? 'Sending…' : 'Send reset link'}
						</Button>
					</form>
				</Form>
			)}
		</AuthShell>
	);
}
