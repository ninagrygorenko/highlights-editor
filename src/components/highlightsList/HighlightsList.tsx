import React from "react";

import { HighlightListItem } from "./HighlightLitsItem";
import { AddHighlightCommand } from "../../model";

export interface HighlightsListProps {
	highlights: Array<AddHighlightCommand>;
	onRemoveHighlight: (highlight: AddHighlightCommand) => void;
}

const HighlightList: React.FC<HighlightsListProps> = (props: HighlightsListProps) => {

	return (
		<div className="highlight-list">{
			props.highlights.map((command: AddHighlightCommand) => {

				return <HighlightListItem
					key={command.id}
					highlight={command}
					onDelete={props.onRemoveHighlight}
				/>
			})}
		</div>
	);
};

export {
	HighlightList
};