import { none, Option, some } from "fp-ts/lib/Option";

class Queue<T> {
	private arr: Array<T> = [];

	public add(item: T) {
		this.arr.push(item);
	}

	public pop(): Option<T> {
		const item = this.arr.pop();
		return item ? some(item) : none;
	}

	public clear() {
		this.arr = [];
	}
}

export {
	Queue
};