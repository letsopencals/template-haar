'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { updateProfileSchema, type UpdateProfileFormValues } from '@/lib/schemas';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { fetcher } from '@/lib/fetcher';
import { FIELD_LABEL, FORM_LABEL, Notice } from '@/components/auth/auth-feedback';
import { SettingsSection } from '@/components/account/settings/settings-section';

type Profile = { firstName?: string | null; lastName?: string | null; email?: string | null };

const SWR_OPTIONS = { revalidateOnFocus: false } as const;

export function ProfileForm() {
	const { data: profile, isLoading } = useSWR<Profile>('/api/account/profile', fetcher, SWR_OPTIONS);
	const { update } = useSession();
	const [saved, setSaved] = useState(false);

	const form = useForm<UpdateProfileFormValues>({
		resolver: zodResolver(updateProfileSchema),
		defaultValues: { firstName: '', lastName: '' },
	});
	const { reset } = form;
	const { submit, isSubmitting, error } = useFormSubmit<UpdateProfileFormValues>(form, {
		url: '/api/account/profile',
		method: 'PUT',
	});

	useEffect(() => {
		if (profile) reset({ firstName: profile.firstName ?? '', lastName: profile.lastName ?? '' });
	}, [profile, reset]);

	useEffect(() => {
		if (!saved) return;
		const id = setTimeout(() => setSaved(false), 3000);
		return () => clearTimeout(id);
	}, [saved]);

	const onSubmit = form.handleSubmit(async (data) => {
		const result = await submit({ firstName: data.firstName, lastName: data.lastName });
		if (result !== null) {
			setSaved(true);
			reset(data);
			// Ask next-auth to re-read the session (greeting); harmless if unsupported.
			void update?.();
		}
	});

	return (
		<SettingsSection numeral="Nº 01" title="Your details" note="The name we greet you by, on your bookings and in our letters.">
			{isLoading ? (
				<div className="space-y-5" aria-busy="true">
					<div className="h-12 animate-pulse bg-cream" />
					<div className="h-12 animate-pulse bg-cream" />
					<div className="h-12 animate-pulse bg-cream" />
				</div>
			) : (
				<Form {...form}>
					<form onSubmit={onSubmit} className="space-y-5" noValidate>
						{error ? <Notice>{error}</Notice> : null}
						{saved ? <Notice tone="success">Saved.</Notice> : null}
						<div className="grid gap-5 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="firstName"
								render={({ field }) => (
									<FormItem>
										<FormLabel className={FORM_LABEL}>First name</FormLabel>
										<FormControl>
											<Input {...field} autoComplete="given-name" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="lastName"
								render={({ field }) => (
									<FormItem>
										<FormLabel className={FORM_LABEL}>Last name</FormLabel>
										<FormControl>
											<Input {...field} value={field.value ?? ''} autoComplete="family-name" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div>
							<label htmlFor="settings-email" className={FIELD_LABEL}>
								Email
							</label>
							<Input id="settings-email" type="email" value={profile?.email ?? ''} disabled readOnly className="opacity-60" />
							<p className="mt-2 text-xs text-warm-gray">To change your email, please contact the salon.</p>
						</div>
						<Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
							{isSubmitting ? 'Saving…' : 'Save details'}
						</Button>
					</form>
				</Form>
			)}
		</SettingsSection>
	);
}
