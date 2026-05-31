'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, type SignUpFormValues } from '@/lib/schemas';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { siteConfig } from '@/lib/site-config';

export default function SignUpPage() {
	const router = useRouter();

	const form = useForm<SignUpFormValues>({
		resolver: zodResolver(signUpSchema),
		defaultValues: { email: '', password: '', firstName: '', lastName: '' },
	});

	const { submit, isSubmitting, error } = useFormSubmit(form);

	const onSubmit = async (data: SignUpFormValues) => {
		const result = await submit('/api/auth/sign-up', {
			email: data.email,
			password: data.password,
			first_name: data.firstName,
			last_name: data.lastName || undefined,
		});

		if (result !== null) {
			router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
		}
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
					<h1 className="mt-6 font-display text-3xl font-semibold text-charcoal">Create Account</h1>
					<p className="mt-2 text-sm text-warm-gray">Sign up to book appointments and manage your visits</p>
				</div>

				{error && (
					<div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
						{error}
					</div>
				)}

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="firstName"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="mb-0 text-xs font-medium normal-case tracking-normal text-warm-gray">First Name</FormLabel>
										<FormControl>
											<input
												{...field}
												type="text"
												placeholder="Jane"
												className="w-full border border-charcoal/10 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-charcoal"
											/>
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
										<FormLabel className="mb-0 text-xs font-medium normal-case tracking-normal text-warm-gray">Last Name</FormLabel>
										<FormControl>
											<input
												{...field}
												type="text"
												placeholder="Smith"
												className="w-full border border-charcoal/10 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-charcoal"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="mb-0 text-xs font-medium normal-case tracking-normal text-warm-gray">
										Email <span className="text-accent">*</span>
									</FormLabel>
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
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="mb-0 text-xs font-medium normal-case tracking-normal text-warm-gray">
										Password <span className="text-accent">*</span>
									</FormLabel>
									<FormControl>
										<input
											{...field}
											type="password"
											placeholder="Min. 8 characters"
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
							{isSubmitting ? 'Creating account...' : 'Create Account'}
						</button>
					</form>
				</Form>

				<p className="mt-8 text-center text-sm text-warm-gray">
					Already have an account?{' '}
					<Link href="/auth/sign-in" className="font-medium text-charcoal hover:text-accent">
						Sign in
					</Link>
				</p>
			</motion.div>
		</section>
	);
}
