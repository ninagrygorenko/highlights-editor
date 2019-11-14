import { isSome, none, Option, some } from "fp-ts/lib/Option";
import { getCaretCharacterOffsetWithin } from "./selection.operations";
import { addCharacterToBlock, getParagraphByContent, removeCharacterFromBlock } from "./paragraphText.operations";
import { addParagraphAfterAnother, mergeParagraphs, removeParagraph, replaceParagraph, splitParagraphAtPosition } from "./editorModel.operations";
import { EditorModel, ParagraphBlock } from "../../model";

const addCharacterInCurrentPosition = (newKey: string, currentEditorModel: EditorModel, paragraph: Option<ParagraphBlock>): EditorModel => {
	switch (newKey) {
		case '\n': { // handle new line separately
			if (isSome(paragraph) && paragraph.value.ref) {
				const position = getCaretCharacterOffsetWithin(paragraph.value.ref);
				// if cursor is inside paragraph - > split current
				if (paragraph.value.content.length >= position) {
					// cursor is moved to the beginning of the 2nd paragraph
					return splitParagraphAtPosition(currentEditorModel, paragraph.value, position);
				} else {
					// if cursor is at the end of paragraph -> add empty after current
					const newParagraph = getParagraphByContent("");
					const newModel = addParagraphAfterAnother(currentEditorModel, newParagraph, paragraph);
					// move cursor to the beginning of the new paragraph
					newModel.caretPosition = { paragraph: some(newParagraph), offset: 0 };
					return newModel;
				}
			}
			return currentEditorModel;
		}
		default: { // normal text character added
			// if there is some paragraph in editor -> change it
			if (isSome(paragraph) && paragraph.value.ref) {
				const position = getCaretCharacterOffsetWithin(paragraph.value.ref);
				// replace only at the end of paragraph
				const newParagraph = addCharacterToBlock(paragraph.value, newKey, position);
				const newModel = replaceParagraph(currentEditorModel, paragraph.value, newParagraph);
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

const removeCharacterInCurrentPosition = (currentEditorModel: EditorModel, paragraph: Option<ParagraphBlock>): EditorModel => {
	if (isSome(paragraph) && paragraph.value.ref) {
		// case for non empty paragraph -> remove 1 character
		if (paragraph.value.blocks.length > 0) {
			const position = getCaretCharacterOffsetWithin(paragraph.value.ref);
			// there is some character to the left
			if (position > 0) {
				const newParagraph = removeCharacterFromBlock(paragraph.value, position);
				const newModel = replaceParagraph(currentEditorModel, paragraph.value, newParagraph);
				newModel.caretPosition = { paragraph: some(newParagraph), offset: position - 1 };
				return newModel;
			} else {
				// merge with previous paragraph
				const currentParagraphIndex = currentEditorModel.content.indexOf(paragraph.value);
				if (currentParagraphIndex > 0) {
					const paragraphToMergeWith = currentEditorModel.content[currentParagraphIndex - 1];
					const newModel = mergeParagraphs(currentEditorModel, paragraphToMergeWith, paragraph.value);
					newModel.caretPosition = { paragraph: some(paragraphToMergeWith), offset: paragraphToMergeWith.content.length };
					return newModel;
				}
			}
		} else {
			// if paragraph is empty already -> remove it
			const nextParagraphIndex = Math.max(0, currentEditorModel.content.indexOf(paragraph.value) - 1);
			const newModel = removeParagraph(currentEditorModel, paragraph.value);
			const newParagraphWithCaret = newModel.content[nextParagraphIndex];
			newModel.caretPosition = { paragraph: some(newParagraphWithCaret), offset: newParagraphWithCaret.content.length };
			return newModel;
		}
	}
	return currentEditorModel;
};

const deleteCharacterInCurrentPosition = (currentEditorModel: EditorModel, paragraph: Option<ParagraphBlock>): EditorModel => {
	if (isSome(paragraph) && paragraph.value.ref) {
		const position = getCaretCharacterOffsetWithin(paragraph.value.ref);

		// case for non empty paragraph -> delete 1 character at current position
		if (paragraph.value.content.length >= position + 1) {
			// delete 1 character
			const newParagraph = removeCharacterFromBlock(paragraph.value, position + 1);
			const newModel = replaceParagraph(currentEditorModel, paragraph.value, newParagraph);
			newModel.caretPosition = { paragraph: some(newParagraph), offset: position };
			return newModel;
		} else {
			// merge paragraphs if current is empty and "delete" was pressed
			const currentParagraphIndex = currentEditorModel.content.indexOf(paragraph.value);
			if (currentParagraphIndex < currentEditorModel.content.length - 1) {
				const newModel = mergeParagraphs(currentEditorModel, paragraph.value, currentEditorModel.content[currentParagraphIndex + 1]);
				newModel.caretPosition = { paragraph: some(currentEditorModel.content[currentParagraphIndex]), offset: paragraph.value.content.length };
				return newModel;
			}
		}
	}
	return currentEditorModel;
};

const updateCaretPosition = (currentEditorModel: EditorModel, paragraph: Option<ParagraphBlock>): EditorModel => {
	return { ...currentEditorModel,
		caretPosition: {
			paragraph: paragraph,
			offset: isSome(paragraph) && paragraph.value.ref ? getCaretCharacterOffsetWithin(paragraph.value.ref) : 0
		}
	};
};

export {
	addCharacterInCurrentPosition,
	removeCharacterInCurrentPosition,
	deleteCharacterInCurrentPosition,
	updateCaretPosition,
};