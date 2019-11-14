import { None, Option } from "fp-ts/lib/Option";
import { HasHighlight } from "./HasHighlight";

export enum TextBlockType {
	WORD = "WORD",
	WHITESPACE = "WHITESPACE",
	PARAGRAPH = "PARAGRAPH"
}

export interface WhitespaceBlock {
	type: TextBlockType.WHITESPACE;
	content: string;
	highlight: None;
}

export interface WordBlock {
	type: TextBlockType.WORD;
	content: string;
	highlight: Option<HasHighlight>;
}
export type TextBlock = WhitespaceBlock | WordBlock;

export interface ParagraphBlock {
	type: TextBlockType.PARAGRAPH;
	content: string;
	blocks: Array<TextBlock>;
	wordsHighlighted: number;
	hash: number;
}