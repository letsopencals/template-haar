'use client';

import { useEffect } from 'react';
import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';
import { useApiRequest } from './use-api-request';

interface UseFormSubmitOptions<TData> {
	url: string;
	method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	headers?: Record<string, string>;
	onSuccess?: (data: TData) => void;
}

interface UseFormSubmitResult<TData> {
	submit: (body: unknown) => Promise<TData | null>;
	isSubmitting: boolean;
	error: string | null;
	clearError: () => void;
}

export function useFormSubmit<TFormValues extends FieldValues, TData = unknown>(
	form: UseFormReturn<TFormValues>,
	options: UseFormSubmitOptions<TData>,
): UseFormSubmitResult<TData> {
	const { url, method = 'POST', headers, onSuccess } = options;

	const request = useApiRequest<TData>(url, {
		method,
		headers,
		autoFetch: false,
		onSuccess,
	});

	useEffect(() => {
		if (request.fieldErrors) {
			for (const [field, message] of Object.entries(request.fieldErrors)) {
				form.setError(field as FieldPath<TFormValues>, { type: 'server', message });
			}
		}
	}, [request.fieldErrors, form]);

	return {
		submit: request.execute,
		isSubmitting: request.loading,
		error: request.error,
		clearError: request.reset,
	};
}
