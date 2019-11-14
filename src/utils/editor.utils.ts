import { EditorModel, ParagraphBlock } from "../model";
import { Option } from "fp-ts/es6/Option";
import { isSome, none, some } from "fp-ts/lib/Option";
import { getCaretNode } from "../controller/operations/selection.operations";
import { CurrentParagraphInfo } from "../controller/operations/editor.operations";

const getChildNodeIndex = (rootNode: Element, node: Element): number => {
	let childNode: Node | null = node;
	let i = 0;
	while( (childNode = childNode.previousSibling) != null ) {
		i++;
	}
	return i;
};

const getParagraphByNode = (editorModel: EditorModel, node: Element, editorDiv: HTMLDivElement): Option<ParagraphBlock> => {
	let editedNode = node;
	while (editedNode.tagName !== "DIV") {
		editedNode = editedNode.parentElement ? editedNode.parentElement : editorDiv;
	}
	const nodeIndex = getChildNodeIndex(editorDiv, node);
	const paragraph = editorModel.content[nodeIndex];
	return paragraph ? some(paragraph) : none;
};

const getCurrentParagraphInfo = (currentEditorModel: EditorModel, editorDiv: HTMLDivElement): Option<CurrentParagraphInfo> => {
	const nodeToEdit = getCaretNode(editorDiv) || editorDiv;
	const paragraphOption = getParagraphByNode(currentEditorModel, nodeToEdit, editorDiv);
	return isSome(paragraphOption) ? some({
		paragraph: paragraphOption.value,
		element: nodeToEdit
	}) : none;
};

export {
	getCurrentParagraphInfo
};