import React, { FormEvent, useState } from "react";
import { isSome, none, Option, some } from "fp-ts/lib/Option";

export interface HighlightCreationProps {
	addHighlight: (wordNumber: number, color: string) => void;
}

const HighlightCreation: React.FC<HighlightCreationProps> = (props: HighlightCreationProps) => {
	const [wordNumber, setWordNumber] = useState<Option<number>>(none);

	const [color, setColor] = useState<Option<string>>(none);

	const handleSubmit = (event: FormEvent<any>) => {
		event.preventDefault();
		if (isSome(wordNumber) && isSome(color)) {
			props.addHighlight(wordNumber.value, color.value);
		}
	};

	return (
		<form className="highlight-add-form" onSubmit={handleSubmit}>
			<label>Word #:</label>
			<input
				type="number"
				placeholder="word index starting 0"
				min={0}
				onChange={event => setWordNumber(some(Number.parseInt(event.target.value, 10)))}/>
			<label>Color:</label>
			<input
				type="text"
				placeholder="hex - 66ff88"
				pattern="^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
				required={true}
				onChange={event => setColor(some(event.target.value))}/>
			<button type="submit">Add</button>
		</form>
	)
};

export {
	HighlightCreation
};