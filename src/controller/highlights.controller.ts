import { Subject } from "rxjs";
import { scan } from "rxjs/operators";
import { AddHighlightCommand, CommandTypes, EditorCommand, HasHighlight, HighlightCommand, RemoveHighlightCommand } from "../model";
import { HistoryController } from "./history.controller";

class HighlightsController {

	public highlightCommand$: Subject<HighlightCommand> = new Subject();
	public highlightsList$: Subject<AddHighlightCommand[]> = new Subject();
	public editorHighlights$: Subject<Record<number, HasHighlight[]>> = new Subject();

	constructor(private historyController: HistoryController) {
		this.initialize();
	}

	public emitHighlightCommand = (command: HighlightCommand) => {
		this.highlightCommand$.next(command);
		this.historyController.addExecutedCommand(command);
	};

	public addHighlight = (wordNumber: number, color: string): void => {
		this.emitHighlightCommand(new AddHighlightCommand(wordNumber, color));
	};

	public removeHighlight = (command: AddHighlightCommand): void => {
		this.emitHighlightCommand(new RemoveHighlightCommand(command));
	};

	public subscribeToHistoryHighlights = (observable: (value: HighlightCommand) => void): { unsubscribe(): void } => {
		return this.highlightCommand$.asObservable().subscribe(observable);
	};

	private initialize = () => {
		this.initializeHighlightList();
		this.initializeEditorHighlights();
		this.initializeHistory();
	};

	private initializeHighlightList = () => {
		this.highlightCommand$.pipe(
			scan((acc: Array<AddHighlightCommand>, current: EditorCommand): Array<AddHighlightCommand> => {
				switch (current.type) {
					case CommandTypes.ADD_HIGHLIGHT:
						return [...acc, current as AddHighlightCommand];
					case CommandTypes.REMOVE_HIGHLIGHT:
						const removeCommand = current as RemoveHighlightCommand;
						return acc.filter((command: EditorCommand) => (command as AddHighlightCommand).id !== removeCommand.getCommandId());
					default:
						return acc;
				}
			}, []),
		).subscribe(commands => {
			this.highlightsList$.next(commands)
		});
	};

	private initializeEditorHighlights = () => {
		this.highlightCommand$.asObservable().pipe(
			scan((acc: Record<number, AddHighlightCommand[]>, current: HighlightCommand): Record<number, AddHighlightCommand[]> => {
				switch (current.type) {
					case CommandTypes.ADD_HIGHLIGHT: {
						const addCommand = current as AddHighlightCommand;
						if (!acc[addCommand.wordNumber]) {
							acc[addCommand.wordNumber] = [];
						}
						acc[addCommand.wordNumber] = [current as AddHighlightCommand, ...acc[addCommand.wordNumber]];
						return {...acc};
					}
					case CommandTypes.REMOVE_HIGHLIGHT: {
						const removeCommand = current as RemoveHighlightCommand;
						const filtered = acc[removeCommand.getWordNumber()].filter(
							(command: AddHighlightCommand) => command.id !== removeCommand.getCommandId()
						);

						if (filtered.length === 0) {
							delete acc[removeCommand.getWordNumber()];
						} else {
							acc[removeCommand.getWordNumber()] = filtered;
						}
						return {...acc};
					}
					default:
						return acc;
				}
			}, {}),
		).subscribe(commands => {
			this.editorHighlights$.next(commands)
		});
	};

	private initializeHistory = () => {
		this.historyController.restoreHistoryCommands$.asObservable().subscribe(command => {
			switch (command.type) {
				case CommandTypes.ADD_HIGHLIGHT:
				case CommandTypes.REMOVE_HIGHLIGHT:
					this.highlightCommand$.next(command as HighlightCommand);
			}
		});
	};

	public addHighlightTestData = () => {
		// test data
		this.highlightCommand$.next(new AddHighlightCommand(5, "f0f"));
		this.highlightCommand$.next(new AddHighlightCommand(1, "ff0"));
		this.highlightCommand$.next(new AddHighlightCommand(1, "f00"));
		this.highlightCommand$.next(new AddHighlightCommand(2, "0fe"));
		// end test data
	}
}

export {
	HighlightsController,
};