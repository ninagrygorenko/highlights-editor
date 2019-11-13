import React from "react";
import { ParagraphBlock, TextBlock, TextBlockType } from "../../model/TextBlock";
import { isSome, Option } from "fp-ts/lib/Option";
import { HasHighlight } from "../../model";
import { HighlightedWord } from "./HighlightedWord";

export interface ParagraphProps {
	index: number;
	paragraphBlock: ParagraphBlock;
	highlightPredicate: (index: number) => Option<HasHighlight>;
	onMouseOverHighlightedWord: (id: string, isMouseOver: boolean) => void;
	mouseOverHighlightedWord: Option<string>;
}

const Paragraph: React.FC<ParagraphProps> = props => {
	const { index, paragraphBlock, highlightPredicate } = props;

	const renderedText: Array<React.ReactFragment> = [];
	let text: string = "";
	let wordIndex = 0;
	paragraphBlock.blocks.forEach((textBlock: TextBlock) => {
		switch (textBlock.type) {
			case TextBlockType.WHITESPACE: {
				text += textBlock.content;
				break;
			}
			case TextBlockType.WORD: {
				const highlightResult = highlightPredicate(wordIndex);
				wordIndex++;
				if (isSome(highlightResult)) {
					if (text) {
						renderedText.push(text);
						text = "";
					}
					const isMouseOver = isSome(props.mouseOverHighlightedWord)
						? props.mouseOverHighlightedWord.value === highlightResult.value.id
						: false;
					renderedText.push(<HighlightedWord
						key={highlightResult.value.id}
						word={textBlock.content}
						highlightCommand={highlightResult.value}
						onMouseOver={props.onMouseOverHighlightedWord}
						isMouseOver={isMouseOver}/>);
				} else {
					text += textBlock.content;
				}
			}
		}
	});
	if (text) {
		renderedText.push(text);
	}
	if (renderedText.length === 0) {
		renderedText.push(<br/>);
	}
	const key = paragraphBlock.blocks.length > 0 ? paragraphBlock.hash : index;
	return (
		<div key={key} ref={ref => paragraphBlock.ref = ref}>
			{renderedText}
		</div>);
};

export { Paragraph };