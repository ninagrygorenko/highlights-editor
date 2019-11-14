import { none, some } from "fp-ts/lib/Option";
import { getParagraphByContent } from "./paragraphText.operations";
import { addParagraphAfterAnother, mergeParagraphs, removeParagraph, replaceParagraph, splitParagraphAtPosition } from "./editorModel.operations";
import { EditorModel, ParagraphBlock } from "../../model";


describe("editorModel.operations", () => {
	const nonEmptyModel: EditorModel = {
		content: [ getParagraphByContent("Hello world") ],
		caretPosition: { paragraph: none, offset: 0 }
	};

	const emptyModel: EditorModel = {
		content: [],
		caretPosition: { paragraph: none, offset: 0}
	};

	it("replaceParagraph", () => {
		const model: EditorModel = {
			...nonEmptyModel,
			content: [ ...nonEmptyModel.content, getParagraphByContent("")]
		};
		let result = replaceParagraph(model, model.content[0], getParagraphByContent("Hello world!"));
		expect(result.content).toHaveLength(model.content.length);
		expect(result.content[0].content).toEqual("Hello world!");

		result = replaceParagraph(emptyModel, model.content[0], getParagraphByContent("No replace"));
		expect(result.content).toHaveLength(0);
	});

	it("splitParagraphAtPosition", () => {
		let result = splitParagraphAtPosition(nonEmptyModel, nonEmptyModel.content[0], 5);
		expect(result.content).toHaveLength(nonEmptyModel.content.length + 1);
		expect(result.content[0].content).toEqual("Hello");
		expect(result.content[1].content).toEqual(" world");
	});

	it("addParagraphAfterAnother", () => {
		const newParagraph: ParagraphBlock = getParagraphByContent("new line");
		let result = addParagraphAfterAnother(emptyModel, newParagraph, none);
		expect(result.content).toHaveLength(1);
		expect(result.content[0].content).toEqual(newParagraph.content);

		result = addParagraphAfterAnother(nonEmptyModel, newParagraph, none);
		expect(result.content).toHaveLength(2);
		expect(result.content[0].content).toEqual(newParagraph.content);

		result = addParagraphAfterAnother(nonEmptyModel, newParagraph, some(nonEmptyModel.content[0]));
		expect(result.content).toHaveLength(2);
		expect(result.content[1].content).toEqual(newParagraph.content);
	});

	it("removeParagraph", () => {
		let result = removeParagraph(nonEmptyModel, nonEmptyModel.content[0]);
		expect(result.content).toHaveLength(0);

		const model: EditorModel = {
			...nonEmptyModel,
			content: [ ...nonEmptyModel.content, getParagraphByContent("-")]
		};
		result = removeParagraph(model, model.content[0]);
		expect(result.content).toHaveLength(1);
		expect(result.content[0].content).toEqual("-");
	});

	it("mergeParagraphs", () => {
		const model: EditorModel = {
			...nonEmptyModel,
			content: [ ...nonEmptyModel.content, getParagraphByContent("!")]
		};
		let result = mergeParagraphs(model, model.content[0], model.content[1]);
		expect(result.content).toHaveLength(1);
		expect(result.content[0].content).toEqual("Hello world!");
	});
});
/*
const replaceParagraph = (editorModel: EditorModel, oldParagraph: ParagraphBlock, newParagraph: ParagraphBlock): EditorModel => {
	const newModel = {...editorModel};
	newModel.content = newModel.content.map((p: ParagraphBlock): ParagraphBlock => {
		return p === oldParagraph ? newParagraph : p;
	});

	return newModel;
};
*/