import { EditorCommand } from "../model";
import { Subject } from "rxjs";
import { Queue } from "../model/Queue";
import { isSome } from "fp-ts/lib/Option";

class HistoryController {

	public restoreHistoryCommands$: Subject<EditorCommand> = new Subject();
	private undoCommands: Queue<EditorCommand> = new Queue();
	private redoCommand: Queue<EditorCommand> = new Queue();

	public addExecutedCommand(command: EditorCommand) {
		console.log('addExecutedCommand:', command);
		this.undoCommands.add(command);
		this.redoCommand.clear(); // no redo after new commands
	}

	public undoLastCommand = () => {
		const commandToUndo = this.undoCommands.pop();
		if (isSome(commandToUndo)) {
			const undoCommand = commandToUndo.value.undoCommand();
			this.redoCommand.add(commandToUndo.value);
			this.restoreHistoryCommands$.next(undoCommand);
		}
	};

	public redoLastCommand = () => {
		const commandToRedo = this.redoCommand.pop();
		if (isSome(commandToRedo)) {
			this.restoreHistoryCommands$.next(commandToRedo.value);
			this.undoCommands.add(commandToRedo.value);
		}
	};
}

export {
	HistoryController
};