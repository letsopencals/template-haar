'use client';

import { useTimezone } from '@/contexts/timezone-context';
import moment from 'moment-timezone';

export function useDateFormatter() {
	const { timezone } = useTimezone();

	// Default formats — can be made configurable via store settings later
	const dateFormat = 'MMM D, YYYY';
	const timeFormat = 'h:mm A';
	const dateTimeFormat = `${dateFormat} ${timeFormat}`;

	/** Format a UTC date to user's timezone */
	const formatDate = (utcDate: string | Date | null | undefined): string => {
		if (!utcDate) return '';
		return moment.utc(utcDate).tz(timezone).format(dateFormat);
	};

	/** Format a UTC date to time in user's timezone */
	const formatTime = (utcDate: string | Date | null | undefined): string => {
		if (!utcDate) return '';
		return moment.utc(utcDate).tz(timezone).format(timeFormat);
	};

	/** Format a UTC date to date + time in user's timezone */
	const formatDateTime = (utcDate: string | Date | null | undefined): string => {
		if (!utcDate) return '';
		return moment.utc(utcDate).tz(timezone).format(dateTimeFormat);
	};

	/** Format with a custom moment format string */
	const formatCustom = (utcDate: string | Date | null | undefined, customFormat: string): string => {
		if (!utcDate) return '';
		return moment.utc(utcDate).tz(timezone).format(customFormat);
	};

	/** Parse separate date + time strings (from availability slots) into a moment in user's timezone */
	const parseSlotDateTime = (date: string, time: string): moment.Moment => {
		return moment.tz(`${date} ${time}`, ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm'], 'UTC').tz(timezone);
	};

	/** Format slot date/time from separate date + time strings */
	const formatSlot = (
		date: string,
		time: string,
		format: 'date' | 'time' | 'datetime' | string = 'datetime',
	): string => {
		const m = parseSlotDateTime(date, time);
		switch (format) {
			case 'date':
				return m.format(dateFormat);
			case 'time':
				return m.format(timeFormat);
			case 'datetime':
				return m.format(dateTimeFormat);
			default:
				return m.format(format);
		}
	};

	/** Format time range from slot start/end */
	const formatTimeRange = (fromDate: string, fromTime: string, toDate: string, toTime: string): [string, string] => {
		return [
			parseSlotDateTime(fromDate, fromTime).format(timeFormat),
			parseSlotDateTime(toDate, toTime).format(timeFormat),
		];
	};

	/** Format date range (multi-day) */
	const formatDateRange = (fromDate: string, toDate: string): string => {
		return `${formatDate(fromDate)} — ${formatDate(toDate)}`;
	};

	/** Format full datetime range */
	const formatDateTimeRange = (fromDate: string, fromTime: string, toDate: string, toTime: string): string => {
		const start = parseSlotDateTime(fromDate, fromTime);
		const end = parseSlotDateTime(toDate, toTime);
		return `${start.format(dateTimeFormat)} — ${end.format(dateTimeFormat)}`;
	};

	/** Format duration in seconds to human-readable string */
	const formatDuration = (seconds: number): string => {
		const days = Math.floor(seconds / 86400);
		const hours = Math.floor((seconds % 86400) / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);

		const parts: string[] = [];
		if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
		if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
		if (minutes > 0 && days === 0) parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);

		return parts.join(' ') || '0 minutes';
	};

	/** Format relative time (e.g., "Booked on Monday", "Booked last week") */
	const formatRelativeTime = (date: string | Date, maxDays: number | null = null): string | null => {
		const now = moment().tz(timezone);
		const bookingDate = moment.utc(date).tz(timezone);
		const daysAgo = now.diff(bookingDate, 'days');

		if (maxDays !== null && daysAgo > maxDays) return null;
		if (daysAgo < 7) return `Booked on ${bookingDate.format('dddd')}`;
		if (daysAgo < 14) return 'Booked last week';
		if (daysAgo < 30) return 'Booked this month';
		if (daysAgo < 60) return 'Booked last month';
		return `Booked on ${bookingDate.format(dateFormat)}`;
	};

	return {
		formatDate,
		formatTime,
		formatDateTime,
		formatCustom,
		formatSlot,
		formatTimeRange,
		formatDateRange,
		formatDateTimeRange,
		formatDuration,
		formatRelativeTime,
		parseSlotDateTime,
		dateFormat,
		timeFormat,
		dateTimeFormat,
		timezone,
	};
}
