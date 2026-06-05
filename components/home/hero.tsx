import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import hero1 from '@/public/images/hero/hero-main.jpg';
import hero2 from '@/public/images/hero/hero-secondary.jpg';

export function Hero() {
	const { hero } = siteConfig;

	return (
		<section id="hero" className="relative overflow-hidden bg-white">
			{/* Top accent line */}
			<div className="absolute top-0 left-0 right-0 h-[3px] bg-accent" />

			<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
				<div className="grid items-center gap-8 pt-28 pb-16 lg:grid-cols-12 lg:pt-32 lg:pb-20">
					{/* Left content */}
					<div className="relative z-10 lg:col-span-5 lg:py-16">
						<div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
							<p className="text-xs font-semibold uppercase tracking-[0.3em] text-warm-gray">
								{hero.subtitle}
							</p>
						</div>

						<h1
							className="heading-display mt-6 text-6xl text-charcoal animate-fade-up sm:text-7xl lg:text-8xl"
							style={{ animationDelay: '0.2s' }}
						>
							{hero.heading.map((line, i) => (
								<span key={i}>
									{line}
									<br />
								</span>
							))}
							<span className="heading-display-italic text-accent">{hero.headingAccent}</span>
						</h1>

						<p
							className="mt-8 max-w-sm text-base leading-relaxed text-warm-gray animate-fade-up"
							style={{ animationDelay: '0.35s' }}
						>
							{hero.body}
						</p>

						<div
							className="mt-10 flex items-center gap-6 animate-fade-up"
							style={{ animationDelay: '0.5s' }}
						>
							<Link
								href={hero.cta.href}
								className="group relative inline-flex items-center gap-3 bg-charcoal px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-accent"
							>
								{hero.cta.label}
								<svg
									className="h-4 w-4 transition-transform group-hover:translate-x-1"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2}
								>
									<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
								</svg>
							</Link>
							<Link
								href={hero.secondaryCta.href}
								className="link-underline text-xs font-semibold uppercase tracking-[0.2em] text-charcoal"
							>
								{hero.secondaryCta.label}
							</Link>
						</div>
					</div>

					{/* Right — Image grid */}
					<div className="relative lg:col-span-7">
						<div className="grid grid-cols-12 gap-4">
							{/* Main large image */}
							<div
								className="col-span-8 aspect-[3/4] overflow-hidden animate-fade-in"
								style={{ animationDelay: '0.2s' }}
							>
								<img src={hero1.src} className="image-placeholder h-full w-full object-cover" />
							</div>

							{/* Side column */}
							<div className="col-span-4 flex flex-col gap-4">
								<div
									className="aspect-square overflow-hidden animate-fade-up"
									style={{ animationDelay: '0.35s' }}
								>
									<img src={hero2.src} className="image-placeholder h-full w-full object-cover" />
								</div>

								<div
									className="flex flex-1 items-center justify-center bg-accent p-6 animate-fade-up"
									style={{ animationDelay: '0.5s' }}
								>
									<div className="text-center">
										<span className="font-display text-4xl font-bold text-white">{hero.stat.value}</span>
										<p className="mt-1 text-xs font-medium uppercase tracking-widest text-white/80 whitespace-pre-line">
											{hero.stat.label}
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Oversized background text */}
						<div
							className="pointer-events-none absolute -bottom-10 -right-10 z-0 select-none opacity-[0.04] animate-fade-in"
							style={{ animationDelay: '0.4s' }}
						>
							<span className="font-display text-[12rem] font-black leading-none tracking-tighter text-charcoal lg:text-[18rem]">
								{hero.backgroundText}
							</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
