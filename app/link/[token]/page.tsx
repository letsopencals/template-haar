import type { Metadata } from 'next';
import { LinkResolver } from '@/components/auth/link-resolver';

export const metadata: Metadata = { title: 'Opening your diary', robots: { index: false, follow: false } };

type Params = Promise<{ token: string }>;

/** Magic link from booking emails: resolved on the client, then redirected. */
export default async function LinkPage({ params }: { params: Params }) {
	const { token } = await params;
	return <LinkResolver token={token} />;
}
