'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/schemas';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { siteConfig } from '@/lib/site-config';

export default function ResetPasswordPage() {
	return (
		<Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" /></div>}>
			<ResetPasswordContent />
		</Suspense>
	);
}

function ResetPasswordContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get('token') ?? '';

	const [success, setSuccess] = useState(false);

	const form = useForm<ResetPasswordFormValues>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: { password: '', confirmPassword: '' },
	});

	const { submit, isSubmitting, error } = useFormSubmit(form);

	const onSubmit = async (data: ResetPasswordFormValues) => {
		const result = await submit('/api/auth/reset-password', {
			token,
			new_password: data.password,
		});

		if (result !== null) {
			setSuccess(true);
			setTimeout(() => router.push('/auth/sign-in'), 3000);
		}
	};

	if (!token) {
		return (
			<section className="flex min-h-screen items-center justify-center bg-white px-6 pt-20 pb-20">
				<div className="text-center">
					<p className="text-warm-gray">Invalid or missing reset token.</p>
					<Link href="/auth/forgot-password" className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
						Request a new reset link
					</Link>
				</div>
			</section>
		);
	}

	return (
		<section className="flex min-h-screen items-center justify-center bg-white px-6 pt-20 pb-20">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="w-full max-w-[440px]"
			>
				<div className="text-center">
					<Link href="/" className="font-display text-2xl font-bold tracking-tight text-charcoal">
						{siteConfig.logo.text}<span className="text-accent">{siteConfig.logo.accent}</span>
					</Link>
					<h1 className="mt-6 font-display text-3xl font-semibold text-charcoal">Reset Password</h1>
					<p className="mt-2 text-sm text-warm-gray">Enter your new password</p>
				</div>

				{success ? (
					<div className="mt-8 border border-green-200 bg-green-50 p-6 text-center">
						<svg className="mx-auto h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
						</svg>
						<p className="mt-4 text-sm font-medium text-green-800">Password reset successful</p>
						<p className="mt-1 text-xs text-green-700">Redirecting to sign in...</p>
					</div>
				) : (
					<>
						{error && (
							<div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
								{error}
							</div>
						)}

						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
								<FormField
									control={form.control}
									name="password"
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
									control={form.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="mb-0 text-xs font-medium normal-case tracking-normal text-warm-gray">Confirm Password</FormLabel>
											<FormControl>
												<input
													{...field}
													type="password"
													placeholder="Confirm your password"
													className="w-full border border-charcoal/10 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-charcoal"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<button
									type="submit"
									disabled={isSubmitting}
									className="w-full bg-charcoal px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-accent disabled:opacity-50"
								>
									{isSubmitting ? 'Resetting...' : 'Reset Password'}
								</button>
							</form>
						</Form>
					</>
				)}

				<p className="mt-8 text-center text-sm text-warm-gray">
					<Link href="/auth/sign-in" className="font-medium text-charcoal hover:text-accent">
						Back to sign in
					</Link>
				</p>
			</motion.div>
		</section>
	);
}
