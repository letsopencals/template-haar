import { readFile } from 'fs/promises';
import { join } from 'path';

export const size = {
	width: 32,
	height: 32,
};
export const contentType = 'image/png';

export default async function Icon() {
	const iconPath = join(process.cwd(), 'public', 'icon.png');
	const iconBuffer = await readFile(iconPath);

	return new Response(new Uint8Array(iconBuffer), {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	});
}
