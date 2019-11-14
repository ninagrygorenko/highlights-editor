import { addCharacterToBlock, getParagraphByContent, parseTextToBlocks, removeCharacterFromBlock } from "./paragraphText.operations";
import { ParagraphBlock, TextBlockType } from "../../model";

it('parseTextToBlocks - empty', () => {
	const result = parseTextToBlocks("");
	expect(result).toHaveLength(0);
});

it('parseTextToBlocks - normal text', () => {
	const result = parseTextToBlocks("");
	expect(result).toHaveLength(0);
});

it('parseTextToBlocks - partially empty paragraph', () => {
	const result = parseTextToBlocks(" Hello");
	expect(result).toHaveLength(2);
});

it('parseTextToBlocks - special characters like - ', () => {
	const result = parseTextToBlocks("One-liner");
	expect(result).toHaveLength(1);
});

it('parseTextToBlocks - two words', () => {
	const text = "Hello world";
	const result = parseTextToBlocks(text);
	expect(result).toHaveLength(3);
	expect(result[0].type).toEqual(TextBlockType.WORD);
	expect(result[1].type).toEqual(TextBlockType.WHITESPACE);
	expect(result[2].type).toEqual(TextBlockType.WORD);
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
		wordsHighlighted: 0,
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