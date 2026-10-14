'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/schemas';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button, buttonClasses } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { AuthLink, AuthShell } from '@/components/auth/auth-shell';
import { FORM_LABEL, Notice } from '@/components/auth/auth-feedback';

export function ResetPasswordForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get('token') ?? '';
	const [success, setSuccess] = useState(false);

	const form = useForm<ResetPasswordFormValues>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: { password: '', confirmPassword: '' },
	});

	const { submit, isSubmitting, error } = useFormSubmit(form, { url: '/api/auth/reset-password' });

	useEffect(() => {
		if (!success) return;
		const id = setTimeout(() => router.push('/auth/sign-in'), 3000);
		return () => clearTimeout(id);
	}, [success, router]);

	const onSubmit = async (data: ResetPasswordFormValues) => {
		const result = await submit({ token, new_password: data.password });
		if (result !== null) setSuccess(true);
	};

	const footer = <AuthLink href="/auth/sign-in">Back to sign in</AuthLink>;

	if (!token) {
		return (
			<AuthShell eyebrow="Nº 00 — Password" title={<>Link <em>missing</em>.</>} footer={footer}>
				<Notice className="mb-6">This reset link is invalid or incomplete.</Notice>
				<Link href="/auth/forgot-password" className={buttonClasses({ size: 'lg', fullWidth: true })}>
					Request a new link
				</Link>
			</AuthShell>
		);
	}

	return (
		<AuthShell
			eyebrow="Nº 00 — Password"
			title={
				<>
					A new <em>password</em>.
				</>
			}
			intro={success ? undefined : 'Choose something you’ll remember. At least six characters.'}
			footer={footer}
		>
			{success ? (
				<Notice tone="success">Password updated. Taking you to sign in…</Notice>
			) : (
				<>
					{error ? <Notice className="mb-6">{error}</Notice> : null}
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel className={FORM_LABEL}>New password</FormLabel>
										<FormControl>
											<Input {...field} type="password" autoComplete="new-password" placeholder="At least 6 characters" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="confirmPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel className={FORM_LABEL}>Confirm password</FormLabel>
										<FormControl>
											<Input {...field} type="password" autoComplete="new-password" placeholder="Once more" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" size="lg" fullWidth disabled={isSubmitting} className="mt-2">
								{isSubmitting ? 'Saving…' : 'Set new password'}
							</Button>
						</form>
					</Form>
				</>
			)}
		</AuthShell>
	);
}
