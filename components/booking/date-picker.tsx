'use client';

import { useState, useMemo } from 'react';

interface DatePickerProps {
	selectedDate: string | null;
	onDateSelect: (date: string) => void;
	availableDates?: Set<string>;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

export function DatePicker({ selectedDate, onDateSelect, availableDates: _availableDates }: DatePickerProps) {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const [currentMonth, setCurrentMonth] = useState(today.getMonth());
	const [currentYear, setCurrentYear] = useState(today.getFullYear());

	const days = useMemo(() => {
		const firstDay = new Date(currentYear, currentMonth, 1).getDay();
		const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
		const cells: (number | null)[] = [];

		for (let i = 0; i < firstDay; i++) cells.push(null);
		for (let d = 1; d <= daysInMonth; d++) cells.push(d);

		return cells;
	}, [currentMonth, currentYear]);

	function prevMonth() {
		if (currentMonth === 0) {
			setCurrentMonth(11);
			setCurrentYear((y) => y - 1);
		} else {
			setCurrentMonth((m) => m - 1);
		}
	}

	function nextMonth() {
		if (currentMonth === 11) {
			setCurrentMonth(0);
			setCurrentYear((y) => y + 1);
		} else {
			setCurrentMonth((m) => m + 1);
		}
	}

	function formatDateStr(day: number): string {
		return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
	}

	function isPast(day: number): boolean {
		const date = new Date(currentYear, currentMonth, day);
		return date < today;
	}

	const canGoPrev =
		currentYear > today.getFullYear() ||
		(currentYear === today.getFullYear() && currentMonth > today.getMonth());

	return (
		<div>
			{/* Month navigation */}
			<div className="flex items-center justify-between">
				<button
					onClick={prevMonth}
					disabled={!canGoPrev}
					className="flex h-10 w-10 items-center justify-center text-charcoal transition-colors hover:text-accent disabled:opacity-30"
				>
					<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
					</svg>
				</button>
				<h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-charcoal">
					{MONTHS[currentMonth]} {currentYear}
				</h3>
				<button
					onClick={nextMonth}
					className="flex h-10 w-10 items-center justify-center text-charcoal transition-colors hover:text-accent"
				>
					<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
					</svg>
				</button>
			</div>

			{/* Day headers */}
			<div className="mt-4 grid grid-cols-7 gap-1">
				{DAYS.map((d) => (
					<div
						key={d}
						className="py-2 text-center text-xs font-medium uppercase tracking-wider text-warm-gray"
					>
						{d}
					</div>
				))}
			</div>

			{/* Calendar grid */}
			<div className="grid grid-cols-7 gap-1">
				{days.map((day, i) => {
					if (day === null) {
						return <div key={`empty-${i}`} className="aspect-square" />;
					}

					const dateStr = formatDateStr(day);
					const past = isPast(day);
					const isSelected = dateStr === selectedDate;
					const isToday =
						day === today.getDate() &&
						currentMonth === today.getMonth() &&
						currentYear === today.getFullYear();

					return (
						<button
							key={dateStr}
							onClick={() => !past && onDateSelect(dateStr)}
							disabled={past}
							className={`
								relative flex aspect-square items-center justify-center text-sm font-medium transition-all
								${past ? 'cursor-not-allowed text-charcoal/20' : 'cursor-pointer hover:bg-cream'}
								${isSelected ? 'bg-charcoal text-white hover:bg-charcoal' : 'text-charcoal'}
								${isToday && !isSelected ? 'font-bold' : ''}
							`}
						>
							{day}
							{isToday && !isSelected && (
								<span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" />
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}
