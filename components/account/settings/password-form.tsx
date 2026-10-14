'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/lib/schemas';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { FORM_LABEL, Notice } from '@/components/auth/auth-feedback';
import { SettingsSection } from '@/components/account/settings/settings-section';

const FIELDS = [
	{ name: 'currentPassword', label: 'Current password', autoComplete: 'current-password' },
	{ name: 'newPassword', label: 'New password', autoComplete: 'new-password' },
	{ name: 'confirmPassword', label: 'Confirm new password', autoComplete: 'new-password' },
] as const;

export function PasswordForm() {
	const [saved, setSaved] = useState(false);
	const form = useForm<ChangePasswordFormValues>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
	});
	const { submit, isSubmitting, error } = useFormSubmit<ChangePasswordFormValues>(form, {
		url: '/api/account/password',
		method: 'PUT',
	});

	useEffect(() => {
		if (!saved) return;
		const id = setTimeout(() => setSaved(false), 3000);
		return () => clearTimeout(id);
	}, [saved]);

	const onSubmit = form.handleSubmit(async (data) => {
		const result = await submit({ currentPassword: data.currentPassword, newPassword: data.newPassword });
		if (result !== null) {
			setSaved(true);
			form.reset();
		}
	});

	return (
		<SettingsSection
			numeral="Nº 02"
			title="Password"
			note="Optional. You can always sign in with a six-digit code sent to your email instead."
		>
			<Form {...form}>
				<form onSubmit={onSubmit} className="space-y-5" noValidate>
					{error ? <Notice>{error}</Notice> : null}
					{saved ? <Notice tone="success">Password updated.</Notice> : null}
					{FIELDS.map((f) => (
						<FormField
							key={f.name}
							control={form.control}
							name={f.name}
							render={({ field }) => (
								<FormItem>
									<FormLabel className={FORM_LABEL}>{f.label}</FormLabel>
									<FormControl>
										<Input {...field} type="password" autoComplete={f.autoComplete} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					))}
					<Button type="submit" variant="outline" disabled={isSubmitting}>
						{isSubmitting ? 'Updating…' : 'Update password'}
					</Button>
				</form>
			</Form>
		</SettingsSection>
	);
}
