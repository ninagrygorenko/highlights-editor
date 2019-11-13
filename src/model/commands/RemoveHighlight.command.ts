import { CommandTypes, EditorCommand } from "./CommandTypes";
import { AddHighlightCommand } from "./AddHighlight.command";

class RemoveHighlightCommand implements EditorCommand {

	constructor(public command: AddHighlightCommand) {}

	type: CommandTypes = CommandTypes.REMOVE_HIGHLIGHT;
	id: string = `f${(~~(Math.random()*1e8)).toString(16)}`;

	getCommandId = (): string => {
		return `${this.command.id}`;
	};

	getWordNumber = (): number => {
		return this.command.wordNumber;
	};

	undoCommand = (): AddHighlightCommand => {
		return new AddHighlightCommand(this.command.wordNumber, this.command.color);
	};
}

export {
	RemoveHighlightCommand
};