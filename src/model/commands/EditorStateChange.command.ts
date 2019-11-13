import { CommandTypes, EditorCommand } from "./CommandTypes";
import { EditorModel } from "../EditorModel";

class EditorStateChangeCommand implements EditorCommand {

	constructor(private newEditorState: EditorModel, private oldEditorState: EditorModel) {}

	type: CommandTypes = CommandTypes.EDITOR_STATE_CHANGE;
	id: string = `c${(~~(Math.random()*1e8)).toString(16)}`;

	getEditorModel = () => {
		return this.newEditorState;
	};

	undoCommand = (): EditorStateChangeCommand => {
		return new EditorStateChangeCommand(this.oldEditorState, this.newEditorState);
	};
}

export {
	EditorStateChangeCommand
};