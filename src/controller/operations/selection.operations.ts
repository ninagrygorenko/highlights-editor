import { Option } from "fp-ts/es6/Option";
import { isSome } from "fp-ts/lib/Option";
import { ParagraphBlock } from "../../model";

const getCaretNode = (editorDiv: HTMLDivElement): Element | null => {
	const selection: Selection | null = window.getSelection();
	let element = null;
	if (selection) {
		element = selection.anchorNode as Element;
		if (element !== editorDiv && element.tagName !== "DIV" && selection.anchorNode && selection.anchorNode.parentNode) {
			element = selection.anchorNode.parentNode as Element;
		}

		if (element === editorDiv && editorDiv.children.length > selection.anchorOffset) {
			return editorDiv.children.item(selection.anchorOffset);
		}
	}

	return element;
};

const getCaretCharacterOffsetWithin = (element: Element): number => {
	let caretOffset = 0;
	const selection = window.getSelection();
	if (selection) {
		if (selection.rangeCount > 0) {
			let range = selection.getRangeAt(0);
			let preCaretRange = range.cloneRange();
			preCaretRange.selectNodeContents(element);
			preCaretRange.setEnd(range.endContainer, range.endOffset);
			caretOffset = preCaretRange.toString().length;
		}
	}
	return caretOffset;
};

const getElementIndexInDiv = (div: HTMLDivElement, element: Element): number => {
	let i = 0;
	let child: Node | null = element;
	while ((child = child.previousSibling) != null) {
		i++;
	}
	return i;
};

const moveCursor = (targetNode: Node, targetOffset: number) => {
	let selection = window.getSelection();
	if (selection) {
		selection.removeAllRanges();
		const newRange = document.createRange();
		const offset = targetNode.nodeType !== Node.TEXT_NODE ? Math.min(targetOffset, (targetNode as Element).innerHTML.length) : targetOffset;
		newRange.setStart(targetNode, offset);
		newRange.setEnd(targetNode, offset);
		selection.addRange(newRange);
	}
};

const setCaretPositionInElement = (editorDiv: HTMLDivElement, targetElement: HTMLElement, targetOffset: number): void => {
	if (targetOffset === 0) {
		// find element index in editorDiv and set cursor there
		moveCursor(editorDiv, getElementIndexInDiv(editorDiv, targetElement));
	} else if (targetElement.children.length > 0) {
		// find anchorElement if it is not the same as "cursorPosition.element" (case with span)
		let i = 0;
		let textLength = 0;
		let childNode: Node | null = null;
		while (textLength < targetOffset && i < targetElement.childNodes.length) {
			childNode = targetElement.childNodes.item(i);
			textLength += childNode.nodeType === Node.TEXT_NODE ? (childNode as Text).wholeText.length : (childNode as HTMLElement).innerText.length;
			i++;
		}
		if (childNode && textLength >= targetOffset) {
			if (childNode.nodeType === Node.TEXT_NODE) {
				const realOffset = targetOffset - textLength + (childNode as Text).wholeText.length;
				moveCursor(childNode, realOffset);
			} else {
				const realOffset = targetOffset - textLength + (childNode as HTMLElement).innerText.length;
				moveCursor(childNode.childNodes.item(0), realOffset);
			}
		} else {
			moveCursor(editorDiv, editorDiv.innerHTML.length);
		}
	} else {
		const applicableNode = targetElement.childNodes.length > 0 ? targetElement.childNodes.item(0) : targetElement;
		moveCursor(applicableNode, targetOffset);
	}
};

const setCaretPositionInParagraph = (editorDiv: HTMLDivElement, paragraph: Option<ParagraphBlock>, offset: number): void => {
	if (isSome(paragraph) && paragraph.value.ref) {
		setCaretPositionInElement(editorDiv, paragraph.value.ref, offset);
	} else {
		setCaretPositionInElement(editorDiv, editorDiv, offset);
	}
};

const collapseSelection = (): void => {
	let selection = window.getSelection();
	if (selection) {
		selection.collapseToStart();
	}
};

export {
	getCaretCharacterOffsetWithin,
	getCaretNode,
	collapseSelection,
	setCaretPositionInElement,
	setCaretPositionInParagraph,
};