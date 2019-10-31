import React from "react";
import { HasHighlight } from "../../model";
const chromaJs = require("chroma-js");

export interface HighlightedWordProps {
	word: string;
	highlightCommand: HasHighlight;
	onMouseOver: (id: string, isMouseOver: boolean) => void;
	isMouseOver: boolean;
}

const HighlightedWord: React.FC<HighlightedWordProps> = (props: HighlightedWordProps) => {
	const getBackgroundColor = (): string => {
		if (!props.isMouseOver) {
			return `#${props.highlightCommand.color}`;
		} else {
			const chromaColor = chromaJs(`#${props.highlightCommand.color}`);
			return chromaColor.luminance(0.5);
		}
	};

	const mouseOverHandler = () => {
		props.onMouseOver(props.highlightCommand.id, true);
	};
	const mouseOutHandler = () => {
		props.onMouseOver(props.highlightCommand.id, false);
	};
	return (
		<span
			style={{ backgroundColor: getBackgroundColor() }}
			onMouseOut={mouseOutHandler}
			onMouseOver={mouseOverHandler}
		>
			{props.word}
		</span>);
};

export {
	HighlightedWord
};