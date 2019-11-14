import React from 'react';
import './App.css';
import { HighlightCreation } from "./components/HighlightCreation";
import { HighlightList } from "./components/highlightsList/HighlightsList";
import { AddHighlightCommand } from "./model";
import { useObservable } from "./hooks/useObservable";
import { Editor } from "./components/editor/Editor";
import { HistoryController } from "./controller/history.controller";
import { HighlightsController } from "./controller/highlights.controller";
import { EditorController } from "./controller/editor.controller";
import { KeyEventsController } from "./controller/keyEvents.controller";

// maybe it would be nice to put these controllers into React.Context and access them in components
const historyController: HistoryController = new HistoryController();
const keyEventsController: KeyEventsController = new KeyEventsController();
const highlightsController: HighlightsController = new HighlightsController(historyController);
const editorController: EditorController = new EditorController(historyController, keyEventsController, highlightsController);

const App: React.FC = () => {
	const highlightsList = useObservable<AddHighlightCommand[]>(highlightsController.highlightsList$.asObservable(), []);
	const removeHighlight = (command: AddHighlightCommand) => {
		highlightsController.removeHighlight(command);
	};

	return (
		<div
			className="App"
			onKeyDown={keyEventsController.handleAppKeyDown}
		>
			<HighlightCreation addHighlight={highlightsController.addHighlight}/>
			<div className="editor-list-container">
				<Editor
					editorController={editorController}
					keyEventsController={keyEventsController}
					highlightsController={highlightsController}
				/>
				<HighlightList
					highlights={highlightsList}
					onRemoveHighlight={removeHighlight}
				/>
			</div>

		</div>
	);
};

export default App;
