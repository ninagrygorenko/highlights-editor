import React from "react";
import { AddHighlightCommand } from "../../model";

interface HighlightListItemProps {
	highlight: AddHighlightCommand;
	onDelete: (command: AddHighlightCommand) => void;
}

const HighlightListItem: React.FC<HighlightListItemProps> = (props: HighlightListItemProps) => {
	return (
		<div style={{ backgroundColor: `#${props.highlight.color}` }} className="highlight-list-item">
			<span key={props.highlight.id}>{props.highlight.wordNumber}</span>
			<button onClick={() => props.onDelete(props.highlight)}>x</button>
		</div>
	);
};

export {
	HighlightListItem,
};