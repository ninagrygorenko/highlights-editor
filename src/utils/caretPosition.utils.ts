export interface SelectionState {
	startPosition: number;
	endPosition: number;
}

const getCurrentSelectionPositions = (): SelectionState => {
	const selection = window.getSelection();
	if (selection && selection.type !== "None") {
		selection.collapseToStart();
		return {
			startPosition: selection.getRangeAt(0).startOffset,
			endPosition: selection.getRangeAt(0).endOffset
		}
	}
	return {
		startPosition: 0,
		endPosition: 0,
	}
};

const getCurrentCursorNode = (div: HTMLDivElement): Node => {
	const selection = window.getSelection();
	if (selection && selection.type !== "None") {
		selection.collapseToStart();
		return selection.anchorNode ? selection.anchorNode : div;
	}
	return div;
};

const moveCursor = (div: HTMLDivElement, { targetNode, cursorOffset }: { targetNode: Node; cursorOffset: number; }) => {
	let selection = window.getSelection();
	if (selection) {
		selection.removeAllRanges();
		const newRange = document.createRange();
		newRange.setStart(targetNode, Math.min((getNodeText(targetNode) || "").length, cursorOffset));
		newRange.setEnd(targetNode, Math.min((getNodeText(targetNode) || "").length, cursorOffset));
		selection.addRange(newRange);
	}
};

const getNodeText = (targetNode: Node): string => {
	return targetNode.nodeType === Node.TEXT_NODE
		? (targetNode as Text).wholeText
		: (targetNode as HTMLElement).innerText;
};

const getCaretInfo = (div: HTMLDivElement): { targetNode: Node, targetNodeText: string } => {
	const targetNode = getCurrentCursorNode(div);
	const targetNodeText = getNodeText(targetNode);
	return {
		targetNode,
		targetNodeText
	};
};

export {
	getCurrentSelectionPositions,
	moveCursor,
	getCurrentCursorNode,
	getCaretInfo
};