import { ParagraphBlock, TextBlock, TextBlockType } from "../../model";
import { none } from "fp-ts/lib/Option";

const wordLetterRegexp = /[0-9a-zA-z]/;
const inWordNonLetterRegexp = /[-']/;

const parseTextToBlocks = (text: string): Array<TextBlock> => {
	const result: Array<TextBlock> = [];
	let currentBlock: TextBlock = { type: TextBlockType.WORD, content: "", highlight: none };
	for (let i = 0; i < text.length; i++) {
		let charType = text[i].match(wordLetterRegexp) ? TextBlockType.WORD : TextBlockType.WHITESPACE;

		// special case when ' or - symbol should follow some alphabetical character. In other cases it is not a word
		if (charType === TextBlockType.WHITESPACE
			&& text[i].match(inWordNonLetterRegexp)
			&& currentBlock.type === TextBlockType.WORD
			&& currentBlock.content.charAt(currentBlock.content.length - 1).match(wordLetterRegexp)) {
			charType = TextBlockType.WORD;
		}
		if (currentBlock.type !== charType) {
			if (currentBlock.content.length > 0) {
				result.push(currentBlock);
			}
			currentBlock = { type: charType, content: "", highlight: none } as TextBlock;
		}
		currentBlock.content += text[i];
	}
	if (currentBlock.content.length > 0) {
		result.push(currentBlock);
	}
	return result;
};

const hashFunction = (text: string): number => {
	let hash = 0, i, chr;
	if (text.length === 0) return hash;
	for (i = 0; i < text.length; i++) {
		chr   = text.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};

const getParagraphByContent = (paragraphText: string): ParagraphBlock => {
	return {
		type: TextBlockType.PARAGRAPH,
		wordsHighlighted: 0,
		content: paragraphText,
		hash: hashFunction(paragraphText),
		blocks: parseTextToBlocks(paragraphText)
	};
};

const addCharacterToBlock = (paragraph: ParagraphBlock, character: string, position: number): ParagraphBlock => {
	const paragraphText = paragraph.content.slice(0, position) + character + paragraph.content.slice(position);
	return getParagraphByContent(paragraphText);
};

const removeCharacterFromBlock = (paragraph: ParagraphBlock, position: number): ParagraphBlock => {
	const paragraphText = paragraph.content.slice(0, Math.max(0, position - 1)) + paragraph.content.slice(position);
	return getParagraphByContent(paragraphText);
};

export {
	parseTextToBlocks,
	getParagraphByContent,
	addCharacterToBlock,
	removeCharacterFromBlock
};