import { ParagraphBlock } from "../TextBlock";
import { Option } from "fp-ts/es6/Option";
import { isNone, isSome, none, some } from "fp-ts/lib/Option";
import { getCaretCharacterOffsetWithin, getCaretNode, setCaretPositionInElement } from "./caretOperations";
import { addCharacterToBlock, getParagraphByContent, removeCharacterFromBlock } from "./paragraphOperations";
import { EditorModel } from "../EditorModel";

const getParagraphByNode = (editorModel: EditorModel, node: Element, editorDiv: HTMLDivElement): Option<ParagraphBlock> => {
	let editedNode = node;
	while (editedNode.tagName !== "DIV") {
		editedNode = editedNode.parentElement ? editedNode.parentElement : editorDiv;
	}
	const paragraph = editorModel.content.find((p: ParagraphBlock) => p.ref === editedNode);
	return paragraph ? some(paragraph) : none;
};

const replaceParagraph = (editorModel: EditorModel, oldParagraph: ParagraphBlock, newParagraph: ParagraphBlock): EditorModel => {
	const newModel = {...editorModel};
	newModel.content = newModel.content.map((p: ParagraphBlock): ParagraphBlock => {
		return p === oldParagraph ? newParagraph : p;
	});

	return newModel;
};

const addParagraph = (editorModel: EditorModel, newParagraph: ParagraphBlock, currentParagraph: Option<ParagraphBlock>): EditorModel => {
	const newModel = { ...editorModel };
	if (isNone(currentParagraph)) {
		newModel.content = [...newModel.content, newParagraph];
	} else {
		newModel.content = newModel.content.reduce((acc: ParagraphBlock[], current: ParagraphBlock) => {
			return current === currentParagraph.value ? [...acc, current, newParagraph] : [...acc, current];
		}, []);
	}
	return newModel;
};

const removeParagraph = (editorModel: EditorModel, oldParagraph: ParagraphBlock): EditorModel => {
	const newModel = {...editorModel};
	newModel.content = newModel.content.filter((p: ParagraphBlock): boolean => {
		return p !== oldParagraph;
	});
	return newModel;
};

const addCharacterInCurrentPosition = (newKey: string, currentEditorModel: EditorModel, editorDiv: HTMLDivElement): EditorModel => {
	const nodeToEdit = getCaretNode(editorDiv) || editorDiv;
	const paragraph = getParagraphByNode(currentEditorModel, nodeToEdit, editorDiv);

	switch (newKey) {
		case '\n': {
			const newParagraph = getParagraphByContent("");
			const newModel = addParagraph(currentEditorModel, newParagraph, paragraph);
			newModel.caretPosition = { paragraph: some(newParagraph), offset: 0 };
			return newModel;
		}
		default: {
			if (isSome(paragraph) && paragraph.value.ref) {
				const position = getCaretCharacterOffsetWithin(paragraph.value.ref);
				const newParagraph = addCharacterToBlock(paragraph.value, newKey, position);
				const newModel = replaceParagraph(currentEditorModel, paragraph.value, newParagraph);
				newModel.caretPosition = { paragraph: some(newParagraph), offset: position + 1};
				return newModel;
			} else {
				const newParagraph = getParagraphByContent(newKey);
				const newModel = addParagraph(currentEditorModel, newParagraph,
					currentEditorModel.content.length > 0 ? some(currentEditorModel.content[currentEditorModel.content.length - 1]) : none);
				newModel.caretPosition = { paragraph: some(newParagraph), offset: 1};
				return newModel;
			}
		}
	}
};

const removeCharacterInCurrentPosition = (currentEditorModel: EditorModel, editorDiv: HTMLDivElement): EditorModel => {
	const nodeToEdit = getCaretNode(editorDiv) || editorDiv;
	const paragraph = getParagraphByNode(currentEditorModel, nodeToEdit, editorDiv);

	if (isSome(paragraph) && paragraph.value.ref) {
		if (paragraph.value.blocks.length > 0) {
			const position = getCaretCharacterOffsetWithin(paragraph.value.ref);
			const newParagraph = removeCharacterFromBlock(paragraph.value, position);
			const newModel = replaceParagraph(currentEditorModel, paragraph.value, newParagraph);
			newModel.caretPosition = { paragraph: some(newParagraph), offset: position - 1};
			return newModel;
		} else {
			const nextParagraphIndex = Math.max(0, currentEditorModel.content.indexOf(paragraph.value) - 1);
			const newModel = removeParagraph(currentEditorModel, paragraph.value);
			const newParagraphWithCaret = newModel.content[nextParagraphIndex];
			newModel.caretPosition = { paragraph: some(newParagraphWithCaret), offset: newParagraphWithCaret.content.length };
			return newModel;
		}
	}
	return currentEditorModel;
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

const deleteCharacterInCurrentPosition = (currentEditorModel: EditorModel, editorDiv: HTMLDivElement): EditorModel => {
	const nodeToEdit = getCaretNode(editorDiv) || editorDiv;
	const paragraph = getParagraphByNode(currentEditorModel, nodeToEdit, editorDiv);

	if (isSome(paragraph) && paragraph.value.ref) {
		if (paragraph.value.blocks.length > 0) {
			const position = getCaretCharacterOffsetWithin(paragraph.value.ref);
			if (paragraph.value.content.length >= position + 1) {
				// delete 1 character
				const newParagraph = removeCharacterFromBlock(paragraph.value, position + 1);
				return replaceParagraph(currentEditorModel, paragraph.value, newParagraph);
			} else {
				// merge paragraphs
				const currentParagraphIndex = currentEditorModel.content.indexOf(paragraph.value);
				if (currentParagraphIndex < currentEditorModel.content.length - 1) {
					return mergeParagraphs(currentEditorModel, paragraph.value, currentEditorModel.content[currentParagraphIndex + 1]);
				}
			}

		}
	}
	return currentEditorModel;
};

const setCaretPositionInParagraph = (editorDiv: HTMLDivElement, paragraph: Option<ParagraphBlock>, offset: number): void => {
	if (isSome(paragraph) && paragraph.value.ref) {
		setCaretPositionInElement(editorDiv, paragraph.value.ref, offset);
	} else {
		setCaretPositionInElement(editorDiv, editorDiv, offset);
	}
};

export {
	addCharacterInCurrentPosition,
	removeCharacterInCurrentPosition,
	deleteCharacterInCurrentPosition,
	addParagraph,
	removeParagraph,
	setCaretPositionInParagraph,
};