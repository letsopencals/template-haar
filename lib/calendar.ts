import { siteConfig } from '@/lib/site-config';

/** One calendar entry. Times are epoch ms (UTC instants). */
export interface CalendarEvent {
	uid: string;
	title: string;
	start: number;
	end: number;
	location?: string;
	description?: string;
}

function stamp(ms: number): string {
	return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function esc(text: string): string {
	return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** `data:` URL for an .ics file with every event (use as an <a download> href). */
export function icsHref(events: readonly CalendarEvent[]): string {
	const now = stamp(Date.now());
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		`PRODID:-//${siteConfig.name}//Booking//EN`,
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		...events.flatMap((e) => [
			'BEGIN:VEVENT',
			`UID:${e.uid}@${siteConfig.name.toLowerCase()}`,
			`DTSTAMP:${now}`,
			`DTSTART:${stamp(e.start)}`,
			`DTEND:${stamp(e.end)}`,
			`SUMMARY:${esc(e.title)}`,
			...(e.location ? [`LOCATION:${esc(e.location)}`] : []),
			...(e.description ? [`DESCRIPTION:${esc(e.description)}`] : []),
			'BEGIN:VALARM',
			'TRIGGER:-PT2H',
			'ACTION:DISPLAY',
			`DESCRIPTION:${esc(e.title)}`,
			'END:VALARM',
			'END:VEVENT',
		]),
		'END:VCALENDAR',
	];
	return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join('\r\n'))}`;
}

/** "Add to Google Calendar" link for a single event. */
export function googleCalendarHref(e: CalendarEvent): string {
	const params = new URLSearchParams({
		action: 'TEMPLATE',
		text: e.title,
		dates: `${stamp(e.start)}/${stamp(e.end)}`,
	});
	if (e.location) params.set('location', e.location);
	if (e.description) params.set('details', e.description);
	return `https://calendar.google.com/calendar/render?${params}`;
}

/** File name for the .ics download. */
export const ICS_FILENAME = `${siteConfig.name.toLowerCase()}-appointment.ics`;
