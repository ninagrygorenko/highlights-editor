import { HighlightCommand } from "./commands/CommandTypes";
import { HighlightsStore } from "./HighlightsStore";

class HistoryStore {

	private undoCommands: Array<HighlightCommand> = [];
	private redoCommand: Array<HighlightCommand> = [];

	constructor(private highlightStore: HighlightsStore) {
		this.initialize();
	}

	private initialize() {
		this.highlightStore.subscribeToHistoryHighlights(command => {
			const isInRedoList = this.redoCommand.some(redoCommand => redoCommand.id !== command.id);
			if (!isInRedoList) {
				this.undoCommands.push(command);
				this.redoCommand = []; // no redo after new commands
			}
		});
	}

	public undoLastCommand = () => {
		const commandToUndo = this.undoCommands.pop();
		if (commandToUndo) {
			this.redoCommand.push(commandToUndo);
			this.highlightStore.emitHighlightCommand(commandToUndo.undoCommand());
		}
	};

	public redoLastCommand = () => {
		const commandToRedo = this.redoCommand.pop();
		if (commandToRedo) {
			this.highlightStore.emitHighlightCommand(commandToRedo);
		}
	};
}

export {
	HistoryStore
};