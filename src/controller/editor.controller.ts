import { BehaviorSubject, merge, Subject } from "rxjs";
import { none, Option, some } from "fp-ts/lib/Option";
import { HighlightsController } from "./highlights.controller";
import { EditorModel, EditorStateChangeCommand } from "../model";
import { HistoryController } from "./history.controller";
import { KeyEventsController } from "./keyEvents.controller";
import { getEditorStateFlush$, getEditorStateHistoryCommands } from "./editor.controller.utils";
import { delay } from "rxjs/operators";

class EditorController {

	public static INITIAL_EDITOR_MODEL = {
		content: [],
		caretPosition: { offset: 0, paragraph: none }
	};

	public mouseOverHighlightedWord$: Subject<Option<string>> = new Subject();
	public content$: BehaviorSubject<EditorModel> = new BehaviorSubject<EditorModel>(EditorController.INITIAL_EDITOR_MODEL);

	private latestEditorStateFromHistory: EditorModel = EditorController.INITIAL_EDITOR_MODEL;

	constructor(private historyController: HistoryController,
				private keyEventsController: KeyEventsController,
				private highlightController: HighlightsController) {
		this.initialize();
	}

	public setHighlightedWordMouseOver = (id: string, isMouseOver: boolean) => {
		this.mouseOverHighlightedWord$.next(isMouseOver ? some(id) : none);
	};

	private initialize = () => {
		// initialize content$ subject
		merge(
			this.keyEventsController.characterAddedAction$.asObservable(),
			this.keyEventsController.nonCharacterAddAction.asObservable(),
			getEditorStateHistoryCommands(this.historyController),
		).subscribe(editorState => this.content$.next(editorState));
		this.initializeEditorStateHistoryFlush();
		this.initializeUndoHandler();
		this.initializeRedoHandler();
	};


	private initializeUndoHandler = () => {
		this.keyEventsController.undoObserver$.pipe(
			delay(100)
		).subscribe(undo => {
			console.log("undo");
			undo.preventDefault();
			this.historyController.undoLastCommand();
		});
	};

	private initializeRedoHandler = () => {
		this.keyEventsController.redoObserver$.subscribe(redo => {
			console.log("redo");
			redo.preventDefault();
			this.historyController.redoLastCommand();
		});
	};

	private initializeEditorStateHistoryFlush = () => {
		getEditorStateFlush$(this.keyEventsController, this.highlightController)
			.subscribe(editorState => {
				this.sendToHistory(editorState);
			});
	};

	private sendToHistory = (editorState: EditorModel) => {
		this.historyController.addExecutedCommand(new EditorStateChangeCommand(editorState, this.latestEditorStateFromHistory));
		this.latestEditorStateFromHistory = this.content$.getValue();
	}
}

export {
	EditorController,
}