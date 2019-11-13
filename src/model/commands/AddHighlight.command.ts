import { CommandTypes, EditorCommand } from "./CommandTypes";
import { RemoveHighlightCommand } from "./RemoveHighlight.command";
import { HasHighlight } from "../HasHighlight";

class AddHighlightCommand implements EditorCommand, HasHighlight {

	constructor(public wordNumber: number, public color: string) {}

	type: CommandTypes = CommandTypes.ADD_HIGHLIGHT;
	id: string = `a${(~~(Math.random()*1e8)).toString(16)}`;

	undoCommand = (): RemoveHighlightCommand => {
		return new RemoveHighlightCommand(this);
	}
}

export {
	AddHighlightCommand
};