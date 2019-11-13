export enum TextBlockType {
	WORD = "WORD",
	WHITESPACE = "WHITESPACE",
	PARAGRAPH = "PARAGRAPH"
}

export interface TextBlock {
	type: TextBlockType.WORD | TextBlockType.WHITESPACE;
	content: string;
}

export interface ParagraphBlock {
	type: TextBlockType.PARAGRAPH;
	content: string;
	blocks: Array<TextBlock>;
	wordsCount: number;
	hash: number;
	ref?: HTMLDivElement | null;
}

export type EditorBlock = TextBlock | ParagraphBlock;