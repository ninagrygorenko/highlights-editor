import { ParagraphBlock } from "./TextBlock";
import { Option } from "fp-ts/lib/Option";

export interface EditorModel {
	content: Array<ParagraphBlock>;
	caretPosition: {
		paragraph: Option<ParagraphBlock>;
		offset: number;
	}
}