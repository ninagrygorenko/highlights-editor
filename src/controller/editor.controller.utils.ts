import { combineLatest, merge, Observable } from "rxjs";
import { bufferWhen, filter, map, startWith } from "rxjs/operators";
import { KeyEventsController } from "./keyEvents.controller";
import { HighlightsController } from "./highlights.controller";
import { HistoryController } from "./history.controller";
import { CommandTypes, EditorModel, EditorStateChangeCommand, HasHighlight, ParagraphBlock, TextBlock, TextBlockType } from "../model";
import { none, some } from "fp-ts/lib/Option";

/**
 * emit only in case history command contains editor-related command
 * @param historyController
 */
const getEditorStateHistoryCommands$ = (historyController: HistoryController): Observable<EditorModel> => {
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

/**
 * Merge EditorModel with info about highlight to product single source for the Editor component
 *
 * @param keyEventsController
 * @param highlightsController
 * @param historyController
 */
const getContentWithHighlights$ = (
	keyEventsController: KeyEventsController, highlightsController: HighlightsController, historyController: HistoryController
) => {
	return combineLatest([
		merge(
			keyEventsController.characterAddedAction$.asObservable(),
			keyEventsController.nonVisualCharacterAddAction$.asObservable(),
			getEditorStateHistoryCommands$(historyController),
		),
		highlightsController.editorHighlights$.asObservable().pipe(
			startWith({} as Record<number, Array<HasHighlight>>)
		),
	]).pipe(
		map(([editorState, highlightsMap]) => {
			let totalWordNumber = 0;
			editorState.content.forEach((paragraph: ParagraphBlock) => {
				let highlightedWordsInParagraphNumber = 0;
				const words = paragraph.blocks
					.filter((textBlock: TextBlock) => textBlock.type === TextBlockType.WORD);
				words.forEach((textBlock: TextBlock, wordNumberInParagraph: number) => {
					const index = totalWordNumber + wordNumberInParagraph;
					if (highlightsMap[index] && highlightsMap[index].length > 0) {
						textBlock.highlight = some(highlightsMap[index][0]);
						highlightedWordsInParagraphNumber++;
					} else {
						textBlock.highlight = none;
					}
				});
				totalWordNumber += words.length;
				paragraph.wordsHighlighted = highlightedWordsInParagraphNumber;
			});
			return { ...editorState };
		})
	)
};

export {
	getEditorStateHistoryCommands$,
	getConstantTextAddFlush$,
	getEditorStateFlush$,
	getContentWithHighlights$,
}