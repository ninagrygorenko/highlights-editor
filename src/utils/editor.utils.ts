import { EditorModel, ParagraphBlock } from "../model";
import { Option } from "fp-ts/es6/Option";
import { none, some } from "fp-ts/lib/Option";
import { getCaretNode } from "../controller/operations/selection.operations";

const getParagraphByNode = (editorModel: EditorModel, node: Element, editorDiv: HTMLDivElement): Option<ParagraphBlock> => {
	let editedNode = node;
	while (editedNode.tagName !== "DIV") {
		editedNode = editedNode.parentElement ? editedNode.parentElement : editorDiv;
	}
	const paragraph = editorModel.content.find((p: ParagraphBlock) => p.ref === editedNode);
	return paragraph ? some(paragraph) : none;
};

const getCurrentParagraph = (currentEditorModel: EditorModel, editorDiv: HTMLDivElement): Option<ParagraphBlock> => {
	const nodeToEdit = getCaretNode(editorDiv) || editorDiv;
	return getParagraphByNode(currentEditorModel, nodeToEdit, editorDiv);
};

export {
	getCurrentParagraph
};