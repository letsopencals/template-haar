'use client';

import { useEffect, useMemo } from 'react';
import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';
import { mapFieldErrors } from '@/lib/field-errors';
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

	// The API's field errors, placed on this form's fields by the end of their path (`customer.email` → `email`).
	// What no field here can show stays in the banner.
	const placed = useMemo(
		() => (request.apiFieldErrors ? mapFieldErrors(request.apiFieldErrors, Object.keys(form.getValues())) : null),
		[request.apiFieldErrors, form],
	);

	useEffect(() => {
		const errors = placed ? placed.fields : request.fieldErrors;
		if (errors) {
			for (const [field, message] of Object.entries(errors)) {
				form.setError(field as FieldPath<TFormValues>, { type: 'server', message });
			}
		}
	}, [placed, request.fieldErrors, form]);

	const allPlaced = placed !== null && Object.keys(placed.fields).length > 0;

	return {
		submit: request.execute,
		isSubmitting: request.loading,
		error: allPlaced ? placed.unmapped.join(' ') || null : request.error,
		clearError: request.reset,
	};
}
