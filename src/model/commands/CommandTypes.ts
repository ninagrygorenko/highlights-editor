import { AddHighlightCommand } from "./AddHighlight.command";
import { RemoveHighlightCommand } from "./RemoveHighlight.command";

export enum CommandTypes {
	ADD_HIGHLIGHT,
	REMOVE_HIGHLIGHT,
	EDITOR_STATE_CHANGE,
}

export interface EditorCommand {
	type: CommandTypes;
	id: string;
	undoCommand: () => EditorCommand;
}

export type HighlightCommand = AddHighlightCommand | RemoveHighlightCommand;
