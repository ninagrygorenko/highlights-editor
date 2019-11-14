import React from "react";
import { ParagraphBlock, TextBlock, TextBlockType } from "../../model";
import { isSome, Option } from "fp-ts/lib/Option";
import { HighlightedWord } from "./HighlightedWord";

export interface ParagraphProps {
	index: number;
	paragraphBlock: ParagraphBlock;
	onMouseOverHighlightedWord: (id: string, isMouseOver: boolean) => void;
	mouseOverHighlightedWord: Option<string>;
}

const Paragraph: React.FC<ParagraphProps> = props => {
	const { index, paragraphBlock } = props;

	const renderedText: Array<React.ReactFragment> = [];
	let text: string = "";
	paragraphBlock.blocks.forEach((textBlock: TextBlock) => {
		switch (textBlock.type) {
			case TextBlockType.WHITESPACE: {
				text += textBlock.content;
				break;
			}
			case TextBlockType.WORD: {
				if (isSome(textBlock.highlight)) {
					if (text) {
						renderedText.push(text);
						text = "";
					}
					const isMouseOver = isSome(props.mouseOverHighlightedWord)
						? props.mouseOverHighlightedWord.value === textBlock.highlight.value.id
						: false;
					renderedText.push(<HighlightedWord
						key={textBlock.highlight.value.id}
						word={textBlock.content}
						highlightCommand={textBlock.highlight.value}
						onMouseOver={props.onMouseOverHighlightedWord}
						isMouseOver={isMouseOver}/>);
				} else {
					text += textBlock.content;
				}
			}
		}
	});
	// to prevent collapse of the space symbol at the end of the paragraph -> display it as &nbsp;
	if (text.charAt(text.length - 1) === " ") {
		text = text.slice(0, text.length - 1) + "\u00A0";
	}
	if (text) {
		renderedText.push(text);
	}
	if (renderedText.length === 0) {
		renderedText.push(<br key={'br'}/>);
	}
	const key = paragraphBlock.blocks.length > 0 ? paragraphBlock.hash : `p${index}`;
	console.log(key);
	return (
		<div key={key}>
			{renderedText}
		</div>);
};

export { Paragraph };