'use client';

import Link from 'next/link';
import { useLocation } from '@/contexts/location-context';
import { useTimezone } from '@/contexts/timezone-context';
import { siteConfig } from '@/lib/site-config';

function FooterSettings() {
	const { locations, selectedLocationId, setSelectedLocationId } = useLocation();
	const { timezone, setTimezone } = useTimezone();

	const hasLocations = locations.length > 1;

	return (
		<div className="flex flex-wrap items-center gap-6">
			{hasLocations && (
				<div className="flex items-center gap-2">
					<svg className="h-3.5 w-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
						<path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					<select
						value={selectedLocationId ?? ''}
						onChange={(e) => setSelectedLocationId(e.target.value || null)}
						className="border-none bg-transparent text-xs text-white/60 outline-none hover:text-white focus:text-white"
					>
						<option value="" className="bg-charcoal">All Locations</option>
						{locations.map((l) => (
							<option key={l.id} value={l.id} className="bg-charcoal">
								{l.title ?? 'Location'}
							</option>
						))}
					</select>
				</div>
			)}
			<div className="flex items-center gap-2">
				<svg className="h-3.5 w-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<select
					value={timezone}
					onChange={(e) => setTimezone(e.target.value)}
					className="max-w-[200px] border-none bg-transparent text-xs text-white/60 outline-none hover:text-white focus:text-white"
				>
					{Intl.supportedValuesOf('timeZone').map((tz) => (
						<option key={tz} value={tz} className="bg-charcoal">
							{tz.replace(/_/g, ' ')}
						</option>
					))}
				</select>
			</div>
		</div>
	);
}

export function Footer() {
	return (
		<footer className="bg-charcoal text-white">
			<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
				{/* Main footer content */}
				<div className="grid gap-12 border-b border-white/10 py-20 md:grid-cols-2 lg:grid-cols-4">
					{/* Brand column */}
					<div className="lg:col-span-2">
						<Link href="/" className="inline-block">
							<span className="font-display text-3xl font-bold tracking-tight">
								{siteConfig.logo.text}<span className="text-accent">{siteConfig.logo.accent}</span>
							</span>
						</Link>
						<p className="mt-6 max-w-md text-sm leading-relaxed text-white/60">
							{siteConfig.footer.description}
						</p>
						<div className="mt-8 flex gap-6">
							{siteConfig.footer.socials.map((social) => (
								<a
									key={social}
									href="#"
									className="text-xs font-medium uppercase tracking-widest text-white/40 transition-colors hover:text-accent"
								>
									{social}
								</a>
							))}
						</div>
					</div>

					{/* Services column */}
					<div>
						<h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
							Services
						</h4>
						<ul className="mt-6 space-y-3">
							{siteConfig.footer.serviceLinks.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="text-sm text-white/70 transition-colors hover:text-white"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Company column */}
					<div>
						<h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
							Company
						</h4>
						<ul className="mt-6 space-y-3">
							{siteConfig.footer.companyLinks.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="text-sm text-white/70 transition-colors hover:text-white"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Bottom bar */}
				<div className="flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
					<FooterSettings />
					<p className="text-xs text-white/30">
						&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved. Powered by{' '}
						<a
							href="https://opencals.com"
							target="_blank"
							rel="noopener noreferrer"
							className="text-white/50 transition-colors hover:text-accent"
						>
							Opencals
						</a>
					</p>
				</div>
			</div>
		</footer>
	);
}
