import type { Metadata } from 'next';
import { ProfileForm } from '@/components/account/settings/profile-form';
import { PasswordForm } from '@/components/account/settings/password-form';

export const metadata: Metadata = { title: 'Settings' };

export default function SettingsPage() {
	return (
		<div className="space-y-16 md:space-y-24">
			<ProfileForm />
			<PasswordForm />
		</div>
	);
}
