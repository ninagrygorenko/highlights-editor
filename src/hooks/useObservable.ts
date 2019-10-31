import { Observable } from "rxjs";
import { useEffect, useState } from "react";

function useObservable<T>(observable: Observable<T>, defaultValue: T): T {
	const [ value, setValue ] = useState<T>(defaultValue);

	useEffect(() => {
		const s = observable.subscribe((value: T) => {
			setValue(value);
		});
		return () => {
			s.unsubscribe()
		};
	}, [ value, observable ]);
	return value;
}

export { useObservable };