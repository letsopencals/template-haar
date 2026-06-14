'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/schemas';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { siteConfig } from '@/lib/site-config';

export default function ForgotPasswordPage() {
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
		form.handleSubmit(onSubmit)();
	};

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
					<h1 className="mt-6 font-display text-3xl font-semibold text-charcoal">Forgot Password</h1>
					<p className="mt-2 text-sm text-warm-gray">
						Enter your email and we&apos;ll send you a reset link
					</p>
				</div>

				{sent ? (
					<div className="mt-8 border border-green-200 bg-green-50 p-6 text-center">
						<svg className="mx-auto h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
						</svg>
						<p className="mt-4 text-sm font-medium text-green-800">Check your email</p>
						<p className="mt-1 text-xs text-green-700">
							If an account exists for <span className="font-medium">{form.getValues('email')}</span>, we&apos;ve sent a password reset link.
						</p>
						<button
							onClick={handleResend}
							className="mt-4 text-xs font-medium text-green-700 underline"
						>
							Resend email
						</button>
					</div>
				) : (
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="mb-0 text-xs font-medium normal-case tracking-normal text-warm-gray">Email</FormLabel>
										<FormControl>
											<input
												{...field}
												type="email"
												placeholder="your@email.com"
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
								{isSubmitting ? 'Sending...' : 'Send Reset Link'}
							</button>
						</form>
					</Form>
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
