import React from 'react';
import './App.css';
import { HighlightCreation } from "./components/HighlightCreation";
import { HighlightList } from "./components/highlightsList/HighlightsList";
import { Editor } from "./components/editor/Editor";
import { AddHighlightCommand, HasHighlight, HighlightsStore } from "./model";
import { EditorStore } from "./model/EditorStore";
import { HistoryStore } from "./model/HistoryStore";
import { none, Option } from "fp-ts/lib/Option";
import { useObservable } from "./hooks/useObservable";

const highlightStore: HighlightsStore = new HighlightsStore();
const historyStore: HistoryStore = new HistoryStore(highlightStore);
const editorStore: EditorStore = new EditorStore(historyStore, highlightStore);

const App: React.FC = () => {
	const highlightsList = useObservable<AddHighlightCommand[]>(highlightStore.highlightsList$.asObservable(), []);
	const editorHighlightsMap = useObservable<Record<number, HasHighlight[]>>(highlightStore.editorHighlights$.asObservable(), {});

	const removeHighlight = (command: AddHighlightCommand) => {
		highlightStore.removeHighlight(command);
	};

	return (
		<div className="App">
			<HighlightCreation addHighlight={highlightStore.addHighlight}/>
			<div className="editor-list-container">
				<Editor
					editorStore={editorStore}
					highlightsMap={editorHighlightsMap}
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
