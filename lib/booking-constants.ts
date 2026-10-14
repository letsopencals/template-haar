/** The numbered sections of the /booking/[slug] consultation-card composer, in unlock order. */
export const BOOKING_SECTIONS = ['service', 'stylist', 'time', 'extras'] as const;
export type BookingSection = (typeof BOOKING_SECTIONS)[number];
/** Index into BOOKING_SECTIONS: 0 service · 1 stylist · 2 day & time · 3 finishing touches. */
export type BookingSectionIndex = 0 | 1 | 2 | 3;

export const SECTION_TITLES: Record<BookingSection, string> = {
	service: 'Your service',
	stylist: 'Your stylist',
	time: 'Day & time',
	extras: 'Finishing touches',
};
