import { CommandTypes, EditorCommand, HighlightCommand } from "./CommandTypes";
import { HasHighlight } from "../HighlightsStore";
import { RemoveHighlightCommand } from "./RemoveHighlightCommand";

class AddHighlightCommand implements EditorCommand, HasHighlight {

	constructor(public wordNumber: number, public color: string) {}

	type: CommandTypes = CommandTypes.ADD_HIGHLIGHT;
	id: string = `f${(~~(Math.random()*1e8)).toString(16)}`;

	undoCommand = (): HighlightCommand => {
		return new RemoveHighlightCommand(this);
	}


}

export {
	AddHighlightCommand
};