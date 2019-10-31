import { AddHighlightCommand } from "./AddHighlightCommand";
import { RemoveHighlightCommand } from "./RemoveHighlightCommand";

export enum CommandTypes {
	ADD_HIGHLIGHT,
	REMOVE_HIGHLIGHT,
	ADD_TEXT,
}

export interface EditorCommand {
	type: CommandTypes;
	id: string;
	undoCommand: () => HighlightCommand;
}

export type HighlightCommand = AddHighlightCommand | RemoveHighlightCommand;

