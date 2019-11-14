import { getParagraphByContent } from "./paragraphText.operations";
import { isNone, some } from "fp-ts/lib/Option";
import { Option } from "fp-ts/es6/Option";
import { EditorModel, ParagraphBlock } from "../../model";

const replaceParagraph = (editorModel: EditorModel, oldParagraph: ParagraphBlock, newParagraph: ParagraphBlock): EditorModel => {
	const newModel = {...editorModel};
	newModel.content = newModel.content.map((p: ParagraphBlock): ParagraphBlock => {
		return p === oldParagraph ? newParagraph : p;
	});

	return newModel;
};

const splitParagraphAtPosition = (editorModel: EditorModel, currentParagraph: ParagraphBlock, position: number): EditorModel => {
	const newModel = { ...editorModel };
	const firstParagraph = getParagraphByContent(currentParagraph.content.slice(0, position));
	const secondParagraph = getParagraphByContent(currentParagraph.content.slice(position));
	newModel.content = newModel.content.reduce((acc: ParagraphBlock[], current: ParagraphBlock) => {
		return [...acc, ...( current === currentParagraph ? [firstParagraph, secondParagraph ] : [current])];

	}, []);
	newModel.caretPosition = { paragraph: some(secondParagraph), offset: 0 };
	return newModel;
};

const addParagraphAfterAnother = (editorModel: EditorModel, newParagraph: ParagraphBlock, currentParagraph: Option<ParagraphBlock>): EditorModel => {
	const newModel = { ...editorModel };
	if (isNone(currentParagraph)) {
		newModel.content = [ newParagraph, ...newModel.content ];
	} else {
		newModel.content = newModel.content.reduce((acc: ParagraphBlock[], current: ParagraphBlock) => {
			return current === currentParagraph.value ? [ ...acc, current, newParagraph ] : [ ...acc, current ];
		}, []);
	}
	return newModel;
};

const removeParagraph = (editorModel: EditorModel, paragraphToRemove: ParagraphBlock): EditorModel => {
	const newModel = {...editorModel};
	newModel.content = newModel.content.filter((p: ParagraphBlock): boolean => {
		return p !== paragraphToRemove;
	});
	return newModel;
};

const mergeParagraphs = (editorModel: EditorModel, currentParagraph: ParagraphBlock, nextParagraph: ParagraphBlock): EditorModel => {
	const mergedParagraph = getParagraphByContent(currentParagraph.content + nextParagraph.content);
	const newModel = {...editorModel};
	newModel.content = newModel.content.reduce((acc: ParagraphBlock[], current: ParagraphBlock) => {
		if (current === currentParagraph) {
			return [...acc, mergedParagraph];
		} else if (current === nextParagraph) {
			return acc;
		} else {
			return [...acc, current];
		}
	}, []);
	return newModel;
};

export {
	addParagraphAfterAnother,
	mergeParagraphs,
	removeParagraph,
	replaceParagraph,
	splitParagraphAtPosition,
};