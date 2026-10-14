import { siteConfig } from '@/lib/site-config';

const GENERIC = 'A considered appointment, shaped around you in the chair — consultation, craft and a finish that lasts.';

/**
 * Editorial blurb for a service. The API description wins; otherwise the copy
 * from `siteConfig.services` (matched by title), otherwise a generic line.
 */
export function serviceBlurb(title: string | null | undefined, description?: string | null): string {
	if (description?.trim()) return description.trim();
	const t = (title ?? '').toLowerCase();
	const match = siteConfig.services.find((s) => s.title.toLowerCase() === t);
	return match?.description ?? GENERIC;
}
