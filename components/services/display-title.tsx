/**
 * Splits a service title into roman words + an italic last word, the HAAR
 * headline voice: "Balayage & <em>Highlights</em>". One-word titles go fully italic.
 */
export function splitDisplayTitle(title: string): { roman: string; italic: string } {
	const words = title.trim().split(/\s+/);
	if (words.length <= 1) return { roman: '', italic: title.trim() };
	return { roman: words.slice(0, -1).join(' '), italic: words[words.length - 1]! };
}

export function DisplayTitle({ text, italicClassName }: { text: string; italicClassName?: string }) {
	const { roman, italic } = splitDisplayTitle(text);
	return (
		<>
			{roman ? `${roman} ` : null}
			<em className={italicClassName}>{italic}</em>
		</>
	);
}
