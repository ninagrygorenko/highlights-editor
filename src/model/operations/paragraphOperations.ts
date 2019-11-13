import { ParagraphBlock, TextBlock, TextBlockType } from "../TextBlock";

const wordLetterRegexp = /[0-9a-zA-z-]/;

const parseTextToBlocks = (text: string): { blocks: Array<TextBlock>, wordsCount: number } => {
	const result: Array<TextBlock> = [];
	let wordsCount = 0;
	let currentBlock: TextBlock = { type: TextBlockType.WORD, content: ""};
	for (let i = 0; i < text.length; i++) {
		const charType = text[i].match(wordLetterRegexp) ? TextBlockType.WORD :  TextBlockType.WHITESPACE;
		if (currentBlock.type !== charType) {
			if (currentBlock.content.length > 0) {
				result.push(currentBlock);
			}
			wordsCount += currentBlock.type === TextBlockType.WORD ? 1 : 0;
			currentBlock = { type: charType, content: ""};
		}
		currentBlock.content += text[i];
	}
	if (currentBlock.content.length > 0) {
		result.push(currentBlock);
		wordsCount += currentBlock.type === TextBlockType.WORD ? 1 : 0;
	}
	return { blocks: result, wordsCount };
};

const parseTextWithParagraphs = (text: string): Array<ParagraphBlock> => {
	const result: Array<ParagraphBlock> = [];
	if (text.length === 0) {
		return [];
	}
	let prevParagraphIsEmpty: boolean = false;
	text.split(/\n/).forEach((paragraphText: string) => {
		if (paragraphText.length > 0 || !prevParagraphIsEmpty) {
			result.push({
				type: TextBlockType.PARAGRAPH,
				hash: hashFunction(paragraphText),
				content: paragraphText,
				...parseTextToBlocks(paragraphText),
			});
			prevParagraphIsEmpty = paragraphText.length === 0;
			return;
		}
		prevParagraphIsEmpty = false;
	});
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
		content: paragraphText,
		hash: hashFunction(paragraphText),
		...parseTextToBlocks(paragraphText)
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
	parseTextWithParagraphs,
	getParagraphByContent,
	addCharacterToBlock,
	removeCharacterFromBlock
};