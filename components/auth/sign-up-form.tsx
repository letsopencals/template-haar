'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, type SignUpFormValues } from '@/lib/schemas';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { AuthLink, AuthShell } from '@/components/auth/auth-shell';
import { FORM_LABEL, Notice } from '@/components/auth/auth-feedback';

export function SignUpForm() {
	const router = useRouter();

	const form = useForm<SignUpFormValues>({
		resolver: zodResolver(signUpSchema),
		defaultValues: { email: '', password: '', firstName: '', lastName: '' },
	});

	const { submit, isSubmitting, error } = useFormSubmit(form, { url: '/api/auth/sign-up' });

	const onSubmit = async (data: SignUpFormValues) => {
		const result = await submit({
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
		<AuthShell
			eyebrow="Nº 00 — Join"
			title={
				<>
					Take a <em>seat</em>.
				</>
			}
			intro="Create an account to keep your salon diary: bookings, receipts and the chair you love, all in one place."
			image="/images/about/main.jpg"
			plate="Pl. 02 · The Atelier"
			footer={
				<>
					Already with us? <AuthLink href="/auth/sign-in">Sign in</AuthLink>
				</>
			}
		>
			{error ? <Notice className="mb-6">{error}</Notice> : null}

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
					<div className="grid gap-5 sm:grid-cols-2">
						<FormField
							control={form.control}
							name="firstName"
							render={({ field }) => (
								<FormItem>
									<FormLabel className={FORM_LABEL}>First name</FormLabel>
									<FormControl>
										<Input {...field} type="text" autoComplete="given-name" placeholder="Jane" />
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
									<FormLabel className={FORM_LABEL}>
										Last name <span className="normal-case tracking-normal text-warm-gray-light">(optional)</span>
									</FormLabel>
									<FormControl>
										<Input {...field} type="text" autoComplete="family-name" placeholder="Smith" />
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
								<FormLabel className={FORM_LABEL}>Email</FormLabel>
								<FormControl>
									<Input {...field} type="email" autoComplete="email" placeholder="you@example.com" />
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
								<FormLabel className={FORM_LABEL}>Password</FormLabel>
								<FormControl>
									<Input {...field} type="password" autoComplete="new-password" placeholder="At least 6 characters" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" size="lg" fullWidth disabled={isSubmitting} className="mt-2">
						{isSubmitting ? 'Creating your account…' : 'Create account'}
					</Button>
				</form>
			</Form>
		</AuthShell>
	);
}
