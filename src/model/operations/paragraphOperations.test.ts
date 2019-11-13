import {
	addCharacterToBlock,
	getParagraphByContent,
	parseTextToBlocks,
	parseTextWithParagraphs,
	removeCharacterFromBlock,
} from "./paragraphOperations";
import { ParagraphBlock, TextBlockType } from "../TextBlock";

it('empty', () => {
	const result = parseTextToBlocks("");
	expect(result).toHaveLength(0);
});

it('empty paragraph', () => {
	const result = parseTextWithParagraphs("");
	expect(result).toHaveLength(0);
	expect(parseTextWithParagraphs("\n")).toHaveLength(1);
});

it('partially empty paragraph', () => {
	const result = parseTextWithParagraphs("\nHello");
	expect(result).toHaveLength(2);
	expect(parseTextWithParagraphs("Hello\nworld")).toHaveLength(2);
});

it('two paragraphs', () => {
	const text = "Hello world!\nThis is me";
	const result = parseTextWithParagraphs(text);
	expect(result).toHaveLength(2);
	expect(result[0].type).toEqual(TextBlockType.PARAGRAPH);
	expect(result[1].type).toEqual(TextBlockType.PARAGRAPH);
	expect((result[0] as ParagraphBlock).blocks).toHaveLength(4);
	expect((result[1] as ParagraphBlock).blocks).toHaveLength(5);
});

it('line breaks paragraphs', () => {
	const text = "Hello world!\n\nThis is me\n\n";
	const result = parseTextWithParagraphs(text);
	expect(result).toHaveLength(4);
});

it("getParagraphByContent", () => {
	let paragraphBlock: ParagraphBlock = getParagraphByContent("ab bc");
	expect(paragraphBlock.content).toHaveLength(5);
	expect(paragraphBlock.blocks).toHaveLength(3);
	expect(paragraphBlock.content).toEqual("ab bc");

	paragraphBlock = getParagraphByContent(" ab bc");
	expect(paragraphBlock.content).toHaveLength(6);
	expect(paragraphBlock.blocks).toHaveLength(4);
	expect(paragraphBlock.blocks[0].type).toEqual(TextBlockType.WHITESPACE);
});

it("addCharacterToBlock", () => {
	let paragraphBlock: ParagraphBlock = {
		type: TextBlockType.PARAGRAPH,
		content: "",
		blocks: [],
		wordsCount: 0,
		hash: 0
	};

	paragraphBlock = addCharacterToBlock(paragraphBlock, "a", 0);
	expect(paragraphBlock.content).toHaveLength(1);
	expect(paragraphBlock.blocks).toHaveLength(1);
	expect(paragraphBlock.content).toEqual("a");

	paragraphBlock = addCharacterToBlock(paragraphBlock, "b", 0);
	expect(paragraphBlock.content).toHaveLength(2);
	expect(paragraphBlock.blocks).toHaveLength(1);
	expect(paragraphBlock.content).toEqual("ba");

	paragraphBlock = addCharacterToBlock(paragraphBlock, " ", 0);
	expect(paragraphBlock.content).toHaveLength(3);
	expect(paragraphBlock.blocks).toHaveLength(2);
	expect(paragraphBlock.blocks[0].type).toEqual(TextBlockType.WHITESPACE);
	expect(paragraphBlock.content).toEqual(" ba");

	paragraphBlock = addCharacterToBlock(paragraphBlock, " ", 3);
	expect(paragraphBlock.content).toHaveLength(4);
	expect(paragraphBlock.blocks).toHaveLength(3);
	expect(paragraphBlock.blocks[2].type).toEqual(TextBlockType.WHITESPACE);
	expect(paragraphBlock.content).toEqual(" ba ");
});

it("removeCharacterFromBlock", () => {
	let paragraphBlock: ParagraphBlock = getParagraphByContent("ab bc");

	paragraphBlock = removeCharacterFromBlock(paragraphBlock, 0);
	expect(paragraphBlock.content).toHaveLength(5);
	expect(paragraphBlock.blocks).toHaveLength(3);
	expect(paragraphBlock.content).toEqual("ab bc");

	paragraphBlock = removeCharacterFromBlock(paragraphBlock, 1);
	expect(paragraphBlock.content).toHaveLength(4);
	expect(paragraphBlock.blocks).toHaveLength(3);
	expect(paragraphBlock.content).toEqual("b bc");

	paragraphBlock = removeCharacterFromBlock(paragraphBlock, 2);
	expect(paragraphBlock.content).toHaveLength(3);
	expect(paragraphBlock.blocks).toHaveLength(1);
	expect(paragraphBlock.blocks[0].type).toEqual(TextBlockType.WORD);
	expect(paragraphBlock.content).toEqual("bbc");
});

