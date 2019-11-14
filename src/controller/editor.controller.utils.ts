import { merge, Observable } from "rxjs";
import { bufferWhen, filter, map } from "rxjs/operators";
import { KeyEventsController } from "./keyEvents.controller";
import { HighlightsController } from "./highlights.controller";
import { HistoryController } from "./history.controller";
import { CommandTypes, EditorModel, EditorStateChangeCommand } from "../model";

/**
 * emit only in case history command contains editor-related command
 * @param historyController
 */
const getEditorStateHistoryCommands = (historyController: HistoryController): Observable<EditorModel> => {
	return historyController.restoreHistoryCommands$.asObservable().pipe(
		filter(command => command.type === CommandTypes.EDITOR_STATE_CHANGE),
		map(command => (command as EditorStateChangeCommand).getEditorModel())
	);
};

/**
 * emit only when some character added and after that non visual key pressed
 * or highlight added
 * or undo command for editor
 */
const getConstantTextAddFlush$ = (
	keyEventsController: KeyEventsController, highlightsController: HighlightsController) => {
	return keyEventsController.characterAddedAction$.asObservable().pipe(
		bufferWhen(() => merge(
			keyEventsController.nonVisualCharacterAddAction$.asObservable(),
			keyEventsController.undoObserver$,
			highlightsController.highlightCommand$.asObservable(),
			keyEventsController.otherKeyEvents$.asObservable(),
		)),
		filter(editorStates => editorStates.length > 0),
		map(editorStates => editorStates[editorStates.length - 1])
	)
};

/**
 * save to history when non visual character is pressed
 * and save text added previously
 */
const getEditorStateFlush$ = (
	keyEventsController: KeyEventsController, highlightsController: HighlightsController
) => {
	return merge(
		getConstantTextAddFlush$(keyEventsController, highlightsController),
		keyEventsController.nonVisualCharacterAddAction$.asObservable(),
	);
};

export {
	getEditorStateHistoryCommands,
	getConstantTextAddFlush$,
	getEditorStateFlush$,
}