'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { clsx } from 'clsx';

export type SafeImageProps = Omit<ImageProps, 'src'> & {
	/** Local (/images/...) or remote (*.amazonaws.com / *.opencals.com) URL. null/'' → fallback. */
	src: string | null | undefined;
};

/**
 * next/image that degrades to nothing when the file is missing or fails to
 * load, so the parent's plaster `.image-placeholder` gradient shows instead of a
 * broken-image icon. Always place it in a container with `image-placeholder`
 * (or another background) — `ParallaxImage` already does.
 */
export function SafeImage({ src, alt, className, onError, ...props }: SafeImageProps) {
	const [failedSrc, setFailedSrc] = useState<string | null>(null);
	if (!src || failedSrc === src) return null;
	return (
		<Image
			src={src}
			alt={alt}
			className={clsx(className)}
			onError={(e) => {
				setFailedSrc(src);
				onError?.(e);
			}}
			{...props}
		/>
	);
}
