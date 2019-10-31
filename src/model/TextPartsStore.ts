export interface TextPart {
	prefix: string | null;
	word: string | null;
	suffix: string | null;
}

const partToTextPart = (part: string, prevIndex: number, textParts: TextPart[]): number => {
	const wordStart = part.search(/\S/gm);
	if (wordStart > -1) {
		const prefix = part.substring(0, wordStart);
		const word = part.trim();
		const suffix = part.substring(part.indexOf(word) + word.length);
		prevIndex += part.length;
		textParts.push({
			prefix, word, suffix
		});
	}
	return prevIndex;
};

const parseToTextParts = (text: string): Array<TextPart> => {
	let textParts: Array<TextPart> = [];
	let prevIndex = -1;
	let result: RegExpExecArray | null;
	const regexp = /(\s|,|\.|\?|!|:)+/gm;
	while ((result = regexp.exec(text)) !== null) {
		const part = text.substring(prevIndex + 1, result.index + result.length - 1);
		prevIndex = partToTextPart(part, prevIndex, textParts);
	}
	if (prevIndex < text.length - 1) {
		const leftoverText = text.substring(prevIndex + 1, text.length);
		const wordStart = leftoverText.search(/\S/gm);
		if (wordStart < 0 && textParts.length > 0) {
			textParts[textParts.length - 1].suffix = textParts[textParts.length - 1].suffix
				? textParts[textParts.length - 1].suffix + leftoverText
				: leftoverText;
		} else {
			partToTextPart(leftoverText, prevIndex, textParts)
		}
	}
	return textParts;
};

export {
	parseToTextParts,
};