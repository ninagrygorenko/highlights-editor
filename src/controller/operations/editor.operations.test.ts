import { getParagraphByContent } from "./paragraphText.operations";
import { none, some } from "fp-ts/lib/Option";
import { addCharacterInCurrentPosition, deleteCharacterInCurrentPosition, removeCharacterInCurrentPosition } from "./editor.operations";
import * as selections from "./selection.operations";
import { EditorModel } from "../../model";

const getCaretCharacterOffsetWithinOriginal = selections.getCaretCharacterOffsetWithin;

describe("editor.operations", () => {
	const editorDiv = document.createElement("div");
	const nonEmptyModel: EditorModel = {
		content: [ { ...getParagraphByContent("Hello world"), ref: document.createElement("div") } ],
		caretPosition: { paragraph: none, offset: 0 }
	};

	const emptyModel: EditorModel = {
		content: [],
		caretPosition: { paragraph: none, offset: 0}
	};

	afterEach(() => {
		// @ts-ignore
		selections.getCaretCharacterOffsetWithin = getCaretCharacterOffsetWithinOriginal;
	});

	it("addCharacterInCurrentPosition", () => {
		// @ts-ignore
		selections.getCaretCharacterOffsetWithin = () => 2;
		let result = addCharacterInCurrentPosition(' ', nonEmptyModel, some(nonEmptyModel.content[0]));
		expect(result.content).toHaveLength(1);
		expect(result.content[0].content).toEqual("He llo world");

		// @ts-ignore
		selections.getCaretCharacterOffsetWithin = () => 0;
		result = addCharacterInCurrentPosition('a', emptyModel, none);
		expect(result.content).toHaveLength(1);
		expect(result.content[0].content).toEqual("a");

	});

	it("addCharacterInCurrentPosition (new line)", () => {
		// @ts-ignore
		selections.getCaretCharacterOffsetWithin = () => 2;
		// split
		let result = addCharacterInCurrentPosition('\n', nonEmptyModel, some(nonEmptyModel.content[0]));
		expect(result.content).toHaveLength(2);
		expect(result.content[0].content).toEqual("He");
		expect(result.content[1].content).toEqual("llo world");

		// @ts-ignore
		selections.getCaretCharacterOffsetWithin = () => nonEmptyModel.content[0].content.length;
		// add
		result = addCharacterInCurrentPosition('\n', nonEmptyModel, some(nonEmptyModel.content[0]));
		expect(result.content).toHaveLength(2);
		expect(result.content[0].content).toEqual("Hello world");
		expect(result.content[1].content).toEqual("");

		// @ts-ignore
		selections.getCaretCharacterOffsetWithin = () => 0;
		// add
		result = addCharacterInCurrentPosition('\n', nonEmptyModel, some(nonEmptyModel.content[0]));
		expect(result.content).toHaveLength(2);
		expect(result.content[0].content).toEqual("");
		expect(result.content[1].content).toEqual("Hello world");
	});

	it("removeCharacterInCurrentPosition (backspace)", () => {
		// @ts-ignore
		selections.getCaretCharacterOffsetWithin = () => 2;
		// simple remove 1 char
		let result = removeCharacterInCurrentPosition(nonEmptyModel, some(nonEmptyModel.content[0]));
		expect(result.content).toHaveLength(1);
		expect(result.content[0].content).toEqual("Hllo world");

		// @ts-ignore
		selections.getCaretCharacterOffsetWithin = () => 0;
		// do nothing at the beginning of the editor
		result = removeCharacterInCurrentPosition(nonEmptyModel, some(nonEmptyModel.content[0]));
		expect(result.content).toHaveLength(1);
		expect(result.content[0].content).toEqual(nonEmptyModel.content[0].content);

		const model: EditorModel = {
			...nonEmptyModel,
			content: [ ...nonEmptyModel.content, { ...getParagraphByContent("New line"), ref: document.createElement("div") }]
		};
		// @ts-ignore
		selections.getCaretCharacterOffsetWithin = () => 0;
		// merge
		result = removeCharacterInCurrentPosition(model, some(model.content[1]));
		expect(result.content).toHaveLength(1);
		expect(result.content[0].content).toEqual("Hello worldNew line");
	});

	it("deleteCharacterInCurrentPosition (delete)", () => {
		// @ts-ignore
		selections.getCaretCharacterOffsetWithin = () => 2;
		// simple remove 1 char
		let result = deleteCharacterInCurrentPosition(nonEmptyModel, some(nonEmptyModel.content[0]));
		expect(result.content).toHaveLength(1);
		expect(result.content[0].content).toEqual("Helo world");

		// @ts-ignore
		selections.getCaretCharacterOffsetWithin = () => nonEmptyModel.content[0].content.length;
		// do nothing at the end of the editor
		result = deleteCharacterInCurrentPosition(nonEmptyModel, some(nonEmptyModel.content[0]));
		expect(result.content).toHaveLength(1);
		expect(result.content[0].content).toEqual(nonEmptyModel.content[0].content);

		const model: EditorModel = {
			...nonEmptyModel,
			content: [ ...nonEmptyModel.content, { ...getParagraphByContent("New line"), ref: document.createElement("div") }]
		};
		// @ts-ignore
		selections.getCaretCharacterOffsetWithin = () => model.content[0].content.length;
		// merge
		result = deleteCharacterInCurrentPosition(model, some(model.content[0]));
		expect(result.content).toHaveLength(1);
		expect(result.content[0].content).toEqual("Hello worldNew line");
	});
});