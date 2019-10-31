import { combineLatest, interval, Observable, race, Subject } from "rxjs";
import { KeyboardEvent, RefObject } from "react";
import { buffer, debounceTime, filter, map, scan } from "rxjs/operators";
import { HistoryStore } from "./HistoryStore";
import { isSome, none, Option, some } from "fp-ts/lib/Option";
import { parseToTextParts, TextPart } from "./TextPartsStore";
import { HasHighlight, HighlightsStore } from "./HighlightsStore";
import { AddHighlightCommand } from "./commands/AddHighlightCommand";

class EditorStore {

	public mouseOverHighlightedWord$: Subject<Option<string>> = new Subject();
	public keyUpEvents$: Subject<KeyboardEvent> = new Subject();
	public keyDownEvents$: Subject<KeyboardEvent> = new Subject();

	private editor: Option<RefObject<HTMLDivElement>> = none;

	private undoObserver$: Observable<KeyboardEvent> = this.keyDownEvents$.asObservable().pipe(
		filter(event => {
			return event.metaKey && event.key.toLowerCase() === 'z'
		})
	);
	private redoObserver$: Observable<KeyboardEvent> = this.keyDownEvents$.asObservable().pipe(
		filter(event => event.metaKey && event.shiftKey && event.key.toLowerCase() === 'z')
	);

	constructor(private historyStore: HistoryStore, private highlightStore: HighlightsStore) {
		this.initialize();
	}

	public setEditorDiv = (ref: RefObject<HTMLDivElement>) => {
		this.editor = ref ? some(ref) : none;
	};

	public setHighlightedWordMouseOver = (id: string, isMouseOver: boolean) => {
		this.mouseOverHighlightedWord$.next(isMouseOver ? some(id) : none);
	};

	private initialize = () => {
		this.initializeUndoHandler();
		this.initializeRedoHandler();
		this.initializeTextChangeHandler();
	};

	private initializeTextChangeHandler = () => {
		this.keyUpEvents$.asObservable().pipe(
			filter(event => event.key.length > 1 && event.key !== 'Shift'),
			map(event => event.key)
		).subscribe(key => console.log("Non visual key=", key));

		combineLatest(
			this.keyUpEvents$.asObservable().pipe(
				filter(event => !event.ctrlKey && !event.altKey && !event.metaKey && event.key.length === 1),
				map(event => event.key),
				scan((acc: string, current: string): string => {
					return acc + current;
				}, ""),
				debounceTime(1000),
			), this.highlightStore.editorHighlights$.asObservable())
		.subscribe(([text, editorHightlights]: [string, Record<number, Array<HasHighlight>>]) => {
			if (isSome(this.editor) && this.editor.value.current) {
				let outerIndex = -1;
				highlight(this.editor.value.current, (index: number): string | false => {
					outerIndex++;
					if (editorHightlights[outerIndex] &&  editorHightlights[outerIndex].length > 0) {
						return editorHightlights[outerIndex][0].color;
					} else {
						return false;
					}
				});
			}
		});


		/*
		this.keyUpEvents$.asObservable().pipe(
			filter(event => !event.ctrlKey && !event.altKey && !event.metaKey && event.key.length === 1),
			map(event => event.key),
			buffer(
				race(
					this.keyUpEvents$.asObservable().pipe(filter(event => event.key.length > 1 && event.key !== 'Shift')),
					interval(1000)
			)),
			filter((keys: string[]) => keys.length > 0)
		).subscribe(val => {
			if (isSome(this.editor) && this.editor.value.current) {
				const innerText = this.editor.value.current.innerText;
				console.log("innerText", innerText);

			}

		});
		*/
	};

	private initializeUndoHandler = () => {
		this.undoObserver$.subscribe(undo => {
			undo.preventDefault();
			this.historyStore.undoLastCommand();
		});
	};

	private initializeRedoHandler = () => {
		this.redoObserver$.subscribe(redo => {
			redo.preventDefault();
			this.historyStore.redoLastCommand();
		});
	};
}

const createHighlightedSpan = (text: string, color: string = "ff0"): HTMLSpanElement => {
	let span: HTMLSpanElement = document.createElement("SPAN");
	span.style.backgroundColor = `#${color}`;
	span.appendChild(document.createTextNode(text));
	return span;
};

const convertTextPartsToNodesWithHighlight = (textParts: Array<TextPart>, predicate: (index: number) => string | false): DocumentFragment => {
	let fragment = document.createDocumentFragment();
	let text: string = "";
	let i = 0;
	textParts.forEach((textPart: TextPart, index: number) => {
		if (textPart.prefix) {
			text += textParts[i].prefix;
		}
		const highlightColor = predicate(index);
		if (highlightColor) {
			if (text.length > 0) {
				fragment.appendChild(document.createTextNode(text));
			}
			if (textPart.word) {
				fragment.appendChild(createHighlightedSpan(textPart.word, highlightColor));
			}
			if (textPart.suffix) {
				text = textPart.suffix;
			}
		} else {
			text += (textPart.word || "") + (textPart.suffix || "")
		}
	});
	if (text.length) {
		fragment.appendChild(document.createTextNode(text));
	}
	return fragment;
};


const highlight = function(node: Node, predicate: (index: number) => string | false) {
	node.childNodes.forEach((el: ChildNode) => {
		if (el.nodeType === Node.TEXT_NODE) {
			const textParts = parseToTextParts((el as Text).wholeText);
			const fragment = convertTextPartsToNodesWithHighlight(textParts, predicate);
			el.replaceWith(fragment);
		} else {
			highlight(el, predicate);
		}
	});
};

export {
	EditorStore,
}