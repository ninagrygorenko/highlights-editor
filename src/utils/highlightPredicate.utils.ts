import { HasHighlight } from "../model";
import { none, Option, some } from "fp-ts/lib/Option";

const getHighlightPredicate = (highlightsMap: Record<number, HasHighlight[]>, prevWordCounter: number): (index: number) => Option<HasHighlight> => {
	return (localIndex: number): Option<HasHighlight> => {
		const index = prevWordCounter + localIndex;
		return highlightsMap[index] && highlightsMap[index].length > 0
			? some(highlightsMap[index][0])
			: none;
	}
};

export { getHighlightPredicate };