'use client';

import { useCallback, useState } from 'react';
import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';

interface ApiErrorResponse {
	error?: string;
	errors?: Record<string, string>;
}

interface UseFormSubmitOptions<TData> {
	onSuccess?: (data: TData) => void;
}

interface UseFormSubmitResult<TData> {
	submit: (url: string, body: unknown, options?: RequestInit) => Promise<TData | null>;
	isSubmitting: boolean;
	error: string | null;
	clearError: () => void;
}

/**
 * Client-side form submission hook.
 * Bridges react-hook-form with API route submissions.
 * Sets field-level errors from API validation responses.
 */
export function useFormSubmit<
	TFormValues extends FieldValues,
	TData = unknown,
>(
	form: UseFormReturn<TFormValues>,
	options: UseFormSubmitOptions<TData> = {},
): UseFormSubmitResult<TData> {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const clearError = useCallback(() => setError(null), []);

	const submit = useCallback(
		async (url: string, body: unknown, requestOptions: RequestInit = {}): Promise<TData | null> => {
			setIsSubmitting(true);
			setError(null);

			try {
				const res = await fetch(url, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
					...requestOptions,
				});

				const data = await res.json().catch(() => null);

				if (!res.ok) {
					const apiError = data as ApiErrorResponse | null;

					// Set field-level errors from API validation
					if (apiError?.errors) {
						for (const [field, message] of Object.entries(apiError.errors)) {
							form.setError(field as FieldPath<TFormValues>, {
								type: 'manual',
								message,
							});
						}
					}

					// Set global error
					const errorMessage = apiError?.error || `Request failed (${res.status})`;
					setError(errorMessage);
					return null;
				}

				options.onSuccess?.(data as TData);
				return data as TData;
			} catch (err: unknown) {
				const message = err instanceof Error ? err.message : 'Unknown error';
				setError(message);
				return null;
			} finally {
				setIsSubmitting(false);
			}
		},
		[form, options],
	);

	return { submit, isSubmitting, error, clearError };
}
