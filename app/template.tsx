import { PageTransition } from '@/components/motion/page-transition';

// Re-mounted by Next on every navigation, so each route plays the enter transition.
export default function Template({ children }: { children: React.ReactNode }) {
	return <PageTransition>{children}</PageTransition>;
}
