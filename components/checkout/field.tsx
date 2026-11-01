import type { ReactNode } from 'react';

/**
 * Editorial field label: eyebrow caption, optional required mark and helper copy, and the error under the input
 * (`${htmlFor}-error`; the input takes `fieldA11y(htmlFor, error, !!hint)`).
 */
export function Field({
	htmlFor,
	label,
	required,
	hint,
	error,
	children,
}: {
	htmlFor: string;
	label: ReactNode;
	required?: boolean;
	hint?: ReactNode;
	error?: string;
	children: ReactNode;
}) {
	return (
		<div>
			<label htmlFor={htmlFor} className="eyebrow mb-2.5 block text-[0.62rem] text-warm-gray">
				{label}
				{required ? (
					<span className="ml-1 text-accent" aria-hidden>
						*
					</span>
				) : null}
			</label>
			{hint ? (
				<p id={`${htmlFor}-hint`} className="-mt-1 mb-2.5 text-xs leading-relaxed text-warm-gray">
					{hint}
				</p>
			) : null}
			{children}
			{error ? (
				<p id={`${htmlFor}-error`} className="mt-1.5 text-xs font-medium text-red-600">
					{error}
				</p>
			) : null}
		</div>
	);
}
