import { KeyEventsController } from "./keyEvents.controller";
import { HighlightsController } from "./highlights.controller";
import { HistoryController } from "./history.controller";
import { AddHighlightCommand, EditorModel, EditorStateChangeCommand } from "../model";
import { EditorController } from "./editor.controller";
import { getConstantTextAddFlush$, getEditorStateFlush$, getEditorStateHistoryCommands$ } from "./editor.controller.utils";
import * as React from "react";
import { getParagraphByContent } from "./operations/paragraphText.operations";

it("getEditorStateHistoryCommands$", () => {
	const history: HistoryController = new HistoryController();
	const result: Array<EditorModel> = [];
	getEditorStateHistoryCommands$(history).subscribe(val => result.push(val));

	history.addExecutedCommand(new AddHighlightCommand(0, 'ccc'));
	history.undoLastCommand();
	expect(result).toHaveLength(0);

	history.addExecutedCommand(new AddHighlightCommand(0, 'ccc'));
	history.addExecutedCommand(new EditorStateChangeCommand(EditorController.INITIAL_EDITOR_MODEL, EditorController.INITIAL_EDITOR_MODEL));
	history.undoLastCommand();
	expect(result).toHaveLength(1);

	history.undoLastCommand();
	expect(result).toHaveLength(1);
});

describe("editor state flush to history", () => {
	const keyEventsController: KeyEventsController = new KeyEventsController();
	const highlightsController: HighlightsController = new HighlightsController(new HistoryController());

	const initialText: string = "Hello world";
	const textToEditorModel = (text: string): EditorModel => {
		return {
			...EditorController.INITIAL_EDITOR_MODEL,
			content: [getParagraphByContent(text)]
		}
	};

	const simulateCharacterAdded = (character: string, prevText: string): string => {
		const result = prevText + character;
		keyEventsController.characterAddedAction$.next(textToEditorModel(result));
		return result;
	};
	const simulateNonVisualCharacterPressed = (text: string): string => {
		keyEventsController.nonVisualCharacterAddAction$.next(textToEditorModel(text + "|"));
		return text;
	};
	const simulateHighlightCommand = (wordNumber: number = 0) => {
		highlightsController.highlightCommand$.next(new AddHighlightCommand(wordNumber, 'ff0'));
	};
	const simulateUndo = () => {
		keyEventsController.appKeyDownEvents$.next({metaKey: true, shiftKey: false, key: 'z'} as React.KeyboardEvent)
	};

	it("flush text changes after other actions", () => {
		const result: Array<EditorModel> = [];
		getConstantTextAddFlush$(keyEventsController, highlightsController)
			.subscribe(val => result.push(val));

		let currentText = initialText;
		currentText = simulateCharacterAdded(' ', currentText);
		currentText = simulateCharacterAdded('a', currentText);
		currentText = simulateNonVisualCharacterPressed(currentText);
		expect(result).toHaveLength(1);
		expect(result[0].content[0].content).toEqual(initialText + " a");

		currentText = simulateNonVisualCharacterPressed(currentText);
		expect(result).toHaveLength(1);

		currentText = simulateCharacterAdded('a', currentText);
		simulateUndo();
		expect(result).toHaveLength(2);

		simulateCharacterAdded('a', currentText);
		simulateHighlightCommand();
		expect(result).toHaveLength(3);
	});

	it("getEditorStateFlush$ key press", () => {
		const result: Array<EditorModel> = [];
		getEditorStateFlush$(keyEventsController, highlightsController)
			.subscribe(editorState => {
				result.push(editorState);
			});
		let currentText = initialText;
		currentText = simulateCharacterAdded(' ', currentText);
		currentText = simulateCharacterAdded('a', currentText);
		simulateNonVisualCharacterPressed(currentText);
		expect(result).toHaveLength(2);
		expect(result[0].content[0].content).toEqual(initialText + " a");
		expect(result[1].content[0].content).toEqual(initialText + " a|");
	});

	it("getEditorStateFlush$ key press and highlight added", () => {
		let result: Array<EditorModel> = [];
		getEditorStateFlush$(keyEventsController, highlightsController)
			.subscribe(editorState => {
				result.push(editorState);
			});
		let currentText = initialText;
		// no editor flush if nothing changed
		simulateHighlightCommand();
		expect(result).toHaveLength(0);

		// text added -> highlight pressed
		currentText = simulateCharacterAdded(' ', currentText);
		simulateCharacterAdded('a', currentText);
		simulateHighlightCommand();
		expect(result).toHaveLength(1);
		expect(result[0].content[0].content).toEqual(initialText + " a");

		result = [];
		simulateCharacterAdded('a', currentText);
		simulateHighlightCommand();
		simulateHighlightCommand();
		expect(result).toHaveLength(1);
	});

	it("getEditorStateFlush$ key press and undo", () => {
		const result: Array<EditorModel> = [];
		getEditorStateFlush$(keyEventsController, highlightsController)
			.subscribe(editorState => {
				result.push(editorState);
			});
		let currentText = initialText;
		currentText = simulateCharacterAdded(' ', currentText);
		simulateCharacterAdded('a', currentText);
		simulateHighlightCommand();
		expect(result).toHaveLength(1);
		expect(result[0].content[0].content).toEqual(initialText + " a");
	});
});
