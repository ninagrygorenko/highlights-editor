import React, { FormEvent, KeyboardEvent } from "react";
import { EditorModel } from "../model";
import { Observable, Subject } from "rxjs";
import { filter } from "rxjs/operators";
import { getCurrentParagraphInfo } from "../utils/editor.utils";
import {
	addCharacterInCurrentPosition,
	deleteCharacterInCurrentPosition,
	removeCharacterInCurrentPosition,
	updateCaretPosition
} from "./operations/editor.operations";

class KeyEventsController {

	public keyDownEvents$: Subject<KeyboardEvent> = new Subject();
	public appKeyDownEvents$: Subject<KeyboardEvent> = new Subject();
	public characterAddedAction$: Subject<EditorModel> = new Subject();
	public nonVisualCharacterAddAction$: Subject<EditorModel> = new Subject();
	public otherKeyEvents$: Subject<EditorModel> = new Subject(); /* such as arrows */

	public undoObserver$: Observable<KeyboardEvent> = this.appKeyDownEvents$.asObservable().pipe(
		filter(event => this.isUndo(event))
	);
	public redoObserver$: Observable<KeyboardEvent> = this.appKeyDownEvents$.asObservable().pipe(
		filter(event => this.isRedo(event))
	);

	public handleAppKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
		if (this.isUndo(event) || this.isRedo(event)) {
			event.preventDefault();
		}
		this.appKeyDownEvents$.next(event);
	};

	public handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, div: HTMLDivElement, currentEditorModel: EditorModel): void => {
		this.keyDownEvents$.next(event);
		switch (event.key) {
			case 'Backspace':
				event.preventDefault();
				this.nonVisualCharacterAddAction$.next(removeCharacterInCurrentPosition(currentEditorModel, getCurrentParagraphInfo(currentEditorModel, div)));
				break;
			case 'Delete':
				event.preventDefault();
				this.nonVisualCharacterAddAction$.next(deleteCharacterInCurrentPosition(currentEditorModel, getCurrentParagraphInfo(currentEditorModel, div)));
				break;
			case 'ArrowLeft':
			case 'ArrowRight':
			case 'ArrowUp':
			case 'ArrowDown':
				this.otherKeyEvents$.next(updateCaretPosition(currentEditorModel, getCurrentParagraphInfo(currentEditorModel, div)));
				break;
		}
	};

	public handleBeforeInput = (event: FormEvent<HTMLDivElement>, div: HTMLDivElement, currentEditorModel: EditorModel): void => {
		event.preventDefault();
		let newKey = (event as any).data;
		const nextEditorState = addCharacterInCurrentPosition(newKey, currentEditorModel, getCurrentParagraphInfo(currentEditorModel, div));
		switch (newKey) {
			case '\n':
				this.nonVisualCharacterAddAction$.next(nextEditorState);
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
