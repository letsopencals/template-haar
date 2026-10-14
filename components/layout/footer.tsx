'use client';

import { memo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useLocation } from '@/contexts/location-context';
import { useTimezone } from '@/contexts/timezone-context';
import { Seal } from '@/components/motifs/seal';
import { OpenTodayChip } from '@/components/home/open-today-chip';
import { siteConfig } from '@/lib/site-config';
import { useHydrated } from '@/hooks/use-hydrated';

/**
 * Location + timezone selectors. Behaviour is unchanged from the original
 * template: the location context persists to localStorage `@opencals/location`,
 * the timezone context to the `@opencals/timezone` cookie.
 */
function FooterSettings() {
	const { locations, selectedLocationId, setSelectedLocationId } = useLocation();
	const { timezone, setTimezone } = useTimezone();
	// The server guesses its own zone and ships a different tz database, so the
	// list and the selected zone only render after hydration.
	const hydrated = useHydrated();
	const timezones = hydrated ? Intl.supportedValuesOf('timeZone') : [];

	const hasLocations = locations.length > 1;

	return (
		<div className="flex flex-wrap items-center gap-6">
			{hasLocations ? (
				<label className="flex items-center gap-2">
					<span className="sr-only">Salon</span>
					<svg aria-hidden className="h-3.5 w-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
						<path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					<select
						value={selectedLocationId ?? ''}
						onChange={(e) => setSelectedLocationId(e.target.value || null)}
						className="border-none bg-transparent text-xs text-white/60 outline-none hover:text-white focus:text-white focus-visible:outline-1 focus-visible:outline-accent"
					>
						<option value="" className="bg-charcoal">
							All Locations
						</option>
						{locations.map((l) => (
							<option key={l.id} value={l.id} className="bg-charcoal">
								{l.title ?? 'Location'}
							</option>
						))}
					</select>
				</label>
			) : null}
			<label className="flex items-center gap-2">
				<span className="sr-only">Timezone</span>
				<svg aria-hidden className="h-3.5 w-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<select
					value={hydrated ? timezone : ''}
					onChange={(e) => setTimezone(e.target.value)}
					className="max-w-[200px] border-none bg-transparent text-xs text-white/60 outline-none hover:text-white focus:text-white focus-visible:outline-1 focus-visible:outline-accent"
				>
					{hydrated ? null : <option value="" className="bg-charcoal" />}
					{timezones.map((tz) => (
						<option key={tz} value={tz} className="bg-charcoal">
							{tz.replace(/_/g, ' ')}
						</option>
					))}
				</select>
			</label>
		</div>
	);
}

/** Visual-only newsletter line: no request is made. */
const Newsletter = memo(function Newsletter() {
	const [sent, setSent] = useState(false);
	const onSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setSent(true);
	};
	return sent ? (
		<p role="status" className="border-b border-white/25 pb-3 font-display text-xl italic text-brass-light">
			Thank you — the next letter is on its way.
		</p>
	) : (
		<form onSubmit={onSubmit} className="group flex items-end gap-4 border-b border-white/25 pb-3 transition-colors focus-within:border-accent">
			<label className="flex-1">
				<span className="sr-only">Email address</span>
				<input
					type="email"
					required
					placeholder="Your email address"
					autoComplete="email"
					className="w-full bg-transparent font-display text-xl text-white outline-none placeholder:text-white/35 md:text-2xl"
				/>
			</label>
			<button type="submit" className="eyebrow shrink-0 text-white/70 outline-none transition-colors hover:text-accent focus-visible:text-accent">
				Subscribe <span aria-hidden>→</span>
			</button>
		</form>
	);
});

function LocationsList() {
	const { locations } = useLocation();
	const physical = locations.filter((l) => l.type === 'physical' && l.title);
	if (physical.length === 0) {
		return (
			<address className="whitespace-pre-line not-italic leading-relaxed text-white/70">{siteConfig.contact.address}</address>
		);
	}
	return (
		<ul className="space-y-2 text-white/70">
			{physical.map((l) => (
				<li key={l.id}>{l.title}</li>
			))}
		</ul>
	);
}

const HOURS = siteConfig.contact.hours.split('\n').map((line) => {
	const sep = line.indexOf(':');
	return { days: line.slice(0, sep).trim(), time: line.slice(sep + 1).trim() };
});

export function Footer() {
	return (
		<footer className="grain overflow-hidden bg-charcoal text-white">
			<div className="container-x relative z-[2]">
				{/* Newsletter + seal */}
				<div className="grid items-end gap-12 border-b border-white/10 pb-16 pt-20 md:grid-cols-12 md:pt-28">
					<div className="md:col-span-7">
						<span className="eyebrow text-brass-light">The Letter</span>
						<p className="mt-5 max-w-lg font-display text-3xl leading-[1.1] tracking-[-0.02em] md:text-4xl">
							Seasonal notes from the salon, <em className="text-accent">four times a year.</em>
						</p>
						<div className="mt-10 max-w-xl">
							<Newsletter />
						</div>
					</div>
					<div className="flex md:col-span-4 md:col-start-9 md:justify-end">
						<Seal motion="spin" size={128} className="text-brass-light" />
					</div>
				</div>

				{/* Columns */}
				<div className="grid gap-12 border-b border-white/10 py-16 text-sm sm:grid-cols-2 lg:grid-cols-4">
					<div>
						<h2 className="eyebrow text-white/40">The House</h2>
						<p className="mt-5 max-w-xs leading-relaxed text-white/60">{siteConfig.footer.description}</p>
					</div>
					<div>
						<h2 className="eyebrow text-white/40">Salons</h2>
						<div className="mt-5">
							<LocationsList />
						</div>
						<div className="mt-5 flex flex-col gap-1 text-white/70">
							<a href={`tel:${siteConfig.contact.phone.replace(/[^+\d]/g, '')}`} className="tabular w-fit hover:text-white">
								{siteConfig.contact.phone}
							</a>
							<a href={`mailto:${siteConfig.contact.email}`} className="w-fit hover:text-white">
								{siteConfig.contact.email}
							</a>
						</div>
					</div>
					<div>
						<h2 className="eyebrow text-white/40">Hours</h2>
						<dl className="mt-5 space-y-2">
							{HOURS.map((h) => (
								<div key={h.days} className="flex justify-between gap-4 border-b border-dotted border-white/15 pb-2">
									<dt className="text-white/70">{h.days}</dt>
									<dd className="tabular text-white/50">{h.time}</dd>
								</div>
							))}
						</dl>
						<OpenTodayChip tone="dark" className="mt-5" />
					</div>
					<div className="grid grid-cols-2 gap-8 sm:col-span-2 lg:col-span-1">
						<nav aria-label="Services">
							<h2 className="eyebrow text-white/40">Menu</h2>
							<ul className="mt-5 space-y-2.5">
								{siteConfig.footer.serviceLinks.map((link) => (
									<li key={link.href}>
										<Link href={link.href} className="link-underline text-white/70 hover:text-white">
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</nav>
						<nav aria-label="Company">
							<h2 className="eyebrow text-white/40">Company</h2>
							<ul className="mt-5 space-y-2.5">
								{siteConfig.footer.companyLinks.map((link) => (
									<li key={link.href}>
										<Link href={link.href} className="link-underline text-white/70 hover:text-white">
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</nav>
					</div>
				</div>

				{/* Settings + legal */}
				<div className="flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
					<FooterSettings />
					<div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/35">
						<ul className="flex gap-5">
							{siteConfig.footer.socials.map((social) => (
								<li key={social}>
									<a href="#" className="eyebrow text-white/45 hover:text-accent">
										{social}
									</a>
								</li>
							))}
						</ul>
						<p>
							&copy; {new Date().getFullYear()} {siteConfig.name}. Powered by{' '}
							<a href="https://opencals.com" target="_blank" rel="noopener noreferrer" className="text-white/55 hover:text-accent">
								Opencals
							</a>
						</p>
					</div>
				</div>
			</div>

			{/* Giant cropped wordmark */}
			<div aria-hidden className="relative z-[2] -mb-[0.24em] select-none overflow-hidden text-center font-display text-[30vw] leading-[0.8] tracking-[-0.06em] text-white/[0.07]">
				{siteConfig.logo.text}
				<span className="text-accent/60">{siteConfig.logo.accent}</span>
			</div>
		</footer>
	);
}
