import { isSome, none, Option, some } from "fp-ts/lib/Option";
import { getCaretCharacterOffsetWithin } from "./selection.operations";
import { addCharacterToBlock, getParagraphByContent, removeCharacterFromBlock } from "./paragraphText.operations";
import { addParagraphAfterAnother, mergeParagraphs, removeParagraph, replaceParagraph, splitParagraphAtPosition } from "./editorModel.operations";
import { EditorModel, ParagraphBlock } from "../../model";

export interface CurrentParagraphInfo {
	paragraph: ParagraphBlock;
	element: Element;
}

const addCharacterInCurrentPosition = (newKey: string, currentEditorModel: EditorModel, paragraphInfo: Option<CurrentParagraphInfo>): EditorModel => {

	switch (newKey) {
		case '\n': { // handle new line separately
			if (isSome(paragraphInfo)) {
				const position = getCaretCharacterOffsetWithin(paragraphInfo.value.element);
				// if cursor is inside paragraph - > split current
				if (paragraphInfo.value.paragraph.content.length >= position) {
					// cursor is moved to the beginning of the 2nd paragraph
					return splitParagraphAtPosition(currentEditorModel, paragraphInfo.value.paragraph, position);
				} else {
					// if cursor is at the end of paragraph -> add empty after current
					const newParagraph = getParagraphByContent("");
					const newModel = addParagraphAfterAnother(currentEditorModel, newParagraph, some(paragraphInfo.value.paragraph));
					// move cursor to the beginning of the new paragraph
					newModel.caretPosition = { paragraph: some(newParagraph), offset: 0 };
					return newModel;
				}
			}
			return currentEditorModel;
		}
		default: { // normal text character added
			// if there is some paragraph in editor -> change it
			if (isSome(paragraphInfo)) {
				const position = getCaretCharacterOffsetWithin(paragraphInfo.value.element);
				// replace only at the end of paragraph
				const newParagraph = addCharacterToBlock(paragraphInfo.value.paragraph, newKey, position);
				const newModel = replaceParagraph(currentEditorModel, paragraphInfo.value.paragraph, newParagraph);
				newModel.caretPosition = { paragraph: some(newParagraph), offset: position + 1};
				return newModel;
			} else {
				// case when nothing is in editor -> create new and move cursor
				// replace with &nbsp; in case no other content
				const newParagraph = getParagraphByContent(newKey);
				const newModel = addParagraphAfterAnother(currentEditorModel, newParagraph,
					currentEditorModel.content.length > 0 ? some(currentEditorModel.content[currentEditorModel.content.length - 1]) : none);
				newModel.caretPosition = { paragraph: some(newParagraph), offset: 1 };
				return newModel;
			}
		}
	}
};

const removeCharacterInCurrentPosition = (currentEditorModel: EditorModel, paragraphInfo: Option<CurrentParagraphInfo>): EditorModel => {
	if (isSome(paragraphInfo)) {
		// case for non empty paragraph -> remove 1 character
		if (paragraphInfo.value.paragraph.blocks.length > 0) {
			const position = getCaretCharacterOffsetWithin(paragraphInfo.value.element);
			// there is some character to the left
			if (position > 0) {
				const newParagraph = removeCharacterFromBlock(paragraphInfo.value.paragraph, position);
				const newModel = replaceParagraph(currentEditorModel, paragraphInfo.value.paragraph, newParagraph);
				newModel.caretPosition = { paragraph: some(newParagraph), offset: position - 1 };
				return newModel;
			} else {
				// merge with previous paragraph
				const currentParagraphIndex = currentEditorModel.content.indexOf(paragraphInfo.value.paragraph);
				if (currentParagraphIndex > 0) {
					const paragraphToMergeWith = currentEditorModel.content[currentParagraphIndex - 1];
					const newModel = mergeParagraphs(currentEditorModel, paragraphToMergeWith, paragraphInfo.value.paragraph);
					newModel.caretPosition = { paragraph: some(paragraphToMergeWith), offset: paragraphToMergeWith.content.length };
					return newModel;
				}
			}
		} else {
			// if paragraph is empty already -> remove it
			const nextParagraphIndex = Math.max(0, currentEditorModel.content.indexOf(paragraphInfo.value.paragraph) - 1);
			const newModel = removeParagraph(currentEditorModel, paragraphInfo.value.paragraph);
			const newParagraphWithCaret = newModel.content[nextParagraphIndex];
			newModel.caretPosition = {
				paragraph: newParagraphWithCaret ? some(newParagraphWithCaret) : none,
				offset: newParagraphWithCaret ? newParagraphWithCaret.content.length : 0
			};
			return newModel;
		}
	}
	return currentEditorModel;
};

const deleteCharacterInCurrentPosition = (currentEditorModel: EditorModel, paragraphInfo: Option<CurrentParagraphInfo>): EditorModel => {
	if (isSome(paragraphInfo)) {
		const position = getCaretCharacterOffsetWithin(paragraphInfo.value.element);

		// case for non empty paragraph -> delete 1 character at current position
		if (paragraphInfo.value.paragraph.content.length >= position + 1) {
			// delete 1 character
			const newParagraph = removeCharacterFromBlock(paragraphInfo.value.paragraph, position + 1);
			const newModel = replaceParagraph(currentEditorModel, paragraphInfo.value.paragraph, newParagraph);
			newModel.caretPosition = { paragraph: some(newParagraph), offset: position };
			return newModel;
		} else {
			// merge paragraphs if current is empty and "delete" was pressed
			const currentParagraphIndex = currentEditorModel.content.indexOf(paragraphInfo.value.paragraph);
			if (currentParagraphIndex < currentEditorModel.content.length - 1) {
				const newModel = mergeParagraphs(currentEditorModel, paragraphInfo.value.paragraph, currentEditorModel.content[currentParagraphIndex + 1]);
				newModel.caretPosition = { paragraph: some(currentEditorModel.content[currentParagraphIndex]), offset: paragraphInfo.value.paragraph.content.length };
				return newModel;
			}
		}
	}
	return currentEditorModel;
};

const updateCaretPosition = (currentEditorModel: EditorModel, paragraphInfo: Option<CurrentParagraphInfo>): EditorModel => {
	return { ...currentEditorModel,
		caretPosition: {
			paragraph: isSome(paragraphInfo) ? some(paragraphInfo.value.paragraph) : none,
			offset: isSome(paragraphInfo) ? getCaretCharacterOffsetWithin(paragraphInfo.value.element) : 0
		}
	};
};

export {
	addCharacterInCurrentPosition,
	removeCharacterInCurrentPosition,
	deleteCharacterInCurrentPosition,
	updateCaretPosition,
};