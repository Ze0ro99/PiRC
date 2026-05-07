//#region src/lens-list.ts
var LensList = class {
	#list;
	#lens;
	constructor() {
		this.#list = [];
		this.#lens = /* @__PURE__ */ new Map();
	}
	get [Symbol.iterator]() {
		return this.#list[Symbol.iterator].bind(this.#list);
	}
	entries() {
		return this.#lens.entries();
	}
	/**
	* Return an order-sensitive list of values by the given key.
	*/
	get(key) {
		return this.#lens.get(key) || [];
	}
	/**
	* Return an order-sensitive list of all values.
	*/
	getAll() {
		return this.#list.map(([, value]) => value);
	}
	/**
	* Append a new value to the given key.
	*/
	append(key, value) {
		this.#list.push([key, value]);
		this.#openLens(key, (list) => list.push(value));
	}
	/**
	* Prepend a new value to the given key.
	*/
	prepend(key, value) {
		this.#list.unshift([key, value]);
		this.#openLens(key, (list) => list.unshift(value));
	}
	/**
	* Delete the value belonging to the given key.
	* Returns `true` if the value was present and removed, `false` otherwise.
	*/
	delete(key, value) {
		if (this.size === 0) return false;
		const values = this.#lens.get(key);
		if (!values) return false;
		const index = values.indexOf(value);
		if (index === -1) return false;
		values.splice(index, 1);
		this.#list.splice(this.#list.findIndex((item) => item[0] === key && item[1] === value), 1);
		return true;
	}
	/**
	* Delete all values belogning to the given key.
	*/
	deleteAll(key) {
		if (this.size === 0) return;
		this.#list = this.#list.filter((item) => item[0] !== key);
		this.#lens.delete(key);
	}
	get size() {
		return this.#list.length;
	}
	clear() {
		if (this.size === 0) return;
		this.#list.length = 0;
		this.#lens.clear();
	}
	#openLens(key, setter) {
		setter(this.#lens.get(key) || this.#lens.set(key, []).get(key));
	}
};

//#endregion
export { LensList };
//# sourceMappingURL=lens-list.mjs.map