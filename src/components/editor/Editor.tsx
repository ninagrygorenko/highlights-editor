import React, { FormEvent, useEffect, useRef } from "react";
import { EditorModel } from "../../model";
import { none, Option } from "fp-ts/lib/Option";
import { ParagraphBlock } from "../../model";
import { Paragraph } from "./Paragraph";
import { useObservable } from "../../hooks/useObservable";
import { EditorController } from "../../controller/editor.controller";
import { KeyEventsController } from "../../controller/keyEvents.controller";
import { HighlightsController } from "../../controller/highlights.controller";
import { collapseSelection, setCaretPositionInParagraph } from "../../controller/operations/selection.operations";

export interface EditorProps {
	editorController: EditorController;
	keyEventsController: KeyEventsController;
	highlightsController: HighlightsController;
}

const Editor: React.FC<EditorProps> = props => {
	const { editorController, keyEventsController, highlightsController } = props;
	const editorDiv = useRef<HTMLDivElement>(null);

	const editorModel = useObservable<EditorModel>(editorController.content$, EditorController.INITIAL_EDITOR_MODEL);
	const mouseOverHighlightedWord = useObservable<Option<string>>(editorController.mouseOverHighlightedWord$, none);

	useEffect(() => {
		const s = highlightsController.highlightCommand$.subscribe(() => {
			editorDiv.current && editorDiv.current.focus();
		});
		return () => {
			s.unsubscribe()
		};
	});

	useEffect(() => {
		setCaretPositionInParagraph(editorModel, editorDiv.current!, editorModel.caretPosition.paragraph, editorModel.caretPosition.offset);
	}, [ editorModel ]);

	const handleBeforeInput = (event: FormEvent<HTMLDivElement>) => {
		keyEventsController.handleBeforeInput(event, editorDiv.current!, editorModel);
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		keyEventsController.handleKeyDown(event, editorDiv.current!, editorModel)
	};

	const blocks = editorModel.content;
	return (
		<div className="editor" >
			<div
				ref={editorDiv}
				contentEditable={true}
				spellCheck={false}
				onBeforeInput={handleBeforeInput}
				onKeyDown={handleKeyDown}
				onSelect={() => collapseSelection()} // just for simplicity
				suppressContentEditableWarning={true}
				onPaste={event => event.preventDefault()} // just for simplicity
			>
				{blocks.map((paragraphBlock: ParagraphBlock, index: number) => {
					const key = paragraphBlock.blocks.length > 0
						? `${paragraphBlock.hash}${paragraphBlock.wordsHighlighted}`
						: index;
					return <Paragraph
						key={key}
						index={index}
						paragraphBlock={paragraphBlock}
						onMouseOverHighlightedWord={editorController.setHighlightedWordMouseOver}
						mouseOverHighlightedWord={mouseOverHighlightedWord}
					/>;
				})}
			</div>
		</div>);
};

export {
	Editor
};