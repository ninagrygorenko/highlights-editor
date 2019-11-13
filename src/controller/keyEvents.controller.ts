import React, { FormEvent, KeyboardEvent } from "react";
import { EditorModel } from "../model";
import { addCharacterInCurrentPosition, deleteCharacterInCurrentPosition, removeCharacterInCurrentPosition } from "../model/operations/editorOperations";
import { Observable, Subject } from "rxjs";
import { filter } from "rxjs/operators";

class KeyEventsController {

	public keyDownEvents$: Subject<KeyboardEvent> = new Subject();
	public appKeyDownEvents$: Subject<KeyboardEvent> = new Subject();
	public characterAddedAction$: Subject<EditorModel> = new Subject();
	public nonCharacterAddAction: Subject<EditorModel> = new Subject();

	public undoObserver$: Observable<KeyboardEvent> = this.appKeyDownEvents$.asObservable().pipe(
		filter(event => this.isUndo(event))
	);
	public redoObserver$: Observable<KeyboardEvent> = this.appKeyDownEvents$.asObservable().pipe(
		filter(event => this.isRedo(event))
	);

	public handleAppKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
		if (this.isUndo(event) || this.isRedo(event)) {
			event.preventDefault();
			event.stopPropagation();
		}
		this.appKeyDownEvents$.next(event);
	};

	public handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, div: HTMLDivElement, currentEditorModel: EditorModel): void => {
		this.keyDownEvents$.next(event);
		switch (event.key) {
			case 'Backspace':
				event.preventDefault();
				this.nonCharacterAddAction.next(removeCharacterInCurrentPosition(currentEditorModel, div));
				break;
			case 'Delete':
				event.preventDefault();
				this.nonCharacterAddAction.next(deleteCharacterInCurrentPosition(currentEditorModel, div));
				break;
		}
	};

	public handleBeforeInput = (event: FormEvent<HTMLDivElement>, div: HTMLDivElement, currentEditorModel: EditorModel): void => {
		event.preventDefault();
		let newKey = (event as any).data;
		if (newKey === ' ') {
			newKey = '\u00A0';
		}
		const nextEditorState = addCharacterInCurrentPosition(newKey, currentEditorModel, div);
		switch (newKey) {
			case '\n':
				this.nonCharacterAddAction.next(nextEditorState);
				break;
			default:
				this.characterAddedAction$.next(nextEditorState);
		}
	};

	private isUndo = (event: React.KeyboardEvent): boolean => {
		return event.metaKey && !event.shiftKey &&event.key.toLowerCase() === 'z';
	};

	private isRedo = (event: React.KeyboardEvent): boolean => {
		return event.metaKey && event.shiftKey &&event.key.toLowerCase() === 'z';
	};
}

export {
	KeyEventsController
};
