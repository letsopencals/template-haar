/**
 * Parses the human-written opening hours in `siteConfig.contact.hours`
 * ("Mon — Fri: 9:00 AM — 8:00 PM\nSat: …") into a weekly timetable, so the
 * home chip ("Open today until 20:00") and the contact timetable share one
 * source of truth. Pure + isomorphic — compute "today" on the client only.
 */

export interface DayHours {
	/** JS weekday: 0 = Sunday … 6 = Saturday. */
	day: number;
	short: string;
	label: string;
	/** Minutes from midnight; null when closed. */
	open: number | null;
	close: number | null;
}

const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
/** Display order: Monday first. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

function dayIndex(token: string): number {
	const t = token.trim().slice(0, 3).toLowerCase();
	return SHORT.findIndex((d) => d.toLowerCase() === t);
}

function parseTime(token: string): number | null {
	const m = token.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
	if (!m) return null;
	let h = Number(m[1]);
	const min = Number(m[2] ?? 0);
	const mer = m[3]?.toLowerCase();
	if (mer === 'pm' && h < 12) h += 12;
	if (mer === 'am' && h === 12) h = 0;
	return h * 60 + min;
}

export function parseOpeningHours(source: string): DayHours[] {
	const week: DayHours[] = SHORT.map((short, day) => ({ day, short, label: LONG[day]!, open: null, close: null }));
	for (const line of source.split('\n')) {
		const sep = line.indexOf(':');
		if (sep < 0) continue;
		const daysPart = line.slice(0, sep);
		const timesPart = line.slice(sep + 1);
		const [fromDay, toDay] = daysPart.split(/[—–-]/).map(dayIndex);
		if (fromDay === undefined || fromDay < 0) continue;
		const [openTok, closeTok] = timesPart.split(/\s[—–-]\s/);
		const open = openTok ? parseTime(openTok) : null;
		const close = closeTok ? parseTime(closeTok) : null;
		const end = toDay !== undefined && toDay >= 0 ? toDay : fromDay;
		for (let d = fromDay; ; d = (d + 1) % 7) {
			week[d] = { ...week[d]!, open, close };
			if (d === end) break;
		}
	}
	return week;
}

export function formatClock(minutes: number, timeFormat: '12H' | '24H' = '24H'): string {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	if (timeFormat === '24H') return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
	const h12 = h % 12 === 0 ? 12 : h % 12;
	return `${h12}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h < 12 ? 'AM' : 'PM'}`;
}

export type OpenState =
	| { kind: 'open'; until: number }
	| { kind: 'later'; from: number }
	| { kind: 'closed'; next: DayHours | null };

/** Open/closed status for a given moment (visitor's local clock). */
export function openStateAt(week: DayHours[], now: Date): OpenState {
	const today = week[now.getDay()]!;
	const mins = now.getHours() * 60 + now.getMinutes();
	if (today.open !== null && today.close !== null) {
		if (mins >= today.open && mins < today.close) return { kind: 'open', until: today.close };
		if (mins < today.open) return { kind: 'later', from: today.open };
	}
	for (let i = 1; i <= 7; i++) {
		const d = week[(now.getDay() + i) % 7]!;
		if (d.open !== null) return { kind: 'closed', next: d };
	}
	return { kind: 'closed', next: null };
}
