import { parseToTextParts } from "./TextPartsStore";


it('one word - one part', () => {
	const text = "Hello";
	const result = parseToTextParts(text);
	expect(result).toHaveLength(1);
});

it('one word with spaces - one part', () => {
	expect(parseToTextParts(" Hello ")).toHaveLength(1);
	expect(parseToTextParts(" Hello")).toHaveLength(1);
});

it('two words - two parts', () => {
	expect(parseToTextParts(" Hello  world")).toHaveLength(2);
	expect(parseToTextParts(" Hello  world!")).toHaveLength(2);
	expect(parseToTextParts(" Hello\nworld!")).toHaveLength(2);
	expect(parseToTextParts(" Hello world. ")).toHaveLength(2);
	expect(parseToTextParts(" Hello\nworld. ")).toHaveLength(2);
});
