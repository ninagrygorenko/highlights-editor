import React, { useRef, Fragment } from "react";
import { HasHighlight } from "../../model";
import { EditorStore } from "../../model/EditorStore";

export interface EditorProps {
	highlightsMap: Record<number, HasHighlight[]>;
	editorStore: EditorStore;
}

const Editor: React.FC<EditorProps> = (props: EditorProps) => {
	const editorDiv = useRef<HTMLDivElement>(null);
	props.editorStore.setEditorDiv(editorDiv);

	return (
		<div className="editor" ref={editorDiv}>
			<div
				contentEditable={true}
				spellCheck={false}
				onKeyUp={event => props.editorStore.keyUpEvents$.next(event)}
				onKeyDown={event => {props.editorStore.keyDownEvents$.next(event)}}
				suppressContentEditableWarning={true}
			/>
		</div>);
};

export {
	Editor
};