'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	updateProfileSchema,
	changePasswordSchema,
	type UpdateProfileFormValues,
	type ChangePasswordFormValues,
} from '@/lib/schemas';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useFormSubmit } from '@/hooks/use-form-submit';

export default function SettingsPage() {
	const [profileLoading, setProfileLoading] = useState(true);
	const [profileSuccess, setProfileSuccess] = useState(false);
	const [passwordSuccess, setPasswordSuccess] = useState(false);
	const [email, setEmail] = useState('');

	const profileForm = useForm<UpdateProfileFormValues>({
		resolver: zodResolver(updateProfileSchema),
		defaultValues: { firstName: '', lastName: '' },
	});

	const passwordForm = useForm<ChangePasswordFormValues>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
	});

	const profileSubmit = useFormSubmit<UpdateProfileFormValues>(profileForm);
	const passwordSubmit = useFormSubmit<ChangePasswordFormValues>(passwordForm);

	// Fetch profile
	useEffect(() => {
		async function fetchProfile() {
			try {
				const res = await fetch('/api/account/profile');
				if (res.ok) {
					const data = await res.json();
					profileForm.reset({
						firstName: data.firstName ?? '',
						lastName: data.lastName ?? '',
					});
					setEmail(data.email ?? '');
				}
			} catch {
				// silently fail
			} finally {
				setProfileLoading(false);
			}
		}

		fetchProfile();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const handleProfileSave = profileForm.handleSubmit(async (data) => {
		const result = await profileSubmit.submit(
			'/api/account/profile',
			{ firstName: data.firstName, lastName: data.lastName },
			{ method: 'PUT' },
		);
		if (result !== null) {
			setProfileSuccess(true);
			setTimeout(() => setProfileSuccess(false), 3000);
		}
	});

	const handlePasswordChange = passwordForm.handleSubmit(async (data) => {
		const result = await passwordSubmit.submit(
			'/api/account/password',
			{ currentPassword: data.currentPassword, newPassword: data.newPassword },
			{ method: 'PUT' },
		);
		if (result !== null) {
			setPasswordSuccess(true);
			passwordForm.reset();
			setTimeout(() => setPasswordSuccess(false), 3000);
		}
	});

	return (
		<div>
			<h1 className="font-display text-3xl font-semibold text-charcoal">Settings</h1>
			<p className="mt-2 text-sm text-warm-gray">Manage your profile and security</p>

			<div className="mt-8 space-y-8">
				{/* Profile Section */}
				<div className="border border-charcoal/10 p-6">
					<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">Profile</h2>

					{profileLoading ? (
						<div className="mt-6 space-y-4">
							<div className="h-12 animate-pulse rounded bg-cream" />
							<div className="h-12 animate-pulse rounded bg-cream" />
						</div>
					) : (
						<Form {...profileForm}>
							<form onSubmit={handleProfileSave}>
								<div className="mt-6 space-y-4">
									<div>
										<label className="mb-1 block text-xs font-medium text-warm-gray">Email</label>
										<input
											type="email"
											value={email}
											disabled
											className="w-full border border-charcoal/5 bg-cream/30 px-4 py-3 text-sm text-warm-gray"
										/>
									</div>
									<div className="grid gap-4 sm:grid-cols-2">
										<FormField
											control={profileForm.control}
											name="firstName"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="mb-0 text-xs font-medium normal-case tracking-normal text-warm-gray">First Name</FormLabel>
													<FormControl>
														<input
															{...field}
															type="text"
															className="w-full border border-charcoal/10 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-charcoal"
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={profileForm.control}
											name="lastName"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="mb-0 text-xs font-medium normal-case tracking-normal text-warm-gray">Last Name</FormLabel>
													<FormControl>
														<input
															{...field}
															type="text"
															className="w-full border border-charcoal/10 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-charcoal"
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>

								{profileSubmit.error && (
									<div className="mt-4 border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
										{profileSubmit.error}
									</div>
								)}
								{profileSuccess && (
									<div className="mt-4 border border-green-200 bg-green-50 px-4 py-2 text-xs text-green-700">
										Profile updated successfully.
									</div>
								)}

								<button
									type="submit"
									disabled={profileSubmit.isSubmitting}
									className="mt-6 bg-charcoal px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-accent disabled:opacity-50"
								>
									{profileSubmit.isSubmitting ? 'Saving...' : 'Save Changes'}
								</button>
							</form>
						</Form>
					)}
				</div>

				{/* Password Section */}
				<div className="border border-charcoal/10 p-6">
					<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">Change Password</h2>

					<Form {...passwordForm}>
						<form onSubmit={handlePasswordChange}>
							<div className="mt-6 space-y-4">
								<FormField
									control={passwordForm.control}
									name="currentPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="mb-0 text-xs font-medium normal-case tracking-normal text-warm-gray">
												Current Password <span className="text-warm-gray/50">(leave empty if not set)</span>
											</FormLabel>
											<FormControl>
												<input
													{...field}
													type="password"
													placeholder="Current password"
													className="w-full border border-charcoal/10 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-charcoal"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={passwordForm.control}
									name="newPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="mb-0 text-xs font-medium normal-case tracking-normal text-warm-gray">New Password</FormLabel>
											<FormControl>
												<input
													{...field}
													type="password"
													placeholder="Min. 6 characters"
													className="w-full border border-charcoal/10 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-charcoal"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={passwordForm.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="mb-0 text-xs font-medium normal-case tracking-normal text-warm-gray">Confirm New Password</FormLabel>
											<FormControl>
												<input
													{...field}
													type="password"
													placeholder="Confirm new password"
													className="w-full border border-charcoal/10 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-charcoal"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{passwordSubmit.error && (
								<div className="mt-4 border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
									{passwordSubmit.error}
								</div>
							)}
							{passwordSuccess && (
								<div className="mt-4 border border-green-200 bg-green-50 px-4 py-2 text-xs text-green-700">
									Password changed successfully.
								</div>
							)}

							<button
								type="submit"
								disabled={passwordSubmit.isSubmitting}
								className="mt-6 bg-charcoal px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-accent disabled:opacity-50"
							>
								{passwordSubmit.isSubmitting ? 'Changing...' : 'Change Password'}
							</button>
						</form>
					</Form>
				</div>
			</div>
		</div>
	);
}
